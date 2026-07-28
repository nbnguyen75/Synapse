import { createFetch } from '@better-fetch/fetch';

import { env } from '@/config/env';

import { authClient } from '@/lib/auth';

export const $fetch = createFetch({
  auth: {
    token: async () => {
      const { error, data } = await authClient.token();

      if (error) return undefined;

      return data?.token ?? undefined;
    },
    type: 'Bearer',
  },
  baseURL: env.VITE_API_URL,
  throw: true,
});
