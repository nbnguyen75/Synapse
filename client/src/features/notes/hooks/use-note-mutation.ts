import type { EditableNoteData, Note } from '@/features/notes/types';
import type { ApiResponse } from '@/types/shared';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import { m } from '@/paraglide/messages';
import { $fetch } from '@/lib/fetch';

export function useCreateNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation<Note, Error, { newData: EditableNoteData }>({
    mutationFn: async ({ newData }) => {
      const result = await $fetch<ApiResponse<Note>>('/api/v1/notes', {
        method: 'POST',
        body: newData,
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      return result.data;
    },
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
  });
}

export function useUpdateNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation<Note, Error, { newData: EditableNoteData; id: string }>({
    mutationFn: async ({ newData, id }) => {
      const result = await $fetch<ApiResponse<Note>>(`/api/v1/notes/${id}`, {
        body: newData,
        method: 'PUT',
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      return result.data;
    },
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
  });
}

export function useDeleteNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation<string, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      const result = await $fetch<ApiResponse<string>>(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      return id;
    },
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
  });
}
