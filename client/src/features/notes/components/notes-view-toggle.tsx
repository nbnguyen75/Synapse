import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

import { LayoutGrid, Table2 } from 'lucide-react';

export type ViewMode = 'grid' | 'table';

interface NotesViewToggleProps {
  onChange: (mode: ViewMode) => void;
  value: ViewMode;
}

export default function NotesViewToggle({
  onChange,
  value,
}: NotesViewToggleProps) {
  return (
    <div className="flex items-center rounded-lg border border-border/60 p-0.5 bg-muted/30">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onChange('grid')}
                className={cn(
                  'size-7 rounded-md cursor-pointer',
                  value === 'grid' && 'bg-background shadow-xs text-foreground',
                  value !== 'grid' &&
                    'text-muted-foreground hover:text-foreground',
                )}
              >
                <LayoutGrid className="size-3.5" />
              </Button>
            }
          />
          <TooltipContent side="bottom">
            {m.notes_page_view_grid()}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onChange('table')}
                className={cn(
                  'size-7 rounded-md cursor-pointer',
                  value === 'table' &&
                    'bg-background shadow-xs text-foreground',
                  value !== 'table' &&
                    'text-muted-foreground hover:text-foreground',
                )}
              >
                <Table2 className="size-3.5" />
              </Button>
            }
          />
          <TooltipContent side="bottom">
            {m.notes_page_view_table()}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
