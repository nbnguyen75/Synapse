import type { NoteFormValues } from '@/features/notes/schemas';
import type { Note } from '@/features/notes/types';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import { createNote, updateNote, deleteNote } from '@/features/notes/api';

import { m } from '@/paraglide/messages';

export function useCreateNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation<Note, Error, { data: NoteFormValues }>({
    onSuccess: ({ title }) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });

      toast.success(m.notes_page_toast_created(), {
        description: m.notes_page_toast_created_desc({ title }),
      });
    },
    onError: () => {
      // TODO: Note message base on error code
      toast.error(m.notes_page_toast_create_failed());
    },
    mutationFn: async ({ data }) => createNote(data),
  });
}

export function useUpdateNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation<Note, Error, { data: NoteFormValues; id: string }>({
    onSuccess: ({ title }) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });

      toast.success(m.notes_page_toast_updated(), {
        description: m.notes_page_toast_updated_desc({ title }),
      });
    },
    onError: () => {
      // TODO: Note message base on error code
      toast.error(m.notes_page_toast_update_failed());
    },
    mutationFn: async ({ data, id }) => updateNote(id, data),
  });
}

export function useDeleteNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation<string, Error, { id: string }>({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });

      toast.success(m.notes_page_toast_deleted(), {
        description: m.notes_page_toast_deleted_desc(),
      });
    },
    onError: () => {
      // TODO: Note message base on error code
      toast.error(m.notes_page_toast_delete_failed());
    },
    mutationFn: async ({ id }) => deleteNote(id),
  });
}
