import type { CompanionSettings } from '@/features/settings/schemas';

import { m } from '@/paraglide/messages';

export const SETTINGS_TABS = ['general', 'companion'] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number];

export const DEFAULT_AI_SETTINGS: CompanionSettings = {
  responseLength: 'balanced',
  botName: 'Synapse',
  preset: 'friendly',
  language: 'auto',
  useEmoji: false,
};

export const COMPANION_SETTINGS_RESPONSE_LENGTH = [
  'short',
  'balanced',
  'detailed',
] as const;

export type CompanionResponseLength =
  (typeof COMPANION_SETTINGS_RESPONSE_LENGTH)[number];

export function getResponseLengthLabel(
  length: CompanionResponseLength,
): string {
  switch (length) {
    case 'short':
      return m.settings_companion_response_length_short();
    case 'balanced':
      return m.settings_companion_response_length_balanced();
    case 'detailed':
      return m.settings_companion_response_length_detailed();
    default:
      return m.settings_companion_response_length();
  }
}

export const COMPANION_SETTINGS_PRESETS = [
  'socratic',
  'friendly',
  'professional',
  'concise',
  'custom',
] as const;

export type CompanionSettingsPreset =
  (typeof COMPANION_SETTINGS_PRESETS)[number];

export function getPresetLabel(preset: CompanionSettingsPreset): string {
  switch (preset) {
    case 'professional':
      return m.settings_companion_preset_professional();
    case 'socratic':
      return m.settings_companion_preset_socratic();
    case 'friendly':
      return m.settings_companion_preset_friendly();
    case 'concise':
      return m.settings_companion_preset_concise();
    case 'custom':
      return m.settings_companion_preset_custom();
    default:
      return m.settings_companion_preset();
  }
}

export const COMPANION_SETTINGS_LANGUAGES = ['vi', 'en', 'auto'] as const;

export type CompanionSettingsLanguage =
  (typeof COMPANION_SETTINGS_LANGUAGES)[number];

export function getLanguageLabel(language: CompanionSettingsLanguage): string {
  switch (language) {
    case 'vi':
      return m.settings_companion_language_vi();
    case 'en':
      return m.settings_companion_language_en();
    case 'auto':
      return m.settings_companion_language_auto();
    default:
      return m.settings_companion_language();
  }
}
