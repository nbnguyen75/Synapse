import { createAuthClient } from 'better-auth/react';

import { env } from '@/env';

export const authClient = createAuthClient({
   baseURL: env.VITE_API_URL,
});

export const { useSession, signOut, signIn, signUp } = authClient;

export type AuthSession = typeof authClient.$Infer.Session;
export type AuthUser = typeof authClient.$Infer.Session.user;
