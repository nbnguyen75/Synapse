import type { AppFetchRouter } from '@/types/app';

import { env } from '@/config/env';

import { createRpcClient } from '@/lib/fetch/rpc';
import { authClient } from '@/lib/auth';

export const $fetch = createRpcClient<AppFetchRouter>(env.VITE_API_URL, {
  auth: {
    token: async () => {
      try {
        const { error, data } = await authClient.token();
        if (!error && data?.token) return data.token;
      } catch {
        return undefined;
      }
      return undefined;
    },
    type: 'Bearer',
  },
  throw: true,
});

export type {
  InferRequestType,
  CreateRpcClientOption,
  EnsureRouter,
  InferResponseType,
} from './rpc';
export { createRpcClient };
