import { Hono } from 'hono';

import {
	checkConversationOwnership,
	cloneConversation,
	deleteConversation,
	listConversations,
	loadMessagesPage,
	renameConversation,
	setConversationCurrentMessage,
	setConversationFavorite
} from '@/conversation/services';
import {
	cloneConversationSchema,
	conversationIdParamSchema,
	currentMessageSchema,
	favoriteConversationSchema,
	messagesQuerySchema,
	renameConversationSchema
} from '@/conversation/schemas';
import { authJwksMiddleware } from '@/middleware/auth';
import { zValidator } from '@/middleware/validation';
import { ok } from '@/middleware/responses';

const conversationRoute = new Hono()
	.basePath('/conversations')
	.use(authJwksMiddleware)
	.get('/', async (c) => {
		const rows = await listConversations(c.get('userId'));

		return ok(c, rows);
	})
	.get(
		'/:id/messages',
		zValidator('param', conversationIdParamSchema),
		zValidator('query', messagesQuerySchema),
		async (c) => {
			const { id } = c.req.valid('param');
			const { offset, limit } = c.req.valid('query');

			await checkConversationOwnership(c.get('userId'), id);

			const history = await loadMessagesPage(id, limit, offset);
			return ok(c, history);
		}
	)
	.patch(
		'/:id',
		zValidator('param', conversationIdParamSchema),
		zValidator('json', renameConversationSchema),
		async (c) => {
			const { id } = c.req.valid('param');
			const { title } = c.req.valid('json');

			await renameConversation(c.get('userId'), id, title);
			return ok(c, null);
		}
	)
	.delete('/:id', zValidator('param', conversationIdParamSchema), async (c) => {
		const { id } = c.req.valid('param');

		await deleteConversation(c.get('userId'), id);
		return ok(c, null);
	})
	.patch(
		'/:id/favorite',
		zValidator('param', conversationIdParamSchema),
		zValidator('json', favoriteConversationSchema),
		async (c) => {
			const { id } = c.req.valid('param');
			const { favorited } = c.req.valid('json');

			await setConversationFavorite(c.get('userId'), id, favorited);
			return ok(c, null);
		}
	)
	.post(
		'/:id/clone',
		zValidator('param', conversationIdParamSchema),
		zValidator('json', cloneConversationSchema),
		async (c) => {
			const { id } = c.req.valid('param');
			const { upToMessageId } = c.req.valid('json');

			const conversation = await cloneConversation(c.get('userId'), id, upToMessageId);
			return ok(c, conversation);
		}
	)
	.patch(
		'/:id/current-message',
		zValidator('param', conversationIdParamSchema),
		zValidator('json', currentMessageSchema),
		async (c) => {
			const { id } = c.req.valid('param');
			const { messageId } = c.req.valid('json');

			await setConversationCurrentMessage(c.get('userId'), id, messageId);
			return ok(c, null);
		}
	);

export default conversationRoute;
