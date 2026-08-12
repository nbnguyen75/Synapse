import type {
  CompanionResponseLength,
  CompanionSettingsLanguage,
  CompanionSettingsPreset,
} from '@/features/companion';

import { m } from '@/paraglide/messages';

export const SETTINGS_TABS = ['general', 'companion', 'shortcuts'] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number];

export const COMPANION_RESPONSE_LENGTH_OPTIONS: {
  value: CompanionResponseLength;
  label: string;
}[] = [
  {
    label: m.settings_companion_response_length_balanced(),
    value: 'balanced',
  },
  {
    label: m.settings_companion_response_length_detailed(),
    value: 'detailed',
  },
  {
    label: m.settings_companion_response_length_short(),
    value: 'short',
  },
];

export const COMPANION_SETTINGS_PRESET_OPTIONS: {
  value: CompanionSettingsPreset;
  label: string;
}[] = [
  {
    label: m.settings_companion_preset_professional(),
    value: 'professional',
  },
  {
    label: m.settings_companion_preset_socratic(),
    value: 'socratic',
  },
  {
    label: m.settings_companion_preset_friendly(),
    value: 'friendly',
  },
  {
    label: m.settings_companion_preset_concise(),
    value: 'concise',
  },
  {
    label: m.settings_companion_preset_custom(),
    value: 'custom',
  },
];

export const COMPANION_SETTINGS_LANGUAGE_OPTIONS: {
  value: CompanionSettingsLanguage;
  label: string;
}[] = [
  {
    label: m.settings_companion_language_auto(),
    value: 'auto',
  },
  {
    label: m.settings_companion_language_vi(),
    value: 'vi',
  },
  {
    label: m.settings_companion_language_en(),
    value: 'en',
  },
];
