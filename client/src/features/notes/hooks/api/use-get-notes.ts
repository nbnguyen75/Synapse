import type { NotesApiParams } from '@/features/notes/types';

import { useQuery } from '@tanstack/react-query';

import { noteListQueryOptions } from '@/features/notes/api/notes.api';
import { EMPTY_PAGINATED } from '@/features/notes/constants';

export function useGetNotes(params?: NotesApiParams) {
  const { data = EMPTY_PAGINATED, ...restProps } = useQuery(noteListQueryOptions(params));

  return { data, ...restProps };
}
