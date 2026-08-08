import { Hono } from 'hono';

import {
	checkConversationOwnership,
	deleteConversation,
	listConversations,
	loadHistory,
	renameConversation,
	setConversationFavorite
} from '@/conversation/services';
import {
	conversationIdParamSchema,
	favoriteConversationSchema,
	renameConversationSchema
} from '@/conversation/schemas';
import { authJwksMiddleware } from '@/middleware/auth';
import { zValidator } from '@/middleware/validation';
import { ok } from '@/middleware/responses';

const conversationRoute = new Hono()
	.use(authJwksMiddleware)
	.basePath('/conversations')
	.get('/', async (c) => {
		const rows = await listConversations(c.get('userId'));

		return ok(c, rows);
	})
	.get('/:id/messages', zValidator('param', conversationIdParamSchema), async (c) => {
		const { id } = c.req.valid('param');

		await checkConversationOwnership(c.get('userId'), id);

		const history = await loadHistory(id);
		return ok(c, history);
	})
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
	);

export default conversationRoute;
