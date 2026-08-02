import { useCallback } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getAiSettings,
  updateAiSettings,
  type AiSettings,
} from '@/features/chat/lib/chat-api';

export const DEFAULT_AI_SETTINGS: AiSettings = {
  responseLength: 'balanced',
  botName: 'Synapse',
  preset: 'friendly',
  language: 'auto',
  useEmoji: false,
};

export function useAiSettings() {
  const queryClient = useQueryClient();

  const { isLoading, data } = useQuery({
    queryFn: async () => {
      const response = await getAiSettings();
      return response.settings;
    },
    queryKey: ['ai-settings'],
  });

  const settings = data ?? DEFAULT_AI_SETTINGS;

  const mutation = useMutation({
    onMutate: (next) => {
      const previous =
        queryClient.getQueryData<AiSettings>(['ai-settings']) ??
        DEFAULT_AI_SETTINGS;
      queryClient.setQueryData(['ai-settings'], next);
      return { previous };
    },
    onError: (_error, _next, context) => {
      queryClient.setQueryData(['ai-settings'], context?.previous);
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(['ai-settings'], saved);
    },
    mutationFn: updateAiSettings,
  });

  const update = useCallback(
    async (next: AiSettings) => {
      await mutation.mutateAsync(next);
    },
    [mutation],
  );

  const resetToDefaults = useCallback(async () => {
    await update({ ...DEFAULT_AI_SETTINGS });
  }, [update]);

  return {
    isSaving: mutation.isPending,
    resetToDefaults,
    isLoading,
    settings,
    update,
  };
}
