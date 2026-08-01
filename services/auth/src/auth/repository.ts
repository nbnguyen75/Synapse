import { eq } from 'drizzle-orm';

import { user } from '@/database/schema';
import { db } from '@/database';

export async function verifyUserEmailWhenSignInByGoogle(userId: string) {
	await db.update(user).set({ emailVerified: true }).where(eq(user.id, userId));
}
