import { logger } from 'hono/logger';
import { Hono } from 'hono';

import { startNoteEventsConsumer, stopNoteEventsConsumer } from '@/embeddings';
import { errorHandler, notFoundHandler } from '@/middleware/errors';
import { conversationRoute } from '@/conversation';
import { generatorRoute } from '@/generator';
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

app.route('/', conversationRoute);
app.route('/', settingsRoute);
app.route('/', generatorRoute);
app.route('/', chatRoute);

startNoteEventsConsumer().catch((err) => {
	console.error('[app] Failed to start note events consumer', err);
	process.exit(1);
});

// 2. Xử lý Graceful Shutdown khi nhận tín hiệu dừng từ hệ thống
const handleShutdown = async (signal: string) => {
	// eslint-disable-next-line no-console
	console.log(`[app] Received ${signal}. Stopping note events consumer...`);
	try {
		await stopNoteEventsConsumer();
		// eslint-disable-next-line no-console
		console.log('[app] Consumer stopped successfully.');
	} catch (err) {
		console.error('[app] Error stopping consumer:', err);
	} finally {
		process.exit(0);
	}
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGHUP', () => handleShutdown('SIGHUP'));

export default app;
