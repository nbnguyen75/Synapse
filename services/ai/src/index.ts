import app from '@/app';

export default {
	idleTimeout: Number(process.env.IDLE_TIMEOUT) || 90,
	port: Number(process.env.PORT) || 5002,
	fetch: app.fetch
};
