import type { Note } from '@/features/notes/types';

import { NoteCard } from '@/features/notes/components/list/note-card';
import { NotesGridSkeleton } from '@/features/notes/components/view';

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
  onChatWithNote?: (note: Note) => void;
  onToggleSelect?: (id: string) => void;
  onOpenDetail?: (note: Note) => void;
  onDelete?: (id: string) => void;
  onCreateClick?: () => void;
  selectedIds: Set<string>;
  isBatchMode: boolean;
  isLoading?: boolean;
  hasQuery: boolean;
  notes: Note[];
}

export default function NotesList({
  onChatWithNote,
  onToggleSelect,
  onCreateClick,
  onOpenDetail,
  isBatchMode,
  selectedIds,
  isLoading,
  hasQuery,
  onDelete,
  notes,
}: NotesListProps) {
  if (isLoading) return <NotesGridSkeleton count={6} />;

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
    <div className="grid gap-4 grid-cols-1 @2xl:grid-cols-2 @5xl:grid-cols-3">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onDelete={onDelete}
          onOpenDetail={onOpenDetail}
          onChatWithNote={onChatWithNote}
          isBatchMode={isBatchMode}
          isSelected={selectedIds.has(note.id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}
