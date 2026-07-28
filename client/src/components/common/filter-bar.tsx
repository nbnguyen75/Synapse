import type { ReactNode } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Plus, Search, SlidersHorizontal, X } from 'lucide-react';

export interface SortOption {
  value: string;
  key: string;
}

function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b px-6 py-3 overflow-x-auto no-scrollbar">
      {children}
    </div>
  );
}

// !Will be used later — filter sidebar toggle
FilterBar.FilterToggle = function FilterToggle({
  onClick,
  isOpen,
  title,
}: {
  onClick: () => void;
  isOpen: boolean;
  title?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      className={isOpen ? 'text-primary' : 'text-muted-foreground'}
      title={title}
    >
      <SlidersHorizontal className="size-4" />
    </Button>
  );
};

// !Will be used later — keyword search
FilterBar.Search = function SearchInput({
  placeholder,
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <div className="relative flex-1 max-w-xs">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 pl-9 pr-8 rounded-lg text-sm"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
};

FilterBar.Sort = function SortSelect({
  onChange,
  getLabel,
  options,
  value,
}: {
  onChange: (value: string) => void;
  getLabel: (key: string) => string;
  options: readonly SortOption[];
  value: string;
}) {
  return (
    <div className="hidden md:block">
      <Select
        value={value}
        onValueChange={(v) => {
          if (v !== null) onChange(v);
        }}
      >
        <SelectTrigger className="w-36 h-9 text-xs rounded-lg">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {getLabel(opt.key)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

FilterBar.CreateButton = function CreateButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <Button
      size="sm"
      className="hidden md:inline-flex shrink-0 h-9"
      onClick={onClick}
    >
      <Plus className="mr-1 size-4" />
      {label}
    </Button>
  );
};

export { FilterBar };
