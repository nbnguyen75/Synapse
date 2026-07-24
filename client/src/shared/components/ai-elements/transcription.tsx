'use client';

import type { Experimental_TranscriptionResult as TranscriptionResult } from 'ai';
import type { ComponentProps, ReactNode } from 'react';

import { createContext, useCallback, useContext, useMemo } from 'react';

import { cn } from '@/shared/lib/utils';

import { useControllableState } from '@radix-ui/react-use-controllable-state';

type TranscriptionSegment = TranscriptionResult['segments'][number];

interface TranscriptionContextValue {
   onTimeUpdate: (time: number) => void;
   segments: TranscriptionSegment[];
   onSeek?: (time: number) => void;
   currentTime: number;
}

const TranscriptionContext = createContext<TranscriptionContextValue | null>(
   null,
);

const useTranscription = () => {
   const context = useContext(TranscriptionContext);
   if (!context) {
      throw new Error(
         'Transcription components must be used within Transcription',
      );
   }
   return context;
};

export type TranscriptionProps = Omit<ComponentProps<'div'>, 'children'> & {
   children: (segment: TranscriptionSegment, index: number) => ReactNode;
   segments: TranscriptionSegment[];
   onSeek?: (time: number) => void;
   currentTime?: number;
};

export const Transcription = ({
   currentTime: externalCurrentTime,
   className,
   segments,
   children,
   onSeek,
   ...props
}: TranscriptionProps) => {
   const [currentTime, setCurrentTime] = useControllableState({
      prop: externalCurrentTime,
      onChange: onSeek,
      defaultProp: 0,
   });

   const contextValue = useMemo(
      () => ({ onTimeUpdate: setCurrentTime, currentTime, segments, onSeek }),
      [currentTime, onSeek, setCurrentTime, segments],
   );

   return (
      <TranscriptionContext.Provider value={contextValue}>
         <div
            className={cn(
               'flex flex-wrap gap-1 text-sm leading-relaxed',
               className,
            )}
            data-slot="transcription"
            {...props}
         >
            {segments
               .filter((segment) => segment.text.trim())
               .map((segment, index) => children(segment, index))}
         </div>
      </TranscriptionContext.Provider>
   );
};

export type TranscriptionSegmentProps = ComponentProps<'button'> & {
   segment: TranscriptionSegment;
   index: number;
};

export const TranscriptionSegment = ({
   className,
   segment,
   onClick,
   index,
   ...props
}: TranscriptionSegmentProps) => {
   const { currentTime, onSeek } = useTranscription();

   const isActive =
      currentTime >= segment.startSecond && currentTime < segment.endSecond;
   const isPast = currentTime >= segment.endSecond;

   const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
         if (onSeek) {
            onSeek(segment.startSecond);
         }
         onClick?.(event);
      },
      [onSeek, segment.startSecond, onClick],
   );

   return (
      <button
         className={cn(
            'inline text-left',
            isActive && 'text-primary',
            isPast && 'text-muted-foreground',
            !(isActive || isPast) && 'text-muted-foreground/60',
            onSeek && 'cursor-pointer hover:text-foreground',
            !onSeek && 'cursor-default',
            className,
         )}
         data-active={isActive}
         data-index={index}
         data-slot="transcription-segment"
         onClick={handleClick}
         type="button"
         {...props}
      >
         {segment.text}
      </button>
   );
};
