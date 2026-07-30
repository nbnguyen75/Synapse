// ! Not used, reference only

import type { ReactElement } from 'react';

import { useSettingsStore } from '@/store/settings-store';

import { useTheme } from '@/providers/theme-provider';

import { m } from '@/paraglide/messages';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';

import { Bot, MessageSquare, Sun, Moon } from 'lucide-react';

export default function ConfigPopover({
  children,
}: {
  children: ReactElement;
}) {
  const { setTheme, theme } = useTheme();
  const { setLayoutMode, layoutMode } = useSettingsStore();

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <Popover>
      <PopoverTrigger render={children} />
      <PopoverContent side="right" align="end" className="w-64 p-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2.5">
              {layoutMode === 'servant' ? (
                <Bot className="h-4 w-4 shrink-0 text-primary" />
              ) : (
                <MessageSquare className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              )}
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">
                  {layoutMode === 'servant'
                    ? m.sidebar_mode_servant()
                    : m.sidebar_mode_chat()}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {layoutMode === 'servant'
                    ? m.sidebar_mode_servant_desc()
                    : m.sidebar_mode_chat_desc()}
                </span>
              </div>
            </div>
            <Switch
              checked={layoutMode === 'chat'}
              onCheckedChange={(checked) =>
                setLayoutMode(checked ? 'chat' : 'servant')
              }
            />
          </div>

          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2.5">
              {isDark ? (
                <Moon className="h-4 w-4 shrink-0 text-indigo-500" />
              ) : (
                <Sun className="h-4 w-4 shrink-0 text-amber-500" />
              )}
              <span className="text-xs font-medium text-foreground">
                {isDark ? m.sidebar_config_dark() : m.sidebar_config_light()}
              </span>
            </div>
            <Switch
              checked={isDark}
              onCheckedChange={() => setTheme(isDark ? 'light' : 'dark')}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
