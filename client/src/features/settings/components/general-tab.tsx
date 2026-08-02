import { m } from '@/paraglide/messages';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface GeneralTabProps {
  onCompanionAlertsChange: (v: boolean) => void;
  onEmailDigestsChange: (v: boolean) => void;
  onAutosaveChange: (v: boolean) => void;
  companionAlerts: boolean;
  emailDigests: boolean;
  autosave: boolean;
}

export default function GeneralTab({
  onCompanionAlertsChange,
  onEmailDigestsChange,
  onAutosaveChange,
  companionAlerts,
  emailDigests,
  autosave,
}: GeneralTabProps) {
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
          <Switch checked={autosave} onCheckedChange={onAutosaveChange} />
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
            checked={emailDigests}
            onCheckedChange={onEmailDigestsChange}
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
            checked={companionAlerts}
            onCheckedChange={onCompanionAlertsChange}
          />
        </div>
      </div>
    </div>
  );
}
