import type { RefObject } from 'react';

import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';

import { SearchIcon } from 'lucide-react';

interface CommandPaletteSearchInputProps {
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  onSearchChange: (value: string) => void;
  search: string;
}

export default function CommandPaletteSearchInput({
  onSearchChange,
  onKeyDown,
  inputRef,
  search,
}: CommandPaletteSearchInputProps) {
  return (
    <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3 bg-background/50">
      <SearchIcon className="h-4 w-4 text-muted-foreground shrink-0" />
      <Input
        ref={inputRef}
        type="text"
        placeholder="Type a command (>), search note..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-full text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto bg-transparent placeholder:text-muted-foreground/60 text-foreground"
        autoFocus
      />
      <Kbd className="hidden sm:inline-flex text-[10px] font-medium opacity-60">
        ESC
      </Kbd>
    </div>
  );
}
