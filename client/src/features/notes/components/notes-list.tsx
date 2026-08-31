import type { Note, NotesEmptyVariant } from '@/features/notes/types';
import type { BaseUIEvent } from '@base-ui/react';
import type { ReactNode } from 'react';

import { Fragment } from 'react';

import { m } from '@/paraglide/messages';

import { Button } from '@/components/ui/button';

import { PlusIcon } from 'lucide-react';

import { NotesListEmpty, NoteCardSkeleton } from '@/features/notes/components';

const SKELETON_KEYS = [
  'skeleton-1',
  'skeleton-2',
  'skeleton-3',
  'skeleton-4',
  'skeleton-5',
  'skeleton-6',
];

interface NotesListProps {
  onCreateClick?: (event: BaseUIEvent<React.MouseEvent<HTMLButtonElement>>) => void;
  renderItem: (note: Note) => ReactNode;
  emptyVariant: NotesEmptyVariant;
  loadingCardCount?: number;
  isLoading?: boolean;
  notes: Array<Note>;
}

function Container({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 grid-cols-1 @4xl:grid-cols-2 @8xl:grid-cols-3">{children}</div>;
}

export default function NotesList({
  loadingCardCount = 6,
  onCreateClick,
  emptyVariant,
  renderItem,
  isLoading,
  notes,
}: NotesListProps) {
  if (isLoading)
    return (
      <Container>
        {SKELETON_KEYS.slice(0, loadingCardCount).map((key) => (
          <NoteCardSkeleton key={key} />
        ))}
      </Container>
    );

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
    <Container>
      {notes.map((note) => (
        <Fragment key={note.id}>{renderItem(note)}</Fragment>
      ))}
    </Container>
  );
}
