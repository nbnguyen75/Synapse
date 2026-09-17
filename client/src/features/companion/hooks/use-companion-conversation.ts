import type {
  CloneConversationRequest,
  CloneConversationResponse,
  DeleteConversationRequest,
  DeleteConversationResponse,
  RenameConversationRequest,
  RenameConversationResponse,
  SetCurrentMessageRequest,
  SetCurrentMessageResponse,
  ToggleConversationFavoriteRequest,
  ToggleConversationFavoriteResponse,
} from '@/features/companion/api/companion.http';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import { m } from '@/paraglide/messages';

import {
  cloneConversationClient,
  deleteConversationClient,
  renameConversationClient,
  setCurrentMessageClient,
  toggleConversationFavoriteClient,
} from '@/features/companion/api/companion.http';
import {
  companionKeys,
  conversationMessagesInfiniteQueryOptions,
  conversationsQueryOptions,
} from '@/features/companion/api/companion.api';

export function useGetConversationsQuery() {
  return useQuery(conversationsQueryOptions());
}

export function useGetConversationMessagesInfiniteQuery(id: string | null) {
  return useInfiniteQuery(conversationMessagesInfiniteQueryOptions(id));
}

export function useRenameConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation<RenameConversationResponse, Error, RenameConversationRequest>({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companionKeys.conversations() });
      toast.success(m.chat_conversation_toast_renamed());
    },
    mutationFn: renameConversationClient,
    onError: () => {
      toast.error(m.chat_conversation_toast_failed(), {
        description: m.common_error_connection(),
      });
    },
  });
}

export function useDeleteConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation<DeleteConversationResponse, Error, DeleteConversationRequest>({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companionKeys.conversations() });
      toast.success(m.chat_conversation_toast_deleted());
    },
    mutationFn: deleteConversationClient,
    onError: () => {
      toast.error(m.chat_conversation_delete_failed(), {
        description: m.common_error_connection(),
      });
    },
  });
}

export function useToggleConversationFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation<ToggleConversationFavoriteResponse, Error, ToggleConversationFavoriteRequest>({
    onSuccess: (_data, { body: { favorited } }) => {
      void queryClient.invalidateQueries({ queryKey: companionKeys.conversations() });
      toast.success(
        favorited ? m.chat_conversation_toast_starred() : m.chat_conversation_toast_unstarred(),
      );
    },
    mutationFn: toggleConversationFavoriteClient,
    onError: () => {
      toast.error(m.chat_conversation_toast_failed(), {
        description: m.common_error_connection(),
      });
    },
  });
}

export function useCloneConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation<CloneConversationResponse, Error, CloneConversationRequest>({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companionKeys.conversations() });
      toast.success(m.chat_message_branch_created());
    },
    mutationFn: cloneConversationClient,
    onError: () => {
      toast.error(m.chat_message_branch_failed(), {
        description: m.common_error_connection(),
      });
    },
  });
}

export function useSetCurrentMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation<SetCurrentMessageResponse, Error, SetCurrentMessageRequest>({
    mutationFn: setCurrentMessageClient,
    onError: () => {
      toast.error(m.chat_message_switch_failed(), {
        description: m.common_error_connection(),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: companionKeys.conversations(),
      });
    },
  });
}
