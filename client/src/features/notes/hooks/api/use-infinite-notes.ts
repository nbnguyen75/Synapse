import type { NotesApiParams } from '@/features/notes/types';

import { useInfiniteQuery } from '@tanstack/react-query';

import { infiniteNotesQueryOptions } from '@/features/notes/queries';

export function useInfiniteNotes(params?: Omit<NotesApiParams, 'page'>, initialPage = 1) {
  return useInfiniteQuery(infiniteNotesQueryOptions(params, initialPage));
}
