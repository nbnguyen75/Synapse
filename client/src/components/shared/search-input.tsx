import { useEffect, useRef, useState, type ChangeEvent } from 'react';

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
  const lastReported = useRef(defaultValue);

  useEffect(() => {
    if (debouncedValue !== lastReported.current) {
      lastReported.current = debouncedValue;
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);

  useEffect(() => {
    const resetValue = () => setValue(defaultValue);
    resetValue();
    lastReported.current = defaultValue;
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
