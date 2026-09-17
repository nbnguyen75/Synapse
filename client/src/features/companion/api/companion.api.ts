import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import {
  getCompanionSettingsClient,
  getConversationMessagesClient,
  getConversationsClient,
} from '@/features/companion/api/companion.http';
import { DEFAULT_COMPANION_SETTINGS, MESSAGE_PAGE_SIZE } from '@/features/companion/constants';

export const companionKeys = {
  all: ['companion'] as const,
  conversations: () => ['companion-conversations'] as const,
  conversationMessages: (id: string | null) => ['companion-conversation-messages', id] as const,
  settings: () => ['companion-settings'] as const,
};

export function conversationsQueryOptions() {
  return queryOptions({
    queryFn: getConversationsClient,
    placeholderData: (previousData) => previousData ?? [],
    queryKey: companionKeys.conversations(),
  });
}

export function conversationMessagesInfiniteQueryOptions(id: string | null) {
  return infiniteQueryOptions({
    queryFn: ({ pageParam }) =>
      getConversationMessagesClient({
        query: { limit: MESSAGE_PAGE_SIZE, offset: pageParam },
        params: { id: id ?? '' },
      }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === MESSAGE_PAGE_SIZE
        ? allPages.reduce((sum, page) => sum + page.length, 0)
        : undefined,
    queryKey: companionKeys.conversationMessages(id),
    enabled: id !== null,
    initialPageParam: 0,
  });
}

export function companionSettingsQueryOptions() {
  return queryOptions({
    queryFn: getCompanionSettingsClient,
    placeholderData: (previousData) => previousData ?? DEFAULT_COMPANION_SETTINGS,
    queryKey: companionKeys.settings(),
  });
}
