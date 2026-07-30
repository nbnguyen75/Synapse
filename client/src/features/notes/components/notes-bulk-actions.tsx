import type { NoteViewMode } from '@/features/notes/schemas';

import { useEffect, useRef, useState } from 'react';

import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

import {
  PinIcon,
  StarIcon,
  Trash2Icon,
  XIcon,
  RotateCcwIcon,
  Undo2Icon,
  ArchiveIcon,
} from 'lucide-react';

interface NotesBulkActionsProps {
  onBulkDeletePermanent?: () => void;
  onClearSelection: () => void;
  onBulkUnarchive?: () => void;
  onBulkFavorite?: () => void;
  onBulkArchive?: () => void;
  onBulkRestore?: () => void;
  onBulkTrash?: () => void;
  viewMode?: NoteViewMode;
  onBulkPin?: () => void;
  selectedCount: number;
}

const EXIT_ANIMATION_DURATION = 250;

export default function NotesBulkActions({
  onBulkDeletePermanent,
  onClearSelection,
  onBulkUnarchive,
  onBulkFavorite,
  selectedCount,
  onBulkArchive,
  onBulkRestore,
  onBulkTrash,
  onBulkPin,
  viewMode,
}: NotesBulkActionsProps) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const prevCount = useRef(0);

  useEffect(() => {
    if (selectedCount > 0 && prevCount.current === 0) {
      setClosing(false);
      setVisible(true);
    } else if (selectedCount === 0 && prevCount.current > 0) {
      setClosing(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, EXIT_ANIMATION_DURATION);
      prevCount.current = 0;
      return () => clearTimeout(timer);
    }
    prevCount.current = selectedCount;
  }, [selectedCount]);

  if (!visible) return null;

  const isEntering = !closing && selectedCount > 0;

  return (
    <div
      className={cn(
        'flex items-center justify-between border rounded-xl border-border bg-muted/30 px-6 py-2 transition-all duration-250 ease-in-out w-fit mx-auto gap-3 mb-3',
        isEntering && 'opacity-100',
        closing && 'opacity-0',
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
          {selectedCount}
        </div>
        <span className="text-sm font-medium">
          {m.notes_batch_selected({ count: selectedCount })}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {viewMode === 'trash' ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 text-xs cursor-pointer"
              onClick={onBulkRestore}
            >
              <RotateCcwIcon className="size-3.5" />
              <span className="hidden sm:inline">{m.notes_bulk_restore()}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 text-xs text-destructive hover:text-destructive cursor-pointer"
              onClick={onBulkDeletePermanent}
            >
              <XIcon className="size-3.5" />
              <span className="hidden sm:inline">
                {m.notes_bulk_delete_permanent()}
              </span>
            </Button>
          </>
        ) : viewMode === 'archive' ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 text-xs cursor-pointer"
              onClick={onBulkUnarchive}
            >
              <Undo2Icon className="size-3.5" />
              <span className="hidden sm:inline">
                {m.notes_bulk_unarchive()}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 text-xs text-destructive hover:text-destructive cursor-pointer"
              onClick={onBulkTrash}
            >
              <Trash2Icon className="size-3.5" />
              <span className="hidden sm:inline">{m.notes_bulk_delete()}</span>
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 text-xs cursor-pointer"
              onClick={onBulkPin}
            >
              <PinIcon className="size-3.5" />
              <span className="hidden sm:inline">{m.notes_bulk_pin()}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 text-xs cursor-pointer"
              onClick={onBulkFavorite}
            >
              <StarIcon className="size-3.5" />
              <span className="hidden sm:inline">
                {m.notes_bulk_favorite()}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 text-xs cursor-pointer"
              onClick={onBulkArchive}
            >
              <ArchiveIcon className="size-3.5" />
              <span className="hidden sm:inline">{m.notes_bulk_archive()}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 text-xs text-destructive hover:text-destructive cursor-pointer"
              onClick={onBulkTrash}
            >
              <Trash2Icon className="size-3.5" />
              <span className="hidden sm:inline">{m.notes_bulk_delete()}</span>
            </Button>
          </>
        )}

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
  );
}
