import type { Note, NoteViewMode } from '@/features/notes/types';
import type { BulkNoteAction } from '@/features/notes/constants';

import { m } from '@/paraglide/messages';

import { SelectionToolbar } from '@/components/shared';

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
  onBulkAction: (action: BulkNoteAction) => void;
  onClearSelection: () => void;
  selectedIds: Set<string>;
  viewMode?: NoteViewMode;
  notes: Note[];
}

export default function NotesBulkActions({
  onClearSelection,
  onBulkAction,
  selectedIds,
  viewMode,
  notes,
}: NotesBulkActionsProps) {
  const selectedNotes = notes.filter((note) => selectedIds.has(note.id));
  const selectedTotal = selectedNotes.length;

  const majorityPinned =
    selectedNotes.filter((note) => note.pinned).length > selectedTotal / 2;
  const majorityFavorited =
    selectedNotes.filter((note) => note.favorite).length > selectedTotal / 2;
  const majorityArchived =
    selectedNotes.filter((note) => note.archived).length > selectedTotal / 2;

  const pinAction: BulkNoteAction = majorityPinned ? 'UNPIN' : 'PIN';
  const pinLabel = majorityPinned ? m.notes_bulk_unpin() : m.notes_bulk_pin();

  const favoriteAction: BulkNoteAction = majorityFavorited
    ? 'UNFAVORITE'
    : 'FAVORITE';
  const favoriteLabel = majorityFavorited
    ? m.notes_bulk_unfavorite()
    : m.notes_bulk_favorite();

  const archiveAction: BulkNoteAction = majorityArchived
    ? 'UNARCHIVE'
    : 'ARCHIVE';
  const archiveLabel = majorityArchived
    ? m.notes_bulk_unarchive()
    : m.notes_bulk_archive();

  return (
    <SelectionToolbar
      selectedCount={selectedIds.size}
      onClearSelection={onClearSelection}
      countLabel={m.notes_batch_selected({ count: selectedIds.size })}
    >
      {viewMode === 'trash' ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 text-xs cursor-pointer"
            onClick={() => onBulkAction('RESTORE')}
          >
            <RotateCcwIcon className="size-3.5" />
            <span className="hidden sm:inline">{m.notes_bulk_restore()}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 text-xs text-destructive hover:text-destructive cursor-pointer"
            onClick={() => onBulkAction('DELETE_PERMANENT')}
          >
            <XIcon className="size-3.5" />
            <span className="hidden sm:inline">
              {m.notes_bulk_delete_permanent()}
            </span>
          </Button>
        </>
      ) : (
        <>
          {viewMode !== 'archive' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 text-xs cursor-pointer"
                onClick={() => onBulkAction(pinAction)}
              >
                <PinIcon className="size-3.5" />
                <span className="hidden sm:inline">{pinLabel}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 text-xs cursor-pointer"
                onClick={() => onBulkAction(favoriteAction)}
              >
                <StarIcon className="size-3.5" />
                <span className="hidden sm:inline">{favoriteLabel}</span>
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 text-xs cursor-pointer"
            onClick={() => onBulkAction(archiveAction)}
          >
            {majorityArchived ? (
              <Undo2Icon className="size-3.5" />
            ) : (
              <ArchiveIcon className="size-3.5" />
            )}
            <span className="hidden sm:inline">{archiveLabel}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 text-xs text-yellow-600 hover:text-yellow-600 dark:text-yellow-300 dark:hover:text-yellow-300 cursor-pointer"
            onClick={() => onBulkAction('TRASH')}
          >
            <Trash2Icon className="size-3.5" />
            <span className="hidden sm:inline">
              {m.notes_bulk_move_to_trash()}
            </span>
          </Button>
        </>
      )}
    </SelectionToolbar>
  );
}
