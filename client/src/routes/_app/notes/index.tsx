import type { Note } from '@/features/notes/types';

import { useCallback, useState } from 'react';

import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';

import {
  notesQueryParamsSchema,
  type NotesQueryParams,
} from '@/features/notes/schemas';
import {
  QuickCreateNoteDialog,
  QuickEditNoteDialog,
} from '@/features/notes/components';
import { DeleteAlertDialog } from '@/features/notes/components/dialogs/delete-alert-dialog';
import { NoteBatchActions } from '@/features/notes/components/list/note-batch-actions';
import { NotesHeader } from '@/features/notes/components/list/notes-header';
import { useMultiSelect } from '@/features/notes/hooks/use-multi-select';
import { useGetNotesQuery } from '@/features/notes/hooks/use-note-query';
import { DEFAULT_NOTES_QUERY_PARAMS } from '@/features/notes/constants';
import { NotesList } from '@/features/notes/components/view';

import { usePagination } from '@/hooks/use-pagination';

import { createTitle } from '@/config/metadata';

import { m } from '@/paraglide/messages';

import { Paginator } from '@/components/shared';

import { Button } from '@/components/ui/button';

import { PlusIcon } from 'lucide-react';

export const Route = createFileRoute('/_app/notes/')({
  search: {
    middlewares: [stripSearchParams(DEFAULT_NOTES_QUERY_PARAMS)],
  },
  head: () => ({
    meta: [{ title: createTitle(m.notes_page_title()) }],
  }),
  validateSearch: notesQueryParamsSchema,
  component: NotesPage,
});

function NotesPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const multiSelect = useMultiSelect();

  const { page, sort, q } = search;

  const updateSearchParam = useCallback(
    (key: string, value: string | number) => {
      void navigate({
        search: (prev: NotesQueryParams) => ({
          ...prev,
          [key]: value,
          page: 1,
        }),
        to: '/notes',
      });
    },
    [navigate],
  );

  const { isLoading, data } = useGetNotesQuery(search);
  const notes = data?.items ?? [];
  const sortBy = sort ?? DEFAULT_NOTES_QUERY_PARAMS.sort;

  const pagination = usePagination({
    onPageChange: (page: number) => {
      void navigate({
        search: (prev: NotesQueryParams) => ({ ...prev, page }),
        to: '/notes',
      });
    },
    currentPage: page ?? DEFAULT_NOTES_QUERY_PARAMS.page,
    totalItems: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 1,
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editNote, setEditNote] = useState<Note | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden">
        <NotesHeader
          sortBy={sortBy}
          onSortChange={(value) => updateSearchParam('sort', value)}
          onCreateClick={() => setIsCreateOpen(true)}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-none px-6 py-6 @container">
            <NotesList
              isLoading={isLoading}
              notes={notes}
              hasQuery={!!q}
              onCreateClick={() => setIsCreateOpen(true)}
              onOpenDetail={(n) =>
                navigate({ params: { noteId: n.id }, to: '/notes/$noteId' })
              }
              onChatWithNote={(n) =>
                navigate({
                  search: { q: `Summarize my note "${n.title}"` },
                  to: '/chat',
                })
              }
              isBatchMode={multiSelect.selectedCount > 0}
              selectedIds={multiSelect.selectedIds}
              onToggleSelect={multiSelect.toggleSelect}
            />
          </div>

          <Paginator
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            isFirstPage={pagination.isFirstPage}
            isLastPage={pagination.isLastPage}
            onFirstPage={pagination.firstPage}
            onPrevPage={pagination.prevPage}
            onNextPage={pagination.nextPage}
            onLastPage={pagination.lastPage}
          />
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="fixed bottom-6 right-6 z-50 size-12 rounded-full shadow-lg md:hidden cursor-pointer"
          size="icon"
        >
          <PlusIcon className="size-5" />
        </Button>

        {multiSelect.selectedCount > 0 && (
          <NoteBatchActions
            selectedIds={multiSelect.selectedIds}
            onClearSelection={multiSelect.clearSelection}
            paginatedIds={notes.map((n) => n.id)}
            onSelectAllPage={multiSelect.selectAll}
          />
        )}
      </div>

      <QuickCreateNoteDialog
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <QuickEditNoteDialog
        note={editNote}
        isOpen={!!editNote}
        onOpenChange={(open) => {
          if (!open) setEditNote(undefined);
        }}
      />

      <DeleteAlertDialog
        note={deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      />
    </>
  );
}
