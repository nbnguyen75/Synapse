import type { ReactNode } from 'react';

interface FullPageViewProps {
   children: ReactNode;
   sidebar?: ReactNode;
   topBar: ReactNode;
}

export function FullPageView({ children, sidebar, topBar }: FullPageViewProps) {
   return (
      <div className="flex h-full flex-col">
         {topBar}
         <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto">{children}</div>
            {sidebar && (
               <div className="hidden xl:block w-80 shrink-0 border-l overflow-y-auto p-4">
                  {sidebar}
               </div>
            )}
         </div>
      </div>
   );
}
