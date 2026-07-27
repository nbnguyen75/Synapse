import type { Note } from '@/features/notes/types';

import {
   getTagColor,
   formatDate,
   getReadTime,
   exportMarkdown,
} from '@/features/notes/constants';

import { m } from '@/paraglide/messages';

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
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
   MoreVertical,
   Pin,
   FileText,
   MessageSquare,
   Download,
   Archive,
   Trash2,
   Sparkles,
   Check,
} from 'lucide-react';

interface NoteCardProps {
   onArchive: (id: string, archived: boolean, title: string) => void;
   onTogglePin: (id: string, pinned: boolean) => void;
   onToggleSelect?: (id: string) => void;
   onChatWithNote: (note: Note) => void;
   onOpenDetail: (note: Note) => void;
   onTagClick: (tag: string) => void;
   onDelete: (note: Note) => void;
   onEdit: (note: Note) => void;
   isBatchMode?: boolean;
   isSelected?: boolean;
   note: Note;
}

export function NoteCard({
   onChatWithNote,
   onToggleSelect,
   onOpenDetail,
   onTogglePin,
   isBatchMode,
   onTagClick,
   isSelected,
   onArchive,
   onDelete,
   onEdit,
   note,
}: NoteCardProps) {
   return (
      <Card className="group relative">
         <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
               <div className="flex items-center gap-2 min-w-0 flex-1">
                  {isBatchMode && onToggleSelect ? (
                     <button
                        onClick={() => onToggleSelect(note.id)}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer ${
                           isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/30 hover:border-muted-foreground/60'
                        }`}
                     >
                        {isSelected && <Check className="h-3 w-3" />}
                     </button>
                  ) : (
                     <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onTogglePin(note.id, !note.pinned)}
                        className={`shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                           note.pinned
                              ? 'opacity-100! text-amber-500'
                              : 'text-muted-foreground'
                        }`}
                        title={
                           note.pinned
                              ? m.notes_page_pin_unpin()
                              : m.notes_page_pin_pin()
                        }
                     >
                        <Pin className="h-3.5 w-3.5" />
                     </Button>
                  )}
                  <CardTitle
                     className="text-sm font-semibold leading-tight truncate cursor-pointer hover:text-primary transition-colors"
                     onClick={() => onOpenDetail(note)}
                  >
                     {note.title || 'Untitled'}
                  </CardTitle>
               </div>
               <DropdownMenu>
                  <DropdownMenuTrigger
                     render={
                        <button className="inline-flex items-center justify-center shrink-0 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-accent h-7 w-7" />
                     }
                  >
                     <MoreVertical className="size-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                     <DropdownMenuItem onClick={() => onOpenDetail(note)}>
                        <FileText className="mr-2 size-3.5" />
                        {m.notes_page_card_open_doc()}
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => onEdit(note)}>
                        <FileText className="mr-2 size-3.5" />
                        {m.notes_page_card_quick_edit()}
                     </DropdownMenuItem>
                     <DropdownMenuItem
                        onClick={() =>
                           exportMarkdown(note.title, note.content || '')
                        }
                     >
                        <Download className="mr-2 size-3.5" />
                        {m.notes_page_action_export()}
                     </DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem
                        onClick={() =>
                           onArchive(note.id, !note.archived, note.title)
                        }
                     >
                        <Archive className="mr-2 size-3.5" />
                        {note.archived
                           ? m.notes_page_action_unarchive()
                           : m.notes_page_action_archive()}
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => onChatWithNote(note)}>
                        <MessageSquare className="mr-2 size-3.5" />
                        {m.notes_page_card_chat_with_note()}
                     </DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem
                        onClick={() => onDelete(note)}
                        className="text-destructive focus:text-destructive"
                     >
                        <Trash2 className="mr-2 size-3.5" />
                        {m.notes_page_action_delete()}
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
            <CardDescription className="flex items-center gap-2 text-[10px]">
               <span>{formatDate(note.updatedAt)}</span>
               <span>·</span>
               <span>{getReadTime(note.content || '')}</span>
            </CardDescription>
            {note.tags && note.tags.length > 0 && (
               <div className="flex flex-wrap gap-1 mt-1">
                  {note.tags.map((tag) => (
                     <Badge
                        key={tag}
                        variant="outline"
                        className={`cursor-pointer text-[10px] px-1.5 py-0 ${getTagColor(tag)}`}
                        onClick={(e) => {
                           e.stopPropagation();
                           onTagClick(tag);
                        }}
                     >
                        {tag}
                     </Badge>
                  ))}
               </div>
            )}
         </CardHeader>
         <CardContent
            className="cursor-pointer text-xs text-muted-foreground line-clamp-2"
            onClick={() => onOpenDetail(note)}
         >
            {note.content?.replace(/[#*`[\]]/g, '').trim() || 'No content'}
         </CardContent>
         <CardFooter className="flex items-center justify-between pt-2">
            <span className="text-[10px] text-muted-foreground">
               {m.notes_page_card_id({ id: note.id.slice(-6) })}
            </span>
            <Button
               variant="ghost"
               size="xs"
               className="text-[10px] text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
               onClick={() => onChatWithNote(note)}
            >
               <Sparkles className="mr-1 size-3" />
               {m.notes_page_card_ask_ai()}
            </Button>
         </CardFooter>
      </Card>
   );
}
