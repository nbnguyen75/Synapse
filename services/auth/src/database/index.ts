import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool as NeonPool } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';

import * as schema from '@/database/schema';
import { env } from '@/env';

const isNeonTech = env.DATABASE_URL.includes('neon.tech');

const isSSLMode = env.DATABASE_URL.includes('sslmode=');

function createDbClient() {
	if (isNeonTech) {
		const pool = new NeonPool({
			connectionString: env.DATABASE_URL,
			connectionTimeoutMillis: 3_000,
			idleTimeoutMillis: 3_000,
			max: 1
		});

		return drizzleNeon({ client: pool, schema });
	}

	const pool = new PgPool({
		ssl: isSSLMode ? { rejectUnauthorized: false } : false,
		connectionString: env.DATABASE_URL,
		connectionTimeoutMillis: 3_000,
		idleTimeoutMillis: 10_000,
		max: 10,
		min: 0
	});

	return drizzlePg({ client: pool, schema });
}

export const db = createDbClient();
