import type {
  CompanionResponseLength,
  CompanionSettingsLanguage,
  CompanionSettingsPreset,
} from '@/features/companion/constants';

export interface CompanionSettings {
  responseLength: CompanionResponseLength;
  customInstructions?: undefined | string;
  language: CompanionSettingsLanguage;
  preset: CompanionSettingsPreset;
  useEmoji: boolean;
  botName: string;
}

export interface CompanionConversation {
  currentMessageId: string | null;
  title: string | null;
  favorited: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  id: string;
}
