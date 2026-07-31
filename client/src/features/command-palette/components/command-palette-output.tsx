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

import { ArrowLeftIcon } from 'lucide-react';

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
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-background max-h-200">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3 bg-muted/20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono border border-primary/20">
            {commandOutput.command}
          </span>
          <span className="text-xs font-medium text-foreground">
            {commandOutput.title}
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onBack}
          className="h-7 text-xs gap-1.5 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          <span>{m.command_palette_output_back()}</span>
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 text-sm">
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
