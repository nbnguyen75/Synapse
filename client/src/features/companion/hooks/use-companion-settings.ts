import type {
  UpdateCompanionSettingsRequest,
  UpdateCompanionSettingsResponse,
} from '@/features/companion/api/companion.http';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import { m } from '@/paraglide/messages';

import {
  companionKeys,
  companionSettingsQueryOptions,
} from '@/features/companion/api/companion.api';
import { updateCompanionSettingsClient } from '@/features/companion/api/companion.http';

export function useGetCompanionSettingsQuery() {
  return useQuery(companionSettingsQueryOptions());
}

export function useUpdateCompanionSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation<UpdateCompanionSettingsResponse, Error, UpdateCompanionSettingsRequest>({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companionKeys.settings() });

      toast.success(m.settings_page_toast_saved());
    },
    onError: () => {
      toast.error(m.settings_page_save_failed(), {
        description: m.common_error_connection(),
      });
    },
    mutationFn: updateCompanionSettingsClient,
  });
}
