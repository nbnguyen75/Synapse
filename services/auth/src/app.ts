import { cors } from 'hono/cors';
import { Hono } from 'hono';

import { auth } from '#/core/auth/auth.service';

const app = new Hono();

app.use(
	'/api/auth/*',
	cors({
		allowHeaders: ['Content-Type', 'Authorization'],
		allowMethods: ['POST', 'GET', 'OPTIONS'],
		exposeHeaders: ['Content-Length'],
		origin: 'http://localhost:5001', // replace with your origin
		credentials: true,
		maxAge: 600
	})
);

app.get('/', (c) => {
	return c.text('Hello Hono!');
});

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
	return auth.handler(c.req.raw);
});

export default app;
