import type { CommandItem } from '@/features/command-palette/types';
import type { RefObject } from 'react';

import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';

import { CornerDownLeftIcon } from 'lucide-react';

interface CommandPaletteSearchResultsProps {
  resultsRef: RefObject<HTMLDivElement | null>;
  onSelectIndex: (index: number) => void;
  searchResults: CommandItem[];
  selectedIndex: number;
  search: string;
}

export default function CommandPaletteSearchResults({
  searchResults,
  selectedIndex,
  onSelectIndex,
  resultsRef,
  search,
}: CommandPaletteSearchResultsProps) {
  return (
    <div
      ref={resultsRef}
      className="max-h-85 overflow-y-auto p-3 space-y-1.5 bg-background/30"
    >
      {searchResults.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-xl bg-background/50 shadow-flat-inset border border-border/10">
          <p className="text-xs text-neutral-400">
            No results found for "{search}"
          </p>
          {search.startsWith('/') && (
            <p className="text-[10px] text-neutral-500 mt-1">
              Type <span className="font-mono text-emerald-500">/help</span> to
              see the full list of slash commands
            </p>
          )}
        </div>
      ) : (
        searchResults.map((item, idx) => {
          const IconComponent = item.icon;
          const isSelected = idx === selectedIndex;
          const isSlashCmd = 'command' in item;

          return (
            <Button
              key={item.id}
              data-index={idx}
              onClick={item.action}
              onMouseEnter={() => onSelectIndex(idx)}
              variant="ghost"
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all border border-transparent h-auto ${
                isSelected
                  ? isSlashCmd
                    ? 'bg-emerald-500/10 border-emerald-500/20 shadow-flat-inset text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500'
                    : 'bg-primary/10 border-primary/20 shadow-flat-inset text-primary hover:bg-primary/10 hover:text-primary'
                  : 'hover:shadow-flat-sm hover:bg-background/40 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
                    isSelected
                      ? isSlashCmd
                        ? 'border-emerald-500/25 bg-emerald-500/20'
                        : 'border-primary/25 bg-primary/20'
                      : 'border-border/10 bg-background shadow-flat-inset'
                  }`}
                >
                  <IconComponent
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isSelected
                        ? isSlashCmd
                          ? 'text-emerald-500'
                          : 'text-primary'
                        : 'text-neutral-400'
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-xs font-semibold truncate leading-none mb-1 transition-colors ${
                      isSelected
                        ? isSlashCmd
                          ? 'text-emerald-500'
                          : 'text-primary'
                        : 'text-foreground'
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="text-[10px] text-neutral-400 truncate leading-none">
                    {item.subtitle}
                  </p>
                </div>
              </div>
              {isSelected && (
                <div
                  className={`flex items-center gap-1 text-[10px] font-mono ${
                    isSlashCmd ? 'text-emerald-500' : 'text-primary'
                  }`}
                >
                  <Kbd>Enter</Kbd>
                  <CornerDownLeftIcon className="h-3 w-3" />
                </div>
              )}
            </Button>
          );
        })
      )}
    </div>
  );
}
