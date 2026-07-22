import type { Note } from '@/features/notes/types';

import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';

import { toast } from 'sonner';

import {
   sendChatMessage,
   loadChatHistory,
   saveChatHistory,
   clearChatHistory,
   type ChatMessage,
} from '@/shared/lib/chat';
import { loadCopilotConfig } from '@/shared/lib/copilot-config';
import { createTitle } from '@/shared/lib/metadata';

import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
} from '@/shared/components/ui/dialog';
import { Spinner } from '@/shared/components/ui/spinner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

import { MessageSquare, Send, Trash2, Bot, User } from 'lucide-react';

import { m } from '@/paraglide/messages';

export const Route = createFileRoute('/_app/chat')({
   head: () => ({
      meta: [{ title: createTitle(m.chat_page_title()) }],
   }),
   component: RouteComponent,
});

function renderMarkdown(text: string): string {
   return text
      .replace(
         /###\s+(.+)/g,
         '<h3 class="text-sm font-semibold mt-3 mb-1">$1</h3>',
      )
      .replace(
         /##\s+(.+)/g,
         '<h2 class="text-base font-semibold mt-3 mb-1">$1</h2>',
      )
      .replace(
         /#\s+(.+)/g,
         '<h1 class="text-lg font-semibold mt-3 mb-1">$1</h1>',
      )
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/- (.+)/g, '<li class="ml-4 list-disc text-sm">$1</li>')
      .replace(/\d+\.\s+(.+)/g, '<li class="ml-4 list-decimal text-sm">$1</li>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
}

function RouteComponent() {
   const config = loadCopilotConfig();
   const [question, setQuestion] = useState('');
   const [messages, setMessages] = useState<ChatMessage[]>(() =>
      loadChatHistory(),
   );
   const [selectedNote, setSelectedNote] = useState<Note | null>(null);
   const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
   const messagesEndRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [messages]);

   useEffect(() => {
      saveChatHistory(messages);
   }, [messages]);

   const chatMutation = useMutation({
      onError: () => {
         const errorMsg: ChatMessage = {
            text: 'I apologize, but I encountered an error processing your request. Please try again.',
            id: `msg_err_${Date.now()}`,
            timestamp: Date.now(),
            sender: 'ai',
         };
         setMessages((prev) => [...prev, errorMsg]);
         toast.error('Failed to get response');
      },
      onSuccess: (response) => {
         setMessages((prev) => [...prev, response]);
      },
      mutationFn: (q: string) => sendChatMessage(q),
   });

   function handleSend() {
      const q = question.trim();
      if (!q) return;
      setMessages((prev) => [
         ...prev,
         {
            id: crypto.randomUUID(),
            sender: 'user' as const,
            timestamp: Date.now(),
            text: q,
         },
      ]);
      setQuestion('');
      chatMutation.mutate(q);
   }

   function handleSuggested(q: string) {
      setMessages((prev) => [
         ...prev,
         {
            id: crypto.randomUUID(),
            sender: 'user' as const,
            timestamp: Date.now(),
            text: q,
         },
      ]);
      chatMutation.mutate(q);
   }

   function handleClear() {
      clearChatHistory();
      setMessages([]);
      toast.success('Chat cleared');
   }

   const suggestedQuestions = [
      m.chat_page_suggest_1(),
      m.chat_page_suggest_2(),
      m.chat_page_suggest_3(),
      m.chat_page_suggest_4(),
   ];

   return (
      <div className="flex h-full flex-col">
         <header className="flex items-center justify-between border-b px-6 py-3">
            <div className="flex items-center gap-3">
               <div className="flex size-8 items-center justify-center rounded-lg bg-violet-600 text-white">
                  <Bot className="size-4" />
               </div>
               <div>
                  <h1 className="text-sm font-semibold">{config.name}</h1>
                  <span className="text-[11px] text-muted-foreground">
                     RAG ENG
                  </span>
               </div>
            </div>
            <Button
               variant="ghost"
               size="icon-sm"
               onClick={handleClear}
               title={m.chat_page_clear()}
            >
               <Trash2 className="size-4" />
            </Button>
         </header>

         <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
               <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                     <MessageSquare className="size-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                     <h2 className="text-lg font-semibold">
                        {m.chat_page_welcome()}
                     </h2>
                     <p className="mt-1 text-sm text-muted-foreground max-w-md">
                        {m.chat_page_welcome_desc()}
                     </p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 max-w-lg">
                     {suggestedQuestions.map((q) => (
                        <Button
                           key={q}
                           variant="outline"
                           className="h-auto whitespace-normal text-left text-xs p-3"
                           onClick={() => handleSuggested(q)}
                        >
                           {q}
                        </Button>
                     ))}
                  </div>
               </div>
            ) : (
               <div className="mx-auto max-w-3xl space-y-4">
                  {messages.map((msg) => (
                     <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                     >
                        <div
                           className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                              msg.sender === 'user'
                                 ? 'bg-primary text-primary-foreground'
                                 : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                           }`}
                        >
                           {msg.sender === 'user' ? (
                              <User className="size-4" />
                           ) : (
                              <Bot className="size-4" />
                           )}
                        </div>
                        <div
                           className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                              msg.sender === 'user'
                                 ? 'bg-primary text-primary-foreground'
                                 : 'bg-muted'
                           }`}
                        >
                           <div
                              dangerouslySetInnerHTML={{
                                 __html: renderMarkdown(msg.text),
                              }}
                           />
                           {msg.sources && msg.sources.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5 border-t pt-2">
                                 <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                    {m.chat_page_sources()}:
                                 </span>
                                 {msg.sources.map((s) => (
                                    <span
                                       key={s}
                                       className="cursor-pointer rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground hover:bg-secondary/80"
                                       onClick={() => {
                                          setSelectedNote({ title: s } as Note);
                                          setIsNoteModalOpen(true);
                                       }}
                                    >
                                       {s}
                                    </span>
                                 ))}
                              </div>
                           )}
                        </div>
                     </div>
                  ))}
                  {chatMutation.isPending && (
                     <div className="flex gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                           <Bot className="size-4" />
                        </div>
                        <div className="rounded-xl bg-muted px-4 py-3">
                           <div className="flex gap-1">
                              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
                              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.1s]" />
                              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.2s]" />
                           </div>
                        </div>
                     </div>
                  )}
                  <div ref={messagesEndRef} />
               </div>
            )}
         </div>

         <div className="border-t p-4">
            <form
               onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
               }}
               className="mx-auto flex max-w-3xl gap-2"
            >
               <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={m.chat_page_input_placeholder()}
                  className="flex-1"
                  disabled={chatMutation.isPending}
               />
               <Button
                  type="submit"
                  size="icon"
                  disabled={!question.trim() || chatMutation.isPending}
               >
                  {chatMutation.isPending ? (
                     <Spinner className="size-4" />
                  ) : (
                     <Send className="size-4" />
                  )}
               </Button>
            </form>
         </div>

         <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>{selectedNote?.title}</DialogTitle>
                  <DialogDescription>Referenced source note</DialogDescription>
               </DialogHeader>
               <p className="text-sm text-muted-foreground">
                  This note was referenced as a source in the AI response.
               </p>
            </DialogContent>
         </Dialog>
      </div>
   );
}
