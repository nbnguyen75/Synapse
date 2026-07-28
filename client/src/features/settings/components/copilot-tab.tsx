import type {
  CopilotConfig,
  PersonaId,
} from '@/features/chat/lib/copilot-config';

import { useState } from 'react';

import { toast } from 'sonner';

import { m } from '@/paraglide/messages';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Save, Sparkles } from 'lucide-react';

const PRESET_AVATARS = [
  'bot',
  'sparkles',
  'brain',
  'heart',
  'star',
  'zap',
  'flame',
  'droplets',
  'feather',
  'gem',
  'compass',
  'crown',
];

interface CopilotTabProps {
  onConfigChange: (updates: Partial<CopilotConfig>) => void;
  onResetDefaults: () => void;
  onManualSave: () => void;
  config: CopilotConfig;
  saveStatus: string;
}

export default function CopilotTab({
  onResetDefaults,
  onConfigChange,
  onManualSave,
  saveStatus,
  config,
}: CopilotTabProps) {
  const [avatarTab, setAvatarTab] = useState<'preset' | 'url' | 'upload'>(
    'preset',
  );
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error(m.settings_page_toast_avatar_invalid());
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onConfigChange({ avatar: dataUrl });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="mt-6 space-y-6">
      <div>
        <h2 className="text-sm font-semibold mb-4">
          {m.settings_page_copilot_identity()}
        </h2>
        <div className="space-y-4">
          <div>
            <Label>{m.settings_page_copilot_name()}</Label>
            <Input
              value={config.name}
              onChange={(e) => onConfigChange({ name: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>
              {m.settings_page_copilot_temperature()} (
              {config.temperature.toFixed(1)})
            </Label>
            <Slider
              value={[config.temperature]}
              onValueChange={(v: number | readonly number[]) =>
                onConfigChange({
                  temperature: (Array.isArray(v) ? v[0] : v) as number,
                })
              }
              min={0}
              max={1}
              step={0.1}
              className="mt-2"
            />
          </div>
          <div>
            <Label>{m.settings_page_copilot_avatar()}</Label>
            <div className="mt-2 flex gap-3">
              <Tabs
                value={avatarTab}
                onValueChange={(v) =>
                  setAvatarTab(v as 'preset' | 'url' | 'upload')
                }
              >
                <TabsList>
                  <TabsTrigger value="preset">Preset</TabsTrigger>
                  <TabsTrigger value="url">URL</TabsTrigger>
                  <TabsTrigger value="upload">
                    {m.settings_page_copilot_import_image()}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="preset" className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {PRESET_AVATARS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => onConfigChange({ avatar: icon })}
                        className={`flex size-9 items-center justify-center rounded-lg border ${config.avatar === icon ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-muted hover:bg-muted'}`}
                      >
                        <Sparkles className="size-4" />
                      </button>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="url" className="mt-2">
                  <Input
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                  />
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      if (customAvatarUrl)
                        onConfigChange({
                          avatar: customAvatarUrl,
                        });
                    }}
                  >
                    Set URL
                  </Button>
                </TabsContent>
                <TabsContent value="upload" className="mt-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-4">
          {m.settings_page_copilot_personality()}
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              'butler',
              'sassy',
              'scientist',
              'poet',
              'concise',
              'custom',
            ] as PersonaId[]
          ).map((p) => (
            <Button
              key={p}
              variant={config.persona === p ? 'default' : 'outline'}
              className="capitalize"
              onClick={() => onConfigChange({ persona: p })}
            >
              {p}
            </Button>
          ))}
        </div>
        {config.persona === 'custom' && (
          <div className="mt-4 space-y-4">
            <div>
              <Label>Persona Name</Label>
              <Input
                value={config.customPersonaName || ''}
                onChange={(e) =>
                  onConfigChange({
                    customPersonaName: e.target.value,
                  })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Persona Instructions</Label>
              <Textarea
                value={config.customPersonaInstructions || ''}
                onChange={(e) =>
                  onConfigChange({
                    customPersonaInstructions: e.target.value,
                  })
                }
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <Label>{m.settings_page_copilot_prompt()}</Label>
        <Textarea
          value={config.prompt}
          onChange={(e) => onConfigChange({ prompt: e.target.value })}
          className="mt-1"
          rows={4}
        />
      </div>

      <div>
        <Label>{m.settings_page_copilot_welcome()}</Label>
        <Textarea
          value={config.welcomeMessage}
          onChange={(e) => onConfigChange({ welcomeMessage: e.target.value })}
          className="mt-1"
          rows={3}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={onManualSave}>
          <Save className="mr-1.5 size-4" />
          {saveStatus === 'saving'
            ? m.settings_page_copilot_saving()
            : saveStatus === 'saved'
              ? m.settings_page_copilot_saved()
              : m.settings_page_copilot_save()}
        </Button>
        <Button variant="outline" onClick={onResetDefaults}>
          Reset to Default
        </Button>
      </div>
    </div>
  );
}
