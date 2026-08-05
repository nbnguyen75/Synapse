import type { UIMessage } from 'ai';

import { DefaultChatTransport } from 'ai';

import { env } from '@/config/env';

import { authClient } from '@/lib/auth';

const CHAT_ENDPOINT = `${env.VITE_API_URL}/api/v1/ai`;

export function getDefaultMessageMetadata() {
  if (typeof window === 'undefined') {
    return { createdAt: Date.now() };
  }

  return {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    locale: navigator.language,
    createdAt: Date.now(),
  };
}

export class SynapseChatTransport extends DefaultChatTransport<UIMessage> {
  private conversationId: string | undefined;

  constructor(
    initialConversationId: string | undefined,
    onConversationId?: (conversationId: string) => void,
    getExtraMetadata?: () => Record<string, unknown>,
  ) {
    super({
      prepareSendMessagesRequest: async ({ messages }) => {
        const lastUserMessage = [...messages]
          .reverse()
          .find((message) => message.role === 'user');

        if (!lastUserMessage) {
          throw new Error('No user message to send.');
        }

        const { error, data } = await authClient.token();

        const headers: HeadersInit = {};
        if (!error && data?.token) {
          headers.Authorization = `Bearer ${data.token}`;
        }

        const messageWithMetadata = {
          ...lastUserMessage,
          metadata: {
            ...getDefaultMessageMetadata(),
            ...(lastUserMessage.metadata as
              Record<string, unknown> | undefined),
            ...(getExtraMetadata ? getExtraMetadata() : {}),
          },
        };

        return {
          body: {
            conversationId: this.conversationId,
            message: messageWithMetadata,
          },
          headers,
        };
      },
      fetch: async (input, init) => {
        const response = await fetch(input, init);

        const conversationId = response.headers.get('X-Conversation-Id');
        if (conversationId) {
          this.conversationId = conversationId;
          onConversationId?.(conversationId);
        }

        return response;
      },
      credentials: 'include',
      api: CHAT_ENDPOINT,
    });

    this.conversationId = initialConversationId;
  }
}
