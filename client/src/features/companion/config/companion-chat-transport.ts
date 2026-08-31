import type { UIMessage } from 'ai';

import { DefaultChatTransport } from 'ai';

import { useChatMessageTreeStore } from '@/store/chat-message-tree-store';

import { env } from '@/config/env';

import { authClient } from '@/lib/auth';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

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

export class CompanionChatTransport extends DefaultChatTransport<UIMessage> {
  private conversationId: undefined | string;

  constructor(
    initialConversationId: undefined | string,
    onConversationId?: (conversationId: string) => void,
    getExtraMetadata?: () => Record<string, unknown>,
  ) {
    const api = `${env.VITE_API_URL}/api/v1/ai/chat`;
    super({
      prepareSendMessagesRequest: async ({ messageId, messages, trigger }) => {
        const lastUserMessage = [...messages]
          .toReversed()
          .find((message) => message.role === 'user');

        if (!lastUserMessage) {
          throw new Error('No user message to send.');
        }

        const { error, data } = await authClient.token();

        const headers: HeadersInit = {};
        if (!error && data.token) {
          headers.Authorization = `Bearer ${data.token}`;
        }

        if (trigger === 'regenerate-message') {
          return {
            body: {
              conversationId: this.conversationId,
              assistantMessageId: messageId,
            },
            api: `${api}/regenerate`,
            headers,
          };
        }

        const messageWithMetadata = {
          ...lastUserMessage,
          metadata: {
            ...getDefaultMessageMetadata(),
            ...(isRecord(lastUserMessage.metadata) ? lastUserMessage.metadata : {}),
            ...(getExtraMetadata ? getExtraMetadata() : {}),
          },
          parts: lastUserMessage.parts,
        };

        const treeParentId = this.conversationId
          ? useChatMessageTreeStore.getState().getTree(this.conversationId)?.nodes[
              lastUserMessage.id
            ]?.parentId
          : undefined;

        return {
          body: {
            parentMessageId: treeParentId ?? messages.at(-2)?.id,
            conversationId: this.conversationId,
            message: messageWithMetadata,
          },
          headers,
          api,
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
      api,
    });

    this.conversationId = initialConversationId;
  }
}
