import type { NoteFormValues } from '@/features/notes/schemas';
import type { Note } from '@/features/notes/types';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import {
  createNote,
  updateNote,
  deleteNote,
  togglePinNote,
  toggleFavoriteNote,
  archiveNote,
  unarchiveNote,
  trashNote,
  restoreNote,
  emptyTrash,
} from '@/features/notes/api';

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
      toast.error(m.notes_page_toast_create_failed());
    },
    mutationFn: async ({ data }) => createNote(data),
  });
}

export function useUpdateNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation<Note, Error, { data: NoteFormValues; id: string }>({
    onSuccess: ({ title }, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes', id] });

      toast.success(m.notes_page_toast_updated(), {
        description: m.notes_page_toast_updated_desc({ title }),
      });
    },
    onError: () => {
      toast.error(m.notes_page_toast_update_failed());
    },
    mutationFn: async ({ data, id }) => updateNote(id, data),
  });
}

export function useDeleteNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation<string, Error, { id: string }>({
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes', id] });

      toast.success(m.notes_page_toast_deleted(), {
        description: m.notes_page_toast_deleted_desc(),
      });
    },
    onError: () => {
      toast.error(m.notes_page_toast_delete_failed());
    },
    mutationFn: async ({ id }) => deleteNote(id),
  });
}

export function useTogglePinMutation() {
  const queryClient = useQueryClient();

  return useMutation<Note, Error, { id: string }>({
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success(
        note.pinned
          ? m.notes_page_toast_pinned()
          : m.notes_page_toast_unpinned(),
        {
          description: (note.pinned
            ? m.notes_page_toast_pinned_desc
            : m.notes_page_toast_unpinned_desc)({ title: note.title }),
        },
      );
    },
    onError: () => {
      toast.error(m.notes_page_toast_update_failed());
    },
    mutationFn: async ({ id }) => togglePinNote(id),
  });
}

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation<Note, Error, { id: string }>({
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success(
        note.favorite
          ? m.notes_page_toast_favorited()
          : m.notes_page_toast_unfavorited(),
        {
          description: (note.favorite
            ? m.notes_page_toast_favorited_desc
            : m.notes_page_toast_unfavorited_desc)({ title: note.title }),
        },
      );
    },
    onError: () => {
      toast.error(m.notes_page_toast_update_failed());
    },
    mutationFn: async ({ id }) => toggleFavoriteNote(id),
  });
}

export function useArchiveNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation<Note, Error, { id: string }>({
    onSuccess: ({ title }) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success(m.notes_page_toast_archived(), {
        description: m.notes_page_toast_archived_desc({ title }),
      });
    },
    onError: () => {
      toast.error(m.notes_page_toast_archive_failed());
    },
    mutationFn: async ({ id }) => archiveNote(id),
  });
}

export function useUnarchiveNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation<Note, Error, { id: string }>({
    onSuccess: ({ title }) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success(m.notes_page_toast_unarchived(), {
        description: m.notes_page_toast_unarchived_desc({ title }),
      });
    },
    onError: () => {
      toast.error(m.notes_page_toast_unarchive_failed());
    },
    mutationFn: async ({ id }) => unarchiveNote(id),
  });
}

export function useTrashNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation<Note, Error, { id: string }>({
    onSuccess: ({ title }) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success(m.notes_page_toast_trashed(), {
        description: m.notes_page_toast_trashed_desc({ title }),
      });
    },
    onError: () => {
      toast.error(m.notes_page_toast_trash_failed());
    },
    mutationFn: async ({ id }) => trashNote(id),
  });
}

export function useRestoreNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation<Note, Error, { id: string }>({
    onSuccess: ({ title }) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success(m.notes_page_toast_restored(), {
        description: m.notes_page_toast_restored_desc({ title }),
      });
    },
    onError: () => {
      toast.error(m.notes_page_toast_restore_failed());
    },
    mutationFn: async ({ id }) => restoreNote(id),
  });
}

export function useEmptyTrashMutation() {
  const queryClient = useQueryClient();

  return useMutation<string, Error, void>({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success(m.notes_page_toast_empty_trash());
    },
    onError: () => {
      toast.error(m.notes_page_toast_trash_failed());
    },
    mutationFn: async () => emptyTrash(),
  });
}
