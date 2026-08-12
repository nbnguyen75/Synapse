import type { NoteFormInput, NoteInputPayload } from '@/features/notes/schemas';
import type { Note } from '@/features/notes/types';

import { useForm, useWatch } from 'react-hook-form';
import { useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { toast } from 'sonner';

import {
  useDeleteNote,
  useGenerateNoteTitle,
  useGetNote,
} from '@/features/notes/hooks/api';
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

  const { handleSubmit, setValue, control } = form;

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
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.notes[':id'].$put(args);

      return result.data;
    },
    onError: () => {
      toast.error(m.notes_page_toast_update_failed());
    },
  });

  const { isPending: isDeleting, mutate: deleteNote } = useDeleteNote();
  const { isPending: isGeneratingTitle, mutate: _generateNoteTitle } =
    useGenerateNoteTitle();

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

  const generateNoteTitle = () => {
    if (!watchedContent?.trim() || isGeneratingTitle) return;

    _generateNoteTitle(
      { body: { content: watchedContent } },
      {
        onSuccess: ({ title }) => {
          setValue('title', title, { shouldDirty: true });
        },
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
    form,
  });

  return {
    actions: {
      saveChanges: handleSubmit(updateNote),
      deleteNotePermanently,
      generateNoteTitle,
      backToNotesPage,
      setActiveTab,
      updateNote,
    },
    status: {
      isGeneratingTitle,
      isDeleting,
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
