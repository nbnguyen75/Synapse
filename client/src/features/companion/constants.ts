import type { CompanionSettings } from '@/features/companion/types';

import { env } from '@/config/env';

export const COMPANION_SETTINGS_RESPONSE_LENGTH = [
  'short',
  'balanced',
  'detailed',
] as const;

export type CompanionResponseLength =
  (typeof COMPANION_SETTINGS_RESPONSE_LENGTH)[number];

export const COMPANION_SETTINGS_PRESETS = [
  'socratic',
  'friendly',
  'professional',
  'concise',
  'custom',
] as const;

export type CompanionSettingsPreset =
  (typeof COMPANION_SETTINGS_PRESETS)[number];

export const COMPANION_SETTINGS_LANGUAGES = ['vi', 'en', 'auto'] as const;

export type CompanionSettingsLanguage =
  (typeof COMPANION_SETTINGS_LANGUAGES)[number];

export const DEFAULT_COMPANION_SETTINGS: CompanionSettings = {
  botName: env.VITE_APP_NAME,
  responseLength: 'balanced',
  preset: 'friendly',
  language: 'auto',
  useEmoji: false,
};
