import type { CommandItem } from '@/features/command-palette/types';
import type { RefObject } from 'react';

import { m } from '@/paraglide/messages';

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
      className="max-h-[340px] overflow-y-auto p-2 space-y-1 bg-background/20"
    >
      {searchResults.length === 0 ? (
        <div className="py-12 px-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {m.command_palette_no_results_prefix()}
            <span className="text-foreground">{search}</span>"
          </p>
          {search.startsWith('/') && (
            <p className="text-xs text-muted-foreground/70 mt-1.5">
              {m.command_palette_type_help_prefix()}{' '}
              <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-[11px]">
                /help
              </code>{' '}
              {m.command_palette_type_help_suffix()}
            </p>
          )}
        </div>
      ) : (
        searchResults.map((item, idx) => {
          const IconComponent = item.icon;
          const isSelected = idx === selectedIndex;
          const isSlashCmd = 'command' in item;

          return (
            <div
              key={item.id}
              data-index={idx}
              onClick={item.action}
              onMouseEnter={() => onSelectIndex(idx)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-md border transition-colors ${
                    isSelected
                      ? 'border-foreground/10 bg-background/80 text-foreground shadow-xs'
                      : 'border-border/40 bg-muted/40 text-muted-foreground'
                  }`}
                >
                  <IconComponent className="h-3.5 w-3.5 shrink-0" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-xs font-medium truncate ${isSelected ? 'text-foreground' : ''}`}
                    >
                      {item.title}
                    </p>
                    {isSlashCmd && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                        {m.command_palette_cmd_badge()}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground/80 truncate mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className="flex items-center gap-1.5 text-muted-foreground pl-2 shrink-0">
                  <span className="text-[10px] font-medium hidden sm:inline">
                    {m.command_palette_select()}
                  </span>
                  <Kbd className="h-5 px-1.5 text-[10px] bg-background border border-border/60">
                    <CornerDownLeftIcon className="h-3 w-3" />
                  </Kbd>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
