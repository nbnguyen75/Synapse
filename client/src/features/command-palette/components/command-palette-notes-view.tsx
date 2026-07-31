import type { NoteItem } from '@/features/command-palette/types';

import { m } from '@/paraglide/messages';

import { FileTextIcon, PinIcon, ChevronRightIcon } from 'lucide-react';

interface CommandPaletteNotesViewProps {
  onOpenNote: (note: NoteItem) => void;
  notes: NoteItem[];
}

export default function CommandPaletteNotesView({
  onOpenNote,
  notes,
}: CommandPaletteNotesViewProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-foreground tracking-wide uppercase">
        <FileTextIcon className="h-3.5 w-3.5 text-primary" />
        <span>{m.command_palette_notes_title({ count: notes.length })}</span>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted-foreground">
          {m.command_palette_notes_empty()}
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => onOpenNote(note)}
              className="w-full text-left rounded-lg border border-border/40 bg-card/40 p-2.5 hover:bg-accent/60 hover:border-border transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-1.5">
                  {note.pinned && (
                    <PinIcon className="h-3 w-3 text-amber-500 shrink-0" />
                  )}
                  <span className="text-xs font-medium text-foreground truncate block">
                    {note.title || m.command_palette_note_untitled()}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground truncate block mt-0.5">
                  {m.command_palette_notes_updated({
                    date: new Date(note.updatedAt).toLocaleDateString(),
                  })}
                </span>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
