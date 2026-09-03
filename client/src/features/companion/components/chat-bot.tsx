import type { ConversationTreeState, TreeMessage } from '@/features/companion/lib/message-tree';
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import type { FileUIPart, UIMessage } from 'ai';

import {
  Fragment,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useStickToBottomContext } from 'use-stick-to-bottom';
import { toast } from 'sonner';

import { useChatMessageTreeStore } from '@/store/chat-message-tree-store';
import { MAX_CHAT_ATTACHMENTS } from '@/store/chat-note-attachment-store';
import { useCompanionStore } from '@/store/companion-store';
import { useSettingsStore } from '@/store/settings-store';

import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';

import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import {
  Message,
  MessageAction,
  MessageActions,
  MessageBranch,
  MessageBranchContent,
  MessageBranchNext,
  MessageBranchPage,
  MessageBranchPrevious,
  MessageBranchSelector,
  MessageContent,
  MessageResponse,
  MessageToolbar,
} from '@/components/ai-elements/message';
import {
  Attachment,
  AttachmentHoverCard,
  AttachmentHoverCardContent,
  AttachmentHoverCardTrigger,
  AttachmentInfo,
  AttachmentPreview,
  Attachments,
  getAttachmentLabel,
  getMediaCategory,
} from '@/components/ai-elements/attachments';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning';
import { Source, Sources, SourcesContent, SourcesTrigger } from '@/components/ai-elements/sources';
import { SpeechInput } from '@/components/ai-elements/speech-input';
import { Shimmer } from '@/components/ai-elements/shimmer';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

import {
  CheckIcon,
  CopyIcon,
  FilePlusIcon,
  GitBranchIcon,
  MoreHorizontalIcon,
  PencilIcon,
  RefreshCcwIcon,
  SparklesIcon,
  XIcon,
} from 'lucide-react';

import {
  addMessage,
  buildTree,
  editUserMessage,
  getActivePath,
  getVersionInfo,
  retryAssistantMessage,
  switchVersion,
} from '@/features/companion/lib/message-tree';
import {
  useGetConversationsQuery,
  useCloneConversationMutation,
  useSetCurrentMessageMutation,
} from '@/features/companion/hooks/use-companion-conversation';
import { PromptInputAttachmentsDisplay } from '@/features/companion/components/chat-attachment';
import { useCompanionChatSession } from '@/features/companion/hooks/use-companion-chat-session';
import { decodeDataUrl, isTextLikeMediaType } from '@/features/companion/utils/file-parts';
import { NOTE_CONTENT_MAX_LENGTH, useNoteCreatePrefillStore } from '@/features/notes';

export interface ChatBotHandle {
  prependMessages: (messages: Array<UIMessage>) => void;
  sendText: (text: string) => void;
}

interface ChatBotProps {
  onFinish?: (result: { message: UIMessage; isError?: boolean }) => void;
  onConversationId?: (conversationId: string) => void;
  isLoadingOlderMessages?: boolean;
  onLoadOlderMessages?: () => void;
  initialConversationId?: string;
  messages?: Array<UIMessage>;
  hasMoreMessages?: boolean;
  disabled?: boolean;
  centered?: boolean;
  className?: string;
}

function ChatBot({
  isLoadingOlderMessages = false,
  messages: loadedMessages,
  hasMoreMessages = false,
  initialConversationId,
  onLoadOlderMessages,
  onConversationId,
  disabled = false,
  centered = false,
  className,
  onFinish,
  ref,
}: ChatBotProps & { ref?: React.Ref<ChatBotHandle> }) {
  const [text, setText] = useState<string>('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const capturedConversationIdRef = useRef<string | null>(null);

  const navigate = useNavigate();
  const layoutMode = useSettingsStore((state) => state.layoutMode);
  const setRightSidebarOpen = useSettingsStore((state) => state.setRightSidebarOpen);
  const setActiveConversationId = useCompanionStore((state) => state.setActiveConversationId);
  const trees = useChatMessageTreeStore((state) => state.trees);
  const setTree = useChatMessageTreeStore((state) => state.setTree);
  const getTree = useChatMessageTreeStore((state) => state.getTree);
  const cloneConversation = useCloneConversationMutation();
  const setCurrentMessage = useSetCurrentMessageMutation();
  const { data: conversations } = useGetConversationsQuery();

  const conversation = useMemo(
    () => conversations?.find((item) => item.id === initialConversationId),
    [conversations, initialConversationId],
  );

  const handleConversationId = useCallback(
    (conversationId: string) => {
      capturedConversationIdRef.current = conversationId;
      onConversationId?.(conversationId);
    },
    [onConversationId],
  );

  const chat = useCompanionChatSession({
    onError: (error) => {
      console.error(error);
      toast.error(m.chat_error_send(), {
        description: m.common_error_connection(),
      });
    },
    onFinish: (result) => handleFinishRef.current(result),
    onConversationId: handleConversationId,
    initialMessages: loadedMessages,
    initialConversationId,
  });

  const status = chat.status;
  const isGenerating = status === 'submitted' || status === 'streaming';

  const tree = initialConversationId ? trees[initialConversationId] : undefined;

  useEffect(() => {
    if (!initialConversationId || !loadedMessages || isGenerating) return;

    let nextTree = tree;
    if (!nextTree) {
      if (loadedMessages.length === 0) return;

      const rows: Array<TreeMessage> = loadedMessages.map((message, index) => {
        const hasEmbeddedParentId = 'parentId' in message;
        // oxlint-disable-next-line typescript/no-unnecessary-condition -- parentId may exist at runtime on UIMessage even if not in type
        const embeddedParentId = hasEmbeddedParentId ? message.parentId : undefined;

        let parentId: undefined | string;
        if (typeof embeddedParentId === 'string') {
          parentId = embeddedParentId;
        } else if (hasEmbeddedParentId) {
          // Server sent null: this is a tree root. The tree primitives
          // (getRootIds / getSiblingIds) recognize roots only as `undefined`.
          parentId = undefined;
        } else {
          parentId = loadedMessages[index - 1]?.id;
        }

        return { ...message, parentId };
      });
      const leaf = conversation?.currentMessageId ?? rows.at(-1)?.id;
      nextTree = buildTree(rows, leaf);
      setTree(initialConversationId, nextTree);
    }

    const path = getActivePath(nextTree);
    if (path.length === 0) return;

    const pathIds = path.map((node) => node.id);
    const isSynced =
      chat.messages.length === pathIds.length &&
      chat.messages.every((message, index) => message.id === pathIds[index]);
    if (!isSynced) {
      chat.setMessages(path.map((node) => node.message));
    }
  }, [
    chat,
    conversation?.currentMessageId,
    initialConversationId,
    isGenerating,
    loadedMessages,
    setTree,
    tree,
  ]);

  useLayoutEffect(() => {
    if (tree || !loadedMessages || loadedMessages.length === 0) {
      return;
    }
    if (chat.messages.length >= loadedMessages.length) return;

    const knownIds = new Set(chat.messages.map((message) => message.id));
    const olderMessages = loadedMessages.filter((message) => !knownIds.has(message.id));
    if (olderMessages.length === 0) return;

    chat.setMessages((prev) => [...olderMessages, ...prev]);
  }, [loadedMessages, chat, tree]);

  const retrySnapshotRef = useRef<{
    assistantMessageId: string;
    snapshot: Array<UIMessage>;
  } | null>(null);

  const handleFinish = useCallback(
    (result: { message: UIMessage; isError?: boolean }) => {
      const conversationId = initialConversationId ?? capturedConversationIdRef.current;

      if (result.isError) {
        const pending = retrySnapshotRef.current;
        retrySnapshotRef.current = null;
        if (pending && conversationId) {
          chat.setMessages(pending.snapshot);
          const existingTree = getTree(conversationId);
          if (existingTree) {
            setTree(conversationId, switchVersion(existingTree, pending.assistantMessageId));
          }
        }
        return;
      }
      retrySnapshotRef.current = null;

      if (conversationId) {
        const existingTree = getTree(conversationId);
        if (existingTree) {
          const previous = chat.messages.at(-2);
          if (previous) {
            let nextTree = existingTree;
            setTree(conversationId, addMessage(nextTree, result.message, previous.id));
          }
        } else {
          const rows: Array<TreeMessage> = chat.messages.map((message, index) => ({
            ...message,
            parentId: index === 0 ? undefined : chat.messages[index - 1]?.id,
          }));
          setTree(conversationId, buildTree(rows, rows.at(-1)?.id));
        }
      }
      onFinish?.(result);
    },
    [chat, getTree, initialConversationId, onFinish, setTree],
  );
  const handleFinishRef = useRef(handleFinish);
  useEffect(() => {
    handleFinishRef.current = handleFinish;
  });

  const handleRetry = useCallback(
    (assistantMessageId: string) => {
      if (!initialConversationId) return;

      const tree = getTree(initialConversationId);
      if (!tree) return;

      const target = tree.nodes[assistantMessageId];
      // oxlint-disable-next-line typescript/no-unnecessary-condition -- missing keys return undefined at runtime
      if (!target || target.role !== 'assistant' || !target.parentId) {
        toast.error(m.chat_message_retry_failed());
        return;
      }

      const { userPromptId, state } = retryAssistantMessage(tree, assistantMessageId);
      if (!userPromptId) return;

      retrySnapshotRef.current = {
        snapshot: chat.messages,
        assistantMessageId,
      };
      setTree(initialConversationId, state);
      void chat.regenerate({ messageId: assistantMessageId });
    },
    [chat, getTree, initialConversationId, setTree],
  );

  const handleEditSave = useCallback(
    (userMessageId: string, newText: string) => {
      if (!initialConversationId) return;

      const tree = getTree(initialConversationId);
      if (!tree) return;

      const result = editUserMessage(tree, userMessageId, newText);
      if (!result.editedMessage) return;

      const fileParts = tree.nodes[userMessageId].message.parts.filter(
        (part): part is FileUIPart => part.type === 'file',
      );

      setTree(initialConversationId, result.state);
      chat.setMessages(getActivePath(result.state).map((node) => node.message));
      setEditingMessageId(null);
      void chat.sendMessage({
        messageId: result.editedMessage.id,
        files: fileParts,
        text: newText,
      });
    },
    [chat, getTree, initialConversationId, setTree],
  );

  const handleBranch = useCallback(
    (assistantMessageId: string) => {
      const conversationId = initialConversationId;
      if (!conversationId) return;

      cloneConversation.mutate(
        {
          body: { upToMessageId: assistantMessageId },
          params: { id: conversationId },
        },
        {
          onSuccess: (newConversation) => {
            setActiveConversationId(newConversation.id);
            if (layoutMode === 'chat') {
              void navigate({
                params: { conversationId: newConversation.id },
                to: '/chat/$conversationId',
              });
            } else {
              setRightSidebarOpen(true);
            }
          },
        },
      );
    },
    [
      cloneConversation,
      initialConversationId,
      layoutMode,
      navigate,
      setActiveConversationId,
      setRightSidebarOpen,
    ],
  );

  const handleSwitchVersion = useCallback(
    (targetMessageId: string) => {
      const conversationId = initialConversationId;
      if (!conversationId) return;

      const tree = getTree(conversationId);
      if (!tree) return;

      const nextTree: ConversationTreeState = switchVersion(tree, targetMessageId);
      if (nextTree === tree) return;

      setTree(conversationId, nextTree);
      chat.setMessages(getActivePath(nextTree).map((node) => node.message));
      setCurrentMessage.mutate({
        body: { messageId: nextTree.currentLeafId ?? targetMessageId },
        params: { id: conversationId },
      });
    },
    [chat, getTree, initialConversationId, setCurrentMessage, setTree],
  );

  const handleCreateNote = useCallback(
    (message: UIMessage) => {
      const content = getCopyableMessageText(message);
      if (!content) return;
      useNoteCreatePrefillStore.getState().set(content.slice(0, NOTE_CONTENT_MAX_LENGTH));
      void navigate({ to: '/notes/create' });
    },
    [navigate],
  );

  useImperativeHandle(
    ref,
    () => ({
      prependMessages: (olderMessages) => {
        chat.setMessages((prev) => [...olderMessages, ...prev]);
      },
      sendText: (content) => {
        void chat.sendMessage({ text: content });
        setText('');
      },
    }),
    [chat],
  );

  const liveMessages = chat.messages;

  const lastMessage = liveMessages[liveMessages.length - 1];
  const isAwaitingResponse =
    isGenerating &&
    // oxlint-disable-next-line typescript/no-unnecessary-condition -- empty array yields undefined
    !!lastMessage &&
    (lastMessage.role === 'user' ||
      (lastMessage.role === 'assistant' && lastMessage.parts.length === 0));

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const content = message.text.trim();
      if (!content && message.files.length === 0) {
        return;
      }

      void chat.sendMessage({ files: message.files, text: content });
      setText('');
    },
    [chat],
  );

  const handleTranscriptionChange = useCallback((transcript: string) => {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
  }, []);

  const handleTextChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  }, []);

  const isSubmitDisabled = (!text.trim() && !isGenerating) || disabled;

  return (
    <div className={cn('relative flex size-full flex-col divide-y overflow-hidden', className)}>
      {liveMessages.length > 0 ? (
        <Conversation>
          {hasMoreMessages && (
            <ConversationLoadOlder
              isLoading={isLoadingOlderMessages}
              onLoadOlder={onLoadOlderMessages}
            />
          )}
          <ConversationContent className={cn(centered && 'mx-auto w-full max-w-6xl')}>
            {liveMessages.map((message, index) => (
              <MessageView
                conversationId={initialConversationId}
                editingMessageId={editingMessageId}
                isGenerating={isGenerating}
                isStreaming={isGenerating && index === liveMessages.length - 1}
                key={message.id}
                message={message}
                onBranch={handleBranch}
                onCreateNote={handleCreateNote}
                onEditCancel={() => setEditingMessageId(null)}
                onEditSave={handleEditSave}
                onEditStart={(userMessageId) => setEditingMessageId(userMessageId)}
                onRetry={handleRetry}
                onSwitchVersion={handleSwitchVersion}
              />
            ))}
            {isAwaitingResponse && (
              <Message from="assistant">
                <MessageContent>
                  <Shimmer duration={1}>{m.chat_thinking()}</Shimmer>
                </MessageContent>
              </Message>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      ) : (
        <ConversationEmptyState
          description={m.chat_agent_desc()}
          icon={<SparklesIcon className="size-5" />}
          title="Synapse AI"
        />
      )}

      <div className="shrink-0 px-4 py-5">
        <div className="flex flex-col gap-4">
          <div className={cn('w-full', centered && 'mx-auto max-w-6xl')}>
            <PromptInput
              globalDrop
              maxFiles={MAX_CHAT_ATTACHMENTS}
              multiple
              onError={(error) => {
                if (error.code === 'max_files') {
                  toast.error(m.chat_attachments_max());
                }
              }}
              onSubmit={handleSubmit}
            >
              <PromptInputHeader>
                <PromptInputAttachmentsDisplay />
              </PromptInputHeader>
              <PromptInputBody>
                <PromptInputTextarea disabled={disabled} onChange={handleTextChange} value={text} />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputTools>
                  <PromptInputActionMenu>
                    <PromptInputActionMenuTrigger disabled={disabled} />
                    <PromptInputActionMenuContent className={'max-w-56 w-full'}>
                      <PromptInputActionAddAttachments className={'w-full'} />
                    </PromptInputActionMenuContent>
                  </PromptInputActionMenu>
                  <SpeechInput
                    className="shrink-0"
                    onTranscriptionChange={handleTranscriptionChange}
                    size="icon-sm"
                    variant="ghost"
                    // {...(disabled ? { disabled: true } : {})}
                    disabled // disable for now
                  />
                </PromptInputTools>

                <PromptInputSubmit
                  disabled={isSubmitDisabled}
                  onStop={() => void chat.stop()}
                  status={status}
                />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;

function ConversationLoadOlder({
  onLoadOlder,
  isLoading,
}: {
  onLoadOlder?: () => void;
  isLoading: boolean;
}) {
  const { scrollRef } = useStickToBottomContext();
  const [atTop, setAtTop] = useState(false);
  const prevHeightRef = useRef(0);
  const wasLoadingRef = useRef(false);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return undefined;

    const handleScroll = () => {
      setAtTop(element.scrollTop <= 1);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => element.removeEventListener('scroll', handleScroll);
  }, [scrollRef]);

  useEffect(() => {
    if (atTop && !isLoading && onLoadOlder) {
      const element = scrollRef.current;
      prevHeightRef.current = element?.scrollHeight ?? 0;
      onLoadOlder();
    }
  }, [atTop, isLoading, onLoadOlder, scrollRef]);

  useEffect(() => {
    if (wasLoadingRef.current && !isLoading) {
      const element = scrollRef.current;
      if (element && prevHeightRef.current > 0) {
        element.scrollTop += element.scrollHeight - prevHeightRef.current;
      }
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading, scrollRef]);

  if (!isLoading) return null;

  return (
    <output className="absolute top-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-background/80 p-2 shadow-sm backdrop-blur-sm">
      <Spinner className="size-4" />
    </output>
  );
}

type ChatPart = UIMessage['parts'][number];

type SourcePart = Extract<ChatPart, { type: 'source-document' | 'source-url' }>;

interface MessageViewProps {
  onEditSave: (userMessageId: string, newText: string) => void;
  onSwitchVersion: (targetMessageId: string) => void;
  onBranch: (assistantMessageId: string) => void;
  onRetry: (assistantMessageId: string) => void;
  onEditStart: (userMessageId: string) => void;
  onCreateNote: (message: UIMessage) => void;
  editingMessageId: string | null;
  onEditCancel: () => void;
  conversationId?: string;
  isGenerating: boolean;
  isStreaming: boolean;
  message: UIMessage;
}

function MessageView({
  editingMessageId,
  onSwitchVersion,
  conversationId,
  isGenerating,
  onEditCancel,
  onCreateNote,
  isStreaming,
  onEditStart,
  onEditSave,
  onBranch,
  message,
  onRetry,
}: MessageViewProps) {
  const copyableText = useMemo(() => getCopyableMessageText(message), [message]);

  const isAssistant = message.role === 'assistant';
  const isUser = message.role === 'user';
  const isEditing = editingMessageId === message.id;
  const actionsDisabled = isGenerating || isStreaming;
  const tree = useChatMessageTreeStore((state) => state.trees[conversationId ?? '']);
  const versionInfo = useMemo(
    // oxlint-disable-next-line typescript/no-unnecessary-condition -- tree is undefined before the store loads
    () => (tree ? getVersionInfo(tree, message.id) : null),
    [message.id, tree],
  );

  if (versionInfo) {
    return (
      <Message from={message.role}>
        <MessageBranch
          defaultBranch={versionInfo.current}
          onBranchChange={(branchIndex) => {
            const target = versionInfo.siblings[branchIndex];
            if (target && target !== message.id) {
              onSwitchVersion(target);
            }
          }}
        >
          <MessageBranchContent>
            {versionInfo.siblings.map((siblingId) => {
              const siblingMessage =
                siblingId === message.id ? message : tree.nodes[siblingId].message;

              return (
                <Fragment key={siblingId}>
                  <MessageBody
                    isEditing={editingMessageId === siblingMessage.id}
                    isStreaming={isStreaming && siblingId === message.id}
                    message={siblingMessage}
                    onEditCancel={onEditCancel}
                    onEditSave={(newText) => onEditSave(siblingMessage.id, newText)}
                  />
                </Fragment>
              );
            })}
          </MessageBranchContent>
          {!isStreaming && !isEditing && (
            <MessageToolbar
              className={cn({
                'justify-start': isAssistant,
                'justify-end': isUser,
              })}
            >
              <MessageBranchSelector>
                <MessageBranchPrevious />
                <MessageBranchPage />
                <MessageBranchNext />
              </MessageBranchSelector>
              <MessageActions>
                {isAssistant && (
                  <MessageAction
                    disabled={actionsDisabled}
                    label={m.chat_message_retry()}
                    onClick={() => onRetry(message.id)}
                    tooltip={m.chat_message_retry()}
                  >
                    <RefreshCcwIcon />
                  </MessageAction>
                )}
                {isUser && (
                  <MessageAction
                    disabled={actionsDisabled}
                    label={m.chat_message_edit()}
                    onClick={() => onEditStart(message.id)}
                    tooltip={m.chat_message_edit()}
                  >
                    <PencilIcon />
                  </MessageAction>
                )}
                {copyableText && <MessageCopyAction text={copyableText} />}
                {isAssistant && (
                  <MessageMoreMenu
                    disabled={actionsDisabled}
                    onBranch={() => onBranch(message.id)}
                    onCreateNote={() => onCreateNote(message)}
                  />
                )}
              </MessageActions>
            </MessageToolbar>
          )}
        </MessageBranch>
      </Message>
    );
  }

  return (
    <Message from={message.role}>
      <MessageBody
        isEditing={isEditing && isUser}
        isStreaming={isStreaming}
        message={message}
        onEditCancel={onEditCancel}
        onEditSave={(newText) => onEditSave(message.id, newText)}
      />

      {!isEditing && !isStreaming && (
        <MessageActions>
          {isAssistant && (
            <MessageAction
              disabled={actionsDisabled}
              label={m.chat_message_retry()}
              onClick={() => onRetry(message.id)}
              tooltip={m.chat_message_retry()}
            >
              <RefreshCcwIcon />
            </MessageAction>
          )}
          {isUser && (
            <MessageAction
              disabled={actionsDisabled}
              label={m.chat_message_edit()}
              onClick={() => onEditStart(message.id)}
              tooltip={m.chat_message_edit()}
            >
              <PencilIcon />
            </MessageAction>
          )}
          {copyableText && <MessageCopyAction text={copyableText} />}
          {isAssistant && (
            <MessageMoreMenu
              disabled={actionsDisabled || !conversationId}
              onBranch={() => onBranch(message.id)}
              onCreateNote={() => onCreateNote(message)}
            />
          )}
        </MessageActions>
      )}
    </Message>
  );
}

function MessageBody({
  onEditCancel,
  isStreaming,
  onEditSave,
  isEditing,
  message,
}: {
  onEditSave?: (newText: string) => void;
  onEditCancel?: () => void;
  isStreaming: boolean;
  isEditing?: boolean;
  message: UIMessage;
}) {
  const sourceParts = message.parts.filter(
    (part): part is SourcePart => part.type === 'source-url' || part.type === 'source-document',
  );
  const reasoningParts = message.parts.filter(
    (part): part is Extract<ChatPart, { type: 'reasoning' }> => part.type === 'reasoning',
  );
  const textParts = message.parts.filter(
    (part): part is Extract<ChatPart, { type: 'text' }> => part.type === 'text',
  );
  const fileParts = message.parts.filter(
    (part): part is Extract<ChatPart, { type: 'file' }> => part.type === 'file',
  );

  return (
    <>
      {sourceParts.length > 0 && (
        <Sources>
          <SourcesTrigger count={sourceParts.length} />
          <SourcesContent>
            {sourceParts.map((part, index) => (
              <Source
                href={part.type === 'source-url' ? part.url : undefined}
                // Source parts carry no stable id; they are positional and
                // static once delivered, so the list index is a safe key.
                // oxlint-disable-next-line @eslint-react/no-array-index-key
                key={index}
                title={part.title}
              />
            ))}
          </SourcesContent>
        </Sources>
      )}
      {reasoningParts.map((part, index) => (
        <Reasoning
          defaultOpen={false}
          // Reasoning parts have no id; positional ordering is stable for a
          // given message, so the list index is a safe key.
          // oxlint-disable-next-line @eslint-react/no-array-index-key
          key={index}
          isStreaming={part.state === 'streaming'}
        >
          <ReasoningTrigger />
          <ReasoningContent>{part.text}</ReasoningContent>
        </Reasoning>
      ))}
      {fileParts.length > 0 && (
        <MessageContent className="group-[.is-user]:bg-transparent">
          <Attachments variant="inline">
            {fileParts.map((part) => {
              const attachmentData = {
                filename: part.filename ?? 'Untitled',
                mediaType: part.mediaType,
                type: 'file' as const,
                url: part.url,
                id: part.url,
              };

              const mediaCategory = getMediaCategory(attachmentData);
              const label = getAttachmentLabel(attachmentData);

              return (
                <AttachmentHoverCard key={part.url}>
                  <AttachmentHoverCardTrigger
                    render={
                      <Attachment data={attachmentData}>
                        <div className="relative size-5 shrink-0">
                          <AttachmentPreview />
                        </div>
                        <AttachmentInfo />
                      </Attachment>
                    }
                  />

                  <AttachmentHoverCardContent className="rounded-md">
                    <div className="space-y-3">
                      {mediaCategory === 'image' && part.url && (
                        <div className="flex max-h-96 w-80 items-center justify-center overflow-hidden rounded-md border">
                          <img
                            alt={label}
                            className="max-h-full max-w-full object-contain"
                            src={part.url}
                          />
                        </div>
                      )}
                      <div className="space-y-1 px-0.5">
                        <h4 className="font-semibold text-sm leading-none">{label}</h4>
                        {part.mediaType && (
                          <p className="font-mono text-muted-foreground text-xs">
                            {part.mediaType}
                          </p>
                        )}
                      </div>
                    </div>
                  </AttachmentHoverCardContent>
                </AttachmentHoverCard>
              );
            })}
          </Attachments>
        </MessageContent>
      )}
      {isEditing && onEditSave && onEditCancel ? (
        <MessageEditForm
          initialText={textParts.map((part) => part.text).join('\n\n')}
          key={message.id}
          onCancel={onEditCancel}
          onSave={onEditSave}
        />
      ) : (
        textParts.map((part, index) => (
          // Text parts have no id and may change content while streaming;
          // a content-derived key would remount and interrupt animations.
          // oxlint-disable-next-line @eslint-react/no-array-index-key
          <MessageContent key={index}>
            <MessageResponse isAnimating={isStreaming}>{part.text}</MessageResponse>
          </MessageContent>
        ))
      )}
    </>
  );
}

function MessageMoreMenu({
  onCreateNote,
  disabled,
  onBranch,
}: {
  onCreateNote: () => void;
  onBranch: () => void;
  disabled: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        render={
          <Button aria-label={m.chat_message_more()} size="icon-sm" type="button" variant="ghost">
            <MoreHorizontalIcon />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={onBranch}>
          <GitBranchIcon className="size-4" />
          {m.chat_message_branch()}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCreateNote}>
          <FilePlusIcon className="size-4" />
          {m.chat_message_create_note()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MessageEditForm({
  initialText,
  onCancel,
  onSave,
}: {
  onSave: (newText: string) => void;
  onCancel: () => void;
  initialText: string;
}) {
  const [draft, setDraft] = useState(initialText);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const trimmed = draft.trim();
        if (trimmed) onSave(trimmed);
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
      }
    },
    [draft, onCancel, onSave],
  );

  return (
    <MessageContent className="w-full">
      <Textarea
        autoFocus
        className="min-h-24 w-full"
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        value={draft}
      />
      <MessageActions>
        <MessageAction
          label={m.chat_message_edit_save()}
          onClick={() => {
            const trimmed = draft.trim();
            if (trimmed) onSave(trimmed);
          }}
          tooltip={m.chat_message_edit_save()}
        >
          <CheckIcon />
        </MessageAction>
        <MessageAction
          label={m.chat_message_edit_cancel()}
          onClick={onCancel}
          tooltip={m.chat_message_edit_cancel()}
        >
          <XIcon />
        </MessageAction>
      </MessageActions>
    </MessageContent>
  );
}

function getCopyableMessageText(message: UIMessage): string {
  const sections: Array<string> = [];

  for (const part of message.parts) {
    if (part.type === 'text') {
      sections.push(part.text);
    } else if (
      part.type === 'file' &&
      part.url.startsWith('data:') &&
      isTextLikeMediaType(part.mediaType)
    ) {
      sections.push(`[${part.filename ?? 'Attachment'}]\n${decodeDataUrl(part.url)}`);
    }
  }

  return sections.join('\n\n');
}

function MessageCopyAction({ text }: { text: string }) {
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    toast.success(m.chat_message_copied());
  }, [text]);

  return (
    <MessageAction
      tooltip={m.chat_message_copy()}
      label={m.chat_message_copy()}
      onClick={() => void handleCopy()}
    >
      <CopyIcon />
    </MessageAction>
  );
}
