import type { CommandItem } from '@/features/command-palette/types';

import { m } from '@/paraglide/messages';

import { ActivityIcon } from 'lucide-react';

interface CommandPaletteHelpViewProps {
  slashCommands: CommandItem[];
}

export default function CommandPaletteHelpView({
  slashCommands,
}: CommandPaletteHelpViewProps) {
  return (
    <div className="space-y-3.5">
      <div className="text-emerald-500 font-bold border-b border-border pb-1.5 flex items-center gap-1.5">
        <ActivityIcon className="h-4 w-4" />
        <span>{m.command_palette_cheatsheet_title()}</span>
      </div>
      <div className="space-y-3 text-[11px] leading-relaxed">
        {slashCommands.map((cmd) => (
          <div
            key={cmd.id}
            className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-b border-border/50 pb-2"
          >
            <span className="text-emerald-400 font-bold w-28 shrink-0">
              {cmd.command}
            </span>
            <span className="text-muted-foreground">{cmd.subtitle}</span>
          </div>
        ))}
      </div>
      <div className="pt-2 text-[10px] text-muted-foreground italic">
        {m.command_palette_tip_back()}
      </div>
    </div>
  );
}
