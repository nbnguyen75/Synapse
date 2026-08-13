import type { NoteFormInput, NoteInputPayload } from '@/features/notes/schemas';
import type { Note } from '@/features/notes/types';

import { useForm, useWatch } from 'react-hook-form';
import { useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { toast } from 'sonner';

import { useDeleteNote, useGetNote } from '@/features/notes/hooks/api';
import { noteKeys } from '@/features/notes/keys';

import { useFormSaveShortcut } from '@/hooks/use-form-save-shortcut';

import {
  $fetch,
  type InferRequestType,
  type InferResponseType,
} from '@/lib/fetch';
import { m } from '@/paraglide/messages';

import { useConfirm } from '@/providers';

export function useNoteDetails(initialData: Note) {
  const navigate = useNavigate();
  const search = useSearch({ from: '/_app/notes/$noteId' });
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('preview');

  const { data: queryNote, isLoading } = useGetNote(
    initialData.id,
    initialData,
  );
  const note = queryNote ?? initialData;

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

  const backToNotesPage = () => {
    const to = search.from ? `/${search.from}` : '/notes';
    void navigate({ to });
  };

  useFormSaveShortcut({
    isSubmitting: isUpdating || isDeleting,
    onSubmit: updateNote,
    enabled: isDirty,
    form,
  });

  return {
    actions: {
      saveChanges: handleSubmit(updateNote),
      deleteNotePermanently,
      backToNotesPage,
      setActiveTab,
      updateNote,
    },
    state: {
      watchedContent,
      watchedTitle,
      activeTab,
    },
    status: {
      isDeleting,
      isUpdating,
      isLoading,
    },
    form,
    note,
  };
}
