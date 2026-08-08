import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import {
  $fetch,
  type InferRequestType,
  type InferResponseType,
} from '@/lib/fetch';
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

export function useRenameConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    InferResponseType<
      (typeof $fetch.api.v1.ai.conversations)[':id']['$patch']
    >['data'],
    Error,
    InferRequestType<(typeof $fetch.api.v1.ai.conversations)[':id']['$patch']>
  >({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companion-conversations'] });
      toast.success(m.chat_conversation_toast_renamed());
    },
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.ai.conversations[':id'].$patch(args);

      return result.data;
    },
    onError: () => {
      toast.error(m.chat_conversation_toast_failed());
    },
  });
}

export function useDeleteConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    InferResponseType<
      (typeof $fetch.api.v1.ai.conversations)[':id']['$delete']
    >['data'],
    Error,
    InferRequestType<(typeof $fetch.api.v1.ai.conversations)[':id']['$delete']>
  >({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companion-conversations'] });
      toast.success(m.chat_conversation_toast_deleted());
    },
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.ai.conversations[':id'].$delete(args);

      return result.data;
    },
    onError: () => {
      toast.error(m.chat_conversation_toast_failed());
    },
  });
}

export function useToggleConversationFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    InferResponseType<
      (typeof $fetch.api.v1.ai.conversations)[':id']['favorite']['$patch']
    >['data'],
    Error,
    InferRequestType<
      (typeof $fetch.api.v1.ai.conversations)[':id']['favorite']['$patch']
    >
  >({
    onSuccess: (_data, { body: { favorited } }) => {
      queryClient.invalidateQueries({ queryKey: ['companion-conversations'] });
      toast.success(
        favorited
          ? m.chat_conversation_toast_starred()
          : m.chat_conversation_toast_unstarred(),
      );
    },
    mutationFn: async (args) => {
      const result =
        await $fetch.api.v1.ai.conversations[':id'].favorite.$patch(args);

      return result.data;
    },
    onError: () => {
      toast.error(m.chat_conversation_toast_failed());
    },
  });
}
