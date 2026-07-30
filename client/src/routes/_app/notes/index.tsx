import type { ViewMode } from '@/features/notes/components/notes-view-toggle';
import type { Note } from '@/features/notes/types';

import { useState } from 'react';

import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';

import {
  NotesList,
  NotesTagFilter,
  NoteCard,
  NotesViewToggle,
  NotesBulkActions,
} from '@/features/notes/components';
import {
  DEFAULT_NOTES_QUERY_PARAMS,
  EMPTY_PAGINATED,
  getSortItems,
} from '@/features/notes/constants';
import {
  notesQueryParamsSchema,
  type NotesQueryParams,
} from '@/features/notes/schemas';
import { useDeleteNoteMutation } from '@/features/notes/hooks/use-note-mutation';
import { useGetNotesQuery } from '@/features/notes/hooks/use-note-query';

import { useMultiSelect } from '@/hooks/use-multi-select';
import { usePagination } from '@/hooks/use-pagination';

import { useConfirm } from '@/providers/confirm-provider';

import { createTitle } from '@/config/metadata';

import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';

import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderRow,
  PageHeaderTitle,
  PageHeaderToolbar,
} from '@/components/shared/page-header';
import { Paginator } from '@/components/shared';

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
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

  const [viewMode, setViewMode] = useState<ViewMode>('grid');

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

  const isBulkActive = multiSelect.selectedCount > 0;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader>
        <PageHeaderRow>
          <PageHeaderContent>
            <PageHeaderTitle className="text-foreground">
              📝 All Notes
            </PageHeaderTitle>
            <PageHeaderDescription>
              {totalElements} notes &middot; Updated 2 mins ago
            </PageHeaderDescription>
          </PageHeaderContent>

          <PageHeaderActions>
            <PageHeaderToolbar>
              <Select
                items={getSortItems()}
                defaultValue={sortBy}
                onValueChange={(value) => {
                  void navigate({
                    search: (prev: NotesQueryParams) => ({
                      ...prev,
                      sort: value ?? undefined,
                      page: 1,
                    }),
                    to: '/notes',
                  });
                }}
              >
                <SelectTrigger className="w-48 h-9 text-sm gap-1">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent className="w-48" align="end">
                  {getSortItems().map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Separator orientation="vertical" className="h-6" />

              <NotesViewToggle value={viewMode} onChange={setViewMode} />
            </PageHeaderToolbar>
          </PageHeaderActions>
        </PageHeaderRow>
      </PageHeader>

      <NotesTagFilter />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-none px-6 py-6 @container">
          <NotesList
            isLoading={isLoading}
            notes={notes}
            hasQuery={!!q}
            renderItem={(note) => (
              <NoteCard
                note={note}
                onOpenDetail={(n) =>
                  navigate({ params: { noteId: n.id }, to: '/notes/$noteId' })
                }
                // onChatWithNote={(n) =>
                //   navigate({
                //     search: { q: m.notes_page_chat_prompt({ title: n.title }) },
                //     to: '/chat',
                //   })
                // }
                isSelected={multiSelect.selectedIds.has(note.id)}
                onDelete={handleOnDelete}
                isBatchMode={isBulkActive}
                onToggleSelect={multiSelect.toggleSelect}
              />
            )}
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
        onClick={() => navigate({ to: '/notes/create' })}
        className={cn(
          'fixed bottom-6 right-6 z-40 size-12 rounded-full shadow-lg md:hidden cursor-pointer transition-all duration-300',
          isBulkActive && 'scale-0 pointer-events-none opacity-0',
        )}
        size="icon"
      >
        <PlusIcon className="size-5" />
      </Button>

      <NotesBulkActions
        selectedCount={multiSelect.selectedCount}
        onClearSelection={multiSelect.clearSelection}
        onDelete={() =>
          multiSelect.selectedIds.forEach((id) => deleteNote({ id }))
        }
      />
    </div>
  );
}
