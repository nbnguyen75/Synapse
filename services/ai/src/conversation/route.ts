import { Hono } from 'hono';

import {
	checkConversationOwnership,
	listConversations,
	loadHistory
} from '@/conversation/services';
import { conversationIdParamSchema } from '@/conversation/schemas';
import { authJwksMiddleware } from '@/middleware/auth';
import { zValidator } from '@/middleware/validation';
import { throwFromReason } from '@/lib/errors';
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

		const result = await checkConversationOwnership(c.get('userId'), id);
		if (!result.success) throwFromReason(result.reason, 'Conversation');

		const history = await loadHistory(id);
		return ok(c, history);
	});

export default conversationRoute;
