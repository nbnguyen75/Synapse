import { createFetch } from '@better-fetch/fetch';

import { env } from '@/config/env';

import { authClient } from '@/lib/auth-client';

export const $fetch = createFetch({
   auth: {
      token: () => authClient.getSession().then((s) => s.data?.session.token),
      type: 'Bearer',
   },
   baseURL: env.VITE_API_URL,
});
