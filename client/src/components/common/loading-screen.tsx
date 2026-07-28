// components/loading-screen.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Left sidebar */}
      <div className="hidden w-64 shrink-0 flex-col gap-4 border-r p-4 md:flex">
        <Skeleton className="h-8 w-32" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
        <div className="mt-auto flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Main column */}
      <div className="flex flex-1 flex-col">
        {/* Top header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <Skeleton className="h-6 w-40" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 gap-4 overflow-hidden p-4">
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>

          {/* Right sidebar */}
          <div className="hidden w-72 shrink-0 flex-col gap-3 lg:flex">
            <Skeleton className="h-6 w-24" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
