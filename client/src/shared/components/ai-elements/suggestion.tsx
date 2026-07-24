'use client';

import type { ComponentProps } from 'react';

import { useCallback } from 'react';

import { cn } from '@/shared/lib/utils';

import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';
import { Button } from '@/shared/components/ui/button';

export type SuggestionsProps = ComponentProps<typeof ScrollArea>;

export const Suggestions = ({
   className,
   children,
   ...props
}: SuggestionsProps) => (
   <ScrollArea className="w-full overflow-x-auto whitespace-nowrap" {...props}>
      <div
         className={cn('flex w-max flex-nowrap items-center gap-2', className)}
      >
         {children}
      </div>
      <ScrollBar className="hidden" orientation="horizontal" />
   </ScrollArea>
);

export type SuggestionProps = Omit<ComponentProps<typeof Button>, 'onClick'> & {
   onClick?: (suggestion: string) => void;
   suggestion: string;
};

export const Suggestion = ({
   variant = 'outline',
   size = 'sm',
   suggestion,
   className,
   children,
   onClick,
   ...props
}: SuggestionProps) => {
   const handleClick = useCallback(() => {
      onClick?.(suggestion);
   }, [onClick, suggestion]);

   return (
      <Button
         className={cn('cursor-pointer rounded-full px-4', className)}
         onClick={handleClick}
         size={size}
         type="button"
         variant={variant}
         {...props}
      >
         {children || suggestion}
      </Button>
   );
};
