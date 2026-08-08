import z from 'zod/v4';

import {
  COMPANION_SETTINGS_LANGUAGES,
  COMPANION_SETTINGS_PRESETS,
  COMPANION_SETTINGS_RESPONSE_LENGTH,
} from '@/features/companion/constants';

import { env } from '@/config/env';

import { m } from '@/paraglide/messages';

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

export type CompanionSettingsFormInput = z.input<
  typeof companionSettingsSchema
>;
export type CompanionSettingsPayload = z.infer<typeof companionSettingsSchema>;

export const conversationIdParam = z.object({
  id: z.string().trim().min(1, { message: m.validation_id_required() }),
});

export type ConversationIdParams = z.infer<typeof conversationIdParam>;
