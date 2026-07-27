import { Sparkles } from 'lucide-react';

export function SidebarLogo() {
   return (
      <div className="flex items-center gap-2.5">
         <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white shadow-sm shadow-violet-500/20">
            <Sparkles className="size-4" />
         </div>
         <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <div className="truncate font-semibold text-neutral-900 dark:text-neutral-50">
               {import.meta.env.VITE_APP_NAME}
            </div>
            <div className="truncate text-[10px] font-medium text-neutral-400 dark:text-neutral-500 leading-none">
               Intelligence Hub
            </div>
         </div>
      </div>
   );
}
