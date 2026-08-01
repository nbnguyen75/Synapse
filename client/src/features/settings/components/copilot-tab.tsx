import type {
  AiLanguage,
  AiResponseLength,
  AiSettings,
  AiSettingsPreset,
} from '@/features/chat/lib/chat-api';

import { useCallback, useEffect, useRef, useState } from 'react';

import { toast } from 'sonner';

import {
  DEFAULT_AI_SETTINGS,
  useAiSettings,
} from '@/features/settings/hooks/use-ai-settings';

import { m } from '@/paraglide/messages';

import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import { Save } from 'lucide-react';

const PRESETS: AiSettingsPreset[] = [
  'socratic',
  'friendly',
  'professional',
  'concise',
  'custom',
];

const PRESET_LABELS: Record<AiSettingsPreset, () => string> = {
  professional: () => m.settings_copilot_preset_professional(),
  socratic: () => m.settings_copilot_preset_socratic(),
  friendly: () => m.settings_copilot_preset_friendly(),
  concise: () => m.settings_copilot_preset_concise(),
  custom: () => m.settings_copilot_preset_custom(),
};

const RESPONSE_LENGTHS: AiResponseLength[] = ['short', 'balanced', 'detailed'];

const LANGUAGES: AiLanguage[] = ['vi', 'en', 'auto'];

export default function CopilotTab() {
  const { resetToDefaults, isLoading, isSaving, settings, update } =
    useAiSettings();
  const [draft, setDraft] = useState<AiSettings>(DEFAULT_AI_SETTINGS);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  if (!hasLoaded && !isLoading) {
    setHasLoaded(true);
    setDraft(settings);
  }

  useEffect(() => {
    if (!isDirty) {
      return;
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      void update(draft);
    }, 400);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [draft, isDirty, update]);

  const change = useCallback(
    <K extends keyof AiSettings>(key: K, value: AiSettings[K]) => {
      setDraft((prev) => ({ ...prev, [key]: value }));
      setIsDirty(true);
    },
    [],
  );

  const handleManualSave = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setIsDirty(false);
    void update(draft).then(() => {
      toast.success(m.settings_page_toast_saved());
    });
  }, [draft, update]);

  const handleResetDefaults = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setDraft({ ...DEFAULT_AI_SETTINGS });
    setIsDirty(false);
    void resetToDefaults().then(() => {
      toast.success(m.settings_page_toast_saved());
    });
  }, [resetToDefaults]);

  if (isLoading) {
    return (
      <div className="mt-6 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <div>
        <h2 className="mb-4 text-sm font-semibold">
          {m.settings_copilot_preset()}
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((preset) => (
            <Button
              className="capitalize"
              key={preset}
              onClick={() => change('preset', preset)}
              variant={draft.preset === preset ? 'default' : 'outline'}
            >
              {PRESET_LABELS[preset]()}
            </Button>
          ))}
        </div>
        {draft.preset === 'custom' && (
          <div className="mt-4">
            <Label>{m.settings_copilot_custom_instructions()}</Label>
            <Textarea
              className="mt-1"
              onChange={(e) =>
                change('customInstructions', e.target.value || undefined)
              }
              rows={3}
              value={draft.customInstructions ?? ''}
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div>
          <Label>{m.settings_copilot_response_length()}</Label>
          <NativeSelect
            className="mt-1"
            onChange={(e) =>
              change('responseLength', e.target.value as AiResponseLength)
            }
            value={draft.responseLength}
          >
            {RESPONSE_LENGTHS.map((length) => (
              <NativeSelectOption key={length} value={length}>
                {length}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div>
          <Label>{m.settings_copilot_language()}</Label>
          <NativeSelect
            className="mt-1"
            onChange={(e) => change('language', e.target.value as AiLanguage)}
            value={draft.language}
          >
            {LANGUAGES.map((language) => (
              <NativeSelectOption key={language} value={language}>
                {language}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={draft.useEmoji}
            onCheckedChange={(checked) => change('useEmoji', Boolean(checked))}
          />
          <Label>{m.settings_copilot_use_emoji()}</Label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button disabled={isSaving} onClick={handleManualSave}>
          <Save className="mr-1.5 size-4" />
          {isSaving
            ? m.settings_page_copilot_saving()
            : m.settings_page_copilot_save()}
        </Button>
        <Button
          disabled={isSaving}
          onClick={handleResetDefaults}
          variant="outline"
        >
          {m.settings_copilot_reset_default()}
        </Button>
      </div>
    </div>
  );
}
