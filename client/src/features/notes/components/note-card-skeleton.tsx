import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function NoteCardSkeleton() {
  return (
    <Card className="flex flex-col justify-between h-72 overflow-hidden rounded-xl border border-border/60 bg-card">
      <div className="flex flex-col flex-1 min-h-0">
        <CardHeader className="p-4 pb-1.5 space-y-1.5">
          <div className="flex items-start justify-between gap-1.5">
            <Skeleton className="h-5 w-2/3" />

            <div className="flex items-center gap-1 shrink-0">
              <Skeleton className="size-6 rounded-md" />
              <Skeleton className="size-6 rounded-md" />
              <Skeleton className="size-6 rounded-md" />
            </div>
          </div>

          <Skeleton className="h-5 w-24 rounded-full" />
        </CardHeader>

        <CardContent className="px-4 py-1.5 flex-1 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
        </CardContent>
      </div>

      <CardFooter className="px-4 py-2 bg-muted/20 border-t border-border/30 flex items-center justify-between gap-2 mt-auto">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </CardFooter>
    </Card>
  );
}
