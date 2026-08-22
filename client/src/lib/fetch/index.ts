import type { AppFetchRouter } from '@/types/app';

import { env } from '@/config/env';

import { createRpcClient } from '@/lib/fetch/rpc';
import { authClient } from '@/lib/auth';

let cachedToken: string | undefined;
let tokenExpiresAt = 0;
let pendingTokenRequest: Promise<string | undefined> | null = null;

const TOKEN_SAFETY_MARGIN_MS = 30_000;

async function getToken(): Promise<string | undefined> {
  const now = Date.now();

  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  if (pendingTokenRequest) {
    return pendingTokenRequest;
  }

  pendingTokenRequest = (async () => {
    try {
      const { error, data } = await authClient.token();
      if (!error && data?.token) {
        cachedToken = data.token;
        // JWT sống 15 phút (theo auth.ts), trừ safety margin
        tokenExpiresAt = Date.now() + 15 * 60 * 1000 - TOKEN_SAFETY_MARGIN_MS;
        return cachedToken;
      }
    } catch {
      return undefined;
    } finally {
      pendingTokenRequest = null;
    }
    return undefined;
  })();

  return pendingTokenRequest;
}

export function clearTokenCache(): void {
  cachedToken = undefined;
  tokenExpiresAt = 0;
  pendingTokenRequest = null;
}

export const $fetch = createRpcClient<AppFetchRouter>(env.VITE_API_URL, {
  auth: {
    token: getToken,
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
