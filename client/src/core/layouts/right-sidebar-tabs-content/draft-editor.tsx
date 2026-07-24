import { useState } from 'react';

import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button';

import {
   CheckIcon,
   CopyIcon,
   Trash2Icon,
   ExternalLinkIcon,
} from 'lucide-react';

export default function DraftEditor() {
   // TODO: Store in BE
   const [isCopied, setIsCopied] = useState(false);

   const [scratchpadText, setScratchpadText] = useState(() => {
      if (typeof window === 'undefined') return '';
      return localStorage.getItem('synapse_scratchpad') || '';
   });

   const handleCopyScratchpad = () => {
      if (!scratchpadText) return;
      navigator.clipboard.writeText(scratchpadText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
   };

   const handleExportToNote = () => {
      if (!scratchpadText.trim()) return;
      // TODO: navigate to note page
      setTimeout(() => {
         window.dispatchEvent(
            new CustomEvent('open-new-note-modal', {
               detail: {
                  title: 'Scratchpad Export',
                  content: scratchpadText,
               },
            }),
         );
      }, 150);
   };

   return (
      <div className="space-y-3 h-[95%] flex flex-col">
         <div className="flex items-center justify-between shrink-0">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
               Quick draft (Auto-save)
            </span>
            <div className="flex items-center gap-1">
               <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleCopyScratchpad}
                  className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Copy content"
               >
                  {isCopied ? (
                     <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                     <CopyIcon className="h-3.5 w-3.5" />
                  )}
               </Button>
               <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => {
                     if (
                        scratchpadText &&
                        window.confirm(
                           'Are you sure you want to clear scratchpad?',
                        )
                     ) {
                        setScratchpadText('');
                     }
                  }}
                  className="h-7 w-7 rounded-md text-muted-foreground hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                  title="Clear scratchpad"
               >
                  <Trash2Icon className="h-3.5 w-3.5" />
               </Button>
            </div>
         </div>

         <Textarea
            value={scratchpadText}
            onChange={(e) => setScratchpadText(e.target.value)}
            placeholder="Write thoughts or quick notes here... Content auto-saves."
            className="flex-1 min-h-45 w-full p-3 text-xs bg-neutral-50 dark:bg-neutral-950/60 border border-border rounded-lg outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder:text-muted-foreground font-sans resize-none leading-relaxed transition-all"
         />

         <Button
            onClick={handleExportToNote}
            disabled={!scratchpadText.trim()}
            className="w-full h-8 text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg gap-1.5 cursor-pointer disabled:opacity-40 transition-all shadow-xs"
         >
            <ExternalLinkIcon className="h-3.5 w-3.5" />
            <span>Save as new Note</span>
         </Button>
      </div>
   );
}
