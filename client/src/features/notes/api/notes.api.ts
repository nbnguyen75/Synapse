import type { NotesApiParams } from '@/features/notes/types';

import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { getNoteClient, getNotesClient } from '@/features/notes/api/notes.http';
import { EMPTY_PAGINATED } from '@/features/notes/constants';

export const noteKeys = {
  infiniteList: (params?: Omit<NotesApiParams, 'page'>) =>
    [...noteKeys.infinites(), params] as const,
  list: (params?: NotesApiParams) => [...noteKeys.lists(), params] as const,
  detail: (id: string) => [...noteKeys.details(), id] as const,
  infinites: () => [...noteKeys.all, 'infinite'] as const,
  details: () => [...noteKeys.all, 'detail'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  all: ['notes'] as const,
};

export function noteListQueryOptions(params?: NotesApiParams) {
  return queryOptions({
    queryFn: () => getNotesClient({ query: params }),
    placeholderData: (previousData) => previousData ?? EMPTY_PAGINATED,
    queryKey: noteKeys.list(params),
  });
}

export function noteDetailQueryOptions(id: string) {
  return queryOptions({
    queryFn: () => getNoteClient({ params: { id } }),
    queryKey: noteKeys.detail(id),
  });
}

export function infiniteNotesQueryOptions(params?: Omit<NotesApiParams, 'page'>, initialPage = 1) {
  return infiniteQueryOptions({
    queryFn: ({ pageParam }) =>
      getNotesClient({ query: params ? { ...params, page: pageParam } : undefined }),
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.isLast ? undefined : lastPageParam + 1,
    queryKey: noteKeys.infiniteList(params),
    initialPageParam: initialPage,
  });
}
