import type { NotesApiParams } from '@/features/notes/types';

import { infiniteQueryOptions } from '@tanstack/react-query';

import { $fetch } from '@/lib/fetch';

import { noteKeys } from '@/features/notes/keys';

export function infiniteNotesQueryOptions(params?: Omit<NotesApiParams, 'page'>, initialPage = 1) {
  return infiniteQueryOptions({
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
