import type { NoteItem } from '@/features/command-palette/types';

import { m } from '@/paraglide/messages';

import { FileTextIcon, PinIcon } from 'lucide-react';

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
      <div className="text-emerald-500 font-bold border-b border-border pb-1.5 flex items-center gap-1.5">
        <FileTextIcon className="h-4 w-4" />
        <span>{m.command_palette_notes_title({ count: notes.length })}</span>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-[11px]">
          {m.command_palette_notes_empty()}
        </div>
      ) : (
        <div className="space-y-1.5 max-h-70 overflow-y-auto pr-1">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => onOpenNote(note)}
              className="w-full text-left bg-muted/20 border border-border/60 rounded-lg p-2.5 hover:bg-muted/40 transition-all hover:border-emerald-500/30 flex items-center justify-between group cursor-pointer"
            >
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-1.5">
                  {note.pinned && (
                    <PinIcon className="h-3 w-3 text-amber-500 shrink-0" />
                  )}
                  <span className="text-[11px] font-bold text-foreground truncate block">
                    {note.title || 'Untitled'}
                  </span>
                </div>
                <span className="text-[9px] text-muted-foreground truncate block font-mono mt-0.5">
                  ID: {note.id.slice(0, 10)}... | Updated:{' '}
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <span className="text-[9px] text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono whitespace-nowrap">
                OPEN &gt;
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
