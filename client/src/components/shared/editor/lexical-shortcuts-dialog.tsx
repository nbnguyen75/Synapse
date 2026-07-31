import { m } from '@/paraglide/messages';

import KeyboardShortcutsList from '@/components/shared/keyboard-shortcuts-list';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

import { InfoIcon, Keyboard } from 'lucide-react';

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
            title={m.lexical_shortcuts_title_button()}
          />
        }
      >
        <Keyboard className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{m.lexical_shortcuts_button()}</span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-200 bg-background border border-border shadow-flat-lg rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold tracking-tight flex items-center gap-2 text-foreground">
            <Keyboard className="h-4 w-4 text-primary" />
            <span>{m.lexical_shortcuts_dialog_title()}</span>

            <Tooltip>
              <TooltipTrigger
                render={
                  <a
                    href="https://www.markdownguide.org/basic-syntax"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <InfoIcon className="h-4 w-4" />
                  </a>
                }
              />
              <TooltipContent>
                {m.lexical_shortcuts_tooltip_info()}
              </TooltipContent>
            </Tooltip>
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto pr-1">
          <KeyboardShortcutsList sections={['editor']} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
