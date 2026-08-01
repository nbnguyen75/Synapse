import { defineRelations } from 'drizzle-orm';

import * as schema from '@/database/schema';

export const relations = defineRelations(schema);
