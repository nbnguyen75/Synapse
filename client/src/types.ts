import type { AuthUser } from '@/core/client/auth-client';

export type AuthContext =
   | { isAuthenticated: true; user: AuthUser }
   | { isAuthenticated: false; user: null };
