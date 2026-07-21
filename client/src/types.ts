import type { AuthUser } from '@/core/client/auth-client';

export type AuthContext =
   | { isAuthenticated: true; user: AuthUser }
   | { isAuthenticated: false; user: null };

export interface NoteVersion {
   updatedAt: string;
   content: string;
   title: string;
   id: string;
}

export interface Note {
   versions?: NoteVersion[];
   archived?: boolean;
   createdAt: string;
   updatedAt: string;
   pinned?: boolean;
   content: string;
   tags?: string[];
   userId: string;
   title: string;
   id: string;
}
