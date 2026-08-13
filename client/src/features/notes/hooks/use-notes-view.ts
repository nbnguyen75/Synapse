import type { NotesQueryParams } from '@/features/notes/schemas';
import type { NoteViewMode } from '@/features/notes/types';

import { useMemo } from 'react';

import { useNavigate, useSearch } from '@tanstack/react-router';

import {
  useEmptyTrash,
  useInfiniteNotes,
  useNotesBulkAction,
} from '@/features/notes/hooks/api';
import { NOTE_VIEW_CONFIG } from '@/features/notes/constants';

import { useMultiSelect } from '@/hooks/use-multi-select';

export function useNotesView(viewMode: NoteViewMode) {
  const navigate = useNavigate();
  const search = useSearch({ from: '/_app/notes/_list' });
  const { q: query, sort } = search;

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

  const { page, ...stableParams } = apiParams;

  const { isFetchingNextPage, fetchNextPage, hasNextPage, isLoading, data } =
    useInfiniteNotes(stableParams, page);
  const notes = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const totalElements = data?.pages[0]?.totalElements ?? 0;

  const multiSelect = useMultiSelect();

  // 3. Bulk & Trash Mutations
  const { executeBulkAction } = useNotesBulkAction(multiSelect.selectedIds, {
    onSuccess: () => multiSelect.clearSelection(),
  });

  const { executeEmptyTrash } = useEmptyTrash({
    onSuccess: () => multiSelect.clearSelection(),
  });

  // 4. Actions / Navigation Handlers
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
    infinite: {
      isFetchingNextPage,
      fetchNextPage,
      hasNextPage,
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
  };
}
