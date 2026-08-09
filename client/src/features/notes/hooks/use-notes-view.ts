import type { NotesQueryParams } from '@/features/notes/schemas';
import type { NoteViewMode } from '@/features/notes/types';

import { useNavigate, useSearch } from '@tanstack/react-router';

import {
  useEmptyTrash,
  useGetNotes,
  useNotesBulkAction,
} from '@/features/notes/hooks/api';
import { EMPTY_PAGINATED, NOTE_VIEW_CONFIG } from '@/features/notes/constants';

import { useMultiSelect } from '@/hooks/use-multi-select';
import { usePagination } from '@/hooks/use-pagination';

export function useNotesView(viewMode: NoteViewMode) {
  const navigate = useNavigate();
  const search = useSearch({ from: '/_app/notes/_list' });
  const { q: query, sort, page } = search;

  // 1. Config & Param Calculations
  const {
    filters: apiFilters,
    emptyVariant,
    description,
    title,
  } = NOTE_VIEW_CONFIG[viewMode];

  const apiParams = {
    ...search,
    ...apiFilters,
    sort: viewMode === 'active' ? ['pinned,desc', sort] : [sort],
  };

  const { data = EMPTY_PAGINATED, isLoading } = useGetNotes(apiParams);
  const { totalElements, items: notes, totalPages } = data;

  const multiSelect = useMultiSelect();

  // 3. Bulk & Trash Mutations
  const { executeBulkAction } = useNotesBulkAction(multiSelect.selectedIds, {
    onSuccess: () => multiSelect.clearSelection(),
  });

  const { executeEmptyTrash } = useEmptyTrash({
    onSuccess: () => multiSelect.clearSelection(),
  });

  // 4. Pagination
  const pagination = usePagination({
    onPageChange: (newPage: number) => {
      void navigate({
        search: (prev) => ({ ...prev, page: newPage }),
        to: '.',
      });
    },
    totalItems: totalElements,
    currentPage: page,
    totalPages,
  });

  // 5. Actions / Navigation Handlers
  const changeSort = (newSort?: NotesQueryParams['sort']) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        sort: newSort,
        page: 1,
      }),
      to: '.',
    });
  };

  const navigateToCreate = () => {
    void navigate({ to: '/notes/create' });
  };

  const resolvedEmptyVariant = query ? 'no-results' : emptyVariant;
  const isBulkActive = multiSelect.selectedCount > 0;

  return {
    config: {
      description: description(String(totalElements)),
      emptyVariant: resolvedEmptyVariant,
      title: title(),
    },
    actions: {
      executeBulkAction,
      executeEmptyTrash,
      navigateToCreate,
      changeSort,
    },
    data: {
      totalElements,
      notes,
    },
    state: {
      isBulkActive,
      sort,
    },
    status: {
      isLoading,
    },
    selection: multiSelect,
    pagination,
  };
}
