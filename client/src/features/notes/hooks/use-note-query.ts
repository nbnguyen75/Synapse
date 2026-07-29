import type { NotesQueryParams } from '@/features/notes/schemas';

import { useQuery } from '@tanstack/react-query';

import { getNote, getNotes } from '@/features/notes/api';

export function useGetNotesQuery(params: NotesQueryParams) {
  return useQuery({
    queryFn: async () => getNotes(params),
    queryKey: ['notes', params],
  });
}

export function useGetNoteQuery(id: string) {
  return useQuery({
    queryFn: async () => getNote(id),
    queryKey: ['notes', id],
  });
}
