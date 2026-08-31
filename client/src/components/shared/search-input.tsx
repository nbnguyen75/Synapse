import type { ChangeEvent } from 'react';

import { useEffect, useRef, useState } from 'react';

import { useDebounce } from '@/hooks/use-debounce';

import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';

import { Input } from '@/components/ui/input';

import { SearchIcon, XIcon } from 'lucide-react';

interface SearchInputProps {
  onSearch: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  delay?: number;
}

export default function SearchInput({
  placeholder = m.search_input_placeholder(),
  defaultValue = '',
  delay = 300,
  className,
  onSearch,
}: SearchInputProps) {
  const [value, setValue] = useState(defaultValue);
  const debouncedValue = useDebounce(value, delay);
  const lastReportedRef = useRef(defaultValue);

  useEffect(() => {
    if (debouncedValue !== lastReportedRef.current) {
      lastReportedRef.current = debouncedValue;
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);

  useEffect(() => {
    // Reset the input whenever the external `defaultValue` (e.g. the route
    // search query) changes. This is an intentional "reset on prop change"
    // pattern; remounting via `key` would require every consumer to opt in.
    // oxlint-disable-next-line @eslint-react/set-state-in-effect
    setValue(defaultValue);
    lastReportedRef.current = defaultValue;
  }, [defaultValue]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleClear = () => {
    setValue('');
  };

  return (
    <div className={cn('relative', className)}>
      <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  );
}
