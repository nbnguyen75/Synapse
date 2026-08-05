import type { CompanionSettings } from '@/features/settings/schemas';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import {
  getCompanionSettings,
  updateCompanionSettings,
} from '@/features/settings/api';

import { m } from '@/paraglide/messages';

export function useGetCompanionSettings() {
  return useQuery({
    queryKey: ['companion-settings'],
    queryFn: getCompanionSettings,
  });
}

export function useUpdateCompanionSettings() {
  const queryClient = useQueryClient();

  return useMutation<CompanionSettings, Error, { data: CompanionSettings }>({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companion-settings'] });

      toast.success(m.settings_page_toast_saved());
    },
    onError: () => {
      toast.error(m.settings_page_save_failed());
    },
    mutationFn: ({ data }) => updateCompanionSettings(data),
  });
}
