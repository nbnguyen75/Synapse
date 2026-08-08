import type { CompanionFetchRouter } from '@/features/companion/types';
import type { NotesFetchRouter } from '@/features/notes';
import type { AuthUser } from '@/lib/auth';

export type AuthContext =
  | { isAuthenticated: true; user: AuthUser }
  | { isAuthenticated: false; user: null };

export interface ValidationErrorItem {
  message: string;
  field: string;
}

export type AppFetchRouter = NotesFetchRouter & CompanionFetchRouter;
