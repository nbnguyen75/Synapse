import type { ReactElement } from 'react';

import { useState } from 'react';

import { useSettingsStore } from '@/store/settings-store';

import { useTheme } from '@/providers/theme-provider';

import { setLocale } from '@/paraglide/runtime';

import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from '@/components/ui/dialog';
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Kbd } from '@/components/ui/kbd';

import { Bot, MessageSquare, Sun, Moon, Globe, Keyboard } from 'lucide-react';

const shortcutSections = [
   {
      shortcuts: [
         { label: 'Open Command Palette', keys: ['Ctrl', 'K'] },
         { label: 'Toggle Left Sidebar', keys: ['Ctrl', 'Shift', 'B'] },
         { label: 'Toggle Right Sidebar', keys: ['Ctrl', 'Alt', 'B'] },
         { label: 'Quick New Note', keys: ['N'] },
      ],
      heading: 'Global',
   },
   {
      shortcuts: [
         { keys: ['Ctrl', 'B'], label: 'Bold' },
         { keys: ['Ctrl', 'I'], label: 'Italic' },
         { keys: ['Ctrl', 'U'], label: 'Underline' },
         { keys: ['Ctrl', 'Shift', 'S'], label: 'Strikethrough' },
         { keys: ['Ctrl', 'E'], label: 'Code' },
      ],
      heading: 'Editor',
   },
   {
      shortcuts: [
         { label: 'Go to Notes', keys: ['G', 'N'] },
         { label: 'Go to Chat', keys: ['G', 'C'] },
         { label: 'Go to Settings', keys: ['G', 'S'] },
      ],
      heading: 'Navigation',
   },
];

export function ConfigPopover({ children }: { children: ReactElement }) {
   const { setTheme, theme } = useTheme();
   const { setLayoutMode, layoutMode } = useSettingsStore();

   const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
         window.matchMedia('(prefers-color-scheme: dark)').matches);

   return (
      <Popover>
         <PopoverTrigger render={children} />
         <PopoverContent side="right" align="start" className="w-56 p-3">
            <div className="space-y-3">
               {/* Layout Mode */}
               <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                     Layout Mode
                  </p>
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
                                 ? 'Servant Mode'
                                 : 'Chat Mode'}
                           </span>
                           <span className="text-[10px] text-muted-foreground">
                              {layoutMode === 'servant'
                                 ? 'Main view + Chat'
                                 : 'Full Chat interface'}
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
               </div>

               <div className="border-t border-border/50" />

               {/* Theme */}
               <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                     Theme
                  </p>
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-muted/50">
                     <div className="flex items-center gap-2.5">
                        {isDark ? (
                           <Moon className="h-4 w-4 shrink-0 text-indigo-500" />
                        ) : (
                           <Sun className="h-4 w-4 shrink-0 text-amber-500" />
                        )}
                        <span className="text-xs font-medium text-foreground">
                           {isDark ? 'Dark Theme' : 'Light Theme'}
                        </span>
                     </div>
                     <Switch
                        checked={isDark}
                        onCheckedChange={() =>
                           setTheme(isDark ? 'light' : 'dark')
                        }
                     />
                  </div>
               </div>

               <div className="border-t border-border/50" />

               {/* Language */}
               <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                     Language
                  </p>
                  <div className="flex gap-1">
                     <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocale('en')}
                        className="flex-1 h-8 text-xs gap-1 cursor-pointer"
                     >
                        <Globe className="size-3.5" />
                        English
                     </Button>
                     <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocale('vi')}
                        className="flex-1 h-8 text-xs gap-1 cursor-pointer"
                     >
                        <Globe className="size-3.5" />
                        Tiếng Việt
                     </Button>
                  </div>
               </div>
            </div>
         </PopoverContent>
      </Popover>
   );
}

export function KeyboardShortcutsDialog({
   children,
}: {
   children: ReactElement;
}) {
   const [open, setOpen] = useState(false);

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger render={children} />
         <DialogContent className="sm:max-w-2xl bg-background border border-border shadow-flat-lg rounded-md p-6">
            <DialogHeader>
               <DialogTitle className="text-base font-semibold tracking-tight flex items-center gap-2 text-foreground">
                  <Keyboard className="h-4 w-4 text-primary" />
                  <span>Keyboard Shortcuts</span>
               </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 pt-2 text-xs max-h-96 overflow-y-auto pr-1">
               {shortcutSections.map((section) => (
                  <div key={section.heading}>
                     <h4 className="font-semibold text-foreground text-xs mb-2 uppercase tracking-wider">
                        {section.heading}
                     </h4>
                     <div className="space-y-1">
                        {section.shortcuts.map((shortcut) => (
                           <div
                              key={shortcut.label}
                              className="flex items-center justify-between bg-muted/30 p-2 rounded-lg border border-border/50"
                           >
                              <span className="text-muted-foreground">
                                 {shortcut.label}
                              </span>
                              <div className="flex items-center gap-1">
                                 {shortcut.keys.map((key, i) => (
                                    <span
                                       key={key}
                                       className="flex items-center gap-1"
                                    >
                                       <Kbd>{key}</Kbd>
                                       {i < shortcut.keys.length - 1 && (
                                          <span className="text-muted-foreground text-[10px]">
                                             +
                                          </span>
                                       )}
                                    </span>
                                 ))}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               ))}
            </div>
         </DialogContent>
      </Dialog>
   );
}
