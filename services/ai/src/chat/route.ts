import type { MessageMetadata } from '@/database/schema';

import {
	convertToModelMessages,
	createIdGenerator,
	createUIMessageStreamResponse,
	isStepCount,
	smoothStream,
	streamText,
	toUIMessageStream
} from 'ai';

import { Hono } from 'hono';

import {
	buildSystemPrompt,
	extractQuestionText,
	getChatTools,
	prepareChatTurn,
	sanitizeMessages,
	saveAssistantReply,
	validateChatMessages
} from '@/chat/services';
import { CHAT_TEMPERATURE, MAX_QUESTION_LENGTH, RECENT_HISTORY_LIMIT } from '@/chat/constants';
import { throwFromReason, ValidationError } from '@/lib/errors';
import { getUserSettings, MAX_OUTPUT_TOKENS } from '@/settings';
import { authJwksMiddleware } from '@/middleware/auth';
import { zValidator } from '@/middleware/validation';
import { chatRequestSchema } from '@/chat/schemas';
import { chatModel } from '@/lib/ai';

const chatRoute = new Hono()
	.use(authJwksMiddleware)
	.post('', zValidator('json', chatRequestSchema), async (c) => {
		const userId = c.get('userId');
		const body = c.req.valid('json');

		const validated = await validateChatMessages(body.message);
		if (!validated.success) throw new ValidationError(validated.error.message);

		const { data: messages } = validated;
		const lastUserMessage = messages[0];
		const question = extractQuestionText(lastUserMessage);
		if (!question.trim()) throw new ValidationError('Empty question');
		if (question.length > MAX_QUESTION_LENGTH) {
			throw new ValidationError(`Question too long (max ${MAX_QUESTION_LENGTH} characters)`);
		}

		const turnResult = await prepareChatTurn(userId, body.conversationId, lastUserMessage);
		if (!turnResult.success) throwFromReason(turnResult.reason, 'Conversation');

		const { conversation, history } = turnResult.data;
		const settings = await getUserSettings(userId);

		const systemPrompt = buildSystemPrompt(settings, lastUserMessage.metadata as MessageMetadata);

		const recentHistory = history.slice(RECENT_HISTORY_LIMIT);
		const rawMessages = [...recentHistory, lastUserMessage].filter((m) => m.role !== 'system');

    const cleanMessages = sanitizeMessages(rawMessages);

		const result = streamText({
      // ! Chunking not work well with Vietnamese https://ai-sdk.dev/docs/reference/ai-sdk-core/smooth-stream#word-chunking-caveats-with-non-latin-languages
			experimental_transform: smoothStream({
				chunking: 'word',
				delayInMs: 15
			}),
			onError: ({ error }) => {
				console.error('[Chat streamText error]:', error);
			},
			maxOutputTokens: MAX_OUTPUT_TOKENS[settings.responseLength],
			messages: await convertToModelMessages(cleanMessages),
			tools: getChatTools(userId, conversation.id),
			temperature: CHAT_TEMPERATURE,
			instructions: systemPrompt,
			stopWhen: isStepCount(5),
			model: chatModel
		});

		const uiStream = toUIMessageStream({
			onEnd: async ({ messages }) => {
				try {
					const assistantMsg = messages.at(-1);
					if (assistantMsg?.role === 'assistant') {
						await saveAssistantReply(conversation.id, assistantMsg);

						const usage = await result.usage;

						await saveAssistantReply(conversation.id, assistantMsg, {
							tokens: {
								outputTokens: usage.outputTokens,
								inputTokens: usage.inputTokens,
								totalTokens: usage.totalTokens
							},
							responseLength: settings.responseLength,
							model: chatModel.modelId
						});
					}
				} catch (error) {
					console.error('[Save Assistant Reply Failed]:', error);
				}
			},
			generateMessageId: createIdGenerator({ prefix: 'msg', size: 16 }),
			originalMessages: [...history, lastUserMessage],
			stream: result.stream
		});

		const response = createUIMessageStreamResponse({ stream: uiStream });
		response.headers.set('X-Conversation-Id', conversation.id);

		return response;
	});

export default chatRoute;
