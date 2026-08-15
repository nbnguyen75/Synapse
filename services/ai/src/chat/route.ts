import { Hono } from 'hono';

import {
	createChatStreamResponse,
	extractQuestionText,
	prepareChatTurn,
	validateChatMessages
} from '@/chat/services';
import { chatRequestSchema, regenerateRequestSchema } from '@/chat/schemas';
import { checkConversationOwnership, loadActivePath } from '@/conversation';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { findMessageById } from '@/conversation/repository';
import { MAX_QUESTION_LENGTH } from '@/chat/constants';
import { authJwksMiddleware } from '@/middleware/auth';
import { zValidator } from '@/middleware/validation';
import { getUserSettings } from '@/settings';

function assertQuestionValid(question: string) {
	if (!question.trim()) throw new ValidationError('Empty question');
	if (question.length > MAX_QUESTION_LENGTH) {
		throw new ValidationError(`Question too long (max ${MAX_QUESTION_LENGTH} characters)`);
	}
}

const chatRoute = new Hono()
	.use(authJwksMiddleware)
	.post('/', zValidator('json', chatRequestSchema), async (c) => {
		const userId = c.get('userId');
		const body = c.req.valid('json');

		const validated = await validateChatMessages(body.message);
		if (!validated.success) throw new ValidationError(validated.error.message);

		const { data: messages } = validated;
		const lastUserMessage = messages[0];
		const question = extractQuestionText(lastUserMessage);
		assertQuestionValid(question);

		const [settings, { conversation, history }] = await Promise.all([
			getUserSettings(userId),
			prepareChatTurn(userId, body.conversationId, lastUserMessage, body.parentMessageId)
		]);

		return createChatStreamResponse({
			conversationId: conversation.id,
			contextMessages: history,
			lastUserMessage,
			settings,
			userId
		});
	})
	.post('/regenerate', zValidator('json', regenerateRequestSchema), async (c) => {
		const userId = c.get('userId');
		const { assistantMessageId, conversationId } = c.req.valid('json');

		await checkConversationOwnership(userId, conversationId);

		const assistantMessage = await findMessageById(assistantMessageId);
		if (
			assistantMessage?.conversationId !== conversationId ||
			assistantMessage.role !== 'assistant'
		) {
			throw new NotFoundError('Tin nhắn không tồn tại trong cuộc trò chuyện này');
		}

		if (!assistantMessage.parentId) {
			throw new ValidationError('Tin nhắn này không thể tạo lại');
		}

		const context = await loadActivePath(conversationId, assistantMessage.parentId);
		const lastUserMessage = context.at(-1);
		if (!lastUserMessage) {
			throw new ValidationError('Không tìm thấy tin nhắn gốc');
		}

		const question = extractQuestionText(lastUserMessage);
		assertQuestionValid(question);

		const settings = await getUserSettings(userId);

		return createChatStreamResponse({
			contextMessages: context.slice(0, -1),
			lastUserMessage,
			conversationId,
			settings,
			userId
		});
	});

export default chatRoute;
