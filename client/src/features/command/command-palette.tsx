import type { Note } from '@/features/notes';

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

import { getNotes } from '@/features/notes/api';

import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Kbd } from '@/shared/components/ui/kbd';

import {
   Search,
   FileText,
   MessageSquare,
   Plus,
   Moon,
   LogOut,
   CornerDownLeft,
   Keyboard,
} from 'lucide-react';

import { signOut } from '@/core/auth/auth-client';

export default function CommandPalette() {
   const [isOpen, setIsOpen] = useState(false);
   const [search, setSearch] = useState('');
   const [selectedIndex, setSelectedIndex] = useState(0);
   const navigate = useNavigate();
   const inputRef = useRef<HTMLInputElement>(null);

   // Fetch all notes (will pull from TanStack Cache instantly)
   const { data: notes = [] } = useQuery<Note[]>({
      queryKey: ['notes'],
      queryFn: getNotes,
      enabled: isOpen,
   });

   // Open/Close on Event
   useEffect(() => {
      const handleToggle = () => {
         setIsOpen((prev) => !prev);
         setSearch('');
         setSelectedIndex(0);
      };
      window.addEventListener('toggle-command-palette', handleToggle);
      return () =>
         window.removeEventListener('toggle-command-palette', handleToggle);
   }, []);

   // Global Key Bindings for launching
   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            setIsOpen((prev) => !prev);
            setSearch('');
            setSelectedIndex(0);
         }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, []);

   // Filter items
   const staticCommands = [
      {
         action: () => {
            setIsOpen(false);
            navigate({ to: '/notes' });
            setTimeout(() => {
               window.dispatchEvent(new CustomEvent('open-new-note-modal'));
            }, 100);
         },
         subtitle: 'Write a new thought or documentation',
         title: 'Create New Note',
         id: 'create_note',
         icon: Plus,
      },
      {
         action: () => {
            setIsOpen(false);
            navigate({ to: '/notes' });
         },
         subtitle: 'View your library of notes',
         title: 'Go to My Notes',
         id: 'go_notes',
         icon: FileText,
      },
      {
         action: () => {
            setIsOpen(false);
            navigate({ to: '/chat' });
         },
         subtitle: 'Chat with your grounded AI assistant',
         title: 'Go to AI Copilot',
         icon: MessageSquare,
         id: 'go_copilot',
      },
      {
         action: () => {
            setIsOpen(false);
            // Find theme toggler button and click it to utilize existing theme toggle logic
            const toggleBtn =
               document.getElementById('theme-toggle-desktop') ||
               document.getElementById('theme-toggle-mobile');
            if (toggleBtn) {
               (toggleBtn as HTMLButtonElement).click();
            }
         },
         subtitle: 'Switch application color theme',
         title: 'Toggle Dark / Light Mode',
         id: 'toggle_theme',
         icon: Moon,
      },
      {
         action: async () => {
            if (window.confirm('Are you sure you want to log out?')) {
               setIsOpen(false);
               await signOut();
            }
         },
         subtitle: 'Sign out of this workspace session',
         title: 'Log Out',
         id: 'logout',
         icon: LogOut,
      },
   ];

   // Search logic
   const searchResults =
      search.trim() === ''
         ? staticCommands
         : [
              ...notes
                 .filter(
                    (note) =>
                       note.title
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                       note.content
                          .toLowerCase()
                          .includes(search.toLowerCase()),
                 )
                 .map((note) => ({
                    action: () => {
                       setIsOpen(false);
                       navigate({ to: '/notes' });
                       setTimeout(() => {
                          window.dispatchEvent(
                             new CustomEvent('open-edit-note', {
                                detail: note,
                             }),
                          );
                       }, 100);
                    },
                    subtitle:
                       note.content.slice(0, 80) +
                       (note.content.length > 80 ? '...' : ''),
                    id: `note_${note.id}`,
                    title: note.title,
                    icon: FileText,
                 })),
              ...staticCommands.filter(
                 (cmd) =>
                    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
                    cmd.subtitle.toLowerCase().includes(search.toLowerCase()),
              ),
           ];

   // Keyboard navigation within command list
   useEffect(() => {
      if (!isOpen) return;
      const selectFirstIndex = () => setSelectedIndex(0);
      selectFirstIndex();
   }, [search, isOpen]);

   const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
         e.preventDefault();
         setSelectedIndex((prev) => (prev + 1) % searchResults.length);
      } else if (e.key === 'ArrowUp') {
         e.preventDefault();
         setSelectedIndex(
            (prev) => (prev - 1 + searchResults.length) % searchResults.length,
         );
      } else if (e.key === 'Enter') {
         e.preventDefault();
         if (searchResults[selectedIndex]) {
            searchResults[selectedIndex].action();
         }
      }
   };

   return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
         <DialogContent className="sm:max-w-lg bg-background rounded-2xl border border-border shadow-flat-lg p-0 overflow-hidden gap-0">
            <div className="flex items-center border-b border-border px-4 py-3 gap-2.5 bg-background/50">
               <Search className="h-4.5 w-4.5 text-neutral-400 shrink-0" />
               <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a command or search notes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto bg-transparent placeholder-neutral-400 text-foreground"
                  autoFocus
               />
               <Kbd className="hidden sm:inline-flex">ESC</Kbd>
            </div>

            {/* Results List */}
            <div className="max-h-85 overflow-y-auto p-3 space-y-1.5 bg-background/30">
               {searchResults.length === 0 ? (
                  <div className="py-12 px-4 text-center rounded-xl bg-background/50 shadow-flat-inset border border-border/10">
                     <p className="text-xs text-neutral-400">
                        No results found for "{search}"
                     </p>
                  </div>
               ) : (
                  searchResults.map((item, idx) => {
                     const IconComponent = item.icon;
                     const isSelected = idx === selectedIndex;
                     return (
                        <Button
                           key={item.id}
                           onClick={item.action}
                           onMouseEnter={() => setSelectedIndex(idx)}
                           variant="ghost"
                           className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all border border-transparent h-auto ${
                              isSelected
                                 ? 'bg-primary/10 border-primary/20 shadow-flat-inset text-primary hover:bg-primary/10 hover:text-primary'
                                 : 'hover:shadow-flat-sm hover:bg-background/40 text-neutral-700 dark:text-neutral-300'
                           }`}
                        >
                           <div className="flex items-center gap-3 min-w-0">
                              <div
                                 className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
                                    isSelected
                                       ? 'border-primary/25 bg-primary/20'
                                       : 'border-border/10 bg-background shadow-flat-inset'
                                 }`}
                              >
                                 <IconComponent
                                    className={`h-4 w-4 shrink-0 transition-colors ${isSelected ? 'text-primary' : 'text-neutral-400'}`}
                                 />
                              </div>
                              <div className="min-w-0">
                                 <p
                                    className={`text-xs font-semibold truncate leading-none mb-1 transition-colors ${isSelected ? 'text-primary' : 'text-foreground'}`}
                                 >
                                    {item.title}
                                 </p>
                                 <p className="text-[10px] text-neutral-400 truncate leading-none">
                                    {item.subtitle}
                                 </p>
                              </div>
                           </div>
                           {isSelected && (
                              <div className="flex items-center gap-1 text-[10px] font-mono text-primary">
                                 <Kbd>Enter</Kbd>
                                 <CornerDownLeft className="h-3 w-3" />
                              </div>
                           )}
                        </Button>
                     );
                  })
               )}
            </div>

            {/* Keyboard Tips Footer */}
            <div className="border-t border-border bg-background/80 px-4 py-2.5 flex items-center justify-between text-[10px] text-neutral-400">
               <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                     <Keyboard className="h-3.5 w-3.5" /> Shortcuts
                  </span>
                  <span className="flex items-center gap-1">
                     <Kbd>N</Kbd> New Note
                  </span>
                  <span className="flex items-center gap-1">
                     <Kbd>/</Kbd> Search
                  </span>
               </div>
               <div className="flex items-center gap-1">
                  <span>Use</span>
                  <Kbd>↑↓</Kbd>
                  <span>to navigate</span>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   );
}
