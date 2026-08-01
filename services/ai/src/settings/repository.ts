import type { UserAiSettings } from '@/settings/schemas';

import { eq } from 'drizzle-orm';

import { userAiSettings } from '@/database/schema';
import { db } from '@/database';

export async function findByUserId(userId: string) {
	const [row] = await db
		.select()
		.from(userAiSettings)
		.where(eq(userAiSettings.userId, userId))
		.limit(1);

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (!row) return null;

	return row;
}

export async function upsert(userId: string, settings: UserAiSettings) {
	await db
		.insert(userAiSettings)
		.values({ userId, ...settings, updatedAt: new Date() })
		.onConflictDoUpdate({
			set: { ...settings, updatedAt: new Date() },
			target: userAiSettings.userId
		});
}
