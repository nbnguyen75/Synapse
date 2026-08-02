import { Hono } from 'hono';

import { getUserSettings, saveUserSettings } from '@/settings/services';
import { PERSONALITY_PRESETS } from '@/settings/constants';
import { authJwksMiddleware } from '@/middleware/auth';
import { zValidator } from '@/middleware/validation';
import { settingsSchema } from '@/settings/schemas';
import { ok } from '@/middleware/responses';

const settingsRoute = new Hono()
	.use(authJwksMiddleware)
	.basePath('/settings')
	.get('', async (c) => {
		const settings = await getUserSettings(c.get('userId'));

		return ok(c, { presets: Object.keys(PERSONALITY_PRESETS), settings });
	})
	.put('', zValidator('json', settingsSchema), async (c) => {
		const result = await saveUserSettings(c.get('userId'), c.req.valid('json'));

		return ok(c, result);
	});

export default settingsRoute;
