'use client';

import type { CSSProperties, ElementType, JSX } from 'react';
import type { MotionProps } from 'motion/react';

import { memo, useMemo } from 'react';

import { motion } from 'motion/react';

import { cn } from '@/shared/lib/utils';

type MotionHTMLProps = MotionProps & Record<string, unknown>;

// Cache motion components at module level to avoid creating during render
const motionComponentCache = new Map<
   keyof JSX.IntrinsicElements,
   React.ComponentType<MotionHTMLProps>
>();

const getMotionComponent = (element: keyof JSX.IntrinsicElements) => {
   let component = motionComponentCache.get(element);
   if (!component) {
      component = motion.create(element);
      motionComponentCache.set(element, component);
   }
   return component;
};

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
   const MotionComponent = getMotionComponent(
      Component as keyof JSX.IntrinsicElements,
   );

   const dynamicSpread = useMemo(
      () => (children?.length ?? 0) * spread,
      [children, spread],
   );

   return (
      <MotionComponent
         animate={{ backgroundPosition: '0% center' }}
         className={cn(
            'relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent',
            '[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--color-background),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]',
            className,
         )}
         initial={{ backgroundPosition: '100% center' }}
         style={
            {
               backgroundImage:
                  'var(--bg), linear-gradient(var(--color-muted-foreground), var(--color-muted-foreground))',
               '--spread': `${dynamicSpread}px`,
            } as CSSProperties
         }
         transition={{
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
            duration,
         }}
      >
         {children}
      </MotionComponent>
   );
};

export const Shimmer = memo(ShimmerComponent);
