import { Hono } from 'hono';

import { authJwksMiddleware } from '@/middleware/auth';
import { zValidator } from '@/middleware/validation';
import { ok } from '@/middleware/responses';

import { getUserSettings, saveUserSettings } from '@/settings/services';
import { settingsSchema } from '@/settings/schemas';

const settingsRoute = new Hono()
  .basePath('/settings')
  .use(authJwksMiddleware)
  .get('/', async (c) => {
    const settings = await getUserSettings(c.get('userId'));

    return ok(c, settings);
  })
  .put('/', zValidator('json', settingsSchema), async (c) => {
    const result = await saveUserSettings(c.get('userId'), c.req.valid('json'));

    return ok(c, result);
  });

export default settingsRoute;
