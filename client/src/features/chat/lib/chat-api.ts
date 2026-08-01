import type { ApiResponse } from '@/types/shared';
import type { UIMessage } from 'ai';

import { $fetch } from '@/lib/fetch';

export interface AiConversation {
  title: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  id: string;
}

export type AiSettingsPreset =
  'concise' | 'friendly' | 'professional' | 'socratic' | 'custom';
export type AiResponseLength = 'short' | 'balanced' | 'detailed';
export type AiLanguage = 'vi' | 'en' | 'auto';

export interface AiSettings {
  responseLength: AiResponseLength;
  customInstructions?: string;
  preset: AiSettingsPreset;
  language: AiLanguage;
  useEmoji: boolean;
}

export interface AiSettingsResponse {
  presets: AiSettingsPreset[];
  settings: AiSettings;
}

export async function listConversations(): Promise<AiConversation[]> {
  const result = await $fetch<ApiResponse<AiConversation[]>>(
    '/api/v1/ai/conversations',
    {
      method: 'GET',
    },
  );

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function getConversationMessages(
  id: string,
): Promise<UIMessage[]> {
  const result = await $fetch<ApiResponse<UIMessage[]>>(
    `/api/v1/ai/conversations/${id}/messages`,
    {
      method: 'GET',
    },
  );

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function getAiSettings(): Promise<AiSettingsResponse> {
  const result = await $fetch<ApiResponse<AiSettingsResponse>>(
    '/api/v1/ai/settings',
    {
      method: 'GET',
    },
  );

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

export async function updateAiSettings(
  settings: AiSettings,
): Promise<AiSettings> {
  const result = await $fetch<ApiResponse<AiSettings>>('/api/v1/ai/settings', {
    body: settings,
    method: 'PUT',
  });

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}
