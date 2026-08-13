import { useMutation } from '@tanstack/react-query';

import { toast } from 'sonner';

import {
  $fetch,
  type InferRequestType,
  type InferResponseType,
} from '@/lib/fetch';
import { m } from '@/paraglide/messages';

export function useGenerateNoteTitle() {
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
    onError: () => {
      toast.error(m.notes_page_ai_title_failed(), {
        description: m.common_error_connection(),
      });
    },
    onSuccess: () => {
      toast.success(m.notes_page_ai_title_success());
    },
  });
}
