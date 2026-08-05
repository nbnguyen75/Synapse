import z from 'zod/v4';

import {
  COMPANION_SETTINGS_LANGUAGES,
  COMPANION_SETTINGS_PRESETS,
  COMPANION_SETTINGS_RESPONSE_LENGTH,
  SETTINGS_TABS,
} from '@/features/settings/constants';

import { env } from '@/config/env';

export const settingsQueryParamsSchema = z.object({
  tab: z.enum(SETTINGS_TABS).default('general'),
});

export const companionSettingsSchema = z.object({
  responseLength: z
    .enum(COMPANION_SETTINGS_RESPONSE_LENGTH)
    .default('balanced'),
  preset: z.enum(COMPANION_SETTINGS_PRESETS).default('friendly'),
  language: z.enum(COMPANION_SETTINGS_LANGUAGES).default('auto'),
  botName: z.string().default(env.VITE_APP_NAME),
  customInstructions: z.string().optional(),
  useEmoji: z.boolean().default(false),
});

export type CompanionSettings = z.infer<typeof companionSettingsSchema>;
export type CompanionSettingsFormValues = z.input<
  typeof companionSettingsSchema
>;
