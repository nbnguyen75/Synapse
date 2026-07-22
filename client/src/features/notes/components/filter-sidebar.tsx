import type { Note } from '@/features/notes/types';

import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';

import { FileText, Pin, X, ChevronDown, ChevronRight } from 'lucide-react';

import { m } from '@/paraglide/messages';

interface FilterSidebarProps {
   onNavigateToNote: (note: Note) => void;
   onTagClick: (tag: string) => void;
   onClearFilter: () => void;
   onToggle: () => void;
   selectedTag: string;
   allTags: string[];
   isOpen: boolean;
   notes: Note[];
}

export function FilterSidebar({
   onNavigateToNote,
   onClearFilter,
   selectedTag,
   onTagClick,
   onToggle,
   allTags,
   isOpen,
   notes,
}: FilterSidebarProps) {
   const [foldersOpen, setFoldersOpen] = useState(true);
   const [tagsOpen, setTagsOpen] = useState(true);

   const activeNotes = notes.filter((n) => !n.archived);
   const tagCount = allTags.reduce<Record<string, number>>((acc, tag) => {
      acc[tag] = notes.filter((n) => n.tags?.includes(tag)).length;
      return acc;
   }, {});

   const recentNotes = [...activeNotes]
      .sort((a, b) => {
         if (a.pinned && !b.pinned) return -1;
         if (!a.pinned && b.pinned) return 1;
         return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
         );
      })
      .slice(0, 5);

   if (!isOpen) return null;

   return (
      <div className="w-60 shrink-0 border-r bg-sidebar">
         <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
               {m.notes_page_filter_title()}
            </span>
            <Button
               variant="ghost"
               size="icon-xs"
               onClick={onToggle}
               title={m.notes_page_filter_hide()}
            >
               <X className="size-3.5" />
            </Button>
         </div>

         <div className="px-3">
            <button
               type="button"
               onClick={() => setFoldersOpen(!foldersOpen)}
               className="flex w-full items-center gap-2 py-2 text-xs font-medium text-muted-foreground"
            >
               {foldersOpen ? (
                  <ChevronDown className="size-3" />
               ) : (
                  <ChevronRight className="size-3" />
               )}
               {m.notes_page_filter_categories()}
            </button>
            {foldersOpen && (
               <div className="space-y-0.5 pb-2">
                  <button
                     type="button"
                     onClick={onClearFilter}
                     className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors ${!selectedTag ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                     <FileText className="size-3.5" />
                     {m.notes_page_filter_all_notes()}
                     <span className="ml-auto text-[10px]">
                        {activeNotes.length}
                     </span>
                  </button>
               </div>
            )}

            <button
               type="button"
               onClick={() => setTagsOpen(!tagsOpen)}
               className="flex w-full items-center gap-2 py-2 text-xs font-medium text-muted-foreground"
            >
               {tagsOpen ? (
                  <ChevronDown className="size-3" />
               ) : (
                  <ChevronRight className="size-3" />
               )}
               {m.notes_page_filter_categories()}
            </button>
            {tagsOpen && (
               <div className="space-y-0.5 pb-2">
                  {allTags.length === 0 ? (
                     <p className="px-3 py-2 text-[10px] text-muted-foreground">
                        {m.notes_page_filter_no_tags()}
                     </p>
                  ) : (
                     allTags.map((tag) => (
                        <button
                           key={tag}
                           type="button"
                           onClick={() => onTagClick(tag)}
                           className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors ${selectedTag === tag ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                        >
                           <span className="size-2 rounded-full bg-violet-500" />
                           {tag}
                           <span className="ml-auto text-[10px]">
                              {tagCount[tag] || 0}
                           </span>
                        </button>
                     ))
                  )}
               </div>
            )}
         </div>

         <div className="border-t px-3 pt-3">
            <p className="mb-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
               {m.notes_page_filter_recent()}
            </p>
            <div className="space-y-0.5">
               {recentNotes.map((note) => (
                  <button
                     key={note.id}
                     type="button"
                     onClick={() => onNavigateToNote(note)}
                     className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors text-left"
                  >
                     <FileText className="size-3 shrink-0" />
                     <span className="truncate flex-1">
                        {note.title || 'Untitled'}
                     </span>
                     {note.pinned && (
                        <Pin className="size-2.5 shrink-0 text-amber-500" />
                     )}
                  </button>
               ))}
            </div>
         </div>
      </div>
   );
}
