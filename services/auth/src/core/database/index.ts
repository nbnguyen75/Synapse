import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { relations } from '#/core/database/relations';
import { env } from '#/env';

const pool = new Pool({
	connectionString: env.DATABASE_URL
});

export const db = drizzle({ client: pool, relations });
