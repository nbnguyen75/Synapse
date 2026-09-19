import type { MessageMetadata } from '@/database/schema';
import type { UserAiSettings } from '@/settings';
import type { UIMessage } from 'ai';

import {
  convertToModelMessages,
  createIdGenerator,
  createUIMessageStreamResponse,
  isStepCount,
  smoothStream,
  streamText,
  toUIMessageStream,
} from 'ai';

import {
  createSearchChatHistoriesTool,
  createSearchNotesTool,
  createSearchWebTool,
} from '@/chat/tools';
import { appendMessage, getOrCreateConversation, loadActivePath } from '@/conversation';
import { CHAT_TEMPERATURE, RECENT_HISTORY_LIMIT } from '@/chat/constants';
import { cleanPartsForStorage, sanitizeMessages } from '@/chat/messages';
import { getChatModel } from '@/providers/ai-studio';
import { buildSystemPrompt } from '@/chat/prompt';
import { isRateLimitOrQuota } from '@/lib/retry';
import { MAX_OUTPUT_TOKENS } from '@/settings';

export function getChatTools(userId: string, conversationId: string) {
  return {
    searchChatHistories: createSearchChatHistoriesTool(conversationId),
    searchNotes: createSearchNotesTool(userId),
    searchWeb: createSearchWebTool(),
  };
}

export async function prepareChatTurn(
  userId: string,
  conversationId: undefined | string,
  userMessage: UIMessage,
  parentMessageId?: string,
) {
  const conversation = await getOrCreateConversation(userId, conversationId);
  const context = parentMessageId ? await loadActivePath(conversation.id, parentMessageId) : [];

  await appendMessage(conversation.id, userMessage, parentMessageId);

  return { history: context, conversation };
}

export async function saveAssistantReply(
  conversationId: string,
  message: UIMessage,
  metadata?: Record<string, unknown>,
  parentMessageId?: string,
) {
  const cleanedParts = cleanPartsForStorage(message.parts);

  if (cleanedParts.length === 0) return;

  const messageWithMetadata: UIMessage = {
    ...message,
    metadata: {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- UIMessage metadata is unknown at the boundary
      ...(message.metadata as MessageMetadata),
      ...metadata,
      createdAt: Date.now(),
    },
    parts: cleanedParts,
  };

  await appendMessage(conversationId, messageWithMetadata, parentMessageId);
}

interface CreateChatStreamOptions {
  contextMessages: Array<UIMessage>;
  lastUserMessage: UIMessage;
  settings: UserAiSettings;
  conversationId: string;
  userId: string;
}

export async function createChatStreamResponse(options: CreateChatStreamOptions) {
  const { contextMessages, lastUserMessage, conversationId, settings } = options;

  const picked = getChatModel();

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- UIMessage metadata is unknown at the boundary
  const systemPrompt = buildSystemPrompt(settings, lastUserMessage.metadata as MessageMetadata);

  const recentHistory = contextMessages.slice(-RECENT_HISTORY_LIMIT);
  const rawMessages = [...recentHistory, lastUserMessage].filter((m) => m.role !== 'system');

  const cleanMessages = sanitizeMessages(rawMessages, {
    maxHistory: RECENT_HISTORY_LIMIT,
    stripOldAttachments: false,
  });

  const segmenterLocale = settings.language === 'en' ? 'en' : 'vi';
  const segmenter = new Intl.Segmenter(segmenterLocale, { granularity: 'word' });

  const result = streamText({
    onError: ({ error }) => {
      if (isRateLimitOrQuota(error)) picked.reportRateLimit();
      console.error('[Chat streamText error]:', error);
    },
    experimental_transform: smoothStream({
      chunking: segmenter,
      delayInMs: 5,
    }),
    maxOutputTokens: MAX_OUTPUT_TOKENS[settings.responseLength],
    messages: await convertToModelMessages(cleanMessages),
    tools: getChatTools(options.userId, conversationId),
    temperature: CHAT_TEMPERATURE,
    instructions: systemPrompt,
    stopWhen: isStepCount(5),
    model: picked.model,
  });

  const uiStream = toUIMessageStream({
    onEnd: async ({ messages }) => {
      try {
        const assistantMsg = messages.at(-1);
        if (assistantMsg?.role === 'assistant') {
          const usage = await result.usage;

          await saveAssistantReply(
            conversationId,
            assistantMsg,
            {
              tokens: {
                outputTokens: usage.outputTokens,
                inputTokens: usage.inputTokens,
                totalTokens: usage.totalTokens,
              },
              responseLength: settings.responseLength,
              model: picked.modelId,
            },
            lastUserMessage.id,
          );
        }
      } catch (error) {
        console.error('[Save Assistant Reply Failed]:', error);
      }
    },
    generateMessageId: createIdGenerator({ prefix: 'msg', size: 16 }),
    originalMessages: [...contextMessages, lastUserMessage],
    stream: result.stream,
  });

  const response = createUIMessageStreamResponse({ stream: uiStream });
  response.headers.set('X-Conversation-Id', conversationId);

  response.headers.set('X-Accel-Buffering', 'no');
  response.headers.set('Cache-Control', 'no-cache, no-transform');
  response.headers.set('Content-Type', 'text/x-unknown');

  return response;
}
