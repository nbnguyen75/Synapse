import { m } from '@/paraglide/messages';

import { Loader2Icon } from 'lucide-react';

export default function DefaultLoaderPage() {
  return (
    <div className="flex h-svh w-full flex-col items-center justify-center gap-6 bg-background px-4 text-foreground">
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,color-mix(in_oklch,var(--color-primary)_30%,transparent),color-mix(in_oklch,var(--color-primary)_10%,transparent)_60%,transparent_100%)] blur-lg" />

        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />

        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary animation-duration-[0.8s]" />

        <Loader2Icon className="relative h-6 w-6 animate-pulse text-primary animation-duration-[1.6s]" />
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="m-0 text-base font-medium text-foreground">{m.loader_title()}</p>
        <p className="m-0 text-sm text-muted-foreground">{m.loader_subtitle()}</p>
      </div>

      <div className="flex w-full max-w-96 flex-col gap-3 pt-2">
        <div className="h-3 w-full animate-pulse rounded-full bg-muted animation-duration-[1.6s]" />
        <div className="h-3 w-4/5 animate-pulse rounded-full bg-muted animation-duration-[1.6s]" />
        <div className="h-3 w-3/5 animate-pulse rounded-full bg-muted animation-duration-[1.6s]" />
      </div>
    </div>
  );
}
