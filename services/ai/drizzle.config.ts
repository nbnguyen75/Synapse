import { defineConfig } from 'drizzle-kit';

import { env } from '@/env';

export default defineConfig({
	dbCredentials: {
		url: env.DATABASE_URL
	},
	schema: './src/database/schema.ts',
	dialect: 'postgresql',
	out: './drizzle'
});
