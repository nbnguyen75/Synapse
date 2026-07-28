import type { Note } from '@/features/notes/types';
import type { ApiResponse } from '@/types/shared';

import { useQuery } from '@tanstack/react-query';

import { $fetch } from '@/lib/fetch';

export function useGetNotesQuery() {
  return useQuery({
    queryFn: async () => {
      try {
        const result = await $fetch<ApiResponse<Note[]>>('/api/v1/notes');

        if (!result.success) return [];

        return result.data;
      } catch {
        return [];
      }
    },
    queryKey: ['notes'],
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
