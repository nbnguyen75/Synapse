import type { InferRequestType, InferResponseType } from '@/lib/fetch';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import { m } from '@/paraglide/messages';
import { $fetch } from '@/lib/fetch';

import { DEFAULT_COMPANION_SETTINGS } from '@/features/companion/constants';

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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['companion-settings'] });

      toast.success(m.settings_page_toast_saved());
    },
    onError: () => {
      toast.error(m.settings_page_save_failed(), {
        description: m.common_error_connection(),
      });
    },
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.ai.settings.$put(args);

      return result.data;
    },
  });
}
