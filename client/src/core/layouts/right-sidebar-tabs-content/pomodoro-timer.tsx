import { useState } from 'react';

import { formatTime } from 'media-chrome/dist/utils/time.js';

import { Button } from '@/shared/components/ui/button';

import { PauseIcon, PlayIcon, RotateCcwIcon } from 'lucide-react';

export default function PomodoroTimer() {
   const [timerMode, setTimerMode] = useState<'work' | 'short' | 'long'>(
      'work',
   );
   const [timeLeft, setTimeLeft] = useState(25 * 60);
   const [timerRunning, setTimerRunning] = useState(false);

   const changeTimerMode = (mode: 'work' | 'short' | 'long') => {
      setTimerMode(mode);
      setTimerRunning(false);
      if (mode === 'work') setTimeLeft(25 * 60);
      else if (mode === 'short') setTimeLeft(5 * 60);
      else if (mode === 'long') setTimeLeft(15 * 60);
   };

   return (
      <div className="space-y-4 flex flex-col items-center justify-center py-2">
         <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-lg w-full">
            {(['work', 'short', 'long'] as const).map((m) => (
               <Button
                  key={m}
                  onClick={() => changeTimerMode(m)}
                  variant="ghost"
                  className={`flex-1 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer uppercase tracking-wider h-7 ${
                     timerMode === m
                        ? 'bg-white dark:bg-[#1E1E1E] text-violet-600 dark:text-violet-400 shadow-xs'
                        : 'text-neutral-500 hover:text-foreground'
                  }`}
               >
                  {m === 'work'
                     ? 'Focus'
                     : m === 'short'
                       ? 'short break'
                       : 'long break'}
               </Button>
            ))}
         </div>

         <div className="relative flex items-center justify-center w-36 h-36">
            <svg className="absolute w-full h-full -rotate-90">
               <circle
                  cx="72"
                  cy="72"
                  r="64"
                  className="stroke-neutral-100 dark:stroke-neutral-900 fill-none"
                  strokeWidth="5"
               />
               <circle
                  cx="72"
                  cy="72"
                  r="64"
                  className="stroke-violet-500 fill-none transition-all duration-300"
                  strokeWidth="5"
                  strokeDasharray={2 * Math.PI * 64}
                  strokeDashoffset={
                     2 *
                     Math.PI *
                     64 *
                     (1 -
                        timeLeft /
                           (timerMode === 'work'
                              ? 25 * 60
                              : timerMode === 'short'
                                ? 5 * 60
                                : 15 * 60))
                  }
                  strokeLinecap="round"
               />
            </svg>

            <div className="text-center z-10 space-y-0.5">
               <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
                  {formatTime(timeLeft)}
               </div>
               <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  {timerRunning ? 'Running' : 'Stopped'}
               </div>
            </div>
         </div>

         <div className="flex gap-2 w-full max-w-50">
            <Button
               onClick={() => setTimerRunning(!timerRunning)}
               className={`flex-1 h-8 text-xs rounded-lg font-semibold cursor-pointer gap-1.5 ${
                  timerRunning
                     ? 'bg-neutral-100 hover:bg-neutral-200 text-foreground dark:bg-neutral-900 dark:hover:bg-neutral-800'
                     : 'bg-violet-600 hover:bg-violet-700 text-white'
               }`}
            >
               {timerRunning ? (
                  <>
                     <PauseIcon className="h-3.5 w-3.5 fill-current" />
                     <span>Pause</span>
                  </>
               ) : (
                  <>
                     <PlayIcon className="h-3.5 w-3.5 fill-current" />
                     <span>Play</span>
                  </>
               )}
            </Button>
            <Button
               variant="outline"
               onClick={() => changeTimerMode(timerMode)}
               className="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:text-foreground cursor-pointer p-0 shrink-0"
               title="Reset timer"
            >
               <RotateCcwIcon className="h-3.5 w-3.5" />
            </Button>
         </div>
      </div>
   );
}
