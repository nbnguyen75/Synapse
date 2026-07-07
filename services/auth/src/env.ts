import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
	server: {
		BETTER_AUTH_TRUST_ORIGINS: z
			.preprocess((val) => (typeof val === 'string' ? [val] : val), z.array(z.string()))
			.optional()
			.default([]),
		GOOGLE_CLIENT_SECRET: z.string().nonempty(),
		GOOGLE_CLIENT_ID: z.string().nonempty(),
		BETTER_AUTH_URL: z.url().optional(),
		BETTER_AUTH_SECRET: z.string(),
		DATABASE_URL: z.url()
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
