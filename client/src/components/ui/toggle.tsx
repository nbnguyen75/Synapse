'use client';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';

const toggleVariants = cva(
   "group/toggle inline-flex items-center justify-center gap-1 rounded-2xl text-sm font-medium whitespace-nowrap transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-pressed:bg-muted dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
   {
      variants: {
         size: {
            default:
               'h-8 min-w-8 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
            sm: 'h-7 min-w-7 px-2.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5',
            lg: 'h-9 min-w-9 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
         },
         variant: {
            outline: 'border border-input bg-transparent hover:bg-muted',
            default: 'bg-transparent',
         },
      },
      defaultVariants: {
         variant: 'default',
         size: 'default',
      },
   },
);

function Toggle({
   variant = 'default',
   size = 'default',
   className,
   ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
   return (
      <TogglePrimitive
         data-slot="toggle"
         className={cn(toggleVariants({ className, variant, size }))}
         {...props}
      />
   );
}

export { Toggle, toggleVariants };
