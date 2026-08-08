import z from 'zod/v4';

import { SETTINGS_TABS } from '@/features/settings/constants';

import { m } from '@/paraglide/messages';

export const settingsQueryParamsSchema = z.object({
  tab: z
    .enum(SETTINGS_TABS, { message: m.validation_tab_invalid() })
    .default('general'),
});
