import type { CommandItem } from '@/features/command-palette/types';

import { m } from '@/paraglide/messages';

import { Kbd } from '@/components/ui/kbd';

import { TerminalIcon } from 'lucide-react';

interface CommandPaletteHelpViewProps {
  slashCommands: CommandItem[];
}

export default function CommandPaletteHelpView({ slashCommands }: CommandPaletteHelpViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-foreground tracking-wide uppercase">
        <TerminalIcon className="h-3.5 w-3.5 text-primary" />
        <span>{m.command_palette_cheatsheet_title()}</span>
      </div>

      <div className="divide-y divide-border/40 rounded-xl border border-border/50 bg-card/40 overflow-hidden">
        {slashCommands.map((cmd) => (
          <div
            key={cmd.id}
            className="flex items-start sm:items-center justify-between gap-4 p-3 hover:bg-muted/30 transition-colors"
          >
            <div className="space-y-0.5">
              <span className="font-mono text-xs font-semibold text-primary">{cmd.command}</span>
              <p className="text-xs text-muted-foreground">{cmd.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground/70 text-center">
        {m.command_palette_help_esc_tip_prefix()} <Kbd>Esc</Kbd>{' '}
        {m.command_palette_help_esc_tip_suffix()}
      </p>
    </div>
  );
}
