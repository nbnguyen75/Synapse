import type { AuthUser } from '@/lib/auth-client';

export type AuthContext =
   | { isAuthenticated: true; user: AuthUser }
   | { isAuthenticated: false; user: null };
