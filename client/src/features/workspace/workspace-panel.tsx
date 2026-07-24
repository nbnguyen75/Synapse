import type { ChatMessage } from '@/shared/lib/chat';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { toast } from 'sonner';

import { sendChatMessage } from '@/shared/lib/chat';

import { Button } from '@/shared/components/ui/button';

import {
   Activity,
   Bot,
   Check,
   Copy,
   ExternalLink,
   FileText,
   Hourglass,
   Pause,
   Play,
   RotateCcw,
   Send,
   Trash2,
   X,
} from 'lucide-react';

import { m } from '@/paraglide/messages';

const TIMER_DURATIONS = {
   work: 25 * 60,
   short: 5 * 60,
   long: 15 * 60,
} as const;
type TimerMode = keyof typeof TIMER_DURATIONS;

function formatTime(seconds: number) {
   const m = Math.floor(seconds / 60);
   const s = seconds % 60;
   return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

interface WorkspacePanelProps {
   onToggle: () => void;
   isOpen: boolean;
}

export function WorkspacePanel({ onToggle, isOpen }: WorkspacePanelProps) {
   const [width, setWidth] = useState(() => {
      const saved = localStorage.getItem('synapse_right_sidebar_width');
      return saved ? parseInt(saved, 10) : 320;
   });
   const [isResizing, setIsResizing] = useState(false);
   const [activeTab, setActiveTab] = useState<
      'scratchpad' | 'timer' | 'stats' | 'copilot'
   >('scratchpad');

   useEffect(() => {
      localStorage.setItem('synapse_right_sidebar_width', String(width));
   }, [width]);
   useEffect(() => {
      localStorage.setItem('synapse_right_sidebar_open', String(isOpen));
   }, [isOpen]);

   useEffect(() => {
      if (isResizing) {
         document.body.classList.add('select-none');
         document.body.style.cursor = 'col-resize';
      } else {
         document.body.classList.remove('select-none');
         document.body.style.cursor = '';
      }
      return () => {
         document.body.classList.remove('select-none');
         document.body.style.cursor = '';
      };
   }, [isResizing]);

   const startResizing = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
   }, []);

   useEffect(() => {
      const onMove = (e: MouseEvent) => {
         if (!isResizing) return;
         const newWidth = window.innerWidth - e.clientX;
         if (newWidth >= 240 && newWidth <= 520) {
            setWidth(newWidth);
         } else if (newWidth < 200) {
            onToggle();
            setIsResizing(false);
         }
      };
      const onUp = () => setIsResizing(false);
      if (isResizing) {
         document.addEventListener('mousemove', onMove);
         document.addEventListener('mouseup', onUp);
      }
      return () => {
         document.removeEventListener('mousemove', onMove);
         document.removeEventListener('mouseup', onUp);
      };
   }, [isResizing]);

   const tabs = [
      {
         label: m.workspace_tab_scratchpad(),
         id: 'scratchpad' as const,
         icon: FileText,
      },
      { label: m.workspace_tab_focus(), id: 'timer' as const, icon: Hourglass },
      { label: m.workspace_tab_stats(), id: 'stats' as const, icon: Activity },
      { label: m.workspace_tab_copilot(), id: 'copilot' as const, icon: Bot },
   ];

   return (
      <>
         {isOpen && (
            <div
               onMouseDown={startResizing}
               onDoubleClick={() => setWidth(320)}
               className={`w-1 cursor-col-resize hover:bg-violet-500/50 active:bg-violet-600 h-full shrink-0 relative group z-20 hidden md:block ${
                  isResizing
                     ? 'bg-violet-600'
                     : 'bg-neutral-200 dark:bg-neutral-800'
               }`}
            >
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0D0D0D] shadow-xs group-hover:scale-110 transition-transform pointer-events-none">
                  <div className="w-[1.5px] h-3 bg-neutral-400 dark:bg-neutral-600 rounded-xs" />
               </div>
            </div>
         )}

         <aside
            style={{ width: isOpen ? `${width}px` : '0px' }}
            className={`h-full hidden md:flex flex-col border-l border-neutral-200/60 bg-white dark:border-neutral-900/80 dark:bg-[#0A0A0A] shrink-0 relative overflow-hidden ${
               isResizing
                  ? 'select-none pointer-events-none transition-none'
                  : 'transition-[width] duration-200'
            }`}
         >
            <div className="flex h-12 items-center justify-between px-4 border-b border-neutral-150 dark:border-neutral-900/60 shrink-0">
               <span className="font-semibold text-xs tracking-tight text-neutral-800 dark:text-neutral-200 uppercase">
                  Workspace Panel
               </span>
               <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={onToggle}
                  className="h-7 w-7 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300 cursor-pointer"
               >
                  <X className="size-4" />
               </Button>
            </div>

            <div className="flex overflow-x-auto scrollbar-none border-b border-neutral-150 dark:border-neutral-900/40 p-1 bg-neutral-50/50 dark:bg-neutral-950/40 shrink-0 gap-1">
               {tabs.map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                     <Button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        variant="ghost"
                        className={`flex-1 min-w-fit whitespace-nowrap px-3 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-medium rounded-md transition-all cursor-pointer h-auto hover:bg-transparent ${
                           isActive
                              ? 'bg-white hover:bg-white dark:bg-[#121212] dark:hover:bg-[#121212] text-violet-600 dark:text-violet-400 shadow-xs'
                              : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                        }`}
                     >
                        <Icon className="size-3.5" />
                        <span>{t.label}</span>
                     </Button>
                  );
               })}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-none p-4 space-y-4">
               {activeTab === 'scratchpad' && <ScratchpadTab />}
               {activeTab === 'timer' && <TimerTab />}
               {activeTab === 'stats' && <StatsTab />}
               {activeTab === 'copilot' && <SidebarCopilotTab />}
            </div>
         </aside>
      </>
   );
}

function ScratchpadTab() {
   const [text, setText] = useState(
      () => localStorage.getItem('synapse_scratchpad') || '',
   );
   const [copied, setCopied] = useState(false);

   useEffect(() => {
      localStorage.setItem('synapse_scratchpad', text);
   }, [text]);

   const handleCopy = () => {
      if (!text) return;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   const handleExport = () => {
      if (!text.trim()) return;
      window.dispatchEvent(
         new CustomEvent('open-new-note-modal', {
            detail: { title: 'Scratchpad Export', content: text },
         }),
      );
   };

   return (
      <div className="space-y-3 h-full flex flex-col">
         <div className="flex items-center justify-between shrink-0">
            <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
               {m.workspace_scratchpad_header()}
            </span>
            <div className="flex items-center gap-1.5">
               <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleCopy}
                  className="h-7 w-7 rounded-md text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300 cursor-pointer"
                  title={m.workspace_copy()}
               >
                  {copied ? (
                     <Check className="size-3.5 text-green-500" />
                  ) : (
                     <Copy className="size-3.5" />
                  )}
               </Button>
               <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => {
                     if (text && window.confirm(m.workspace_clear_confirm()))
                        setText('');
                  }}
                  className="h-7 w-7 rounded-md text-neutral-400 hover:text-red-600 dark:text-neutral-500 dark:hover:text-red-400 cursor-pointer"
                  title={m.workspace_clear()}
               >
                  <Trash2 className="size-3.5" />
               </Button>
            </div>
         </div>

         <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={m.workspace_scratchpad_placeholder()}
            className="flex-1 min-h-45 w-full p-3 text-xs bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-900 rounded-lg outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder-neutral-400 dark:placeholder-neutral-500 font-sans resize-none leading-relaxed transition-all"
         />

         <Button
            onClick={handleExport}
            disabled={!text.trim()}
            className="w-full h-8.5 text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-600 dark:hover:bg-violet-700 rounded-lg gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
         >
            <ExternalLink className="size-3.5" />
            <span>{m.workspace_save_as_note()}</span>
         </Button>
      </div>
   );
}

function TimerTab() {
   const [mode, setMode] = useState<TimerMode>('work');
   const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS.work);
   const [running, setRunning] = useState(false);

   useEffect(() => {
      let id: ReturnType<typeof setInterval> | null = null;
      if (running) {
         id = setInterval(() => {
            setTimeLeft((prev) => {
               if (prev <= 1) {
                  setRunning(false);
                  try {
                     const ctx = new (
                        window.AudioContext || window.webkitAudioContext
                     )();
                     const osc = ctx.createOscillator();
                     const gain = ctx.createGain();
                     osc.type = 'sine';
                     osc.frequency.setValueAtTime(880, ctx.currentTime);
                     gain.gain.setValueAtTime(0.08, ctx.currentTime);
                     osc.connect(gain);
                     gain.connect(ctx.destination);
                     osc.start();
                     osc.stop(ctx.currentTime + 0.35);
                  } catch {}
                  return 0;
               }
               return prev - 1;
            });
         }, 1000);
      }
      return () => {
         if (id) clearInterval(id);
      };
   }, [running]);

   const changeMode = (m: TimerMode) => {
      setMode(m);
      setRunning(false);
      setTimeLeft(TIMER_DURATIONS[m]);
   };

   const total = TIMER_DURATIONS[mode];
   const radius = 72;
   const circumference = 2 * Math.PI * radius;
   const offset = circumference * (1 - timeLeft / total);

   return (
      <div className="space-y-5 flex flex-col items-center justify-center py-4">
         <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-lg w-full">
            {(['work', 'short', 'long'] as const).map((m) => (
               <Button
                  key={m}
                  onClick={() => changeMode(m)}
                  variant="ghost"
                  className={`flex-1 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer uppercase tracking-wider h-auto hover:bg-transparent ${
                     mode === m
                        ? 'bg-white hover:bg-white dark:bg-[#1E1E1E] dark:hover:bg-[#1E1E1E] text-violet-600 dark:text-violet-400 shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                  }`}
               >
                  {m === 'work'
                     ? 'Focus'
                     : m === 'short'
                       ? 'Short Break'
                       : 'Long Break'}
               </Button>
            ))}
         </div>

         <div className="relative flex items-center justify-center w-40 h-40">
            <svg className="absolute w-full h-full -rotate-90">
               <circle
                  cx="80"
                  cy="80"
                  r="72"
                  className="stroke-neutral-100 dark:stroke-neutral-900 fill-none"
                  strokeWidth="5"
               />
               <circle
                  cx="80"
                  cy="80"
                  r="72"
                  className="stroke-violet-500 dark:stroke-violet-500 fill-none transition-all duration-300"
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
               />
            </svg>
            <div className="text-center z-10 space-y-1">
               <div className="text-3xl font-bold font-mono tracking-tight text-neutral-800 dark:text-neutral-100">
                  {formatTime(timeLeft)}
               </div>
               <div className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                  {running ? 'Running' : 'Paused'}
               </div>
            </div>
         </div>

         <div className="flex gap-2.5 w-full max-w-50">
            <Button
               onClick={() => setRunning(!running)}
               className={`flex-1 h-9 text-xs rounded-lg font-semibold cursor-pointer gap-1.5 ${
                  running
                     ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200'
                     : 'bg-violet-600 hover:bg-violet-700 text-white'
               }`}
            >
               {running ? (
                  <>
                     <Pause className="size-3.5 fill-current" />
                     <span>Pause</span>
                  </>
               ) : (
                  <>
                     <Play className="size-3.5 fill-current" />
                     <span>Start</span>
                  </>
               )}
            </Button>
            <Button
               variant="outline"
               onClick={() => changeMode(mode)}
               className="h-9 w-9 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-500 cursor-pointer p-0 shrink-0"
               title="Reset"
            >
               <RotateCcw className="size-3.5" />
            </Button>
         </div>

         <div className="text-center px-2">
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 italic leading-relaxed">
               &ldquo;Focus for 25 minutes, enjoy 5 minutes of full
               relaxation.&rdquo;
            </p>
         </div>
      </div>
   );
}

function StatsTab() {
   const text =
      typeof window !== 'undefined'
         ? localStorage.getItem('synapse_scratchpad') || ''
         : '';

   const stats = useMemo(() => {
      const t = text.trim();
      return {
         readingTime: Math.max(
            1,
            Math.ceil((t ? t.split(/\s+/).filter(Boolean).length : 0) / 200),
         ),
         sentences: t
            ? t.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
            : 0,
         words: t ? t.split(/\s+/).filter(Boolean).length : 0,
         chars: t.length,
      };
   }, [text]);

   return (
      <div className="space-y-4">
         <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
            Scratchpad Analysis
         </span>

         <div className="grid grid-cols-2 gap-2.5">
            {[
               { label: m.workspace_stat_words(), value: stats.words },
               { label: m.workspace_stat_characters(), value: stats.chars },
               { label: m.workspace_stat_sentences(), value: stats.sentences },
               {
                  label: m.workspace_stat_read_time(),
                  value: `~${stats.readingTime}m`,
               },
            ].map((s) => (
               <div
                  key={s.label}
                  className="bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200/50 dark:border-neutral-900 rounded-lg p-3 text-center space-y-1"
               >
                  <div className="text-lg font-bold text-violet-600 dark:text-violet-400 font-mono">
                     {s.value}
                  </div>
                  <div className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                     {s.label}
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}

function SidebarCopilotTab() {
   const [copilotName, setCopilotName] = useState('Assistant');
   const [messages, setMessages] = useState<ChatMessage[]>(() => {
      const history = localStorage.getItem('synapse_sidebar_chat_history');
      if (history) {
         try {
            return JSON.parse(history) as ChatMessage[];
         } catch {}
      }
      return [
         {
            text: 'Hello! I am your workspace assistant.\n\nI can read and understand your notes. Ask me anything!',
            sender: 'ai' as const,
            timestamp: Date.now(),
            id: 'msg_welcome',
         },
      ];
   });
   const [input, setInput] = useState('');
   const [loading, setLoading] = useState(false);
   const endRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const update = () => {
         const saved = localStorage.getItem('synapse_copilot_config');
         if (saved) {
            try {
               const config = JSON.parse(saved) as { name?: string };
               setCopilotName(config.name || 'Assistant');
            } catch {}
         }
      };
      update();
      window.addEventListener('synapse-copilot-config-updated', update);
      return () =>
         window.removeEventListener('synapse-copilot-config-updated', update);
   }, []);

   useEffect(() => {
      localStorage.setItem(
         'synapse_sidebar_chat_history',
         JSON.stringify(messages),
      );
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [messages]);

   const handleSend = async () => {
      const text = input.trim();
      if (!text || loading) return;
      const userMsg: ChatMessage = {
         id: crypto.randomUUID(),
         timestamp: Date.now(),
         sender: 'user',
         text,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);
      try {
         const response = await sendChatMessage(text);
         setMessages((prev) => [...prev, response]);
      } catch {
         toast.error(m.workspace_send_failed());
         setMessages((prev) => [
            ...prev,
            {
               text: 'Sorry, I encountered an issue. Please try again.',
               id: crypto.randomUUID(),
               timestamp: Date.now(),
               sender: 'ai',
            },
         ]);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="flex flex-col h-full overflow-hidden space-y-3">
         <div className="flex items-center justify-between shrink-0">
            <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
               {copilotName}
            </span>
            <Button
               variant="ghost"
               size="icon-xs"
               onClick={() => {
                  if (window.confirm(m.workspace_clear_chat_confirm())) {
                     setMessages([
                        {
                           text: 'Hello! I am your workspace assistant. Ask me anything!',
                           timestamp: Date.now(),
                           id: 'msg_welcome',
                           sender: 'ai',
                        },
                     ]);
                  }
               }}
               className="h-7 w-7 rounded-md text-neutral-400 hover:text-red-600 dark:text-neutral-500 dark:hover:text-red-400 cursor-pointer"
               title={m.workspace_clear_chat()}
            >
               <Trash2 className="size-3.5" />
            </Button>
         </div>

         <div className="flex-1 overflow-y-auto scrollbar-none space-y-4 pr-1">
            {messages.map((msg) => (
               <div
                  key={msg.id}
                  className={`flex flex-col gap-1 text-xs ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
               >
                  <div
                     className={`max-w-[90%] p-2.5 rounded-lg leading-relaxed shadow-sm ${
                        msg.sender === 'user'
                           ? 'bg-violet-600 text-white rounded-tr-sm'
                           : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 rounded-tl-sm border border-neutral-200/50 dark:border-neutral-800'
                     }`}
                  >
                     {msg.text}
                  </div>
               </div>
            ))}
            {loading && (
               <div className="flex items-start">
                  <div className="max-w-[90%] p-2.5 rounded-lg rounded-tl-sm bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800">
                     <div className="flex gap-1 items-center h-4">
                        <span
                           className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce"
                           style={{ animationDelay: '0ms' }}
                        />
                        <span
                           className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce"
                           style={{ animationDelay: '150ms' }}
                        />
                        <span
                           className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce"
                           style={{ animationDelay: '300ms' }}
                        />
                     </div>
                  </div>
               </div>
            )}
            <div ref={endRef} />
         </div>

         <div className="shrink-0 relative mt-2">
            <textarea
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     handleSend();
                  }
               }}
               placeholder={m.workspace_chat_placeholder({ name: copilotName })}
               className="w-full p-2.5 pr-10 text-xs bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-900 rounded-lg outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder-neutral-400 dark:placeholder-neutral-500 font-sans resize-none transition-all h-18"
            />
            <Button
               size="icon-xs"
               onClick={handleSend}
               disabled={!input.trim() || loading}
               className="absolute right-2 bottom-2 h-6 w-6 rounded bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50"
            >
               <Send className="size-3" />
            </Button>
         </div>
      </div>
   );
}

export function RightSidebarToggle({
   onToggle,
   isOpen,
}: {
   onToggle: () => void;
   isOpen: boolean;
}) {
   return (
      <Button
         variant="ghost"
         size="icon-xs"
         onClick={onToggle}
         className={`h-8 w-8 cursor-pointer transition-all duration-200 hidden md:inline-flex ${
            isOpen
               ? 'text-violet-600 bg-violet-50/80 dark:text-violet-400 dark:bg-violet-950/30'
               : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-900'
         }`}
         title={isOpen ? m.workspace_toggle_close() : m.workspace_toggle_open()}
      >
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
         >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M15 3v18" />
         </svg>
      </Button>
   );
}
