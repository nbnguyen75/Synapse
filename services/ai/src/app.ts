import { logger } from 'hono/logger';
import { Hono } from 'hono';

import { errorHandler, notFoundHandler } from '@/middleware/errors';
import { startNoteEventsConsumer } from '@/embeddings';
import { conversationRoute } from '@/conversation';
import { generatorRoute } from '@/generator';
import { settingsRoute } from '@/settings';
import { chatRoute } from '@/chat';

const app = new Hono();

app.use('*', logger());
// app.use(
// 	'*',
// 	cors({
// 		exposeHeaders: ['Content-Length', 'X-Conversation-Id'],
// 		allowHeaders: ['Content-Type', 'Authorization'],
// 		allowMethods: ['POST', 'GET', 'OPTIONS'],
// 		origin: env.ORIGINS,
// 		credentials: true,
// 		maxAge: 600
// 	})
// );

app.onError(errorHandler);
app.notFound(notFoundHandler);

app.get('/health', (c) => c.json({ status: 'ok' }));

app.route('/', chatRoute);
app.route('/', conversationRoute);
app.route('/', settingsRoute);
app.route('/', generatorRoute);

startNoteEventsConsumer().catch((err) => {
	console.error('[app] Failed to start note events consumer', err);
	process.exit(1);
});

export default app;
