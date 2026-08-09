import type { Note } from '@/features/notes/types';

import { useQuery } from '@tanstack/react-query';

import { noteKeys } from '@/features/notes/keys';

import { $fetch } from '@/lib/fetch';

export function useGetNote(id: string, initialData?: Note) {
  const { data, ...restProps } = useQuery({
    queryFn: async () => {
      const result = await $fetch.api.v1.notes[':id'].$get({
        params: {
          id,
        },
      });

      return result.data;
    },
    queryKey: noteKeys.detail(id),
    initialData,
  });

  return { data, ...restProps };
}
