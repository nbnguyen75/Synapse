import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import { BULK_NOTES_ACTION_SUCCESS_MESSAGE } from '@/features/notes/constants';

import {
  $fetch,
  type InferRequestType,
  type InferResponseType,
} from '@/lib/fetch';
import { m } from '@/paraglide/messages';

export function useCreateNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    InferResponseType<(typeof $fetch.api.v1.notes)['$post']>['data'],
    Error,
    InferRequestType<(typeof $fetch.api.v1.notes)['$post']>
  >({
    onSuccess: ({ title }) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });

      toast.success(m.notes_page_toast_created(), {
        description: m.notes_page_toast_created_desc({ title }),
      });
    },
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.notes.$post(args);

      return result.data;
    },
    onError: () => {
      toast.error(m.notes_page_toast_create_failed());
    },
  });
}

export function useUpdateNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    InferResponseType<(typeof $fetch.api.v1.notes)[':id']['$put']>['data'],
    Error,
    InferRequestType<(typeof $fetch.api.v1.notes)[':id']['$put']>
  >({
    onSuccess: ({ title }, { params: { id } }) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes', id] });

      toast.success(m.notes_page_toast_updated(), {
        description: m.notes_page_toast_updated_desc({ title }),
      });
    },
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.notes[':id'].$put(args);

      return result.data;
    },
    onError: () => {
      toast.error(m.notes_page_toast_update_failed());
    },
  });
}

export function useDeleteNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    InferResponseType<(typeof $fetch.api.v1.notes)[':id']['$delete']>['data'],
    Error,
    InferRequestType<(typeof $fetch.api.v1.notes)[':id']['$delete']>
  >({
    onSuccess: (_data, { params: { id } }) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes', id] });

      toast.success(m.notes_page_toast_deleted(), {
        description: m.notes_page_toast_deleted_desc(),
      });
    },
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.notes[':id'].$delete(args);

      return result.data;
    },
    onError: () => {
      toast.error(m.notes_page_toast_delete_failed());
    },
  });
}

export function useTogglePinMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    InferResponseType<
      (typeof $fetch.api.v1.notes)[':id']['pin']['$patch']
    >['data'],
    Error,
    InferRequestType<(typeof $fetch.api.v1.notes)[':id']['pin']['$patch']>
  >({
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
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.notes[':id'].pin.$patch(args);

      return result.data;
    },
    onError: () => {
      toast.error(m.notes_page_toast_update_failed());
    },
  });
}

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    InferResponseType<
      (typeof $fetch.api.v1.notes)[':id']['favorite']['$patch']
    >['data'],
    Error,
    InferRequestType<(typeof $fetch.api.v1.notes)[':id']['favorite']['$patch']>
  >({
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
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.notes[':id'].favorite.$patch(args);

      return result.data;
    },
    onError: () => {
      toast.error(m.notes_page_toast_update_failed());
    },
  });
}

export function useArchiveNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    InferResponseType<
      (typeof $fetch.api.v1.notes)[':id']['archive']['$patch']
    >['data'],
    Error,
    InferRequestType<(typeof $fetch.api.v1.notes)[':id']['archive']['$patch']>
  >({
    onSuccess: ({ title }) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success(m.notes_page_toast_archived(), {
        description: m.notes_page_toast_archived_desc({ title }),
      });
    },
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.notes[':id'].archive.$patch(args);

      return result.data;
    },
    onError: () => {
      toast.error(m.notes_page_toast_archive_failed());
    },
  });
}

export function useUnarchiveNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    InferResponseType<
      (typeof $fetch.api.v1.notes)[':id']['unarchive']['$patch']
    >['data'],
    Error,
    InferRequestType<(typeof $fetch.api.v1.notes)[':id']['unarchive']['$patch']>
  >({
    onSuccess: ({ title }) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success(m.notes_page_toast_unarchived(), {
        description: m.notes_page_toast_unarchived_desc({ title }),
      });
    },
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.notes[':id'].unarchive.$patch(args);

      return result.data;
    },
    onError: () => {
      toast.error(m.notes_page_toast_unarchive_failed());
    },
  });
}

export function useTrashNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    InferResponseType<
      (typeof $fetch.api.v1.notes)[':id']['trash']['$patch']
    >['data'],
    Error,
    InferRequestType<(typeof $fetch.api.v1.notes)[':id']['trash']['$patch']>
  >({
    onSuccess: ({ title }) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success(m.notes_page_toast_trashed(), {
        description: m.notes_page_toast_trashed_desc({ title }),
      });
    },
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.notes[':id'].trash.$patch(args);

      return result.data;
    },
    onError: () => {
      toast.error(m.notes_page_toast_trash_failed());
    },
  });
}

export function useRestoreNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    InferResponseType<
      (typeof $fetch.api.v1.notes)[':id']['restore']['$patch']
    >['data'],
    Error,
    InferRequestType<(typeof $fetch.api.v1.notes)[':id']['restore']['$patch']>
  >({
    onSuccess: ({ title }) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success(m.notes_page_toast_restored(), {
        description: m.notes_page_toast_restored_desc({ title }),
      });
    },
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.notes[':id'].restore.$patch(args);

      return result.data;
    },
    onError: () => {
      toast.error(m.notes_page_toast_restore_failed());
    },
  });
}

export function useEmptyTrashMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    InferResponseType<typeof $fetch.api.v1.notes.trash.$delete>['data'],
    Error,
    InferRequestType<typeof $fetch.api.v1.notes.trash.$delete>
  >({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success(m.notes_page_toast_empty_trash());
    },
    mutationFn: async () => {
      const result = await $fetch.api.v1.notes.trash.$delete();

      return result.data;
    },
    onError: () => {
      toast.error(m.notes_page_toast_trash_failed());
    },
  });
}

export function useGenerateNoteTitleMutation() {
  return useMutation<
    InferResponseType<
      (typeof $fetch.api.v1.ai.generator)['note-title']['$post']
    >['data'],
    Error,
    InferRequestType<(typeof $fetch.api.v1.ai.generator)['note-title']['$post']>
  >({
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.ai.generator['note-title'].$post(args);

      return result.data;
    },
  });
}

export function useBulkActionsMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    InferResponseType<typeof $fetch.api.v1.notes.bulk.actions.$post>['data'],
    Error,
    InferRequestType<typeof $fetch.api.v1.notes.bulk.actions.$post>
  >({
    onSuccess: (_data, { body: { action } }) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });

      toast.success(BULK_NOTES_ACTION_SUCCESS_MESSAGE[action]);
    },
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.notes.bulk.actions.$post(args);

      return result.data;
    },
    onError: () => {
      toast.error(m.notes_page_toast_update_failed());
    },
  });
}
