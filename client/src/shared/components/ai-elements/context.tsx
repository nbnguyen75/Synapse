'use client';

import type { LanguageModelUsage } from 'ai';
import type { ComponentProps } from 'react';

import { createContext, useContext, useMemo } from 'react';

import { getUsage } from 'tokenlens';

import { cn } from '@/shared/lib/utils';

import {
   HoverCard,
   HoverCardContent,
   HoverCardTrigger,
} from '@/shared/components/ui/hover-card';
import { Progress } from '@/shared/components/ui/progress';
import { Button } from '@/shared/components/ui/button';

const PERCENT_MAX = 100;
const ICON_RADIUS = 10;
const ICON_VIEWBOX = 24;
const ICON_CENTER = 12;
const ICON_STROKE_WIDTH = 2;

type ModelId = string;

interface ContextSchema {
   usage?: LanguageModelUsage;
   usedTokens: number;
   maxTokens: number;
   modelId?: ModelId;
}

const ContextContext = createContext<ContextSchema | null>(null);

const useContextValue = () => {
   const context = useContext(ContextContext);

   if (!context) {
      throw new Error('Context components must be used within Context');
   }

   return context;
};

export type ContextProps = ComponentProps<typeof HoverCard> & ContextSchema;

export const Context = ({
   usedTokens,
   maxTokens,
   modelId,
   usage,
   ...props
}: ContextProps) => {
   const contextValue = useMemo(
      () => ({ usedTokens, maxTokens, modelId, usage }),
      [maxTokens, modelId, usage, usedTokens],
   );

   return (
      <ContextContext.Provider value={contextValue}>
         <HoverCard closeDelay={0} openDelay={0} {...props} />
      </ContextContext.Provider>
   );
};

const ContextIcon = () => {
   const { usedTokens, maxTokens } = useContextValue();
   const circumference = 2 * Math.PI * ICON_RADIUS;
   const usedPercent = usedTokens / maxTokens;
   const dashOffset = circumference * (1 - usedPercent);

   return (
      <svg
         aria-label="Model context usage"
         height="20"
         role="img"
         style={{ color: 'currentcolor' }}
         viewBox={`0 0 ${ICON_VIEWBOX} ${ICON_VIEWBOX}`}
         width="20"
      >
         <circle
            cx={ICON_CENTER}
            cy={ICON_CENTER}
            fill="none"
            opacity="0.25"
            r={ICON_RADIUS}
            stroke="currentColor"
            strokeWidth={ICON_STROKE_WIDTH}
         />
         <circle
            cx={ICON_CENTER}
            cy={ICON_CENTER}
            fill="none"
            opacity="0.7"
            r={ICON_RADIUS}
            stroke="currentColor"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            strokeWidth={ICON_STROKE_WIDTH}
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
         />
      </svg>
   );
};

export type ContextTriggerProps = ComponentProps<typeof Button>;

export const ContextTrigger = ({ children, ...props }: ContextTriggerProps) => {
   const { usedTokens, maxTokens } = useContextValue();
   const usedPercent = usedTokens / maxTokens;
   const renderedPercent = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 1,
      style: 'percent',
   }).format(usedPercent);

   return (
      <HoverCardTrigger>
         {children ?? (
            <Button type="button" variant="ghost" {...props}>
               <span className="font-medium text-muted-foreground">
                  {renderedPercent}
               </span>
               <ContextIcon />
            </Button>
         )}
      </HoverCardTrigger>
   );
};

export type ContextContentProps = ComponentProps<typeof HoverCardContent>;

export const ContextContent = ({
   className,
   ...props
}: ContextContentProps) => (
   <HoverCardContent
      className={cn('min-w-60 divide-y overflow-hidden p-0', className)}
      {...props}
   />
);

export type ContextContentHeaderProps = ComponentProps<'div'>;

export const ContextContentHeader = ({
   className,
   children,
   ...props
}: ContextContentHeaderProps) => {
   const { usedTokens, maxTokens } = useContextValue();
   const usedPercent = usedTokens / maxTokens;
   const displayPct = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 1,
      style: 'percent',
   }).format(usedPercent);
   const used = new Intl.NumberFormat('en-US', {
      notation: 'compact',
   }).format(usedTokens);
   const total = new Intl.NumberFormat('en-US', {
      notation: 'compact',
   }).format(maxTokens);

   return (
      <div className={cn('w-full space-y-2 p-3', className)} {...props}>
         {children ?? (
            <>
               <div className="flex items-center justify-between gap-3 text-xs">
                  <p>{displayPct}</p>
                  <p className="font-mono text-muted-foreground">
                     {used} / {total}
                  </p>
               </div>
               <div className="space-y-2">
                  <Progress
                     className="bg-muted"
                     value={usedPercent * PERCENT_MAX}
                  />
               </div>
            </>
         )}
      </div>
   );
};

export type ContextContentBodyProps = ComponentProps<'div'>;

export const ContextContentBody = ({
   className,
   children,
   ...props
}: ContextContentBodyProps) => (
   <div className={cn('w-full p-3', className)} {...props}>
      {children}
   </div>
);

export type ContextContentFooterProps = ComponentProps<'div'>;

export const ContextContentFooter = ({
   className,
   children,
   ...props
}: ContextContentFooterProps) => {
   const { modelId, usage } = useContextValue();
   const costUSD = modelId
      ? getUsage({
           usage: {
              output: usage?.outputTokens ?? 0,
              input: usage?.inputTokens ?? 0,
           },
           modelId,
        }).costUSD?.totalUSD
      : undefined;
   const totalCost = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
   }).format(costUSD ?? 0);

   return (
      <div
         className={cn(
            'flex w-full items-center justify-between gap-3 bg-secondary p-3 text-xs',
            className,
         )}
         {...props}
      >
         {children ?? (
            <>
               <span className="text-muted-foreground">Total cost</span>
               <span>{totalCost}</span>
            </>
         )}
      </div>
   );
};

const TokensWithCost = ({
   costText,
   tokens,
}: {
   costText?: string;
   tokens?: number;
}) => (
   <span>
      {tokens === undefined
         ? '—'
         : new Intl.NumberFormat('en-US', {
              notation: 'compact',
           }).format(tokens)}
      {costText ? (
         <span className="ml-2 text-muted-foreground">• {costText}</span>
      ) : null}
   </span>
);

export type ContextInputUsageProps = ComponentProps<'div'>;

export const ContextInputUsage = ({
   className,
   children,
   ...props
}: ContextInputUsageProps) => {
   const { modelId, usage } = useContextValue();
   const inputTokens = usage?.inputTokens ?? 0;

   if (children) {
      return children;
   }

   if (!inputTokens) {
      return null;
   }

   const inputCost = modelId
      ? getUsage({
           usage: { input: inputTokens, output: 0 },
           modelId,
        }).costUSD?.totalUSD
      : undefined;
   const inputCostText = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
   }).format(inputCost ?? 0);

   return (
      <div
         className={cn('flex items-center justify-between text-xs', className)}
         {...props}
      >
         <span className="text-muted-foreground">Input</span>
         <TokensWithCost costText={inputCostText} tokens={inputTokens} />
      </div>
   );
};

export type ContextOutputUsageProps = ComponentProps<'div'>;

export const ContextOutputUsage = ({
   className,
   children,
   ...props
}: ContextOutputUsageProps) => {
   const { modelId, usage } = useContextValue();
   const outputTokens = usage?.outputTokens ?? 0;

   if (children) {
      return children;
   }

   if (!outputTokens) {
      return null;
   }

   const outputCost = modelId
      ? getUsage({
           usage: { output: outputTokens, input: 0 },
           modelId,
        }).costUSD?.totalUSD
      : undefined;
   const outputCostText = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
   }).format(outputCost ?? 0);

   return (
      <div
         className={cn('flex items-center justify-between text-xs', className)}
         {...props}
      >
         <span className="text-muted-foreground">Output</span>
         <TokensWithCost costText={outputCostText} tokens={outputTokens} />
      </div>
   );
};

export type ContextReasoningUsageProps = ComponentProps<'div'>;

export const ContextReasoningUsage = ({
   className,
   children,
   ...props
}: ContextReasoningUsageProps) => {
   const { modelId, usage } = useContextValue();
   const reasoningTokens = usage?.reasoningTokens ?? 0;

   if (children) {
      return children;
   }

   if (!reasoningTokens) {
      return null;
   }

   const reasoningCost = modelId
      ? getUsage({
           usage: { reasoningTokens },
           modelId,
        }).costUSD?.totalUSD
      : undefined;
   const reasoningCostText = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
   }).format(reasoningCost ?? 0);

   return (
      <div
         className={cn('flex items-center justify-between text-xs', className)}
         {...props}
      >
         <span className="text-muted-foreground">Reasoning</span>
         <TokensWithCost
            costText={reasoningCostText}
            tokens={reasoningTokens}
         />
      </div>
   );
};

export type ContextCacheUsageProps = ComponentProps<'div'>;

export const ContextCacheUsage = ({
   className,
   children,
   ...props
}: ContextCacheUsageProps) => {
   const { modelId, usage } = useContextValue();
   const cacheTokens = usage?.cachedInputTokens ?? 0;

   if (children) {
      return children;
   }

   if (!cacheTokens) {
      return null;
   }

   const cacheCost = modelId
      ? getUsage({
           usage: { cacheReads: cacheTokens, output: 0, input: 0 },
           modelId,
        }).costUSD?.totalUSD
      : undefined;
   const cacheCostText = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
   }).format(cacheCost ?? 0);

   return (
      <div
         className={cn('flex items-center justify-between text-xs', className)}
         {...props}
      >
         <span className="text-muted-foreground">Cache</span>
         <TokensWithCost costText={cacheCostText} tokens={cacheTokens} />
      </div>
   );
};
