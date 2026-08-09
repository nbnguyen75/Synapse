import { useForm, useWatch } from 'react-hook-form';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { toast } from 'sonner';

import {
  noteInputSchema,
  type NoteFormInput,
  type NoteInputPayload,
} from '@/features/notes/schemas';
import { useGenerateNoteTitle } from '@/features/notes/hooks/api';
import { noteKeys } from '@/features/notes/keys';

import { useKeyboardShortcut } from '@/hooks/use-key-binding';

import { getShortcut } from '@/config/keyboard-shortcuts';

import {
  $fetch,
  type InferRequestType,
  type InferResponseType,
} from '@/lib/fetch';
import { m } from '@/paraglide/messages';

interface UseNoteCreateOptions {
  initialTitle?: string;
}

export function useNoteCreate({ initialTitle }: UseNoteCreateOptions = {}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useForm<NoteFormInput>({
    defaultValues: {
      title: initialTitle,
      content: '',
    },
    resolver: standardSchemaResolver(noteInputSchema),
  });

  const { handleSubmit, setValue, control } = form;

  const [watchedContent] = useWatch({
    name: ['content'],
    control,
  });

  const { isPending: isCreating, mutate: _createNote } = useMutation<
    InferResponseType<(typeof $fetch.api.v1.notes)['$post']>['data'],
    Error,
    InferRequestType<(typeof $fetch.api.v1.notes)['$post']>
  >({
    onSuccess: ({ title }) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });

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

  const { isPending: isGeneratingTitle, mutate: _generateNoteTitle } =
    useGenerateNoteTitle();

  // 3. Handlers
  const createNote = (data: NoteInputPayload) => {
    _createNote({ body: data });
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
    void navigate({ to: '/notes' });
  };

  useKeyboardShortcut(
    getShortcut('save-note').combos,
    () => {
      if (isCreating) return;
      void handleSubmit(createNote)();
    },
    { allowWhenTyping: ['ctrl+s', 'meta+s'] },
  );

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
