import { useEffect, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

import { XIcon } from 'lucide-react';

interface SelectionToolbarProps {
  onClearSelection: () => void;
  selectedCount: number;
  children: ReactNode;
  countLabel?: string;
}

const EXIT_ANIMATION_DURATION = 250;

export default function SelectionToolbar({
  onClearSelection,
  selectedCount,
  countLabel,
  children,
}: SelectionToolbarProps) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (selectedCount > 0 && prevCountRef.current === 0) {
      setClosing(false);
      setVisible(true);
    } else if (selectedCount === 0 && prevCountRef.current > 0) {
      setClosing(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, EXIT_ANIMATION_DURATION);
      prevCountRef.current = 0;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = selectedCount;
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
        {countLabel && (
          <span className="text-sm font-medium">{countLabel}</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {children}

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
