import { useQuery } from '@tanstack/react-query';

import { $fetch } from '@/lib/fetch';

export function useGetConversationsQuery() {
  return useQuery({
    queryFn: async () => {
      const result = await $fetch.api.v1.ai.conversations.$get();

      return result.data;
    },
    placeholderData: (prevData) => prevData ?? [],
    queryKey: ['companion-conversations'],
  });
}

export function useGetConversationMessagesQuery(id: string | null) {
  return useQuery({
    queryFn: async () => {
      const result = await $fetch.api.v1.ai.conversations[':id'].messages.$get({
        params: { id: id as string },
      });

      return result.data;
    },
    queryKey: ['companion-conversation-messages', id],
    placeholderData: (prevData) => prevData ?? [],
    enabled: id !== null,
  });
}
