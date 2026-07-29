import type { Note } from '@/features/notes/types';

import {
  countWordsMarkdownSync,
  exportMarkdown,
  getMarkdownReadTimeSync,
} from '@/features/notes/services';
import { formatDate, MAX_VISIBLE_TAGS } from '@/features/notes/constants';

import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';

import MarkdownRenderer from '@/components/shared/markdown-renderer';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
  MoreVerticalIcon,
  Trash2Icon,
  ArchiveIcon,
  DownloadIcon,
  FileTextIcon,
  MessageSquareIcon,
  StarIcon,
  PinIcon,
  CalendarIcon,
  BookOpenIcon,
} from 'lucide-react';

interface NoteWithDetails extends Note {
  isStarred?: boolean;
  isPinned?: boolean;
  tags?: string[];
}

interface NoteCardProps {
  onDelete?: (note: Note) => void | Promise<void>;
  onToggleSelect?: (id: string) => void;
  onChatWithNote?: (note: Note) => void;
  onOpenDetail?: (note: Note) => void;
  onToggleStar?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  isBatchMode?: boolean;
  note: NoteWithDetails;
  isSelected?: boolean;
}

export function NoteCard({
  onChatWithNote,
  onToggleSelect,
  onOpenDetail,
  onToggleStar,
  isBatchMode,
  onTogglePin,
  isSelected,
  onDelete,
  note,
}: NoteCardProps) {
  const tags = note.tags || [];
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const remainingTagsCount = tags.length - MAX_VISIBLE_TAGS;
  const wordCount = countWordsMarkdownSync(note.content);

  return (
    <Card
      className={cn(
        'group relative flex flex-col justify-between h-72 overflow-hidden rounded-xl transition-all duration-300 ease-out',
        'border border-border/60 bg-card hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 cursor-pointer',
        note.isPinned && 'border-primary/30 bg-primary/1.5',
        isSelected && 'border-primary bg-primary/5 ring-1 ring-primary',
      )}
      onClick={() => {
        if (isBatchMode) {
          onToggleSelect?.(note.id);
        } else {
          onOpenDetail?.(note);
        }
      }}
    >
      {/* Vạch kẻ Pin với hiệu ứng Gradient & Fade-in */}
      {note.isPinned && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-primary/30 via-primary to-primary/30 transition-all duration-500 animate-in fade-in" />
      )}

      <div className="flex flex-col flex-1 min-h-0">
        <CardHeader className="p-4 pb-1.5 space-y-1.5">
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {isBatchMode && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect?.(note.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="mr-0.5 shrink-0 transition-transform duration-200 active:scale-90"
                />
              )}

              <CardTitle className="text-sm font-semibold leading-tight truncate text-foreground group-hover:text-primary transition-colors duration-200">
                {note.title || m.notes_page_untitled()}
              </CardTitle>
            </div>

            <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="ghost"
                size="icon"
                title={
                  note.isPinned
                    ? m.notes_page_pin_unpin()
                    : m.notes_page_pin_pin()
                }
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin?.(note.id);
                }}
                className={cn(
                  'h-6 w-6 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 transition-all duration-200 active:scale-90 hover:scale-105',
                  note.isPinned && 'text-primary hover:text-primary',
                )}
              >
                <PinIcon
                  className={cn(
                    'size-3.5 transition-transform duration-300 ease-out',
                    note.isPinned
                      ? 'fill-primary rotate-45 scale-110'
                      : 'hover:-rotate-12',
                  )}
                />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                title={
                  note.isStarred
                    ? m.notes_page_favorite_off()
                    : m.notes_page_favorite_on()
                }
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar?.(note.id);
                }}
                className={cn(
                  'h-6 w-6 rounded-md text-muted-foreground/60 hover:text-amber-500 hover:bg-muted/80 transition-all duration-200 active:scale-90 hover:scale-105',
                  note.isStarred && 'text-amber-400 hover:text-amber-500',
                )}
              >
                <StarIcon
                  className={cn(
                    'size-3.5 transition-all duration-300 ease-out',
                    note.isStarred
                      ? 'fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                      : 'hover:scale-125 hover:rotate-12',
                  )}
                />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger
                  onClick={(e) => e.stopPropagation()}
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-pointer rounded-md h-6 w-6 text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-90 hover:scale-105"
                    >
                      <MoreVerticalIcon className="size-3.5" />
                    </Button>
                  }
                />
                <DropdownMenuContent
                  align="end"
                  className="w-52"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem onClick={() => onOpenDetail?.(note)}>
                    <FileTextIcon className="mr-2 size-3.5" />
                    {m.notes_page_card_open_doc()}
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => exportMarkdown(note)}>
                    <DownloadIcon className="mr-2 size-3.5" />
                    {m.notes_page_action_export()}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem disabled className="cursor-not-allowed">
                    <ArchiveIcon className="mr-2 size-3.5" />
                    {m.notes_page_action_unarchive()}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => onChatWithNote?.(note)}
                    disabled
                    className="cursor-not-allowed"
                  >
                    <MessageSquareIcon className="mr-2 size-3.5" />
                    {m.notes_page_card_chat_with_note()}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => onDelete?.(note)}
                    variant="destructive"
                  >
                    <Trash2Icon className="mr-2 size-3.5" />
                    {m.notes_page_action_delete()}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center pt-0.5">
            <Badge
              variant="secondary"
              className="gap-1 font-normal text-[10px] px-2 py-0 h-5 bg-muted/60 hover:bg-muted text-muted-foreground border-none transition-all duration-200 hover:scale-[1.02]"
            >
              <CalendarIcon className="size-2.5 text-muted-foreground/80 transition-transform duration-200 group-hover:scale-110" />
              {formatDate(note.updatedAt)}
            </Badge>
          </div>
        </CardHeader>

        {/* Nội dung Preview */}
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
            <MarkdownRenderer className="px-3" content={note.content ?? ''} />
          </div>
        </CardContent>
      </div>

      {/* FOOTER METADATA: Thêm hiệu ứng hover cho từng Tag Badge */}
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

          {tags.length === 0 && (
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
          {getMarkdownReadTimeSync(note.content)}
        </Badge>
      </CardFooter>
    </Card>
  );
}
