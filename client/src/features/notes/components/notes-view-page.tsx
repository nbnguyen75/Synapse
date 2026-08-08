import type { NotesApiParams, NoteViewMode } from '@/features/notes/types';

import { useNavigate } from '@tanstack/react-router';

import {
  DEFAULT_NOTES_QUERY_PARAMS,
  EMPTY_PAGINATED,
  NOTE_SORT_OPTIONS,
  NOTE_VIEW_CONFIG,
} from '@/features/notes/constants';
import {
  NotesList,
  NoteCard,
  NotesBulkActions,
} from '@/features/notes/components';
import { useNotesQueryParams } from '@/features/notes/hooks/use-notes-query-params';
import { useNotesBulkActions } from '@/features/notes/hooks/use-notes-bulk-actions';
import { useGetNotesQuery } from '@/features/notes/hooks/use-note-query';
import { useEmptyTrash } from '@/features/notes/hooks/use-empty-trash';

import { useMultiSelect } from '@/hooks/use-multi-select';
import { usePagination } from '@/hooks/use-pagination';

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
import { Button } from '@/components/ui/button';

import { PlusIcon, Trash2Icon } from 'lucide-react';

interface NotesViewPageProps {
  viewMode: NoteViewMode;
}

export default function NotesViewPage({ viewMode }: NotesViewPageProps) {
  const {
    filters: apiFilters,
    emptyVariant,
    description,
    title,
  } = NOTE_VIEW_CONFIG[viewMode];

  const { sortValue, search, query, sort, page } = useNotesQueryParams();

  const apiParams: NotesApiParams = {
    ...search,
    ...apiFilters,
    sort:
      viewMode === 'active'
        ? ['pinned,desc', sort ?? DEFAULT_NOTES_QUERY_PARAMS.sort]
        : sort !== null
          ? [sort]
          : null,
  };

  const { data = EMPTY_PAGINATED, isLoading } = useGetNotesQuery(apiParams);
  const { totalElements, items: notes, totalPages } = data;

  const navigate = useNavigate();

  const multiSelect = useMultiSelect();
  const { handleBulkAction } = useNotesBulkActions(
    multiSelect.selectedIds,
    multiSelect.clearSelection,
  );
  const { handleEmptyTrash } = useEmptyTrash(multiSelect.clearSelection);

  const pagination = usePagination({
    onPageChange: (page: number) => {
      void navigate({
        search: (prev) => ({ ...prev, page }),
        to: '.',
      });
    },
    totalItems: totalElements,
    totalPages: totalPages,
    currentPage: page,
  });

  const isBulkActive = multiSelect.selectedCount > 0;

  const resolvedEmptyVariant = query ? 'no-results' : emptyVariant;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader>
        <PageHeaderRow>
          <PageHeaderContent>
            <PageHeaderTitle className="text-foreground">
              {title()}
            </PageHeaderTitle>
            <PageHeaderDescription>
              {description(String(totalElements))}
            </PageHeaderDescription>
          </PageHeaderContent>

          <PageHeaderActions>
            <PageHeaderToolbar>
              {viewMode === 'trash' && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-9 gap-1.5 text-xs cursor-pointer"
                  onClick={handleEmptyTrash}
                >
                  <Trash2Icon className="size-3.5" />
                  {m.trash_page_empty()}
                </Button>
              )}

              <Select
                items={NOTE_SORT_OPTIONS}
                defaultValue={sortValue}
                onValueChange={(value) => {
                  void navigate({
                    search: (prev) => ({
                      ...prev,
                      sort: value ?? undefined,
                      page: 1,
                    }),
                    to: '.',
                  });
                }}
              >
                <SelectTrigger className="w-48 h-9 text-sm gap-1">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent className="w-48" align="end">
                  {NOTE_SORT_OPTIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* <Separator orientation="vertical" className="h-6" /> */}

              {/* <NotesViewToggle value={viewModeUI} onChange={setViewModeUI} /> */}
            </PageHeaderToolbar>
          </PageHeaderActions>
        </PageHeaderRow>
      </PageHeader>

      {/* <NotesTagFilter /> */}

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-none px-6 py-6 @container">
          <NotesList
            isLoading={isLoading}
            notes={notes}
            emptyVariant={resolvedEmptyVariant}
            onCreateClick={(e) => {
              e.preventDefault();
              navigate({ to: '/notes/create' });
            }}
            renderItem={(note) => (
              <NoteCard
                note={note}
                viewMode={viewMode}
                isSelected={multiSelect.selectedIds.has(note.id)}
                onToggleSelect={multiSelect.toggleSelect}
                onSelectRange={(id) =>
                  multiSelect.toggleSelectRange(
                    id,
                    notes.map((n) => n.id),
                  )
                }
              />
            )}
          />
        </div>

        <NotesBulkActions
          viewMode={viewMode}
          notes={notes}
          selectedIds={multiSelect.selectedIds}
          onClearSelection={multiSelect.clearSelection}
          onBulkAction={handleBulkAction}
        />

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
    </div>
  );
}
