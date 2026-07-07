import { eq } from 'drizzle-orm';

import { user } from '#/core/database/schema';
import { db } from '#/core/database';

export async function verifyUserEmailWhenSignInByGoogle(userId: string) {
	await db.update(user).set({ emailVerified: true }).where(eq(user.id, userId));
}
