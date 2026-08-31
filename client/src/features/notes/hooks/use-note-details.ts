import type { NoteFormInput, NoteInputPayload } from '@/features/notes/schemas';
import type { Note } from '@/features/notes/types';

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useRouter, useSearch } from '@tanstack/react-router';

import { toast } from 'sonner';

import {
  useDeleteNote,
  useGetNote,
  useRestoreNote,
  useTrashNote,
} from '@/features/notes/hooks/api';
import { noteKeys } from '@/features/notes/keys';

import { useFormSaveShortcut } from '@/hooks/use-form-save-shortcut';

import { useConfirm } from '@/providers';

import {
  $fetch,
  type InferRequestType,
  type InferResponseType,
} from '@/lib/fetch';
import { m } from '@/paraglide/messages';

export function useNoteDetails(initialData: Note) {
  const router = useRouter();
  const navigate = useNavigate();
  const search = useSearch({ from: '/_app/notes/$noteId' });
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('preview');

  const { data: queryNote, isLoading } = useGetNote(
    initialData.id,
    initialData,
    {
      refetchInterval: (query) => {
        if (!initialData.createdAt) return false;

        const now = Date.now();
        const createdTime = new Date(initialData.createdAt).getTime();

        if (now - createdTime > 15_000) return false;

        const currentNote = query.state.data;
        if (!currentNote || currentNote.title !== initialData.title)
          return false;

        const fetchCount = query.state.dataUpdateCount;
        if (fetchCount >= 4) return false;

        const intervals = [2_500, 5_000, 8_500, 13_000];
        return intervals[fetchCount] ?? false;
      },
      refetchIntervalInBackground: false,
    },
  );
  const note = queryNote ?? initialData;

  useEffect(() => {
    if (!note.title) return;

    if (note.title !== initialData.title) {
      void router.invalidate();
    }
  }, [note.title, initialData.title, router]);

  const form = useForm<NoteFormInput>({
    values: {
      content: note.content ?? '',
      title: note.title,
    },
  });

  const {
    formState: { isDirty },
    handleSubmit,
    control,
  } = form;

  const [watchedContent, watchedTitle] = useWatch({
    name: ['content', 'title'],
    control,
  });

  const { isPending: isUpdating, mutate: _updateNote } = useMutation<
    InferResponseType<(typeof $fetch.api.v1.notes)[':id']['$put']>['data'],
    Error,
    InferRequestType<(typeof $fetch.api.v1.notes)[':id']['$put']>
  >({
    onSuccess: ({ title }) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(note.id) });
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      router.invalidate();

      setActiveTab('preview');

      toast.success(m.notes_page_toast_updated(), {
        description: m.notes_page_toast_updated_desc({ title }),
      });
    },
    onError: () => {
      toast.error(m.notes_page_toast_update_failed(), {
        description: m.common_error_connection(),
      });
    },
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.notes[':id'].$put(args);

      return result.data;
    },
  });

  const { isPending: isDeleting, mutate: deleteNote } = useDeleteNote();
  const { isPending: isTrashing, mutate: trashNote } = useTrashNote();
  const { isPending: isRestoring, mutate: restoreNote } = useRestoreNote();

  const updateNote = (data: NoteInputPayload) => {
    _updateNote(
      {
        params: { id: note.id },
        body: data,
      },
      {
        onSuccess: () => setActiveTab('preview'),
      },
    );
  };

  const deleteNotePermanently = async () => {
    const ok = await confirm({
      description: m.notes_page_delete_desc({ title: note.title }),
      confirmText: m.notes_page_delete_confirm(),
      cancelText: m.notes_page_delete_cancel(),
      title: m.notes_page_delete_title(),
      variant: 'destructive',
    });

    if (!ok) return;

    deleteNote(
      { params: { id: note.id } },
      {
        onSuccess: () => navigate({ to: '/notes' }),
      },
    );
  };

  const moveNoteToTrash = () => {
    trashNote(
      { body: { status: 'TRASHED' }, params: { id: note.id } },
      {
        onSuccess: () => navigate({ to: '/notes' }),
      },
    );
  };

  const restoreNoteFromTrash = () => {
    restoreNote(
      { body: { status: 'ACTIVE' }, params: { id: note.id } },
      {
        onSuccess: () => navigate({ to: '/notes' }),
      },
    );
  };

  const copyContent = async (content = note.content ?? '') => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(m.notes_page_toast_copy_content());
    } catch {
      toast.error(m.notes_page_toast_copy_content_failed(), {
        description: m.common_error_connection(),
      });
    }
  };

  const backToNotesPage = () => {
    const to = search.from ? `/notes/${search.from}` : '/notes';
    void navigate({ to });
  };

  useFormSaveShortcut({
    isSubmitting: isUpdating || isDeleting || isTrashing || isRestoring,
    onSubmit: updateNote,
    enabled: isDirty,
    form,
  });

  return {
    actions: {
      saveChanges: handleSubmit(updateNote),
      restoreNote: restoreNoteFromTrash,
      deleteNotePermanently,
      moveNoteToTrash,
      backToNotesPage,
      setActiveTab,
      copyContent,
      updateNote,
    },
    status: {
      isRestoring,
      isDeleting,
      isTrashing,
      isUpdating,
      isLoading,
    },
    state: {
      watchedContent,
      watchedTitle,
      activeTab,
    },
    form,
    note,
  };
}
