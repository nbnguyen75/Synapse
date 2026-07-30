import type { NoteFormValues } from '@/features/notes/schemas';

export interface Note extends NoteFormValues {
  trashedAt?: string;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
  archived: boolean;
  trashed: boolean;
  pinned: boolean;
  userId: string;
  id: string;
}
