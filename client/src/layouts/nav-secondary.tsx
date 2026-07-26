import { useState } from 'react';

import { useTheme } from '@/providers/theme-provider';

import { setLocale } from '@/paraglide/runtime';

import {
   SidebarGroup,
   SidebarGroupContent,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from '@/components/ui/sidebar';
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
import { Kbd } from '@/components/ui/kbd';

import {
   Sun,
   Moon,
   Monitor,
   Languages,
   Settings2,
   Keyboard,
} from 'lucide-react';

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

export function NavSecondary() {
   const { setTheme, theme } = useTheme();
   const [shortcutsOpen, setShortcutsOpen] = useState(false);

   return (
      <SidebarGroup className="mt-auto">
         <SidebarGroupContent>
            <SidebarMenu>
               <SidebarMenuItem>
                  <Popover>
                     <PopoverTrigger
                        render={
                           <SidebarMenuButton
                              size="sm"
                              className="text-xs font-medium"
                           >
                              <Settings2 className="size-4" />
                              <span>Configuration</span>
                           </SidebarMenuButton>
                        }
                     />
                     <PopoverContent
                        side="top"
                        align="start"
                        className="w-56 p-3"
                     >
                        <div className="space-y-3">
                           {/* Theme */}
                           <div>
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                                 Theme
                              </p>
                              <div className="flex gap-1">
                                 {(
                                    [
                                       { mode: 'light', icon: Sun },
                                       { mode: 'dark', icon: Moon },
                                       { mode: 'system', icon: Monitor },
                                    ] as const
                                 ).map(({ icon: Icon, mode }) => (
                                    <Button
                                       key={mode}
                                       variant={
                                          theme === mode ? 'secondary' : 'ghost'
                                       }
                                       size="sm"
                                       onClick={() => setTheme(mode)}
                                       className="flex-1 h-8 text-xs gap-1 cursor-pointer"
                                    >
                                       <Icon className="size-3.5" />
                                       {mode.charAt(0).toUpperCase() +
                                          mode.slice(1)}
                                    </Button>
                                 ))}
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
                                    <Languages className="size-3.5" />
                                    English
                                 </Button>
                                 <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setLocale('vi')}
                                    className="flex-1 h-8 text-xs gap-1 cursor-pointer"
                                 >
                                    <Languages className="size-3.5" />
                                    Tiếng Việt
                                 </Button>
                              </div>
                           </div>
                        </div>
                     </PopoverContent>
                  </Popover>
               </SidebarMenuItem>

               <SidebarMenuItem>
                  <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
                     <DialogTrigger
                        render={
                           <SidebarMenuButton
                              size="sm"
                              className="text-xs font-medium"
                           >
                              <Keyboard className="size-4" />
                              <span>Keyboard Shortcuts</span>
                           </SidebarMenuButton>
                        }
                     />
                     <DialogContent className="sm:max-w-md bg-background border border-border shadow-flat-lg rounded-2xl p-6">
                        <DialogHeader>
                           <DialogTitle className="text-base font-semibold tracking-tight flex items-center gap-2 text-foreground">
                              <Keyboard className="h-4 w-4 text-primary" />
                              <span>Keyboard Shortcuts</span>
                           </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-5 pt-2 text-xs max-h-96 overflow-y-auto pr-1">
                           {shortcutSections.map((section) => (
                              <div key={section.heading}>
                                 <h4 className="font-semibold text-foreground text-xs mb-2 uppercase tracking-wider text-muted-foreground">
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
                                                   {i <
                                                      shortcut.keys.length -
                                                         1 && (
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
               </SidebarMenuItem>
            </SidebarMenu>
         </SidebarGroupContent>
      </SidebarGroup>
   );
}
