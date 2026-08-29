import { formatForDisplay } from '@tanstack/hotkeys';

import { cn } from '@/lib/utils';

import { Kbd, KbdGroup } from '@/components/ui/kbd';

interface KeyComboProps {
  className?: string;
  /** Canonical hotkey string (e.g. `mod+shift+n`). */
  combo: string;
}

/**
 * Renders a hotkey as Kbd chips, cross-platform: symbols on macOS (⌘ ⇧ B),
 * `+`-joined keys (Ctrl+Shift+B) on Windows/Linux.
 */
export function KeyCombo({ className, combo }: KeyComboProps) {
  const formatted = formatForDisplay(combo);
  const keys = formatted.split(/[\s+]+/);
  const usesSeparator = formatted.includes('+');

  return (
    <KbdGroup className={cn(className)}>
      {keys.map((key, index) => (
        <span key={key} className="flex items-center gap-1">
          <Kbd>{key}</Kbd>
          {usesSeparator && index < keys.length - 1 && (
            <span className="mx-0.5 text-[10px] text-muted-foreground">+</span>
          )}
        </span>
      ))}
    </KbdGroup>
  );
}
