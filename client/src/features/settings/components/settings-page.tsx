import { useState, useEffect, useCallback } from 'react';

import {
  loadCustomTemplates,
  saveCustomTemplates,
  type NoteTemplate,
} from '@/features/chat/lib/companion-config';

import { m } from '@/paraglide/messages';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import TemplatesTab from './templates-tab';
import CompanionTab from './companion-tab';
import GeneralTab from './general-tab';

import { Bot, FileText } from 'lucide-react';

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [customTemplates, setCustomTemplates] = useState<NoteTemplate[]>(() =>
    loadCustomTemplates(),
  );
  const [autosave, setAutosave] = useState(
    () => localStorage.getItem('synapse_autosave_enabled') !== 'false',
  );
  const [emailDigests, setEmailDigests] = useState(
    () => localStorage.getItem('synapse_email_digests') === 'true',
  );
  const [companionAlerts, setCompanionAlerts] = useState(
    () => localStorage.getItem('synapse_companion_alerts') === 'true',
  );

  const persistSetting = useCallback((key: string, value: boolean) => {
    localStorage.setItem(key, String(value));
    window.dispatchEvent(new CustomEvent('synapse-settings-updated'));
  }, []);

  useEffect(() => {
    const handleSettingsUpdated = () => {
      setAutosave(localStorage.getItem('synapse_autosave_enabled') !== 'false');
      setEmailDigests(localStorage.getItem('synapse_email_digests') === 'true');
      setCompanionAlerts(
        localStorage.getItem('synapse_companion_alerts') === 'true',
      );
    };

    window.addEventListener('synapse-settings-updated', handleSettingsUpdated);
    return () => {
      window.removeEventListener(
        'synapse-settings-updated',
        handleSettingsUpdated,
      );
    };
  }, []);

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
          <TabsTrigger value="companion">
            <Bot className="mr-1.5 size-3.5" />
            {m.settings_page_tab_companion()}
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
            companionAlerts={companionAlerts}
            onAutosaveChange={(v) => {
              setAutosave(v);
              persistSetting('synapse_autosave_enabled', v);
            }}
            onEmailDigestsChange={(v) => {
              setEmailDigests(v);
              persistSetting('synapse_email_digests', v);
            }}
            onCompanionAlertsChange={(v) => {
              setCompanionAlerts(v);
              persistSetting('synapse_companion_alerts', v);
            }}
          />
        </TabsContent>

        <TabsContent value="companion">
          <CompanionTab />
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
