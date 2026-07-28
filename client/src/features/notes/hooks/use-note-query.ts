import type { ApiResponse, PaginatedApiResponse } from '@/types/shared';
import type { Note, NotesSearchParams } from '@/features/notes/types';

import { useQuery } from '@tanstack/react-query';

import {
  DEFAULT_NOTES_QUERY_PARAMS,
  EMPTY_PAGINATED,
} from '@/features/notes/constants';

import { $fetch } from '@/lib/fetch';

export function useGetNotesQuery(
  params: NotesSearchParams = DEFAULT_NOTES_QUERY_PARAMS,
) {
  return useQuery({
    queryFn: async () => {
      try {
        const result = await $fetch<PaginatedApiResponse<Note>>(
          '/api/v1/notes',
          {
            query: params,
          },
        );

        if (!result.success) return EMPTY_PAGINATED;

        return result.data;
      } catch {
        return EMPTY_PAGINATED;
      }
    },

    queryKey: ['notes', params],
  });
}

export function useGetNoteQuery(id: string) {
  return useQuery({
    queryFn: async () => {
      const result = await $fetch<ApiResponse<Note>>(`/api/v1/notes/${id}`);

      if (!result.success) {
        throw new Error(result.message);
      }

      return result.data;
    },
    queryKey: ['notes', id],
  });
}
