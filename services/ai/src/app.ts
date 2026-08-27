import { logger } from 'hono/logger';
import { Hono } from 'hono';

import { errorHandler, notFoundHandler } from '@/middleware/errors';
import { conversationRoute } from '@/conversation';
import { generatorRoute } from '@/generator';
import { pubsubRoute } from '@/embeddings';
import { settingsRoute } from '@/settings';
import { chatRoute } from '@/chat';

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

app.route('/', pubsubRoute);

app.route('/', conversationRoute);
app.route('/', settingsRoute);
app.route('/', generatorRoute);
app.route('/', chatRoute);

export default app;
