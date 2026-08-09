import type { NotesApiParams } from '@/features/notes/types';

import { useQuery } from '@tanstack/react-query';

import { EMPTY_PAGINATED } from '@/features/notes/constants';
import { noteKeys } from '@/features/notes/keys';

import { $fetch } from '@/lib/fetch';

export function useGetNotes(params?: NotesApiParams) {
  const { data = EMPTY_PAGINATED, ...restProps } = useQuery({
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
    queryKey: noteKeys.list(params),
  });

  return { data, ...restProps };
}
