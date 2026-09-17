import type {
  GenerateNoteTitleRequest,
  GenerateNoteTitleResponse,
} from '@/features/notes/api/notes.http';

import { useMutation } from '@tanstack/react-query';

import { toast } from 'sonner';

import { m } from '@/paraglide/messages';

import { generateNoteTitleClient } from '@/features/notes/api/notes.http';

export function useGenerateNoteTitle() {
  return useMutation<GenerateNoteTitleResponse, Error, GenerateNoteTitleRequest>({
    mutationFn: generateNoteTitleClient,
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
