import type { ReactElement } from 'react';

import { useEffect, useState } from 'react';

import { m } from '@/paraglide/messages';

import KeyboardShortcutsList from '@/components/shared/keyboard-shortcuts-list';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Keyboard } from 'lucide-react';

export default function KeyboardShortcutsDialog({
  children,
}: {
  children: ReactElement;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener('open-keyboard-shortcuts-dialog', handleOpen);
    return () =>
      window.removeEventListener('open-keyboard-shortcuts-dialog', handleOpen);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-2xl md:max-w-3xl xl:max-w-4xl bg-background border border-border shadow-flat-lg rounded-md p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold tracking-tight flex items-center gap-2 text-foreground">
            <Keyboard className="h-4 w-4 text-primary" />
            <span>{m.keyboard_shortcuts_title()}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto pr-1">
          <KeyboardShortcutsList sections={['global']} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
