import type { NoteFormValues } from '@/features/notes/schemas';

export interface Note extends NoteFormValues {
  createdAt: string;
  updatedAt: string;
  userId: string;
  id: string;
}
