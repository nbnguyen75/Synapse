import { logger } from 'hono/logger';
import { Hono } from 'hono';

import { errorHandler, notFoundHandler } from '@/middleware/errors';
import { auth } from '@/auth/service';

const SKIP_LOG_PATHS = ['/health', '/favicon.ico'];

const app = new Hono();

app.use('*', async (c, next) => {
	if (SKIP_LOG_PATHS.includes(c.req.path)) {
		return next();
	}
	return logger()(c, next);
});

app.onError(errorHandler);
app.notFound(notFoundHandler);

app.get('/health', (c) => c.json({ status: 'ok' }));

app.on(['POST', 'GET'], '/*', (c) => {
	return auth.handler(c.req.raw);
});

export default app;
