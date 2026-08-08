import type {
  CompanionResponseLength,
  CompanionSettingsLanguage,
  CompanionSettingsPreset,
} from '@/features/companion/constants';

export interface CompanionSettings {
  responseLength: CompanionResponseLength;
  customInstructions?: string | undefined;
  language: CompanionSettingsLanguage;
  preset: CompanionSettingsPreset;
  useEmoji: boolean;
  botName: string;
}

export interface CompanionConversation {
  title: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  id: string;
}
