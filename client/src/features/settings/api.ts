import type { CompanionSettings } from '@/features/settings/schemas';
import type { ApiResponse } from '@/types/shared';

import { $fetch } from '@/lib/fetch';

const COMPANION_SETTINGS_API = '/api/v1/ai/settings';

export async function getCompanionSettings() {
  const result = await $fetch<ApiResponse<CompanionSettings>>(
    COMPANION_SETTINGS_API,
    {
      method: 'GET',
    },
  );

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function updateCompanionSettings(settings: CompanionSettings) {
  const result = await $fetch<ApiResponse<CompanionSettings>>(
    COMPANION_SETTINGS_API,
    {
      body: settings,
      method: 'PUT',
    },
  );

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}
