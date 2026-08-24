import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { relations } from '@/database/relations';
import { env } from '@/env';

const needsSsl = env.DATABASE_URL.includes('sslmode=');

const pool = new Pool({
	ssl: needsSsl ? { rejectUnauthorized: false } : false,
	connectionString: env.DATABASE_URL,
	connectionTimeoutMillis: 2000,
	idleTimeoutMillis: 30000,
	max: 10
});

export const db = drizzle({ client: pool, jit: true, relations });
