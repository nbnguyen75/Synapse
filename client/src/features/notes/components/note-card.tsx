import type { Note, NoteViewMode } from '@/features/notes/types';

import { memo } from 'react';

import { NoteCardDropdown } from '@/features/notes/components/note-card-dropdown';
import { useNoteCard } from '@/features/notes/hooks';

import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages';

import MarkdownRenderer from '@/components/shared/markdown-renderer';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

import { BookOpenIcon, CalendarIcon, PinIcon, StarIcon } from 'lucide-react';

interface NoteWithDetails extends Note {
  tags?: string[];
}

interface NoteCardProps {
  onToggleSelect?: (id: string) => void;
  onSelectRange?: (id: string) => void;
  viewMode?: NoteViewMode;
  note: NoteWithDetails;
  isSelected?: boolean;
}

function NoteCard({
  onToggleSelect,
  onSelectRange,
  isSelected,
  viewMode,
  note,
}: NoteCardProps) {
  const { actions, metrics, state, data } = useNoteCard({
    onToggleSelect,
    onSelectRange,
    viewMode,
    note,
  });

  const { formattedUpdatedAt, previewContent } = data;
  const {
    handleTouchStart,
    handleCardClick,
    handleTouchEnd,
    includeInChat,
    copyContent,
    exportNote,
    openDetail,
    execute,
  } = actions;
  const { remainingTagsCount, visibleTags, wordCount, readTime } = metrics;
  const { canPinFavorite } = state;

  return (
    <Card
      className={cn(
        'group relative flex flex-col justify-between h-72 overflow-hidden rounded-xl transition-all duration-300 ease-out',
        'border border-border/60 bg-card hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 cursor-pointer',
        note.pinned && 'border-primary/30 bg-primary/1.5',
        isSelected && 'border-primary bg-primary/5 ring-1 ring-primary',
      )}
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
    >
      {note.pinned && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-primary/30 via-primary to-primary/30 transition-all duration-500 animate-in fade-in" />
      )}

      <div className="flex flex-col flex-1 min-h-0">
        <CardHeader className="p-4 pb-1.5 space-y-1.5">
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect?.(note.id)}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  'mr-0.5 shrink-0 transition-all duration-200 active:scale-90',
                  isSelected
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100',
                )}
              />

              <CardTitle className="text-sm font-semibold leading-tight truncate text-foreground group-hover:text-primary transition-colors duration-200">
                {note.title || m.notes_page_untitled()}
              </CardTitle>
            </div>

            <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
              {canPinFavorite && (
                <Button
                  variant="ghost"
                  size="icon"
                  title={
                    note.pinned
                      ? m.notes_page_pin_unpin()
                      : m.notes_page_pin_pin()
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    execute('pin');
                  }}
                  className={cn(
                    'h-6 w-6 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 transition-all duration-200 active:scale-90 hover:scale-105',
                    note.pinned && 'text-primary hover:text-primary',
                  )}
                >
                  <PinIcon
                    className={cn(
                      'size-3.5 transition-transform duration-300 ease-out',
                      note.pinned
                        ? 'fill-primary rotate-45 scale-110'
                        : 'hover:-rotate-12',
                    )}
                  />
                </Button>
              )}

              {canPinFavorite && (
                <Button
                  variant="ghost"
                  size="icon"
                  title={
                    note.favorite
                      ? m.notes_page_favorite_off()
                      : m.notes_page_favorite_on()
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    execute('favorite');
                  }}
                  className={cn(
                    'h-6 w-6 rounded-md text-muted-foreground/60 hover:text-amber-500 hover:bg-muted/80 transition-all duration-200 active:scale-90 hover:scale-105',
                    note.favorite && 'text-amber-400 hover:text-amber-500',
                  )}
                >
                  <StarIcon
                    className={cn(
                      'size-3.5 transition-all duration-300 ease-out',
                      note.favorite
                        ? 'fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                        : 'hover:scale-125 hover:rotate-12',
                    )}
                  />
                </Button>
              )}

              <NoteCardDropdown
                actions={{
                  includeInChat,
                  copyContent,
                  exportNote,
                  openDetail,
                  execute,
                }}
                note={note}
                viewMode={viewMode}
              />
            </div>
          </div>

          <div className="flex items-center pt-0.5">
            <Badge
              variant="secondary"
              className="gap-1 font-normal text-[10px] px-2 py-0 h-5 bg-muted/60 hover:bg-muted text-muted-foreground border-none transition-all duration-200 hover:scale-[1.02]"
            >
              <CalendarIcon className="size-2.5 text-muted-foreground/80 transition-transform duration-200 group-hover:scale-110" />
              {formattedUpdatedAt}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="px-4 py-1.5 flex-1 overflow-hidden">
          <div
            className={cn(
              'text-xs text-muted-foreground/80 line-clamp-5 leading-relaxed transition-colors duration-300 group-hover:text-muted-foreground',
              '[&_p]:m-0 [&_p]:inline',
              '[&_h1]:text-xs [&_h1]:font-semibold [&_h1]:m-0 [&_h1]:inline',
              '[&_h2]:text-xs [&_h2]:font-semibold [&_h2]:m-0 [&_h2]:inline',
              '[&_h3]:text-xs [&_h3]:font-semibold [&_h3]:m-0 [&_h3]:inline',
              '[&_ul]:my-0.5 [&_ul]:pl-3 [&_ul]:list-disc',
              '[&_ol]:my-0.5 [&_ol]:pl-3 [&_ol]:list-decimal',
              '[&_li]:m-0 [&_li]:p-0',
              '[&_blockquote]:my-0.5 [&_blockquote]:pl-1.5 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:italic',
              '[&_code]:bg-muted [&_code]:px-1 [&_code]:rounded [&_code]:text-[10px] [&_code]:font-mono',
            )}
          >
            <MarkdownRenderer className="px-3" content={previewContent} />
          </div>
        </CardContent>
      </div>

      <CardFooter className="px-4 py-2 bg-muted/20 border-t border-border/30 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1 min-w-0 overflow-hidden">
          {visibleTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="truncate max-w-20 font-medium text-[10px] px-2 py-0 h-5 transition-transform duration-200 hover:scale-105"
            >
              #{tag}
            </Badge>
          ))}

          {remainingTagsCount > 0 && (
            <Badge
              variant="outline"
              className="shrink-0 font-medium text-[10px] px-1.5 py-0 h-5 border-border/50 text-muted-foreground transition-transform duration-200 hover:scale-105"
            >
              +{remainingTagsCount}
            </Badge>
          )}

          {wordCount > 0 && (
            <Badge
              variant="outline"
              className="font-normal text-[10px] px-2 py-0 h-5 border-border/40 text-muted-foreground/70"
            >
              {m.notes_page_word_count({ count: wordCount })}
            </Badge>
          )}
        </div>

        <Badge
          variant="secondary"
          className="shrink-0 gap-1 font-normal text-[10px] px-2 py-0 h-5 bg-muted/50 hover:bg-muted text-muted-foreground/80 border-none transition-all duration-200 hover:scale-[1.02]"
        >
          <BookOpenIcon className="size-2.5 text-muted-foreground/80 transition-transform duration-200 group-hover:rotate-6" />
          {readTime}
        </Badge>
      </CardFooter>
    </Card>
  );
}

export default memo(NoteCard, (prev, next) => {
  return (
    prev.isSelected === next.isSelected &&
    prev.viewMode === next.viewMode &&
    prev.note.id === next.note.id &&
    prev.note.updatedAt === next.note.updatedAt &&
    prev.note.title === next.note.title &&
    prev.note.content === next.note.content &&
    prev.note.pinned === next.note.pinned &&
    prev.note.favorite === next.note.favorite
  );
});
