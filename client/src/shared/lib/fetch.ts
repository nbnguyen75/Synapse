import { createFetch } from '@better-fetch/fetch';

import { authClient } from '@/core/auth-client';
import { env } from '@/env';

export const $fetch = createFetch({
   auth: {
      token: () => authClient.getSession().then((s) => s.data?.session.token),
      type: 'Bearer',
   },
   baseURL: env.VITE_API_URL,
});
