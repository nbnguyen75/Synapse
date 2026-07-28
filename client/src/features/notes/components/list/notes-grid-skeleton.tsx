import { Skeleton } from '@/components/ui/skeleton';

interface NotesGridSkeletonProps {
  count?: number;
}

export function NotesGridSkeleton({ count = 6 }: NotesGridSkeletonProps) {
  return (
    <div className="grid gap-4 grid-cols-1 @2xl:grid-cols-2 @5xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border-none bg-background shadow-flat-sm p-4 h-64"
        >
          <Skeleton className="mb-5 h-5 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  );
}
