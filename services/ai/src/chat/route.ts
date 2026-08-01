import {
	convertToModelMessages,
	createIdGenerator,
	createUIMessageStreamResponse,
	streamText,
	toUIMessageStream
} from 'ai';

import { Hono } from 'hono';

import {
	buildSystemPrompt,
	extractQuestionText,
	prepareChatTurn,
	retrieveRelevantNotes,
	saveAssistantReply,
	validateChatMessages
} from '@/chat/services';
import { throwFromReason, ValidationError } from '@/lib/errors';
import { getUserSettings, MAX_OUTPUT_TOKENS } from '@/settings';
import { MAX_QUESTION_LENGTH } from '@/chat/constants';
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
		const relevantNotes = await retrieveRelevantNotes(userId, question);
		const systemPrompt = await buildSystemPrompt(settings, relevantNotes);

		const result = streamText({
			messages: await convertToModelMessages(
				[...history, lastUserMessage].filter((m) => m.role !== 'system')
			),
			maxOutputTokens: MAX_OUTPUT_TOKENS[settings.responseLength],
			instructions: systemPrompt,
			model: chatModel,
			temperature: 0.3
		});

		const uiStream = toUIMessageStream({
			onEnd: async ({ messages }) => {
				const assistantMsg = messages.at(-1);
				if (assistantMsg?.role === 'assistant') {
					await saveAssistantReply(conversation.id, extractQuestionText(assistantMsg));
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
