import type { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
   return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] text-zinc-100 px-4 py-12 selection:bg-zinc-800 selection:text-white transition-colors duration-300">
         {children}
      </div>
   );
}
