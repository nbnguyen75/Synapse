import { useEffect, useState } from 'react';

import { useSettingsStore } from '@/store/settings-store';

import { NOTE_SEARCH_SYNC_EVENT_NAME } from '@/config/events';

import { getLocale, setLocale } from '@/paraglide/runtime';

import { ThemeToggle } from '@/components/common/theme-toggle';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SidebarManagerTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { PanelRightIcon, SearchIcon, Globe } from 'lucide-react';

export default function AppTopHeader() {
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setSearchVal(customEvent.detail || '');
    };
    window.addEventListener(NOTE_SEARCH_SYNC_EVENT_NAME, handleSync);
    return () =>
      window.removeEventListener(NOTE_SEARCH_SYNC_EVENT_NAME, handleSync);
  }, []);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 md:px-6 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-3 w-full max-w-xl">
        <SidebarManagerTrigger name="left" className="-ml-1 cursor-pointer" />

        <Separator
          orientation="vertical"
          className="mr-2 my-auto data-[orientation=vertical]:h-4"
        />

        <div
          onClick={() =>
            window.dispatchEvent(new CustomEvent('open-command-palette'))
          }
          className="relative flex-1 max-w-md cursor-pointer"
        >
          <SearchIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground z-10 pointer-events-none" />
          <Input
            id="header-search-input"
            type="text"
            readOnly
            placeholder="Search notes... (Ctrl+K)"
            value={searchVal}
            className="w-full h-9 pl-9 pr-8 text-xs bg-neutral-50 dark:bg-neutral-950 border border-border rounded-lg outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder:text-muted-foreground transition-all focus-visible:ring-0 cursor-pointer"
          />
          <span className="absolute right-3 top-2.5 text-[9px] font-mono text-muted-foreground bg-neutral-200/50 dark:bg-neutral-900/80 px-1.5 py-0.5 rounded pointer-events-none">
            ⌘K
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />

        <Select
          value={getLocale()}
          onValueChange={(v) => setLocale(v as 'en' | 'vi')}
        >
          <SelectTrigger className="h-8 w-fit gap-1 border-none bg-transparent px-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer [&>svg]:hidden">
            <Globe className="size-3.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="min-w-[120px]">
            <SelectItem value="en" className="text-xs cursor-pointer">
              English
            </SelectItem>
            <SelectItem value="vi" className="text-xs cursor-pointer">
              Tiếng Việt
            </SelectItem>
          </SelectContent>
        </Select>

        <Separator
          orientation="vertical"
          className="ml-1 my-auto data-[orientation=vertical]:h-4"
        />

        {/* Right Sidebar toggle */}
        <Button
          data-sidebar="manager-trigger"
          data-slot="manager-sidebar-trigger"
          variant="ghost"
          size="icon-sm"
          className="-mr-1 cursor-pointer"
          onClick={() =>
            useSettingsStore
              .getState()
              .setRightSidebarOpen(
                !useSettingsStore.getState().rightSidebar.open,
              )
          }
        >
          <PanelRightIcon />
          <span className="sr-only">Toggle right Sidebar</span>
        </Button>
      </div>
    </header>
  );
}
