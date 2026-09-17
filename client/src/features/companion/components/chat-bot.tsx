import type { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import type { UIMessage } from 'ai';

import { useCallback, useImperativeHandle, useState } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Shimmer } from '@/components/ai-elements/shimmer';

import { SparklesIcon } from 'lucide-react';

import { ConversationPromptInput } from '@/features/companion/components/conversation-prompt-input';
import { ConversationLoadOlder } from '@/features/companion/components/conversation-load-older';
import { NOTE_CONTENT_MAX_LENGTH, useNoteCreatePrefillStore } from '@/features/notes';
import { getCopyableMessageText } from '@/features/companion/lib/message-text';
import { useMessageTree } from '@/features/companion/hooks/use-message-tree';
import { MessageView } from '@/features/companion/components/message-view';

export interface ChatBotHandle {
  prependMessages: (messages: Array<UIMessage>) => void;
  sendText: (text: string) => void;
}

interface ChatBotProps {
  onFinish?: ((result: { message: UIMessage; isError?: boolean }) => void) | undefined;
  onConversationId?: ((conversationId: string) => void) | undefined;
  onLoadOlderMessages?: (() => void) | undefined;
  initialConversationId?: undefined | string;
  messages?: Array<UIMessage> | undefined;
  isLoadingOlderMessages?: boolean;
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
}: ChatBotProps & { ref?: React.Ref<ChatBotHandle> | undefined }) {
  const [text, setText] = useState<string>('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleEditCommitted = useCallback(() => setEditingMessageId(null), []);

  const { handleSwitchVersion, handleEditSave, isGenerating, handleRetry, handleBranch, chat } =
    useMessageTree({
      initialConversationId,
      onConversationId,
      onEditCommitted: handleEditCommitted,
      messages: loadedMessages,
      onFinish,
    });

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

  const handleTextChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  }, []);

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

      <ConversationPromptInput
        centered={centered}
        disabled={disabled}
        onStop={() => void chat.stop()}
        onSubmit={handleSubmit}
        onTextChange={handleTextChange}
        status={chat.status}
        text={text}
      />
    </div>
  );
}

export default ChatBot;
