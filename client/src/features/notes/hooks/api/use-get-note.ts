import type { Note } from '@/features/notes/types';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { $fetch } from '@/lib/fetch';

import { noteKeys } from '@/features/notes/keys';

type Options = Prettify<
  Omit<
    UseQueryOptions<Note, Error, Note, ReturnType<typeof noteKeys.detail>>,
    'initialData' | 'queryKey' | 'queryFn'
  >
>;

export function useGetNote(id: string, initialData?: Note, options: Options = {}) {
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
    ...options,
  });

  return { data, ...restProps };
}
