import type { NotesApiParams } from '@/features/notes/types';

import { useInfiniteQuery } from '@tanstack/react-query';

import { noteKeys } from '@/features/notes/keys';

import { $fetch } from '@/lib/fetch';

export function useInfiniteNotes(
  params?: Omit<NotesApiParams, 'page'>,
  initialPage: number = 1,
) {
  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => {
      const result = await $fetch.api.v1.notes.$get({
        query: params ? { ...params, page: pageParam } : undefined,
      });

      return result.data;
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.isLast ? undefined : lastPageParam + 1,
    queryKey: noteKeys.infiniteList(params),
    initialPageParam: initialPage,
  });
}
