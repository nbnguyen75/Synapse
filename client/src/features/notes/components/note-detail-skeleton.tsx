import { Skeleton } from '@/components/ui/skeleton';

export default function NoteDetailSkeleton() {
  return (
    <div className="h-full">
      <div className="flex items-center justify-between border-b border-border/40 bg-background/80 px-4 md:px-8 py-2.5 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="hidden @2xl/page-header:block h-5 w-16 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8 md:py-12 space-y-6">
        <Skeleton className="h-10 w-2/3" />

        <div className="rounded-xl border border-border/80 bg-background px-5 py-5 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />

          <div className="h-2" />

          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}
