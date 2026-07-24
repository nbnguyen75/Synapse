import type { AuthUser } from '@/core/auth/auth-client';

export type AuthContext =
   | { isAuthenticated: true; user: AuthUser }
   | { isAuthenticated: false; user: null };
