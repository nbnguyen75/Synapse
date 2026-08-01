import type { UIMessage } from 'ai';

import { useState } from 'react';

import { useChat } from '@ai-sdk/react';

import { SynapseChatTransport } from '../lib/chat-transport';

export interface UseChatSessionOptions {
  onConversationId?: (conversationId: string) => void;
  onError?: (error: Error) => void;
  initialConversationId?: string;
  initialMessages?: UIMessage[];
}

export function useChatSession({
  initialConversationId,
  onConversationId,
  initialMessages,
  onError,
}: UseChatSessionOptions) {
  const [chatId] = useState(() => initialConversationId ?? 'new-chat');
  const [transport] = useState(
    () => new SynapseChatTransport(initialConversationId, onConversationId),
  );

  const chat = useChat({
    messages: initialMessages,
    id: chatId,
    transport,
    onError,
  });

  return chat;
}
