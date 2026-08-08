import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import { DEFAULT_COMPANION_SETTINGS } from '@/features/companion/constants';

import {
  $fetch,
  type InferRequestType,
  type InferResponseType,
} from '@/lib/fetch';

export function useGetCompanionSettingsQuery() {
  return useQuery({
    queryFn: async () => {
      const result = await $fetch.api.v1.ai.settings.$get();

      return result.data;
    },
    placeholderData: (prevData) => prevData ?? DEFAULT_COMPANION_SETTINGS,
    queryKey: ['companion-settings'],
  });
}

export function useUpdateCompanionSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    InferResponseType<typeof $fetch.api.v1.ai.settings.$put>['data'],
    Error,
    InferRequestType<typeof $fetch.api.v1.ai.settings.$put>
  >({
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.ai.settings.$put(args);

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companion-settings'] });

      toast.success('');
    },
    onError: () => {
      toast.error('');
    },
  });
}
