// TODO: Apply dynamic later
import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

import { PlusIcon } from 'lucide-react';

const HARDCODED_TAGS = [
  { label: () => m.notes_page_tag_all(), active: true, count: null },
  { label: () => m.notes_tag_mock_work(), active: false, count: 12 },
  { label: () => m.notes_tag_mock_ideas(), active: false, count: 8 },
  { label: () => m.notes_tag_mock_personal(), active: false, count: 5 },
  { label: () => m.notes_tag_mock_design(), active: false, count: 3 },
] as const;

export default function NotesTagFilter() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-2 px-6">
      {HARDCODED_TAGS.map((tag) => (
        <Button
          key={tag.label()}
          variant={tag.active ? 'secondary' : 'ghost'}
          size="sm"
          className={cn(
            'shrink-0 h-8 rounded-full text-xs font-medium px-3.5 cursor-pointer',
            tag.active &&
              'bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20',
            !tag.active &&
              'text-muted-foreground hover:text-foreground hover:bg-muted/60',
          )}
          onClick={() => {}}
        >
          {tag.label()}
          {tag.count != null && (
            <span className="ml-1 text-[10px] opacity-70">({tag.count})</span>
          )}
        </Button>
      ))}
      <Button
        variant="outline"
        size="icon"
        className="shrink-0 size-8 rounded-full cursor-pointer"
        title={m.notes_tag_filter_add()}
      >
        <PlusIcon className="size-3.5" />
      </Button>
    </div>
  );
}
