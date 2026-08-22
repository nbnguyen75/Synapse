import app from '@/app';

export default {
	idleTimeout: Number(process.env.IDLE_TIMEOUT) || 15,
	port: Number(process.env.PORT) || 5001,
	hostname: '0.0.0.0',
	fetch: app.fetch
};
