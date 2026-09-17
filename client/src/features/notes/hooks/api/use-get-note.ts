import type { noteKeys } from '@/features/notes/api/notes.api';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { Note } from '@/features/notes/types';

import { useQuery } from '@tanstack/react-query';

import { noteDetailQueryOptions } from '@/features/notes/api/notes.api';

type Options = Prettify<
  Omit<
    UseQueryOptions<Note, Error, Note, ReturnType<typeof noteKeys.detail>>,
    'initialData' | 'queryKey' | 'queryFn'
  >
>;

export function useGetNote(id: string, initialData?: Note, options: Options = {}) {
  const { data, ...restProps } = useQuery({
    ...noteDetailQueryOptions(id),
    ...(initialData === undefined ? {} : { initialData }),
    ...options,
  });

  return { data, ...restProps };
}
