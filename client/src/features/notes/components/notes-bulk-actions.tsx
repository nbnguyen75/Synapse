// ! Not used, reference only
import { m } from '@/paraglide/messages';

import { Button } from '@/components/ui/button';

import { PinIcon, TagIcon, Trash2Icon, XIcon } from 'lucide-react';

interface NotesBulkActionsProps {
  onClearSelection: () => void;
  selectedCount: number;
  onDelete: () => void;
}

export default function NotesBulkActions({
  onClearSelection,
  selectedCount,
  onDelete,
}: NotesBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-background/95 backdrop-blur-md shadow-lg animate-in slide-in-from-bottom-full duration-300">
      <div className="flex items-center justify-between px-4 py-3 md:px-6 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
            {selectedCount}
          </div>
          <span className="text-sm font-medium">
            {m.notes_batch_selected({ count: selectedCount })}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 text-xs cursor-pointer"
            onClick={() => {}}
          >
            <PinIcon className="size-3.5" />
            <span className="hidden sm:inline">{m.notes_bulk_pin()}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 text-xs cursor-pointer"
            onClick={() => {}}
          >
            <TagIcon className="size-3.5" />
            <span className="hidden sm:inline">{m.notes_bulk_tag()}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 text-xs text-destructive hover:text-destructive cursor-pointer"
            onClick={onDelete}
          >
            <Trash2Icon className="size-3.5" />
            <span className="hidden sm:inline">{m.notes_bulk_delete()}</span>
          </Button>

          <div className="mx-1 h-5 w-px bg-border" />

          <Button
            variant="ghost"
            size="icon-sm"
            className="size-9 cursor-pointer"
            onClick={onClearSelection}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
