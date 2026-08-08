import type { UIMessage } from 'ai';

import { useState } from 'react';

import { useChat } from '@ai-sdk/react';

import { CompanionChatTransport } from '@/features/companion/config/companion-chat-transport';

export interface UseCompanionChatSessionOptions {
  onConversationId?: (conversationId: string) => void;
  extraMetadata?: Record<string, unknown>;
  onError?: (error: Error) => void;
  initialConversationId?: string;
  initialMessages?: UIMessage[];
}

export function useCompanionChatSession({
  initialConversationId,
  onConversationId,
  initialMessages,
  extraMetadata,
  onError,
}: UseCompanionChatSessionOptions) {
  const [chatId] = useState(() => initialConversationId ?? 'new-chat');
  const [transport] = useState(
    () =>
      new CompanionChatTransport(
        initialConversationId,
        onConversationId,
        extraMetadata ? () => extraMetadata : undefined,
      ),
  );

  const chat = useChat({
    messages: initialMessages,
    id: chatId,
    transport,
    onError,
  });

  return chat;
}
