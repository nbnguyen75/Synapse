import { createEnv } from '@t3-oss/env-core';
import z from 'zod/v4';

export const env = createEnv({
	server: {
		BETTER_AUTH_TRUSTED_ORIGINS: z
			.preprocess(
				(val) => (typeof val === 'string' ? val.split(',').map((v) => v.trim()) : val),
				z.array(z.string())
			)
			.optional()
			.default([]),
		DATABASE_URL: z.url().trim().default('postgresql://synapse:root@postgres:5432/auth_db'),
		APP_NAME: z.string().min(1).optional().default('Synapse'),
		GOOGLE_CLIENT_SECRET: z.string().trim().nonempty(),
		BETTER_AUTH_SECRET: z.string().trim().nonempty(),
		GOOGLE_CLIENT_ID: z.string().trim().nonempty(),
		BETTER_AUTH_URL: z.url().trim().default('')
	},

	runtimeEnv: { ...process.env },

	emptyStringAsUndefined: true,

	clientPrefix: 'PUBLIC_',

	client: {}
});
