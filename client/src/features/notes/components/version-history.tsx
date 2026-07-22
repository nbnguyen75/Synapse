import type { NoteVersion } from '@/features/notes/types';

import { Button } from '@/shared/components/ui/button';

import { Clock, RotateCcw } from 'lucide-react';

import { m } from '@/paraglide/messages';

interface VersionHistoryProps {
   onSelectVersion: (v: NoteVersion | null) => void;
   onRestoreVersion: (v: NoteVersion) => void;
   selectedVersion: NoteVersion | null;
   versions: NoteVersion[];
}

function formatTime(iso: string): string {
   const d = new Date(iso);
   return d.toLocaleTimeString(undefined, {
      minute: '2-digit',
      hour: '2-digit',
   });
}

function formatDate(iso: string): string {
   const d = new Date(iso);
   const now = new Date();
   const diff = now.getTime() - d.getTime();
   if (diff < 86400000) return 'Today';
   if (diff < 172800000) return 'Yesterday';
   return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function VersionHistory({
   onRestoreVersion,
   selectedVersion,
   onSelectVersion,
   versions,
}: VersionHistoryProps) {
   return (
      <div>
         <div className="flex items-center gap-2 mb-3">
            <Clock className="size-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
               {m.notes_page_edit_history({ count: versions.length })}
            </span>
         </div>

         {selectedVersion && (
            <div className="mb-3 rounded-lg border bg-muted/30 p-3">
               <p className="mb-1 text-xs font-medium">
                  {selectedVersion.title}
               </p>
               <p className="mb-2 text-[10px] text-muted-foreground line-clamp-3">
                  {selectedVersion.content}
               </p>
               <Button
                  size="xs"
                  variant="outline"
                  className="w-full"
                  onClick={() => onRestoreVersion(selectedVersion)}
               >
                  <RotateCcw className="mr-1 size-3" />
                  {m.notes_page_version_restore()}
               </Button>
            </div>
         )}

         <div className="space-y-1">
            <button
               type="button"
               onClick={() => onSelectVersion(null)}
               className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors ${!selectedVersion ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}
            >
               <span className="truncate">
                  {m.notes_page_version_current()}
               </span>
               <span className="shrink-0 text-[10px]">
                  {formatTime(new Date().toISOString())}
               </span>
            </button>

            {versions.length === 0 ? (
               <p className="px-3 py-2 text-[10px] text-muted-foreground">
                  {m.notes_page_version_empty()}
               </p>
            ) : (
               versions.map((v, i) => (
                  <button
                     key={v.id}
                     type="button"
                     onClick={() => onSelectVersion(v)}
                     className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors ${selectedVersion?.id === v.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                     <span className="truncate">
                        {m.notes_page_version_number({
                           number: String(versions.length - i),
                        })}
                     </span>
                     <span className="shrink-0 text-[10px]">
                        {formatDate(v.updatedAt)} {formatTime(v.updatedAt)}
                     </span>
                  </button>
               ))
            )}
         </div>
      </div>
   );
}
