import { useCallback } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { listConversations } from '../lib/chat-api';

export function useConversations() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryFn: async () => listConversations(),
    queryKey: ['ai-conversations'],
  });

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
  }, [queryClient]);

  return {
    conversations: query.data ?? [],
    isLoading: query.isLoading,
    refresh,
  };
}
