import type {
  NoteViewMode,
  NotesApiParams,
  NotesQueryParams,
} from '@/features/notes/schemas';
import type { ViewMode } from '@/features/notes/components/notes-view-toggle';

import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { toast } from 'sonner';

import {
  useTogglePinMutation,
  useToggleFavoriteMutation,
  useArchiveNoteMutation,
  useUnarchiveNoteMutation,
  useTrashNoteMutation,
  useRestoreNoteMutation,
} from '@/features/notes/hooks/use-note-mutation';
import {
  bulkArchiveNotes,
  bulkUnarchiveNotes,
  bulkDeletePermanent,
  bulkToggleFavoriteNotes,
  bulkTogglePinNotes,
} from '@/features/notes/api';
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
import { useGetNotesQuery } from '@/features/notes/hooks/use-note-query';

import { useMultiSelect } from '@/hooks/use-multi-select';
import { usePagination } from '@/hooks/use-pagination';

import { useConfirm } from '@/providers/confirm-provider';

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

import { PlusIcon, Trash2Icon } from 'lucide-react';

interface NotesViewPageProps {
  apiFilters?: { archived?: boolean; favorite?: boolean; trashed?: boolean };
  onEmptyTrash?: () => void;
  search: NotesQueryParams;
  viewMode: NoteViewMode;
}

const titleMap: Record<NoteViewMode, () => string> = {
  favorites: () => '⭐ ' + m.favorites_page_title(),
  archive: () => '📦 ' + m.archive_page_title(),
  active: () => '📝 ' + m.notes_page_title(),
  trash: () => '🗑️ ' + m.trash_page_title(),
};

const descMap: Record<NoteViewMode, (count: string) => string> = {
  favorites: (count) => m.favorites_page_title_desc({ count }),
  archive: (count) => m.archive_page_title_desc({ count }),
  trash: (count) => m.trash_page_title_desc({ count }),
  active: (count) => m.notes_page_view_desc({ count }),
};

export default function NotesViewPage({
  onEmptyTrash,
  apiFilters,
  viewMode,
  search,
}: NotesViewPageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const multiSelect = useMultiSelect();
  const confirm = useConfirm();
  const { mutate: togglePin } = useTogglePinMutation();
  const { mutate: toggleFavorite } = useToggleFavoriteMutation();
  const { mutate: archiveNote } = useArchiveNoteMutation();
  const { mutate: unarchiveNote } = useUnarchiveNoteMutation();
  const { mutate: trashNote } = useTrashNoteMutation();
  const { mutate: restoreNote } = useRestoreNoteMutation();

  const {
    sort: sortBy = DEFAULT_NOTES_QUERY_PARAMS.sort,
    page = DEFAULT_NOTES_QUERY_PARAMS.page,
    q,
  } = search;

  const { sort, ...searchParams } = search;

  const apiParams: NotesApiParams = {
    ...searchParams,
    ...apiFilters,
    sort:
      viewMode === 'active'
        ? ['pinned,desc', sort ?? DEFAULT_NOTES_QUERY_PARAMS.sort]
        : sort !== undefined
          ? [sort]
          : undefined,
  };

  const { data = EMPTY_PAGINATED, isLoading } = useGetNotesQuery(apiParams);
  const { totalElements, items: notes, totalPages } = data;

  const pagination = usePagination({
    onPageChange: (page: number) => {
      void navigate({
        search: (prev: NotesQueryParams) => ({ ...prev, page }),
        to: '.',
      });
    },
    totalItems: totalElements,
    totalPages: totalPages,
    currentPage: page,
  });

  const [viewModeUI, setViewModeUI] = useState<ViewMode>('grid');

  const isBulkActive = multiSelect.selectedCount > 0;

  const handleBulkTrash = () => {
    if (!multiSelect.selectedIds.size) return;
    [...multiSelect.selectedIds].forEach((id) => trashNote({ id }));
    multiSelect.clearSelection();
  };

  const handleBulkRestore = () => {
    [...multiSelect.selectedIds].forEach((id) => restoreNote({ id }));
    multiSelect.clearSelection();
  };

  const invalidateNotes = () => {
    queryClient.invalidateQueries({ queryKey: ['notes'] });
  };

  const handleBulkDeletePermanent = async () => {
    if (!multiSelect.selectedIds.size) return;
    const ok = await confirm({
      description: m.trash_page_empty_confirm_desc(),
      confirmText: m.notes_bulk_delete_permanent(),
      title: m.trash_page_empty_confirm_title(),
      cancelText: m.notes_batch_cancel(),
      variant: 'destructive',
    });
    if (!ok) return;
    bulkDeletePermanent([...multiSelect.selectedIds])
      .then(invalidateNotes)
      .catch(() => toast.error(m.notes_page_toast_update_failed()));
    multiSelect.clearSelection();
  };

  const handleBulkArchive = () => {
    if (!multiSelect.selectedIds.size) return;
    bulkArchiveNotes([...multiSelect.selectedIds])
      .then(invalidateNotes)
      .catch(() => toast.error(m.notes_page_toast_update_failed()));
    multiSelect.clearSelection();
  };

  const handleBulkUnarchive = () => {
    if (!multiSelect.selectedIds.size) return;
    bulkUnarchiveNotes([...multiSelect.selectedIds])
      .then(invalidateNotes)
      .catch(() => toast.error(m.notes_page_toast_update_failed()));
    multiSelect.clearSelection();
  };

  const handleBulkFavorite = () => {
    if (!multiSelect.selectedIds.size) return;
    bulkToggleFavoriteNotes([...multiSelect.selectedIds])
      .then(invalidateNotes)
      .catch(() => toast.error(m.notes_page_toast_update_failed()));
    multiSelect.clearSelection();
  };

  const handleBulkPin = () => {
    if (!multiSelect.selectedIds.size) return;
    bulkTogglePinNotes([...multiSelect.selectedIds])
      .then(invalidateNotes)
      .catch(() => toast.error(m.notes_page_toast_update_failed()));
    multiSelect.clearSelection();
  };

  const emptyStateMap: Record<NoteViewMode, 'active' | 'archived' | 'trash'> = {
    favorites: 'active',
    archive: 'archived',
    active: 'active',
    trash: 'trash',
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader>
        <PageHeaderRow>
          <PageHeaderContent>
            <PageHeaderTitle className="text-foreground">
              {titleMap[viewMode]()}
            </PageHeaderTitle>
            <PageHeaderDescription>
              {descMap[viewMode](String(totalElements))}
            </PageHeaderDescription>
          </PageHeaderContent>

          <PageHeaderActions>
            <PageHeaderToolbar>
              {viewMode === 'trash' && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-9 gap-1.5 text-xs cursor-pointer"
                  onClick={onEmptyTrash}
                >
                  <Trash2Icon className="size-3.5" />
                  {m.trash_page_empty()}
                </Button>
              )}

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
                    to: '.',
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

              <NotesViewToggle value={viewModeUI} onChange={setViewModeUI} />
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
            emptyVariant={emptyStateMap[viewMode]}
            renderItem={(note) => (
              <NoteCard
                note={note}
                viewMode={viewMode}
                onOpenDetail={(n) =>
                  navigate({
                    search:
                      viewMode !== 'active' ? { from: viewMode } : undefined,
                    params: { noteId: n.id },
                    to: '/notes/$noteId',
                  })
                }
                isSelected={multiSelect.selectedIds.has(note.id)}
                onTogglePin={(id) => togglePin({ id })}
                onToggleStar={(id) => toggleFavorite({ id })}
                onArchive={(id) => archiveNote({ id })}
                onUnarchive={(id) => unarchiveNote({ id })}
                onTrash={(id) => trashNote({ id })}
                onRestore={(id) => restoreNote({ id })}
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
          selectedCount={multiSelect.selectedCount}
          onClearSelection={multiSelect.clearSelection}
          onBulkArchive={handleBulkArchive}
          onBulkUnarchive={handleBulkUnarchive}
          onBulkTrash={handleBulkTrash}
          onBulkRestore={handleBulkRestore}
          onBulkDeletePermanent={handleBulkDeletePermanent}
          onBulkFavorite={handleBulkFavorite}
          onBulkPin={handleBulkPin}
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
