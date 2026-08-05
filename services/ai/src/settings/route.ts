import { Hono } from 'hono';

import { getUserSettings, saveUserSettings } from '@/settings/services';
import { authJwksMiddleware } from '@/middleware/auth';
import { zValidator } from '@/middleware/validation';
import { settingsSchema } from '@/settings/schemas';
import { ok } from '@/middleware/responses';

const settingsRoute = new Hono()
	.use(authJwksMiddleware)
	.basePath('/settings')
	.get('/', async (c) => {
		const settings = await getUserSettings(c.get('userId'));

		return ok(c, settings);
	})
	.put('/', zValidator('json', settingsSchema), async (c) => {
		const result = await saveUserSettings(c.get('userId'), c.req.valid('json'));

		return ok(c, result);
	});

export default settingsRoute;
