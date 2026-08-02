import { Hono } from 'hono';

import { generateTitleRequestSchema } from '@/generator/schemas';
import { generateNoteTitle } from '@/generator/services';
import { authJwksMiddleware } from '@/middleware/auth';
import { zValidator } from '@/middleware/validation';
import { ok } from '@/middleware/responses';

const generatorRoute = new Hono()
	.use(authJwksMiddleware)
	.basePath('/generator')
	.post('/note-title', zValidator('json', generateTitleRequestSchema), async (c) => {
		const { content } = c.req.valid('json');

		const title = await generateNoteTitle(content);

		return ok(c, { title });
	});

export default generatorRoute;
