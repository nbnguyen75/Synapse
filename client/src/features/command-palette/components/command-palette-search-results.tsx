import type { CommandItem } from '@/features/command-palette/types';
import type { RefObject } from 'react';

import { m } from '@/paraglide/messages';

import { Kbd } from '@/components/ui/kbd';

import { CornerDownLeftIcon } from 'lucide-react';

export interface GroupedCommandItem extends CommandItem {
  group?: 'quick' | 'commands' | 'notes' | 'tags';
  shortcut?: string;
  meta?: string;
}

interface CommandPaletteSearchResultsProps {
  resultsRef: RefObject<HTMLDivElement | null>;
  onSelectIndex: (index: number) => void;
  searchResults: GroupedCommandItem[];
  selectedIndex: number;
  search: string;
}

const GROUP_TITLES: Record<string, string> = {
  commands: 'COMMANDS (Type > or /)',
  quick: 'QUICK ACTIONS / RECENT',
  tags: 'TAGS (Type #)',
  notes: 'NOTES',
};

export default function CommandPaletteSearchResults({
  searchResults,
  selectedIndex,
  onSelectIndex,
  resultsRef,
  search,
}: CommandPaletteSearchResultsProps) {
  if (searchResults.length === 0) {
    return (
      <div className="py-12 px-4 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          {m.command_palette_no_results_prefix()}
          <span className="text-foreground">{search}</span>"
        </p>
      </div>
    );
  }

  let globalIndexCounter = 0;

  // Gom nhóm danh sách kết quả theo thuộc tính `group`
  const groups = searchResults.reduce<
    Record<string, { item: GroupedCommandItem; flatIndex: number }[]>
  >((acc, item) => {
    const groupKey = item.group || 'quick';
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push({ flatIndex: globalIndexCounter++, item });
    return acc;
  }, {});

  return (
    <div
      ref={resultsRef}
      className="max-h-85 overflow-y-auto p-2 space-y-3 bg-background/20"
    >
      {Object.entries(groups).map(([groupKey, items]) => (
        <div key={groupKey} className="space-y-1">
          {/* Header phân nhóm */}
          <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">
            {GROUP_TITLES[groupKey] || groupKey}
          </div>

          {/* Danh sách items thuộc nhóm */}
          {items.map(({ flatIndex, item }) => {
            const IconComponent = item.icon;
            const isSelected = flatIndex === selectedIndex;

            return (
              <div
                key={item.id}
                data-index={flatIndex}
                onClick={item.action}
                onMouseEnter={() => onSelectIndex(flatIndex)}
                onPointerMove={(e) => {
                  if (e.movementX !== 0 || e.movementY !== 0) {
                    onSelectIndex(flatIndex);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-accent text-accent-foreground shadow-xs'
                    : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-md border transition-colors shrink-0 ${
                      isSelected
                        ? 'border-foreground/10 bg-background/80 text-foreground shadow-2xs'
                        : 'border-border/40 bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <IconComponent className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-medium truncate ${
                        isSelected ? 'text-foreground' : ''
                      }`}
                    >
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="text-[11px] text-muted-foreground/80 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phím tắt hoặc Metadata ở bên phải */}
                <div className="flex items-center gap-2 pl-2 shrink-0">
                  {item.meta && (
                    <span className="text-[11px] text-muted-foreground/60 hidden sm:inline">
                      {item.meta}
                    </span>
                  )}
                  {item.shortcut && (
                    <Kbd className="text-[10px] px-1.5 py-0.5 bg-background border border-border/60">
                      {item.shortcut}
                    </Kbd>
                  )}
                  {isSelected && !item.shortcut && (
                    <Kbd className="h-5 px-1.5 text-[10px] bg-background border border-border/60">
                      <CornerDownLeftIcon className="h-3 w-3" />
                    </Kbd>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
