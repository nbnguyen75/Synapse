import { useState, useEffect, useRef, useCallback } from 'react';

import { toast } from 'sonner';

import {
  loadCopilotConfig,
  saveCopilotConfig,
  loadCustomTemplates,
  saveCustomTemplates,
  DEFAULT_COPILOT_CONFIG,
  type CopilotConfig,
  type NoteTemplate,
} from '@/features/chat/lib/copilot-config';

import { m } from '@/paraglide/messages';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import TemplatesTab from './templates-tab';
import GeneralTab from './general-tab';
import CopilotTab from './copilot-tab';

import { Bot, FileText } from 'lucide-react';

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [copilotConfig, setCopilotConfig] = useState<CopilotConfig>(() =>
    loadCopilotConfig(),
  );
  const [customTemplates, setCustomTemplates] = useState<NoteTemplate[]>(() =>
    loadCustomTemplates(),
  );
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>(
    'idle',
  );
  const [autosave, setAutosave] = useState(
    () => localStorage.getItem('synapse_autosave_enabled') !== 'false',
  );
  const [emailDigests, setEmailDigests] = useState(
    () => localStorage.getItem('synapse_email_digests') === 'true',
  );
  const [copilotAlerts, setCopilotAlerts] = useState(
    () => localStorage.getItem('synapse_copilot_alerts') === 'true',
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const persistSetting = useCallback((key: string, value: boolean) => {
    localStorage.setItem(key, String(value));
    window.dispatchEvent(new CustomEvent('synapse-settings-updated'));
  }, []);

  const debouncedSave = useCallback((config: CopilotConfig) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSaveStatus('saving');
    debounceRef.current = setTimeout(() => {
      saveCopilotConfig(config);
      setSaveStatus('saved');
    }, 400);
  }, []);

  function updateConfig(updates: Partial<CopilotConfig>) {
    const next = { ...copilotConfig, ...updates };
    setCopilotConfig(next);
    debouncedSave(next);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleManualSave() {
    saveCopilotConfig(copilotConfig);
    setSaveStatus('saved');
    toast.success(m.settings_page_toast_saved());
  }

  function handleResetDefaults() {
    setCopilotConfig({ ...DEFAULT_COPILOT_CONFIG });
    saveCopilotConfig(DEFAULT_COPILOT_CONFIG);
    setSaveStatus('saved');
    toast.success(m.settings_page_toast_saved());
  }

  function handleTemplatesChange(templates: NoteTemplate[]) {
    setCustomTemplates(templates);
    saveCustomTemplates(templates);
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">
          {m.settings_page_title()}
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line">
          <TabsTrigger value="general">
            {m.settings_page_tab_general()}
          </TabsTrigger>
          <TabsTrigger value="copilot">
            <Bot className="mr-1.5 size-3.5" />
            {m.settings_page_tab_copilot()}
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="mr-1.5 size-3.5" />
            {m.settings_page_tab_templates()}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralTab
            autosave={autosave}
            emailDigests={emailDigests}
            copilotAlerts={copilotAlerts}
            onAutosaveChange={(v) => {
              setAutosave(v);
              persistSetting('synapse_autosave_enabled', v);
            }}
            onEmailDigestsChange={(v) => {
              setEmailDigests(v);
              persistSetting('synapse_email_digests', v);
            }}
            onCopilotAlertsChange={(v) => {
              setCopilotAlerts(v);
              persistSetting('synapse_copilot_alerts', v);
            }}
          />
        </TabsContent>

        <TabsContent value="copilot">
          <CopilotTab
            config={copilotConfig}
            onConfigChange={updateConfig}
            saveStatus={saveStatus}
            onManualSave={handleManualSave}
            onResetDefaults={handleResetDefaults}
          />
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesTab
            templates={customTemplates}
            onTemplatesChange={handleTemplatesChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SettingsPage;
