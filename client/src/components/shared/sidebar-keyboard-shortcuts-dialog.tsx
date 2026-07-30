import type { ReactElement } from 'react';

import { useState } from 'react';

import { m } from '@/paraglide/messages';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';

import { Keyboard } from 'lucide-react';

const shortcutSections = [
  {
    shortcuts: [
      { label: () => m.keyboard_shortcuts_cmd_palette(), keys: ['Ctrl', 'K'] },
      {
        label: () => m.keyboard_shortcuts_toggle_left(),
        keys: ['Ctrl', 'Shift', 'B'],
      },
      {
        label: () => m.keyboard_shortcuts_toggle_right(),
        keys: ['Ctrl', 'Alt', 'B'],
      },
      { label: () => m.keyboard_shortcuts_new_note(), keys: ['N'] },
    ],
    heading: () => m.keyboard_shortcuts_global(),
  },
  {
    shortcuts: [
      { label: () => m.keyboard_shortcuts_bold(), keys: ['Ctrl', 'B'] },
      { label: () => m.keyboard_shortcuts_italic(), keys: ['Ctrl', 'I'] },
      { label: () => m.keyboard_shortcuts_underline(), keys: ['Ctrl', 'U'] },
      {
        label: () => m.keyboard_shortcuts_strikethrough(),
        keys: ['Ctrl', 'Shift', 'S'],
      },
      { label: () => m.keyboard_shortcuts_code(), keys: ['Ctrl', 'E'] },
    ],
    heading: () => m.keyboard_shortcuts_editor(),
  },
  {
    shortcuts: [
      { label: () => m.keyboard_shortcuts_go_notes(), keys: ['G', 'N'] },
      { label: () => m.keyboard_shortcuts_go_chat(), keys: ['G', 'C'] },
      { label: () => m.keyboard_shortcuts_go_settings(), keys: ['G', 'S'] },
    ],
    heading: () => m.keyboard_shortcuts_navigation(),
  },
];

export default function KeyboardShortcutsDialog({
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
            <span>{m.keyboard_shortcuts_title()}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2 text-xs max-h-96 overflow-y-auto pr-1">
          {shortcutSections.map((section) => (
            <div key={section.heading}>
              <h4 className="font-semibold text-foreground text-xs mb-2 uppercase tracking-wider">
                {section.heading()}
              </h4>
              <div className="space-y-1">
                {section.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.label}
                    className="flex items-center justify-between bg-muted/30 p-2 rounded-lg border border-border/50"
                  >
                    <span className="text-muted-foreground">
                      {shortcut.label()}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={key} className="flex items-center gap-1">
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
