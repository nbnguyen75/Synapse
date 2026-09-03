import type { Note, NotesEmptyVariant } from '@/features/notes/types';
import type { BaseUIEvent } from '@base-ui/react';
import type { ReactNode } from 'react';

import { Fragment } from 'react';

import { m } from '@/paraglide/messages';

import { Button } from '@/components/ui/button';

import { PlusIcon } from 'lucide-react';

import { NotesListEmpty, NotesListCardSkeleton } from '@/features/notes/components';

interface NotesListProps {
  onCreateClick?: (event: BaseUIEvent<React.MouseEvent<HTMLButtonElement>>) => void;
  renderItem: (note: Note) => ReactNode;
  emptyVariant: NotesEmptyVariant;
  loadingCardCount?: number;
  isLoading?: boolean;
  notes: Array<Note>;
}

export default function NotesList({
  loadingCardCount = 6,
  onCreateClick,
  emptyVariant,
  renderItem,
  isLoading,
  notes,
}: NotesListProps) {
  if (isLoading) return <NotesListCardSkeleton loadingCardCount={loadingCardCount} />;

  if (notes.length < 1)
    return (
      <NotesListEmpty variant={emptyVariant}>
        {emptyVariant === 'active' && (
          <Button onClick={onCreateClick}>
            <PlusIcon className="h-4 w-4" />
            {m.notes_page_create()}
          </Button>
        )}
      </NotesListEmpty>
    );

  return (
    <div className="grid gap-4 grid-cols-1 @4xl:grid-cols-2 @8xl:grid-cols-3">
      {notes.map((note) => (
        <Fragment key={note.id}>{renderItem(note)}</Fragment>
      ))}
    </div>
  );
}
