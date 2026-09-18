import type { UIMessage } from 'ai';

import { useMemo } from 'react';

import { useChat } from '@ai-sdk/react';

import { CompanionChatTransport } from '@/features/companion/config/companion-chat-transport';

export interface UseCompanionChatSessionOptions {
  onFinish?: ((result: { message: UIMessage; isError?: boolean }) => void) | undefined;
  onConversationId?: ((conversationId: string) => void) | undefined;
  initialMessages?: Array<UIMessage> | undefined;
  initialConversationId?: undefined | string;
  extraMetadata?: Record<string, unknown>;
  onError?: (error: Error) => void;
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

  const transport = useMemo(
    () =>
      new CompanionChatTransport(
        initialConversationId,
        onConversationId,
        extraMetadata ? () => extraMetadata : undefined,
      ),
    [initialConversationId, onConversationId, extraMetadata],
  );

  // Seeded once by useChat; all later hydration (pagination, refetch,
  // conversation switch) is owned by useMessageTree's single merge effect.
  const chat = useChat({
    messages: initialMessages ?? [],
    id: chatId,
    transport,
    ...(onFinish ? { onFinish } : {}),
    ...(onError ? { onError } : {}),
  });

  return chat;
}
