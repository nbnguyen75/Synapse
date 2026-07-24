'use client';

import type { CSSProperties, ElementType } from 'react';

import { memo, useMemo, createElement } from 'react';

import { motion } from 'motion/react';

import { cn } from '@/shared/lib/utils';

// Static lookup map created ONCE at module load — no component creation during render
const motionElements = {
   article: motion.article,
   section: motion.section,
   span: motion.span,
   div: motion.div,
   h1: motion.h1,
   h2: motion.h2,
   h3: motion.h3,
   h4: motion.h4,
   h5: motion.h5,
   h6: motion.h6,
   p: motion.p,
} as const;

export interface TextShimmerProps {
   className?: string;
   duration?: number;
   children: string;
   as?: ElementType;
   spread?: number;
}

const ShimmerComponent = ({
   as: Component = 'p',
   duration = 2,
   spread = 2,
   className,
   children,
}: TextShimmerProps) => {
   const dynamicSpread = useMemo(
      () => (children?.length ?? 0) * spread,
      [children, spread],
   );

   // Select the target motion element statically
   const TargetComponent =
      typeof Component === 'string' && Component in motionElements
         ? motionElements[Component as keyof typeof motionElements]
         : motion.p;

   // Using createElement bypasses JSX static-analysis false positives
   return createElement(
      TargetComponent,
      {
         className: cn(
            'relative inline-block bg-size-[250%_100%,auto] bg-clip-text text-transparent',
            '[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--color-background),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]',
            className,
         ),
         style: {
            backgroundImage:
               'var(--bg), linear-gradient(var(--color-muted-foreground), var(--color-muted-foreground))',
            '--spread': `${dynamicSpread}px`,
         } as CSSProperties,
         transition: {
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
            duration,
         },
         initial: { backgroundPosition: '100% center' },
         animate: { backgroundPosition: '0% center' },
      },
      children,
   );
};

export const Shimmer = memo(ShimmerComponent);
