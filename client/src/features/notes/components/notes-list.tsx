import type { Note } from '@/features/notes/types';

import { Fragment, type ReactNode } from 'react';

import { NotesEmptyState, NoteCardSkeleton } from '@/features/notes/components';

import { m } from '@/paraglide/messages';

import { Button } from '@/components/ui/button';

import { PlusIcon } from 'lucide-react';

interface NotesListProps {
  emptyVariant?: 'active' | 'archived' | 'trash' | 'no-results';
  renderItem: (note: Note) => ReactNode;
  onCreateClick?: () => void;
  loadingCardCount?: number;
  isLoading?: boolean;
  hasQuery: boolean;
  notes: Note[];
}

export default function NotesList({
  loadingCardCount = 6,
  onCreateClick,
  emptyVariant,
  renderItem,
  isLoading,
  hasQuery,
  notes,
}: NotesListProps) {
  if (isLoading)
    return (
      <div className="grid gap-4 grid-cols-1 @2xl:grid-cols-2 @6xl:grid-cols-3">
        {Array.from({ length: loadingCardCount }).map((_, i) => (
          <NoteCardSkeleton key={i} />
        ))}
      </div>
    );

  if (notes.length < 1)
    return (
      <NotesEmptyState
        variant={emptyVariant ?? (hasQuery ? 'no-results' : 'active')}
      >
        {emptyVariant === 'active' && (
          <Button onClick={onCreateClick}>
            <PlusIcon className="h-4 w-4" />
            {m.notes_page_create()}
          </Button>
        )}
      </NotesEmptyState>
    );

  return (
    <div className="grid gap-4 grid-cols-1 @2xl:grid-cols-2 @7xl:grid-cols-3">
      {notes.map((note) => (
        <Fragment key={note.id}>{renderItem(note)}</Fragment>
      ))}
    </div>
  );
}
