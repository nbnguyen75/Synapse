import type { RefObject, KeyboardEvent as ReactKeyboardEvent } from 'react';

import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';

import { SearchIcon } from 'lucide-react';

interface CommandPaletteSearchInputProps {
  inputRef: RefObject<HTMLInputElement | null>;
  onKeyDown: (e: ReactKeyboardEvent) => void;
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
    <div className="flex items-center border-b border-border px-4 py-3 gap-2.5 bg-background/50">
      <SearchIcon className="h-4.5 w-4.5 text-neutral-400 shrink-0" />
      <Input
        ref={inputRef}
        type="text"
        placeholder="Type a command (e.g., /theme, /stats) or search notes..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-full text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 h-auto bg-transparent placeholder-neutral-400 text-foreground"
        autoFocus
      />
      <Kbd className="hidden sm:inline-flex">ESC</Kbd>
    </div>
  );
}
