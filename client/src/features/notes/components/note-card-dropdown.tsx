import type { NoteActionType } from '@/features/notes/hooks/use-note-card';
import type { Note, NoteViewMode } from '@/features/notes/types';

import { m } from '@/paraglide/messages';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

import {
  ArchiveIcon,
  CopyIcon,
  DownloadIcon,
  FileTextIcon,
  MessagesSquareIcon,
  MoreVerticalIcon,
  PinIcon,
  RotateCcwIcon,
  Trash2Icon,
  Undo2Icon,
  XCircleIcon,
} from 'lucide-react';

interface NoteWithDetails extends Note {
  tags?: Array<string>;
}

interface NoteCardDropdownProps {
  actions: {
    execute: ((type: NoteActionType) => Promise<void>) | ((type: NoteActionType) => void);
    copyContent: (() => Promise<void>) | (() => void);
    includeInChat: () => void;
    exportNote: () => void;
    openDetail: () => void;
  };
  viewMode?: NoteViewMode;
  note: NoteWithDetails;
}

export function NoteCardDropdown({ viewMode, actions, note }: NoteCardDropdownProps) {
  const { includeInChat, copyContent, exportNote, openDetail, execute } = actions;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        onClick={(e) => e.stopPropagation()}
        render={
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer rounded-md h-6 w-6 text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-90 hover:scale-105"
          >
            <MoreVerticalIcon className="size-3.5" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-52" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={openDetail}>
          <FileTextIcon className="mr-2 size-3.5" />
          {m.notes_page_card_open_doc()}
        </DropdownMenuItem>

        {viewMode !== 'trash' && (
          <DropdownMenuItem onClick={includeInChat}>
            <MessagesSquareIcon className="mr-2 size-3.5 text-violet-400 dark:text-violet-600" />
            {m.notes_page_include_in_chat()}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={void copyContent}>
          <CopyIcon className="mr-2 size-3.5" />
          {m.notes_page_card_copy_content()}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={exportNote}>
          <DownloadIcon className="mr-2 size-3.5" />
          {m.notes_page_action_export()}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {viewMode === 'trash' ? (
          <>
            <DropdownMenuItem onClick={() => void execute('restore')}>
              <RotateCcwIcon className="mr-2 size-3.5" />
              {m.notes_card_restore()}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => void execute('delete')} variant="destructive">
              <XCircleIcon className="mr-2 size-3.5" />
              {m.notes_card_delete_permanent()}
            </DropdownMenuItem>
          </>
        ) : viewMode === 'archive' ? (
          <>
            <DropdownMenuItem onClick={() => void execute('unarchive')}>
              <Undo2Icon className="mr-2 size-3.5" />
              {m.notes_card_unarchive()}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => void execute('trash')}>
              <Trash2Icon className="mr-2 size-3.5" />
              {m.notes_page_action_trash()}
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => void execute('pin')}>
              <PinIcon className="mr-2 size-3.5" />
              {note.pinned ? m.notes_page_pin_unpin() : m.notes_page_pin_pin()}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => void execute('archive')}>
              <ArchiveIcon className="mr-2 size-3.5" />
              {m.notes_page_action_archive()}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => void execute('trash')}>
              <Trash2Icon className="mr-2 size-3.5" />
              {m.notes_page_action_trash()}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => void execute('delete')} variant="destructive">
              <XCircleIcon className="mr-2 size-3.5" />
              {m.notes_card_delete_permanent()}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
