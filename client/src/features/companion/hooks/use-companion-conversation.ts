import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import { $fetch, type InferRequestType, type InferResponseType } from '@/lib/fetch';
import { m } from '@/paraglide/messages';

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

export const MESSAGE_PAGE_SIZE = 15;

export function useGetConversationMessagesInfiniteQuery(id: string | null) {
  return useInfiniteQuery({
    queryFn: async ({ pageParam }) => {
      const result = await $fetch.api.v1.ai.conversations[':id'].messages.$get({
        query: { limit: MESSAGE_PAGE_SIZE, offset: pageParam },
        params: { id: id ?? '' },
      });

      return result.data;
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === MESSAGE_PAGE_SIZE
        ? allPages.reduce((sum, page) => sum + page.length, 0)
        : undefined,
    queryKey: ['companion-conversation-messages', id],
    enabled: id !== null,
    initialPageParam: 0,
  });
}

export function useRenameConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    InferResponseType<(typeof $fetch.api.v1.ai.conversations)[':id']['$patch']>['data'],
    Error,
    InferRequestType<(typeof $fetch.api.v1.ai.conversations)[':id']['$patch']>
  >({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['companion-conversations'] });
      toast.success(m.chat_conversation_toast_renamed());
    },
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.ai.conversations[':id'].$patch(args);

      return result.data;
    },
    onError: () => {
      toast.error(m.chat_conversation_toast_failed(), {
        description: m.common_error_connection(),
      });
    },
  });
}

export function useDeleteConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    InferResponseType<(typeof $fetch.api.v1.ai.conversations)[':id']['$delete']>['data'],
    Error,
    InferRequestType<(typeof $fetch.api.v1.ai.conversations)[':id']['$delete']>
  >({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['companion-conversations'] });
      toast.success(m.chat_conversation_toast_deleted());
    },
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.ai.conversations[':id'].$delete(args);

      return result.data;
    },
    onError: () => {
      toast.error(m.chat_conversation_delete_failed(), {
        description: m.common_error_connection(),
      });
    },
  });
}

export function useToggleConversationFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    InferResponseType<(typeof $fetch.api.v1.ai.conversations)[':id']['favorite']['$patch']>['data'],
    Error,
    InferRequestType<(typeof $fetch.api.v1.ai.conversations)[':id']['favorite']['$patch']>
  >({
    onSuccess: (_data, { body: { favorited } }) => {
      void queryClient.invalidateQueries({ queryKey: ['companion-conversations'] });
      toast.success(
        favorited ? m.chat_conversation_toast_starred() : m.chat_conversation_toast_unstarred(),
      );
    },
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.ai.conversations[':id'].favorite.$patch(args);

      return result.data;
    },
    onError: () => {
      toast.error(m.chat_conversation_toast_failed(), {
        description: m.common_error_connection(),
      });
    },
  });
}

export function useCloneConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    InferResponseType<(typeof $fetch.api.v1.ai.conversations)[':id']['clone']['$post']>['data'],
    Error,
    InferRequestType<(typeof $fetch.api.v1.ai.conversations)[':id']['clone']['$post']>
  >({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['companion-conversations'] });
      toast.success(m.chat_message_branch_created());
    },
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.ai.conversations[':id'].clone.$post(args);

      return result.data;
    },
    onError: () => {
      toast.error(m.chat_message_branch_failed(), {
        description: m.common_error_connection(),
      });
    },
  });
}

export function useSetCurrentMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    InferResponseType<
      (typeof $fetch.api.v1.ai.conversations)[':id']['current-message']['$patch']
    >['data'],
    Error,
    InferRequestType<(typeof $fetch.api.v1.ai.conversations)[':id']['current-message']['$patch']>
  >({
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.ai.conversations[':id']['current-message'].$patch(args);

      return result.data;
    },
    onError: () => {
      toast.error(m.chat_message_switch_failed(), {
        description: m.common_error_connection(),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['companion-conversations'],
      });
    },
  });
}
