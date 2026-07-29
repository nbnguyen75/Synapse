import type { Note } from '@/features/notes/types';

import { useState } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { DeleteAlertDialog } from '@/features/notes/components/dialogs/delete-alert-dialog';
import {
  NotesGridSkeleton,
  NotesEmptyState,
} from '@/features/notes/components/view';
import { useGetNotesQuery } from '@/features/notes/hooks/use-note-query';
import { NoteCard } from '@/features/notes/components/note-card';

import { m } from '@/paraglide/messages';

import { Archive as ArchiveIcon } from 'lucide-react';

export default function ArchivedPage() {
  const navigate = useNavigate();

  const { isLoading, data } = useGetNotesQuery();

  const archivedNotes = data?.items ?? [];

  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b px-6 py-3">
        <ArchiveIcon className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {m.notes_page_title()} — {m.notes_page_no_notes_archived()}
        </span>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-none px-6 py-6 @container">
          {isLoading ? (
            <NotesGridSkeleton count={3} />
          ) : archivedNotes.length === 0 ? (
            <NotesEmptyState variant="archived" />
          ) : (
            <div className="grid gap-4 grid-cols-1 @2xl:grid-cols-2 @5xl:grid-cols-3">
              {archivedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onOpenDetail={(n) =>
                    navigate({ params: { noteId: n.id }, to: '/notes/$noteId' })
                  }
                  onChatWithNote={(n) =>
                    navigate({
                      search: { q: `Summarize my note "${n.title}"` },
                      to: '/chat',
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <DeleteAlertDialog
        note={deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      />
    </div>
  );
}
