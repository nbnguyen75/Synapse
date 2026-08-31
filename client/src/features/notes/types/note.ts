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

export type NoteViewMode = 'favorites' | 'archive' | 'active' | 'trash';

export type NotesEmptyVariant = 'no-results' | 'favorites' | 'archived' | 'active' | 'trash';
