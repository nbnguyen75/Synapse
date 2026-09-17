import { m } from '@/paraglide/messages';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

import { FilePlusIcon, GitBranchIcon, MoreHorizontalIcon } from 'lucide-react';

export function MessageMoreMenu({
  onCreateNote,
  disabled,
  onBranch,
}: {
  onCreateNote: () => void;
  onBranch: () => void;
  disabled: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        render={
          <Button aria-label={m.chat_message_more()} size="icon-sm" type="button" variant="ghost">
            <MoreHorizontalIcon />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={onBranch}>
          <GitBranchIcon className="size-4" />
          {m.chat_message_branch()}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCreateNote}>
          <FilePlusIcon className="size-4" />
          {m.chat_message_create_note()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
