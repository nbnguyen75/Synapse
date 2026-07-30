import type { Note } from '@/features/notes/types';

import { Fragment, type ReactNode } from 'react';

import { NoteCardSkeleton } from '@/features/notes/components';

import { m } from '@/paraglide/messages';

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Button } from '@/components/ui/button';

import { FileTextIcon, PlusIcon } from 'lucide-react';

interface NotesListProps {
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
  renderItem,
  isLoading,
  hasQuery,
  notes,
}: NotesListProps) {
  if (isLoading)
    return (
      <div className="grid gap-4 grid-cols-1 @2xl:grid-cols-2 @6xl:grid-cols-3">
        {Array.from({ length: loadingCardCount }).map((_, i) => (
          <Fragment key={i}>
            <NoteCardSkeleton />
          </Fragment>
        ))}
      </div>
    );

  if (notes.length < 1)
    return (
      <Empty className="py-20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileTextIcon className="h-5 w-5" />
          </EmptyMedia>

          <EmptyTitle>
            {hasQuery ? m.notes_page_no_results() : m.notes_page_no_notes()}
          </EmptyTitle>

          {!hasQuery && (
            <EmptyDescription>{m.notes_page_no_notes_desc()}</EmptyDescription>
          )}
        </EmptyHeader>

        <EmptyContent>
          <Button onClick={onCreateClick}>
            <PlusIcon className="h-4 w-4" />
            {m.notes_page_create()}
          </Button>
        </EmptyContent>
      </Empty>
    );

  return (
    <div className="grid gap-4 grid-cols-1 @2xl:grid-cols-2 @7xl:grid-cols-3">
      {notes.map((note) => (
        <Fragment key={note.id}>{renderItem(note)}</Fragment>
      ))}
    </div>
  );
}
