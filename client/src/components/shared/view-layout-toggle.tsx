import { cn } from '@/lib/utils';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

import { LayoutGridIcon, Table2Icon } from 'lucide-react';

export type LayoutMode = 'table' | 'grid';

interface ViewToggleProps {
  onChange: (mode: LayoutMode) => void;
  tableLabel?: string;
  gridLabel?: string;
  value: LayoutMode;
}

export default function ViewLayoutToggle({
  tableLabel,
  gridLabel,
  onChange,
  value,
}: ViewToggleProps) {
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
                  value !== 'grid' && 'text-muted-foreground hover:text-foreground',
                )}
              >
                <LayoutGridIcon className="size-3.5" />
              </Button>
            }
          />

          <TooltipContent side="bottom">{gridLabel}</TooltipContent>
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
                  value === 'table' && 'bg-background shadow-xs text-foreground',
                  value !== 'table' && 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Table2Icon className="size-3.5" />
              </Button>
            }
          />
          <TooltipContent side="bottom">{tableLabel}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
