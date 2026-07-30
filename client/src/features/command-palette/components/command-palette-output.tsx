import type {
  CommandItem,
  CommandOutput,
  NoteItem,
} from '@/features/command-palette/types';

import {
  CommandPaletteHelpView,
  CommandPaletteNotesView,
  CommandPaletteStatsView,
} from '@/features/command-palette/components';

import { m } from '@/paraglide/messages';

import { Button } from '@/components/ui/button';

import { TerminalIcon, ArrowLeftIcon } from 'lucide-react';

interface CommandPaletteOutputProps {
  onOpenNote: (note: NoteItem) => void;
  commandOutput: CommandOutput;
  slashCommands: CommandItem[];
  onBack: () => void;
  notes: NoteItem[];
}

export default function CommandPaletteOutput({
  commandOutput,
  slashCommands,
  onOpenNote,
  onBack,
  notes,
}: CommandPaletteOutputProps) {
  return (
    <div className="flex flex-col bg-background max-h-115 select-text">
      <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <TerminalIcon className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono text-emerald-500 tracking-wider">
              {commandOutput.command}
            </h3>
            <p className="text-[10px] text-neutral-400 font-medium">
              {commandOutput.title}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onBack}
          className="h-7 text-[10px] font-mono gap-1 cursor-pointer"
        >
          <ArrowLeftIcon className="h-3 w-3" />
          <span>{m.command_palette_output_back()}</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 font-mono text-xs text-muted-foreground space-y-4">
        {commandOutput.type === 'help' && (
          <CommandPaletteHelpView slashCommands={slashCommands} />
        )}

        {commandOutput.type === 'stats' && (
          <CommandPaletteStatsView data={commandOutput.data} />
        )}

        {commandOutput.type === 'notes' && (
          <CommandPaletteNotesView notes={notes} onOpenNote={onOpenNote} />
        )}
      </div>
    </div>
  );
}
