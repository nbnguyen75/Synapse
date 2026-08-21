import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dbCredentials: {
		url: process.env.DATABASE_URL!
	},
	schema: './src/database/schema.ts',
	dialect: 'postgresql',
	out: './drizzle'
});
