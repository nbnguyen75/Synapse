import type { UIMessage } from 'ai';

import { useEffect, useMemo, useRef } from 'react';

import { useChat } from '@ai-sdk/react';

import { CompanionChatTransport } from '@/features/companion/config/companion-chat-transport';

export interface UseCompanionChatSessionOptions {
  onFinish?: (result: { message: UIMessage; isError?: boolean }) => void;
  onConversationId?: (conversationId: string) => void;
  extraMetadata?: Record<string, unknown>;
  initialMessages?: Array<UIMessage>;
  onError?: (error: Error) => void;
  initialConversationId?: string;
}

export function useCompanionChatSession({
  initialConversationId,
  onConversationId,
  initialMessages,
  extraMetadata,
  onFinish,
  onError,
}: UseCompanionChatSessionOptions) {
  const chatId = initialConversationId ?? 'new-chat';
  const initializedIdRef = useRef<string | null>(null);

  const transport = useMemo(
    () =>
      new CompanionChatTransport(
        initialConversationId,
        onConversationId,
        extraMetadata ? () => extraMetadata : undefined,
      ),
    [initialConversationId, onConversationId, extraMetadata],
  );

  const chat = useChat({
    messages: initialMessages,
    id: chatId,
    transport,
    onFinish,
    onError,
  });

  useEffect(() => {
    if (!initialConversationId) {
      initializedIdRef.current = null;
      return;
    }

    if (initializedIdRef.current !== initialConversationId) {
      if (initialMessages && initialMessages.length > 0) {
        chat.setMessages(initialMessages);
        initializedIdRef.current = initialConversationId;
      }
    }
  }, [initialConversationId, initialMessages, chat]);

  return chat;
}
