/* eslint-disable no-console */
import { eq } from 'drizzle-orm';

import { auth } from '../src/core/auth/auth.service';
import { user } from '../src/database/schema';
import { db } from '../src/database';

const DEMO_EMAIL = process.env.DEMO_EMAIL ?? 'demo@synapse.dev';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? 'Demo@12345';

async function seedDemoAccount() {
	if (process.env.SEED_DEMO_ACCOUNT !== 'true') {
		console.log("[seed] SEED_DEMO_ACCOUNT is not 'true', skipping.");
		return;
	}

	// if (!DEMO_PASSWORD) {
	// 	throw new Error(
	// 		'[seed] DEMO_PASSWORD is not set — refusing to seed without an explicit password.'
	// 	);
	// }

	const existing = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.email, DEMO_EMAIL))
		.limit(1);

	if (existing.length > 0) {
		console.log(`[seed] Demo account already exists (${DEMO_EMAIL}), skipping creation.`);
		return;
	}

	const result = await auth.api.signUpEmail({
		body: {
			password: DEMO_PASSWORD,
			email: DEMO_EMAIL,
			name: 'Demo User'
		}
	});

	if (!result.user.id) {
		throw new Error('[seed] signUpEmail did not return a user id.');
	}

	console.log(`[seed] Created demo account: ${DEMO_EMAIL}`);
}

seedDemoAccount()
	.then(() => {
		console.log('[seed] Done.');
		process.exit(0);
	})
	.catch((err) => {
		console.error('[seed] Failed:', err);
		process.exit(1);
	});
