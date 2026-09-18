import type { ConversationTreeState } from '@/features/companion/lib/message-tree';
import type { FileUIPart, UIMessage } from 'ai';

import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { toast } from 'sonner';

import { useChatMessageTreeStore } from '@/store/chat-message-tree-store';
import { useCompanionStore } from '@/store/companion-store';
import { useSettingsStore } from '@/store/settings-store';

import { m } from '@/paraglide/messages';

import {
  editUserMessage,
  getActivePath,
  mergeTreeRows,
  retryAssistantMessage,
  switchVersion,
  toTreeRows,
} from '@/features/companion/lib/message-tree';
import {
  useCloneConversationMutation,
  useGetConversationsQuery,
  useSetCurrentMessageMutation,
} from '@/features/companion/hooks/use-companion-conversation';
import { useCompanionChatSession } from '@/features/companion/hooks/use-companion-chat-session';

interface UseMessageTreeOptions {
  onFinish?: ((result: { message: UIMessage; isError?: boolean }) => void) | undefined;
  onConversationId?: ((conversationId: string) => void) | undefined;
  initialConversationId?: undefined | string;
  onEditCommitted?: (() => void) | undefined;
  messages?: Array<UIMessage> | undefined;
}

export function useMessageTree({
  initialConversationId,
  onConversationId,
  onEditCommitted,
  messages: loadedMessages,
  onFinish,
}: UseMessageTreeOptions) {
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

  // Single owner of chat hydration: server pages merge into the tree, the
  // active path syncs into useChat. Pagination-safe (merge upserts by id),
  // no clobber of newly fetched older pages with a stale tree snapshot.
  const chatMessages = chat.messages;
  const setChatMessages = chat.setMessages;

  useEffect(() => {
    if (!initialConversationId || !loadedMessages || isGenerating) return;
    if (loadedMessages.length === 0) return;

    const rows = toTreeRows(loadedMessages);
    const leaf = conversation?.currentMessageId ?? tree?.currentLeafId ?? rows.at(-1)?.id;
    const nextTree = mergeTreeRows(tree, rows, leaf);
    const coversRows = tree && rows.every((row) => tree.nodes[row.id]);
    if (!tree || !coversRows || tree.currentLeafId !== leaf) {
      setTree(initialConversationId, nextTree);
    }

    const path = getActivePath(nextTree);
    if (path.length === 0) return;

    const pathIds = path.map((node) => node.id);
    const isSynced =
      chatMessages.length === pathIds.length &&
      chatMessages.every((message, index) => message.id === pathIds[index]);
    if (!isSynced) {
      setChatMessages(path.map((node) => node.message));
    }
  }, [
    chatMessages,
    setChatMessages,
    conversation?.currentMessageId,
    initialConversationId,
    isGenerating,
    loadedMessages,
    setTree,
    tree,
  ]);

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
        // chat.messages already holds the full local tail (user + assistant);
        // merge upserts both so the user node is never dropped (the old
        // at(-2) parent lookup skipped it) and other branches are preserved.
        const rows = toTreeRows(chat.messages);
        setTree(conversationId, mergeTreeRows(getTree(conversationId), rows, result.message.id));
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

      const editedNode = tree.nodes[userMessageId];
      if (!editedNode) return;
      const fileParts = editedNode.message.parts.filter(
        (part): part is FileUIPart => part.type === 'file',
      );

      setTree(initialConversationId, result.state);
      chat.setMessages(getActivePath(result.state).map((node) => node.message));
      onEditCommitted?.();
      void chat.sendMessage({
        messageId: result.editedMessage.id,
        files: fileParts,
        text: newText,
      });
    },
    [chat, getTree, initialConversationId, onEditCommitted, setTree],
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

  return {
    handleSwitchVersion,
    handleEditSave,
    isGenerating,
    handleRetry,
    handleBranch,
    chat,
  };
}
