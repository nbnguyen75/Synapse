import { logger } from 'hono/logger';
import { Hono } from 'hono';

import { errorHandler, notFoundHandler } from '@/middleware/errors';

import { auth } from '@/auth/service';

const SKIP_LOG_PATHS = ['/health', '/favicon.ico'];

const app = new Hono();

app.use(
  logger((str, ...rest) => {
    if (SKIP_LOG_PATHS.some((p) => str.includes(p))) {
      return;
    }
    process.stdout.write(`${str}${rest.length > 0 ? ` ${rest.join(' ')}` : ''}\n`);
  }),
);

app.onError(errorHandler);
app.notFound(notFoundHandler);

app.get('/health', (c) => c.json({ status: 'ok' }));

app.on(['POST', 'GET'], '/api/v1/auth/*', (c) => {
  return auth.handler(c.req.raw);
});

export default app;
