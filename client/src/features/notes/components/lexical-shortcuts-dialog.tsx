import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';

import { Keyboard } from 'lucide-react';

export default function ShortcutsHelpDialog() {
   return (
      <Dialog>
         <DialogTrigger
            render={
               <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="h-7 px-2 flex items-center gap-1 rounded text-neutral-400 hover:text-foreground hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors text-[10px] font-mono cursor-pointer ml-auto"
                  title="Keyboard Shortcuts & Markdown Syntax"
               />
            }
         >
            <Keyboard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Shortcuts</span>
         </DialogTrigger>
         <DialogContent className="sm:max-w-120 bg-background border border-border shadow-flat-lg rounded-2xl p-6">
            <DialogHeader>
               <DialogTitle className="text-base font-semibold tracking-tight flex items-center gap-2 text-foreground">
                  <Keyboard className="h-4 w-4 text-primary" />
                  <span>Editor Shortcuts & Markdown Guide</span>
               </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
               <div>
                  <h4 className="font-semibold text-foreground text-xs mb-2">
                     Text Formatting
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50">
                        <span>Bold</span>
                        <div className="flex gap-1">
                           <Kbd>Ctrl+B</Kbd>
                           <Kbd>**text**</Kbd>
                        </div>
                     </div>
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50">
                        <span>Italic</span>
                        <div className="flex gap-1">
                           <Kbd>Ctrl+I</Kbd>
                           <Kbd>*text*</Kbd>
                        </div>
                     </div>
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50">
                        <span>Underline</span>
                        <Kbd>Ctrl+U</Kbd>
                     </div>
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50">
                        <span>Strikethrough</span>
                        <div className="flex gap-1">
                           <Kbd>Ctrl+Shift+X</Kbd>
                           <Kbd>~~text~~</Kbd>
                        </div>
                     </div>
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50 col-span-2">
                        <span>Inline Code</span>
                        <div className="flex gap-1">
                           <Kbd>Ctrl+E</Kbd>
                           <Kbd>`code`</Kbd>
                        </div>
                     </div>
                  </div>
               </div>

               <div>
                  <h4 className="font-semibold text-foreground text-xs mb-2">
                     Structure & Headings
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50">
                        <span>Heading 1</span>
                        <div className="flex gap-1">
                           <Kbd>Ctrl+Alt+1</Kbd>
                           <Kbd># Space</Kbd>
                        </div>
                     </div>
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50">
                        <span>Heading 2</span>
                        <div className="flex gap-1">
                           <Kbd>Ctrl+Alt+2</Kbd>
                           <Kbd>## Space</Kbd>
                        </div>
                     </div>
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50">
                        <span>Heading 3</span>
                        <div className="flex gap-1">
                           <Kbd>Ctrl+Alt+3</Kbd>
                           <Kbd>### Space</Kbd>
                        </div>
                     </div>
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50">
                        <span>Normal Text</span>
                        <Kbd>Ctrl+Alt+0</Kbd>
                     </div>
                  </div>
               </div>

               <div>
                  <h4 className="font-semibold text-foreground text-xs mb-2">
                     Lists & Blockquotes
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50">
                        <span>Bullet List</span>
                        <div className="flex gap-1">
                           <Kbd>Ctrl+Shift+8</Kbd>
                           <Kbd>- Space</Kbd>
                        </div>
                     </div>
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50">
                        <span>Numbered List</span>
                        <div className="flex gap-1">
                           <Kbd>Ctrl+Shift+7</Kbd>
                           <Kbd>1. Space</Kbd>
                        </div>
                     </div>
                     <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg border border-border/50 col-span-2">
                        <span>Block Quote</span>
                        <div className="flex gap-1">
                           <Kbd>Ctrl+Shift+Q</Kbd>
                           <Kbd>&gt; Space</Kbd>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
}
