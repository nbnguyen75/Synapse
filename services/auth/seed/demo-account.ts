import { eq } from 'drizzle-orm';

import { user } from '../src/database/schema';
import { auth } from '../src/auth/service';
import { db } from '../src/database';

const DEMO_EMAIL = process.env.DEMO_EMAIL ?? 'demo@synapse.dev';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? 'Demo@12345';

async function seedDemoAccount() {
  if (process.env.SEED_DEMO_ACCOUNT !== 'true') {
    process.stdout.write("[seed] SEED_DEMO_ACCOUNT is not 'true', skipping.\n");
    return;
  }

  if (!DEMO_PASSWORD.trim()) {
    throw new Error(
      '[seed] DEMO_PASSWORD is not set — refusing to seed without an explicit password.',
    );
  }

  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, DEMO_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    process.stdout.write(
      `[seed] Demo account already exists (${DEMO_EMAIL}), skipping creation.\n`,
    );
    return;
  }

  const result = await auth.api.signUpEmail({
    body: {
      password: DEMO_PASSWORD,
      email: DEMO_EMAIL,
      name: 'Demo User',
    },
  });

  if (!result.user.id) {
    throw new Error('[seed] signUpEmail did not return a user id.');
  }

  process.stdout.write(`[seed] Created demo account: ${DEMO_EMAIL}\n`);
}

seedDemoAccount()
  .then(() => {
    process.stdout.write('[seed] Done.\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[seed] Failed:', err);
    process.exit(1);
  });
