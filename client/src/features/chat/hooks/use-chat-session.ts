import type { UIMessage } from 'ai';

import { useState } from 'react';

import { useChat } from '@ai-sdk/react';

import { SynapseChatTransport } from '@/features/chat/lib/chat-transport';

export interface UseChatSessionOptions {
  onConversationId?: (conversationId: string) => void;
  extraMetadata?: Record<string, unknown>;
  onError?: (error: Error) => void;
  initialConversationId?: string;
  initialMessages?: UIMessage[];
}

export function useChatSession({
  initialConversationId,
  onConversationId,
  initialMessages,
  extraMetadata,
  onError,
}: UseChatSessionOptions) {
  const [chatId] = useState(() => initialConversationId ?? 'new-chat');
  const [transport] = useState(
    () =>
      new SynapseChatTransport(
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
