import { useCallback, useEffect, useState } from 'react';

import { m } from '@/paraglide/messages';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function GeneralSettingsPage() {
  // TODO: save to account later
  const [autosave, setAutosave] = useState(
    () => localStorage.getItem('synapse_autosave_enabled') === 'true',
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
      setAutosave(localStorage.getItem('synapse_autosave_enabled') === 'true');
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

  return (
    <div className="mt-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-sm font-semibold">
          {m.settings_page_general_appearance()}
        </h2>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label>{m.settings_page_general_autosave()}</Label>
            <p className="text-xs text-muted-foreground">
              {m.settings_page_general_autosave_desc()}
            </p>
          </div>

          <Switch
            disabled
            checked={autosave}
            onCheckedChange={(v) => {
              setAutosave(v);
              persistSetting('synapse_autosave_enabled', v);
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold">
          {m.settings_page_general_notifications()}
        </h2>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label>{m.settings_page_general_email_digests()}</Label>
            <p className="text-xs text-muted-foreground">
              {m.settings_page_general_email_digests_desc()}
            </p>
          </div>

          <Switch
            disabled
            checked={emailDigests}
            onCheckedChange={(v) => {
              setEmailDigests(v);
              persistSetting('synapse_email_digests', v);
            }}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label>{m.settings_page_general_companion_alerts()}</Label>
            <p className="text-xs text-muted-foreground">
              {m.settings_page_general_companion_alerts_desc()}
            </p>
          </div>

          <Switch
            disabled
            checked={companionAlerts}
            onCheckedChange={(v) => {
              setCompanionAlerts(v);
              persistSetting('synapse_companion_alerts', v);
            }}
          />
        </div>
      </div>
    </div>
  );
}
