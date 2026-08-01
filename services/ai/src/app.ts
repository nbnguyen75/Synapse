import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { Hono } from 'hono';

import { errorHandler, notFoundHandler } from '@/middleware/errors';
import conversationRoute from '@/conversation/route';
import settingsRoute from '@/settings/route';
import chatRoute from '@/chat/route';
import { env } from '@/env';

const app = new Hono();

app.use('*', logger());
app.use(
	'*',
	cors({
		allowHeaders: ['Content-Type', 'Authorization'],
		allowMethods: ['POST', 'GET', 'OPTIONS'],
		exposeHeaders: ['Content-Length'],
		origin: env.ORIGINS,
		credentials: true,
		maxAge: 600
	})
);

app.onError(errorHandler);
app.notFound(notFoundHandler);

app.get('/health', (c) => c.json({ status: 'ok' }));

app.route('/', chatRoute);
app.route('/', conversationRoute);
app.route('/', settingsRoute);

export default app;
