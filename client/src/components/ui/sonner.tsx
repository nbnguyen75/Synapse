'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useTheme } from 'next-themes';

import {
   CircleCheckIcon,
   InfoIcon,
   TriangleAlertIcon,
   OctagonXIcon,
   Loader2Icon,
} from 'lucide-react';

const Toaster = ({ ...props }: ToasterProps) => {
   const { theme = 'system' } = useTheme();

   return (
      <Sonner
         theme={theme as ToasterProps['theme']}
         className="toaster group"
         icons={{
            loading: <Loader2Icon className="size-4 animate-spin" />,
            warning: <TriangleAlertIcon className="size-4" />,
            success: <CircleCheckIcon className="size-4" />,
            error: <OctagonXIcon className="size-4" />,
            info: <InfoIcon className="size-4" />,
         }}
         style={
            {
               '--normal-text': 'var(--popover-foreground)',
               '--normal-border': 'var(--border)',
               '--border-radius': 'var(--radius)',
               '--normal-bg': 'var(--popover)',
            } as React.CSSProperties
         }
         toastOptions={{
            classNames: {
               toast: 'cn-toast',
            },
         }}
         {...props}
      />
   );
};

export { Toaster };
