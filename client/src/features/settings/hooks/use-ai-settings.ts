import { useCallback, useEffect, useState } from 'react';

import {
  getAiSettings,
  updateAiSettings,
  type AiSettings,
} from '@/features/chat/lib/chat-api';

export const DEFAULT_AI_SETTINGS: AiSettings = {
  responseLength: 'balanced',
  preset: 'friendly',
  language: 'auto',
  useEmoji: false,
};

export function useAiSettings() {
  const [settings, setSettings] = useState<AiSettings>(DEFAULT_AI_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void getAiSettings()
      .then((response) => {
        if (isMounted) {
          setSettings(response.settings);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSettings(DEFAULT_AI_SETTINGS);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const update = useCallback(async (next: AiSettings) => {
    setSettings(next);
    setIsSaving(true);
    try {
      const saved = await updateAiSettings(next);
      setSettings(saved);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const resetToDefaults = useCallback(async () => {
    await update({ ...DEFAULT_AI_SETTINGS });
  }, [update]);

  return {
    resetToDefaults,
    isLoading,
    isSaving,
    settings,
    update,
  };
}
