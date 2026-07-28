import type { Note } from '@/features/notes';

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { toast } from 'sonner';

import { getNotes, createNote } from '@/features/notes/api';

import { useTheme } from '@/providers/theme-provider';

import { signOut } from '@/lib/auth';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';

import {
  Search,
  FileText,
  MessageSquare,
  Plus,
  Moon,
  Sun,
  LogOut,
  KeyboardIcon,
  CornerDownLeftIcon,
  ArrowLeft,
  Terminal,
  HelpCircle,
  BarChart2,
  Pin,
  ActivityIcon,
} from 'lucide-react';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commandOutput, setCommandOutput] = useState<{
    type: 'help' | 'stats' | 'notes';
    command: string;
    data?: unknown;
    title: string;
  } | null>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toggleTheme, theme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Fetch all notes
  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: getNotes,
    enabled: isOpen,
  });

  const createNoteMutation = useMutation({
    mutationFn: ({ content, title }: { content: string; title: string }) =>
      createNote(title, content, 'usr_01'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  // Open/Close on Event
  useEffect(() => {
    const handleToggle = () => {
      setIsOpen((prev) => !prev);
      setSearch('');
      setSelectedIndex(0);
      setCommandOutput(null);
    };
    const handleOpen = () => {
      setIsOpen(true);
      setSearch('');
      setSelectedIndex(0);
      setCommandOutput(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    };
    window.addEventListener('toggle-command-palette', handleToggle);
    window.addEventListener('open-command-palette', handleOpen);
    return () => {
      window.removeEventListener('toggle-command-palette', handleToggle);
      window.removeEventListener('open-command-palette', handleOpen);
    };
  }, []);

  // Global Key Bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setSearch('');
        setSelectedIndex(0);
        setCommandOutput(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Slash commands
  const slashCommands = useMemo(
    () => [
      {
        action: () => {
          setCommandOutput({
            title: 'Command Palette Guide',
            command: '/help',
            type: 'help',
          });
          setSearch('');
        },
        subtitle: 'Display interactive guide for all slash commands',
        command: '/help',
        icon: HelpCircle,
        id: 'cmd_help',
        title: '/help',
      },
      {
        action: () => {
          toggleTheme();
          toast.success(
            `Toggled color theme to ${theme === 'dark' ? 'LIGHT' : 'DARK'}!`,
          );
          setIsOpen(false);
        },
        subtitle: `Toggle light & dark theme (Current: ${theme.toUpperCase()})`,
        icon: theme === 'dark' ? Sun : Moon,
        command: '/theme',
        id: 'cmd_theme',
        title: '/theme',
      },
      {
        action: () => {
          const active = notes.filter((n) => !n.archived).length;
          const archived = notes.filter((n) => n.archived).length;
          const pinned = notes.filter((n) => n.pinned).length;
          const tagsSet = new Set<string>();

          setCommandOutput({
            data: {
              tagsList: Array.from(tagsSet),
              tagsCount: tagsSet.size,
              total: notes.length,
              archived,
              active,
              pinned,
            },
            title: 'Workspace Diagnostics & Metrics',
            command: '/stats',
            type: 'stats',
          });
          setSearch('');
        },
        subtitle: 'Analyze statistics of your workspace notes & tags',
        command: '/stats',
        id: 'cmd_stats',
        title: '/stats',
        icon: BarChart2,
      },
      {
        action: () => {
          setCommandOutput({
            title: 'Workspace Notes Database',
            command: '/notes',
            type: 'notes',
          });
          setSearch('');
        },
        subtitle: 'List all active notes directly inside this console',
        command: '/notes',
        id: 'cmd_notes',
        title: '/notes',
        icon: FileText,
      },
      {
        action: async () => {
          const titlePart = search.replace(/^\/create\s*/i, '').trim();
          const finalTitle = titlePart || 'Untitled Command Note';
          try {
            const res = await createNoteMutation.mutateAsync({
              content: `Document initiated via command shortcut on ${new Date().toLocaleString()}.\n\nTags: #command-created`,
              title: finalTitle,
            });
            toast.success(`Successfully spawned note: "${finalTitle}"!`);
            setIsOpen(false);
            navigate({ to: '/notes' });
            setTimeout(() => {
              window.dispatchEvent(
                new CustomEvent('open-edit-note', {
                  detail: res,
                }),
              );
            }, 150);
          } catch (err: unknown) {
            const message =
              err instanceof Error ? err.message : 'Unknown error';
            toast.error(`Error spawning note: ${message}`);
          }
        },
        subtitle: 'Instantly construct a new formatted note in workspace',
        title: '/create [title]',
        command: '/create',
        id: 'cmd_create',
        icon: Plus,
      },
    ],
    [theme, notes, navigate, createNoteMutation, toggleTheme],
  );

  // Static commands
  const staticCommands = useMemo(
    () => [
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
          toggleTheme();
          toast.success(
            `Toggled color theme to ${theme === 'dark' ? 'LIGHT' : 'DARK'}!`,
          );
          setIsOpen(false);
        },
        subtitle: `Switch application color theme (${theme.toUpperCase()})`,
        icon: theme === 'dark' ? Sun : Moon,
        title: 'Toggle Dark / Light Mode',
        id: 'toggle_theme',
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
    ],
    [navigate, theme, toggleTheme],
  );

  // Search results logic
  const searchResults = useMemo(() => {
    const term = search.trim();

    if (term.startsWith('/')) {
      return slashCommands.filter((cmd) =>
        cmd.command.toLowerCase().startsWith(term.split(' ')[0].toLowerCase()),
      );
    }

    if (term === '') {
      return staticCommands;
    }

    const notesResults = notes
      .filter(
        (note) =>
          note.title.toLowerCase().includes(term.toLowerCase()) ||
          note.content.toLowerCase().includes(term.toLowerCase()),
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
          note.content.slice(0, 80) + (note.content.length > 80 ? '...' : ''),
        id: `note_${note.id}`,
        title: note.title,
        icon: FileText,
      }));

    const filteredCommands = staticCommands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(term.toLowerCase()) ||
        cmd.subtitle.toLowerCase().includes(term.toLowerCase()),
    );

    return [...notesResults, ...filteredCommands];
  }, [search, notes, staticCommands, slashCommands, navigate]);

  // Scroll selected item into view
  useEffect(() => {
    if (!isOpen || !resultsRef.current) return;
    const el = resultsRef.current.querySelector(
      `[data-index="${selectedIndex}"]`,
    );
    if (el) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, isOpen]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSelectedIndex(0);
  };

  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (commandOutput) {
      if (e.key === 'Escape' || (e.key === 'Backspace' && search === '')) {
        e.preventDefault();
        setCommandOutput(null);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      return;
    }

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
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg bg-background rounded-2xl border border-border shadow-flat-lg p-0 overflow-hidden gap-0"
      >
        {commandOutput ? (
          /* Output panel */
          <div className="flex flex-col bg-background max-h-115 select-text">
            <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                  <Terminal className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-mono text-emerald-500 tracking-wider">
                    {commandOutput.command}
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-medium">
                    {commandOutput.title}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setCommandOutput(null);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="h-7 text-[10px] font-mono gap-1 cursor-pointer"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>BACK</span>
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 font-mono text-xs text-muted-foreground space-y-4">
              {commandOutput.type === 'help' && (
                <div className="space-y-3.5">
                  <div className="text-emerald-500 font-bold border-b border-border pb-1.5 flex items-center gap-1.5">
                    <ActivityIcon className="h-4 w-4" />
                    <span>SYSTEM SHELL COMMAND CHEATSHEET</span>
                  </div>
                  <div className="space-y-3 text-[11px] leading-relaxed">
                    {slashCommands.map((cmd) => (
                      <div
                        key={cmd.id}
                        className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-b border-border/50 pb-2"
                      >
                        <span className="text-emerald-400 font-bold w-28 shrink-0">
                          {cmd.command}
                        </span>
                        <span className="text-muted-foreground">
                          {cmd.subtitle}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 text-[10px] text-muted-foreground italic">
                    Tip: Press Backspace or click BACK to return.
                  </div>
                </div>
              )}

              {commandOutput.type === 'stats' && (
                <div className="space-y-4">
                  <div className="text-emerald-500 font-bold border-b border-border pb-1.5 flex items-center gap-1.5">
                    <BarChart2 className="h-4 w-4" />
                    <span>WORKSPACE SUMMARY METRICS</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        value: (
                          commandOutput.data as {
                            total: number;
                          }
                        ).total,
                        color: 'text-foreground',
                        label: 'Total Notes',
                      },
                      {
                        value: (
                          commandOutput.data as {
                            pinned: number;
                          }
                        ).pinned,
                        color: 'text-amber-500',
                        label: 'Pinned Notes',
                      },
                      {
                        value: (
                          commandOutput.data as {
                            active: number;
                          }
                        ).active,
                        color: 'text-emerald-500',
                        label: 'Active Notes',
                      },
                      {
                        value: (
                          commandOutput.data as {
                            drafts: number;
                          }
                        ).drafts,
                        color: 'text-blue-500',
                        label: 'Drafts',
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-muted/30 border border-border/80 rounded-xl p-3.5 flex flex-col justify-center"
                      >
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                          {stat.label}
                        </span>
                        <span
                          className={`text-2xl font-extrabold ${stat.color}`}
                        >
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-muted/20 border border-border p-3.5 rounded-xl space-y-1.5">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase block">
                      Category Tags (
                      {
                        (
                          commandOutput.data as {
                            tagsCount: number;
                          }
                        ).tagsCount
                      }
                      )
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(
                        commandOutput.data as {
                          tagsList: string[];
                        }
                      ).tagsList.map((t: string) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 text-[10px] bg-muted/50 border border-border text-muted-foreground rounded font-semibold"
                        >
                          #{t}
                        </span>
                      )) || (
                        <span className="text-muted-foreground text-[10px]">
                          No tags mapped
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes list output */}
              {commandOutput.type === 'notes' && (
                <div className="space-y-3">
                  <div className="text-emerald-500 font-bold border-b border-border pb-1.5 flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    <span>NOTES DATABASE CATALOG ({notes.length})</span>
                  </div>

                  {notes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-[11px]">
                      No notes found in workspace.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-70 overflow-y-auto pr-1">
                      {notes.map((note) => (
                        <button
                          key={note.id}
                          onClick={() => {
                            setIsOpen(false);
                            navigate({ to: '/notes' });
                            setTimeout(() => {
                              window.dispatchEvent(
                                new CustomEvent('open-edit-note', {
                                  detail: note,
                                }),
                              );
                            }, 100);
                          }}
                          className="w-full text-left bg-muted/20 border border-border/60 rounded-lg p-2.5 hover:bg-muted/40 transition-all hover:border-emerald-500/30 flex items-center justify-between group cursor-pointer"
                        >
                          <div className="min-w-0 pr-3">
                            <div className="flex items-center gap-1.5">
                              {note.pinned && (
                                <Pin className="h-3 w-3 text-amber-500 shrink-0" />
                              )}
                              <span className="text-[11px] font-bold text-foreground truncate block">
                                {note.title || 'Untitled'}
                              </span>
                            </div>
                            <span className="text-[9px] text-muted-foreground truncate block font-mono mt-0.5">
                              ID: {note.id.slice(0, 10)}... | Updated:{' '}
                              {new Date(note.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="text-[9px] text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono whitespace-nowrap">
                            OPEN &gt;
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Normal search view */
          <>
            <div className="flex items-center border-b border-border px-4 py-3 gap-2.5 bg-background/50">
              <Search className="h-4.5 w-4.5 text-neutral-400 shrink-0" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Type a command (e.g., /theme, /stats) or search notes..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 h-auto bg-transparent placeholder-neutral-400 text-foreground"
                autoFocus
              />
              <Kbd className="hidden sm:inline-flex">ESC</Kbd>
            </div>

            <div
              ref={resultsRef}
              className="max-h-85 overflow-y-auto p-3 space-y-1.5 bg-background/30"
            >
              {searchResults.length === 0 ? (
                <div className="py-12 px-4 text-center rounded-xl bg-background/50 shadow-flat-inset border border-border/10">
                  <p className="text-xs text-neutral-400">
                    No results found for "{search}"
                  </p>
                  {search.startsWith('/') && (
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Type{' '}
                      <span className="font-mono text-emerald-500">/help</span>{' '}
                      to see the full list of slash commands
                    </p>
                  )}
                </div>
              ) : (
                searchResults.map((item, idx) => {
                  const IconComponent = item.icon;
                  const isSelected = idx === selectedIndex;
                  const isSlashCmd = 'command' in item;

                  return (
                    <Button
                      key={item.id}
                      data-index={idx}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      variant="ghost"
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all border border-transparent h-auto ${
                        isSelected
                          ? isSlashCmd
                            ? 'bg-emerald-500/10 border-emerald-500/20 shadow-flat-inset text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500'
                            : 'bg-primary/10 border-primary/20 shadow-flat-inset text-primary hover:bg-primary/10 hover:text-primary'
                          : 'hover:shadow-flat-sm hover:bg-background/40 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
                            isSelected
                              ? isSlashCmd
                                ? 'border-emerald-500/25 bg-emerald-500/20'
                                : 'border-primary/25 bg-primary/20'
                              : 'border-border/10 bg-background shadow-flat-inset'
                          }`}
                        >
                          <IconComponent
                            className={`h-4 w-4 shrink-0 transition-colors ${
                              isSelected
                                ? isSlashCmd
                                  ? 'text-emerald-500'
                                  : 'text-primary'
                                : 'text-neutral-400'
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-semibold truncate leading-none mb-1 transition-colors ${
                              isSelected
                                ? isSlashCmd
                                  ? 'text-emerald-500'
                                  : 'text-primary'
                                : 'text-foreground'
                            }`}
                          >
                            {item.title}
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate leading-none">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <div
                          className={`flex items-center gap-1 text-[10px] font-mono ${isSlashCmd ? 'text-emerald-500' : 'text-primary'}`}
                        >
                          <Kbd>Enter</Kbd>
                          <CornerDownLeftIcon className="h-3 w-3" />
                        </div>
                      )}
                    </Button>
                  );
                })
              )}
            </div>

            <div className="border-t border-border bg-background/80 px-4 py-2.5 flex items-center justify-between text-[10px] text-neutral-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <KeyboardIcon className="h-3.5 w-3.5" /> Tips
                </span>
                <span className="flex items-center gap-1">
                  <Kbd>/</Kbd> Command Mode
                </span>
                <span className="flex items-center gap-1">
                  <Kbd>/help</Kbd> Cheat Sheet
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span>Use</span>
                <Kbd>↑↓</Kbd>
                <span>to navigate</span>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
