import type { Note } from '@/features/notes/types';

import { useMemo, useState } from 'react';

import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

import { DeleteAlertDialog } from '@/features/notes/components/dialogs/delete-alert-dialog';
import { NotesGridSkeleton } from '@/features/notes/components/view/notes-grid-skeleton';
import { NotesEmptyState } from '@/features/notes/components/view/notes-empty-state';
import { NoteCard } from '@/features/notes/components/list/note-card';
import { getNotes } from '@/features/notes/api';

import { m } from '@/paraglide/messages';

import { Archive as ArchiveIcon } from 'lucide-react';

export default function ArchivedPage() {
  const navigate = useNavigate();

  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: getNotes,
  });

  const archivedNotes = useMemo(() => notes.filter((n) => n.archived), [notes]);

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
                  onTagClick={(tag) =>
                    navigate({
                      search: { tag },
                      to: '/notes',
                    })
                  }
                  onDelete={setDeleteTarget}
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
