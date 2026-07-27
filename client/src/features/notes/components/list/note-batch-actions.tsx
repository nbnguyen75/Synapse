import type { Note } from '@/features/notes/types';

import { useState } from 'react';

import { updateNote, deleteNote } from '@/features/notes/api';

import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Plus, X, Tag, Trash2, Archive } from 'lucide-react';

interface NoteBatchActionsProps {
   onSelectAllPage: (ids: string[]) => void;
   onClearSelection: () => void;
   onBatchUpdate: () => void;
   selectedIds: Set<string>;
   paginatedIds: string[];
   allTags: string[];
   allNotes: Note[];
}

export function NoteBatchActions({
   onClearSelection,
   onSelectAllPage,
   onBatchUpdate,
   paginatedIds,
   selectedIds,
   allNotes,
   allTags,
}: NoteBatchActionsProps) {
   const [isArchiving, setIsArchiving] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

   const ids = Array.from(selectedIds);
   const allSelectedOnPage = paginatedIds.every((id) => selectedIds.has(id));

   async function handleTagUpdate(action: 'add' | 'remove', tag: string) {
      await Promise.all(
         ids.map((id) => {
            const note = allNotes.find((n) => n.id === id);
            const currentTags = note?.tags || [];
            const nextTags =
               action === 'add'
                  ? currentTags.includes(tag)
                     ? currentTags
                     : [...currentTags, tag]
                  : currentTags.filter((t) => t !== tag);
            return updateNote(id, { tags: nextTags });
         }),
      );
      onBatchUpdate();
   }

   async function handleArchive() {
      setIsArchiving(true);
      await Promise.all(ids.map((id) => updateNote(id, { archived: true })));
      setIsArchiving(false);
      onClearSelection();
      onBatchUpdate();
   }

   async function handleDelete() {
      setIsDeleting(true);
      await Promise.all(ids.map((id) => deleteNote(id)));
      setIsDeleting(false);
      onClearSelection();
      onBatchUpdate();
   }

   return (
      <>
         <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 w-[92%] max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-300 select-none rounded-2xl border border-neutral-800 bg-neutral-950 px-6 py-4 text-neutral-100 shadow-2xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
               <div className="flex items-center justify-between md:border-r md:border-neutral-800 md:pr-4">
                  <div className="flex items-center gap-2">
                     <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {selectedIds.size}
                     </div>
                     <span className="text-xs font-medium text-neutral-300">
                        selected
                     </span>
                  </div>
               </div>

               <div className="flex flex-wrap items-center gap-2">
                  <Button
                     variant="ghost"
                     size="xs"
                     onClick={() => {
                        if (allSelectedOnPage) {
                           onSelectAllPage(
                              ids.filter((id) => !paginatedIds.includes(id)),
                           );
                        } else {
                           onSelectAllPage(
                              Array.from(new Set([...ids, ...paginatedIds])),
                           );
                        }
                     }}
                     className="text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
                  >
                     {allSelectedOnPage ? 'Deselect Page' : 'Select All Page'}
                  </Button>

                  <DropdownMenu>
                     <DropdownMenuTrigger className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-2.5 text-xs font-semibold text-neutral-200 outline-none hover:bg-neutral-800">
                        <Plus className="size-3.5 text-emerald-400" />
                        <span>Add Tag</span>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent
                        align="end"
                        className="w-56 border-neutral-800 bg-neutral-900 text-neutral-100"
                     >
                        <div className="border-b border-neutral-800 px-2 py-1.5">
                           <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                              Select or type new tag:
                           </span>
                        </div>
                        {allTags.map((tag) => (
                           <DropdownMenuItem
                              key={tag}
                              onClick={() => handleTagUpdate('add', tag)}
                              className="cursor-pointer p-2 text-xs hover:bg-neutral-800 hover:text-white"
                           >
                              <Tag className="mr-2 size-3.5 shrink-0 text-emerald-400" />
                              <span>#{tag}</span>
                           </DropdownMenuItem>
                        ))}
                        <div className="flex items-center gap-1 border-t border-neutral-800 p-2">
                           <Input
                              placeholder="New tag... (Enter)"
                              className="h-7 rounded-md border-neutral-800 bg-neutral-950 px-1.5 text-xs text-white focus-visible:ring-primary"
                              onKeyDown={(e) => {
                                 if (e.key === 'Enter') {
                                    const val = (
                                       e.target as HTMLInputElement
                                    ).value.trim();
                                    if (val) {
                                       handleTagUpdate('add', val);
                                       (e.target as HTMLInputElement).value =
                                          '';
                                    }
                                 }
                              }}
                           />
                        </div>
                     </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                     <DropdownMenuTrigger className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-2.5 text-xs font-semibold text-neutral-200 outline-none hover:bg-neutral-800">
                        <X className="size-3.5 text-rose-400" />
                        <span>Remove Tag</span>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent
                        align="end"
                        className="w-48 border-neutral-800 bg-neutral-900 text-neutral-100"
                     >
                        <div className="border-b border-neutral-800 px-2 py-1.5">
                           <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                              Select tag to remove:
                           </span>
                        </div>
                        {allTags.length === 0 ? (
                           <div className="p-2.5 text-center text-xs text-neutral-500">
                              No tags yet
                           </div>
                        ) : (
                           allTags.map((tag) => (
                              <DropdownMenuItem
                                 key={tag}
                                 onClick={() => handleTagUpdate('remove', tag)}
                                 className="cursor-pointer p-2 text-xs hover:bg-neutral-800 hover:text-white"
                              >
                                 <Tag className="mr-2 size-3.5 shrink-0 text-rose-400" />
                                 <span>#{tag}</span>
                              </DropdownMenuItem>
                           ))
                        )}
                     </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                     variant="ghost"
                     size="xs"
                     onClick={handleArchive}
                     disabled={isArchiving}
                     className="text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer"
                  >
                     <Archive className="mr-1 size-3.5" />
                     Archive
                  </Button>

                  <Button
                     variant="ghost"
                     size="xs"
                     onClick={() => setShowDeleteConfirm(true)}
                     disabled={isDeleting}
                     className="text-xs text-rose-400 hover:text-rose-300 hover:bg-neutral-800 cursor-pointer"
                  >
                     <Trash2 className="mr-1 size-3.5" />
                     Delete
                  </Button>

                  <Button
                     variant="ghost"
                     size="xs"
                     onClick={onClearSelection}
                     className="ml-1 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
                  >
                     Close
                  </Button>
               </div>
            </div>

            {showDeleteConfirm && (
               <div className="mt-3 flex items-center gap-2 border-t border-neutral-800 pt-3">
                  <span className="text-xs text-neutral-400">
                     Delete {selectedIds.size} note(s)?
                  </span>
                  <Button
                     size="xs"
                     variant="destructive"
                     onClick={handleDelete}
                     disabled={isDeleting}
                     className="h-7 cursor-pointer text-xs"
                  >
                     Confirm Delete
                  </Button>
                  <Button
                     variant="ghost"
                     size="xs"
                     onClick={() => setShowDeleteConfirm(false)}
                     className="h-7 cursor-pointer text-xs text-neutral-400"
                  >
                     Cancel
                  </Button>
               </div>
            )}
         </div>
      </>
   );
}
