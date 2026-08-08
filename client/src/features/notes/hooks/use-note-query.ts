import type { Note, NotesApiParams } from '@/features/notes/types';

import { useQuery } from '@tanstack/react-query';

import { EMPTY_PAGINATED } from '@/features/notes/constants';

import { $fetch } from '@/lib/fetch';

export function useGetNotesQuery(params?: NotesApiParams) {
  return useQuery({
    queryFn: async () => {
      const query = params
        ? {
            ...params,
          }
        : undefined;

      const result = await $fetch.api.v1.notes.$get({
        query,
      });

      return result.data;
    },
    placeholderData: (previousData) => previousData ?? EMPTY_PAGINATED,
    queryKey: ['notes', params],
  });
}

export function useGetNoteQuery(id: string, initialData?: Note) {
  return useQuery({
    queryFn: async () => {
      const result = await $fetch.api.v1.notes[':id'].$get({
        params: {
          id,
        },
      });

      return result.data;
    },
    queryKey: ['notes', id],
    initialData,
  });
}
