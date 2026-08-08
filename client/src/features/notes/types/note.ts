export interface Note {
  favorite: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  trashed: boolean;
  content: string;
  pinned: boolean;
  userId: string;
  title: string;
  id: string;
}

export type NoteViewMode = 'active' | 'archive' | 'favorites' | 'trash';

export type NotesEmptyVariant =
  'active' | 'archived' | 'favorites' | 'trash' | 'no-results';
