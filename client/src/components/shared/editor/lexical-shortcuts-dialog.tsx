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
import { Kbd, KbdGroup } from '@/components/ui/kbd';
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
            title="Keyboard Shortcuts & Markdown Syntax"
          />
        }
      >
        <Keyboard className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Shortcuts</span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-200 bg-background border border-border shadow-flat-lg rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold tracking-tight flex items-center gap-2 text-foreground">
            <Keyboard className="h-4 w-4 text-primary" />
            <span>Editor Shortcuts & Markdown Guide</span>

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
              <TooltipContent>Markdown syntax information</TooltipContent>
            </Tooltip>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          <div>
            <h4 className="font-semibold text-foreground text-xs mb-2">
              Text Formatting
            </h4>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 p-2 rounded-lg border border-border/50">
                <span className="font-extrabold">Bold</span>

                <KbdGroup>
                  <Kbd>Ctrl</Kbd>
                  <span>+</span>
                  <Kbd>B</Kbd>
                </KbdGroup>
              </div>
              <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 p-2 rounded-lg border border-border/50">
                <span className="font-extrabold">Italic</span>

                <KbdGroup>
                  <Kbd>Ctrl</Kbd>
                  <span>+</span>
                  <Kbd>I</Kbd>
                </KbdGroup>
              </div>
              <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 p-2 rounded-lg border border-border/50">
                <span className="font-extrabold">Underline</span>

                <KbdGroup>
                  <Kbd>Ctrl</Kbd>
                  <span>+</span>
                  <Kbd>U</Kbd>
                </KbdGroup>
              </div>
              <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 p-2 rounded-lg border border-border/50">
                <span className="font-extrabold">Strikethrough</span>

                <KbdGroup>
                  <Kbd>Ctrl</Kbd>
                  <span>+</span>
                  <Kbd>Shift</Kbd>
                  <span>+</span>
                  <Kbd>X</Kbd>
                </KbdGroup>
              </div>
              <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 p-2 rounded-lg border border-border/50 col-span-2">
                <span className="font-extrabold">Inline Code</span>

                <KbdGroup>
                  <Kbd>Ctrl</Kbd>
                  <span>+</span>
                  <Kbd>E</Kbd>
                </KbdGroup>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-xs mb-2">
              Structure & Headings
            </h4>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 p-2 rounded-lg border border-border/50">
                <span className="font-extrabold">Heading 1</span>

                <KbdGroup>
                  <Kbd>Ctrl</Kbd>
                  <span>+</span>
                  <Kbd>Alt</Kbd>
                  <span>+</span>
                  <Kbd>1</Kbd>
                </KbdGroup>
              </div>
              <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 p-2 rounded-lg border border-border/50">
                <span className="font-extrabold">Heading 2</span>

                <KbdGroup>
                  <Kbd>Ctrl</Kbd>
                  <span>+</span>
                  <Kbd>Alt</Kbd>
                  <span>+</span>
                  <Kbd>2</Kbd>
                </KbdGroup>
              </div>
              <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 p-2 rounded-lg border border-border/50">
                <span className="font-extrabold">Heading 3</span>

                <KbdGroup>
                  <Kbd>Ctrl</Kbd>
                  <span>+</span>
                  <Kbd>Alt</Kbd>
                  <span>+</span>
                  <Kbd>3</Kbd>
                </KbdGroup>
              </div>
              <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 p-2 rounded-lg border border-border/50">
                <span className="font-extrabold">Normal Text</span>

                <KbdGroup>
                  <Kbd>Ctrl</Kbd>
                  <span>+</span>
                  <Kbd>Alt</Kbd>
                  <span>+</span>
                  <Kbd>0</Kbd>
                </KbdGroup>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-xs mb-2">
              Lists & Blockquotes
            </h4>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 p-2 rounded-lg border border-border/50">
                <span className="font-extrabold">Bullet List</span>

                <KbdGroup>
                  <Kbd>Ctrl</Kbd>
                  <span>+</span>
                  <Kbd>Shift</Kbd>
                  <span>+</span>
                  <Kbd>8</Kbd>
                </KbdGroup>
              </div>
              <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 p-2 rounded-lg border border-border/50">
                <span className="font-extrabold">Numbered List</span>

                <KbdGroup>
                  <Kbd>Ctrl</Kbd>
                  <span>+</span>
                  <Kbd>Shift</Kbd>
                  <span>+</span>
                  <Kbd>7</Kbd>
                </KbdGroup>
              </div>
              <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 p-2 rounded-lg border border-border/50 col-span-2">
                <span className="font-extrabold">Block Quote</span>

                <KbdGroup>
                  <Kbd>Ctrl</Kbd>
                  <span>+</span>
                  <Kbd>Shift</Kbd>
                  <span>+</span>
                  <Kbd>Q</Kbd>
                </KbdGroup>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
