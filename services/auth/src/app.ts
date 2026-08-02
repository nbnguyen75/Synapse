import { logger } from 'hono/logger';
import { Hono } from 'hono';

import { errorHandler, notFoundHandler } from '@/middleware/errors';
import { auth } from '@/auth/service';

const app = new Hono();

app.use('*', logger());
// app.use(
// 	'*',
// 	cors({
// 		allowHeaders: ['Content-Type', 'Authorization'],
// 		allowMethods: ['POST', 'GET', 'OPTIONS'],
// 		exposeHeaders: ['Content-Length'],
// 		origin: env.ORIGINS,
// 		credentials: true,
// 		maxAge: 600
// 	})
// );

app.onError(errorHandler);
app.notFound(notFoundHandler);

app.get('/health', (c) => c.json({ status: 'ok' }));

app.on(['POST', 'GET'], '/*', (c) => {
	return auth.handler(c.req.raw);
});

export default app;
