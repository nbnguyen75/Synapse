import type { NoteFormInput, NoteInputPayload } from '@/features/notes/schemas';
import type { InferRequestType, InferResponseType } from '@/lib/fetch';

import { useForm, useWatch } from 'react-hook-form';
import { useEffect } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { toast } from 'sonner';

import { useFormSaveShortcut } from '@/hooks/use-form-save-shortcut';

import { m } from '@/paraglide/messages';
import { $fetch } from '@/lib/fetch';

import { useNoteCreatePrefillStore } from '@/features/notes/store';
import { useGenerateNoteTitle } from '@/features/notes/hooks/api';
import { noteInputSchema } from '@/features/notes/schemas';
import { noteKeys } from '@/features/notes/keys';

export function useNoteCreate() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useForm<NoteFormInput>({
    resolver: standardSchemaResolver(noteInputSchema),
    defaultValues: {
      content: '',
    },
  });

  const {
    formState: { isDirty },
    handleSubmit,
    setValue,
    control,
  } = form;

  const consumePrefill = useNoteCreatePrefillStore((state) => state.consume);

  useEffect(() => {
    const prefill = consumePrefill();
    if (prefill) {
      setValue('content', prefill, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [consumePrefill, setValue]);

  const [watchedContent] = useWatch({
    name: ['content'],
    control,
  });

  const { isPending: isCreating, mutate: _createNote } = useMutation<
    InferResponseType<(typeof $fetch.api.v1.notes)['$post']>['data'],
    Error,
    InferRequestType<(typeof $fetch.api.v1.notes)['$post']>
  >({
    onSuccess: ({ title, id }) => {
      void queryClient.invalidateQueries({ queryKey: noteKeys.all });

      toast.success(m.notes_page_toast_created(), {
        description: m.notes_page_toast_created_desc({ title }),
      });

      void navigate({ params: { noteId: id }, to: '/notes/$noteId', replace: true });

      form.reset({ title: undefined, content: '' });
    },
    onError: () => {
      toast.error(m.notes_page_toast_create_failed(), {
        description: m.common_error_connection(),
      });
    },
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.notes.$post(args);

      return result.data;
    },
  });

  const { isPending: isGeneratingTitle, mutate: _generateNoteTitle } = useGenerateNoteTitle();

  // 3. Handlers
  const createNote = (data: NoteInputPayload) => {
    _createNote({ body: data });
  };

  const generateNoteTitle = () => {
    if (!watchedContent.trim() || isGeneratingTitle) return;

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
    void navigate({ to: '/notes' });
  };

  useFormSaveShortcut({
    isSubmitting: isCreating,
    onSubmit: createNote,
    enabled: isDirty,
    form,
  });

  return {
    actions: {
      createNew: handleSubmit(createNote),
      generateNoteTitle,
      backToNotesPage,
      createNote,
    },
    status: {
      isGeneratingTitle,
      isCreating,
    },
    state: {
      watchedContent,
    },
    form,
  };
}
