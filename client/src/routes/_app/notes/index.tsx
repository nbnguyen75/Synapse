import type { Note } from '@/features/notes/types';

import { useCallback, useState } from 'react';

import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';

import {
  DEFAULT_NOTES_QUERY_PARAMS,
  EMPTY_PAGINATED,
  sortItems,
} from '@/features/notes/constants';
import {
  notesQueryParamsSchema,
  type NotesQueryParams,
} from '@/features/notes/schemas';
import { NoteBatchActions } from '@/features/notes/components/list/note-batch-actions';
import { useDeleteNoteMutation } from '@/features/notes/hooks/use-note-mutation';
import { NotesHeader } from '@/features/notes/components/list/notes-header';
import { useMultiSelect } from '@/features/notes/hooks/use-multi-select';
import { useGetNotesQuery } from '@/features/notes/hooks/use-note-query';
import { NotesList } from '@/features/notes/components/view';

import { usePagination } from '@/hooks/use-pagination';

import { useConfirm } from '@/providers/confirm-provider';

import { createTitle } from '@/config/metadata';

import { m } from '@/paraglide/messages';

import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderRow,
  PageHeaderTitle,
  PageHeaderToolbar,
} from '@/components/common/page-header';
import { Paginator } from '@/components/shared';

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '@/components/ui/select';
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
  const confirm = useConfirm();
  const { mutate: deleteNote } = useDeleteNoteMutation();

  const {
    sort: sortBy = DEFAULT_NOTES_QUERY_PARAMS.sort,
    page = DEFAULT_NOTES_QUERY_PARAMS.page,
    q,
  } = search;

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

  const { data = EMPTY_PAGINATED, isLoading } = useGetNotesQuery(search);
  const { totalElements, items: notes, totalPages } = data;

  const pagination = usePagination({
    onPageChange: (page: number) => {
      void navigate({
        search: (prev: NotesQueryParams) => ({ ...prev, page }),
        to: '/notes',
      });
    },
    totalItems: totalElements,
    totalPages: totalPages,
    currentPage: page,
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleOnDelete = async (note: Note) => {
    const ok = await confirm({
      description: m.notes_page_delete_desc({
        title: note.title,
      }),
      confirmText: m.notes_page_delete_confirm(),
      cancelText: m.notes_page_delete_cancel(),
      title: m.notes_page_delete_title(),
      variant: 'destructive',
    });

    if (!ok) return;

    deleteNote({ id: note.id });
  };

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden">
        {/* <NotesHeader
          sortBy={sortBy}
          onSortChange={(value) => updateSearchParam('sort', value)}
          onCreateClick={() => setIsCreateOpen(true)}
          searchValue={q}
          onSearchChange={(value) => updateSearchParam('q', value)}
        /> */}

        <PageHeader>
          <PageHeaderRow>
            <PageHeaderContent>
              <PageHeaderTitle className="text-foreground">
                📝 All Notes
              </PageHeaderTitle>
              <PageHeaderDescription>
                {pagination.totalItems * pagination.totalPages} {'notes total'}
              </PageHeaderDescription>
            </PageHeaderContent>

            <PageHeaderActions>
              <PageHeaderToolbar>
                <Select items={sortItems} defaultValue={sortBy}>
                  <SelectTrigger className="w-36 h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {sortItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </PageHeaderToolbar>
            </PageHeaderActions>
          </PageHeaderRow>
        </PageHeader>

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
                  search: { q: m.notes_page_chat_prompt({ title: n.title }) },
                  to: '/chat',
                })
              }
              onDelete={handleOnDelete}
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
    </>
  );
}
