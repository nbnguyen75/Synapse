import { createEnv } from '@t3-oss/env-core';
import z from 'zod/v4';

export const env = createEnv({
	server: {
		ORIGINS: z
			.preprocess(
				(val) => (typeof val === 'string' ? val.split(',').map((v) => v.trim()) : val),
				z.array(z.string())
			)
			.optional()
			.default([]),
		DATABASE_URL: z.url().trim().default('postgresql://synapse:root@postgres:5432/ai_db'),
		AUTH_JWKS_URL: z.url().trim().default('http://auth:5001/.well-known/jwks.json'),
		RABBITMQ_URL: z.url().trim().default('amqp://guest:guest@rabbitmq:5672'),
		TAVILY_API_KEY: z.string().trim().optional()
	},

	client: {
		PUBLIC_APP_NAME: z.string().min(1).optional().default('Synapse')
	},

	/**
	 * What object holds the environment variables at runtime. This is usually
	 * `process.env` or `import.meta.env`.
	 */
	runtimeEnv: { ...process.env },

	/**
	 * By default, this library will feed the environment variables directly to
	 * the Zod validator.
	 *
	 * This means that if you have an empty string for a value that is supposed
	 * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
	 * it as a type mismatch violation. Additionally, if you have an empty string
	 * for a value that is supposed to be a string with a default value (e.g.
	 * `DOMAIN=` in an ".env" file), the default value will never be applied.
	 *
	 * In order to solve these issues, we recommend that all new projects
	 * explicitly specify this option as true.
	 */
	emptyStringAsUndefined: true,

	/**
	 * The prefix that client-side variables must have. This is enforced both at
	 * a type-level and at runtime.
	 */
	clientPrefix: 'PUBLIC_'
});
