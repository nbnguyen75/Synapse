import { useEffect, useState } from 'react';

import { useDebounce } from '@/shared/hooks/use-debounce';

import { SidebarManagerTrigger } from '@/shared/components/ui/sidebar';
import { Separator } from '@/shared/components/ui/separator';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Kbd } from '@/shared/components/ui/kbd';

import { PanelRightIcon, SearchIcon } from 'lucide-react';

import {
   NOTE_SEARCH_EVENT_NAME,
   NOTE_SEARCH_SYNC_EVENT_NAME,
   TOGGLE_RIGHT_SIDEBAR_EVENT_NAME,
} from '@/shared/constants/event';
import { ThemeToggle } from '@/core/theme';

export default function AppTopHeader() {
   const [searchVal, setSearchVal] = useState('');
   const debouncedSearchVal = useDebounce(searchVal, 300);

   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchVal(e.target.value);
   };

   useEffect(() => {
      window.dispatchEvent(
         new CustomEvent(NOTE_SEARCH_EVENT_NAME, {
            detail: debouncedSearchVal,
         }),
      );
   }, [debouncedSearchVal]);

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
            <SidebarManagerTrigger
               name="left"
               className="-ml-1 cursor-pointer"
            />

            <Separator
               orientation="vertical"
               className="mr-2 my-auto data-[orientation=vertical]:h-4"
            />

            <div className="relative flex-1 max-w-md">
               <SearchIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground z-10" />
               <Input
                  id="header-search-input"
                  type="text"
                  placeholder="Search notes... ('/' to focus)"
                  value={searchVal}
                  onChange={handleSearchChange}
                  className="w-full h-9 pl-9 pr-8 text-xs bg-neutral-50 dark:bg-neutral-950 border border-border rounded-lg outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder:text-muted-foreground transition-all focus-visible:ring-0"
               />
               <span className="absolute right-3 top-2.5 text-[9px] font-mono text-muted-foreground bg-neutral-200/50 dark:bg-neutral-900/80 px-1.5 py-0.5 rounded">
                  /
               </span>
            </div>
         </div>

         <div className="flex items-center gap-2">
            {/* Quick Switcher Indicator */}
            <Button
               onClick={() =>
                  window.dispatchEvent(
                     new CustomEvent('toggle-command-palette'),
                  )
               }
               variant="outline"
               className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 h-7 rounded-lg border border-border bg-neutral-50 dark:bg-neutral-950 text-[10px] font-mono text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-foreground transition-all cursor-pointer font-normal"
            >
               <span>Command Palette</span>
               <Kbd>⌘K</Kbd>
            </Button>

            <ThemeToggle />

            <Separator
               orientation="vertical"
               className="ml-2 my-auto data-[orientation=vertical]:h-4"
            />

            {/* Right Sidebar toggle */}
            <Button
               data-sidebar="manager-trigger"
               data-slot="manager-sidebar-trigger"
               variant="ghost"
               size="icon-sm"
               className="-mr-1 cursor-pointer"
               onClick={() =>
                  window.dispatchEvent(
                     new CustomEvent(TOGGLE_RIGHT_SIDEBAR_EVENT_NAME),
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
