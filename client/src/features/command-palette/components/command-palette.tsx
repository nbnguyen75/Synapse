import type {
  CommandItem,
  CommandOutput,
  NoteItem,
} from '@/features/command-palette/types';

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { toast } from 'sonner';

import {
  CommandPaletteOutput,
  CommandPaletteSearchInput,
  CommandPaletteSearchResults,
} from '@/features/command-palette/components';
import { useGetNotesQuery } from '@/features/notes/hooks/use-note-query';
import { createNote } from '@/features/notes/api';

import { useTheme } from '@/providers/theme-provider';

import { m } from '@/paraglide/messages';
import { signOut } from '@/lib/auth';

import { Dialog, DialogContent } from '@/components/ui/dialog';

import {
  FileTextIcon,
  MessageSquareIcon,
  PlusIcon,
  MoonIcon,
  SunIcon,
  LogOutIcon,
  HelpCircleIcon,
  BarChart2Icon,
} from 'lucide-react';
export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commandOutput, setCommandOutput] = useState<CommandOutput | null>(
    null,
  );

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toggleTheme, theme } = useTheme();

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { data } = useGetNotesQuery();
  const notes = useMemo<NoteItem[]>(
    () => (data?.items as NoteItem[]) ?? [],
    [data?.items],
  );

  const createNoteMutation = useMutation({
    mutationFn: ({ content, title }: { content: string; title: string }) =>
      createNote({ content, title }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const focusInput = () => {
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  useEffect(() => {
    const handleToggle = () => {
      setIsOpen((prev) => {
        const next = !prev;
        if (next) focusInput();
        return next;
      });
      setSearch('');
      setSelectedIndex(0);
      setCommandOutput(null);
    };

    const handleOpen = () => {
      setIsOpen(true);
      setSearch('');
      setSelectedIndex(0);
      setCommandOutput(null);
      focusInput();
    };

    window.addEventListener('toggle-command-palette', handleToggle);
    window.addEventListener('open-command-palette', handleOpen);
    return () => {
      window.removeEventListener('toggle-command-palette', handleToggle);
      window.removeEventListener('open-command-palette', handleOpen);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => {
          const next = !prev;
          if (next) focusInput();
          return next;
        });
        setSearch('');
        setSelectedIndex(0);
        setCommandOutput(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const slashCommands = useMemo<CommandItem[]>(
    () => [
      {
        action: () => {
          setCommandOutput({
            title: m.command_palette_title_help(),
            command: '/help',
            type: 'help',
          });
          setSearch('');
        },
        subtitle: m.command_palette_subtitle_help(),
        icon: HelpCircleIcon,
        command: '/help',
        id: 'cmd_help',
        title: '/help',
      },
      {
        action: () => {
          toggleTheme();
          toast.success(
            m.command_palette_toast_theme({
              mode: theme === 'dark' ? 'LIGHT' : 'DARK',
            }),
          );
          setIsOpen(false);
        },
        subtitle: m.command_palette_subtitle_theme({
          theme: theme.toUpperCase(),
        }),
        icon: theme === 'dark' ? SunIcon : MoonIcon,
        command: '/theme',
        id: 'cmd_theme',
        title: '/theme',
      },
      {
        action: () => {
          const total = notes.length;
          const pinned = notes.filter((n) => n.pinned).length;
          const active = notes.filter((n) => !n.archived).length;
          const drafts = notes.filter(
            (n) => !n.title || n.title.trim().toLowerCase() === 'untitled',
          ).length;

          const tagsSet = new Set<string>();
          notes.forEach((note) => {
            const matches = note.content?.match(/#[\w-]+/g);
            matches?.forEach((tag) => tagsSet.add(tag.replace('#', '')));
          });

          setCommandOutput({
            data: {
              tagsList: Array.from(tagsSet),
              tagsCount: tagsSet.size,
              pinned,
              active,
              drafts,
              total,
            },
            title: m.command_palette_title_stats(),
            command: '/stats',
            type: 'stats',
          });
          setSearch('');
        },
        subtitle: m.command_palette_subtitle_stats(),
        icon: BarChart2Icon,
        command: '/stats',
        id: 'cmd_stats',
        title: '/stats',
      },
      {
        action: () => {
          setCommandOutput({
            title: m.command_palette_title_notes(),
            command: '/notes',
            type: 'notes',
          });
          setSearch('');
        },
        subtitle: m.command_palette_subtitle_notes(),
        icon: FileTextIcon,
        command: '/notes',
        id: 'cmd_notes',
        title: '/notes',
      },
      {
        action: async () => {
          const titlePart = search.replace(/^\/create\s*/i, '').trim();
          const finalTitle =
            titlePart || m.command_palette_create_fallback_title();
          try {
            const res = await createNoteMutation.mutateAsync({
              content: `Document initiated via command shortcut on ${new Date().toLocaleString()}.\n\nTags: #command-created`,
              title: finalTitle,
            });
            toast.success(
              m.command_palette_toast_create_success({ title: finalTitle }),
            );
            setIsOpen(false);
            navigate({ to: '/notes' });
            setTimeout(() => {
              window.dispatchEvent(
                new CustomEvent('open-edit-note', { detail: res }),
              );
            }, 150);
          } catch (err: unknown) {
            const message =
              err instanceof Error ? err.message : 'Unknown error';
            toast.error(m.command_palette_toast_create_error({ message }));
          }
        },
        subtitle: m.command_palette_subtitle_create(),
        title: '/create [title]',
        command: '/create',
        id: 'cmd_create',
        icon: PlusIcon,
      },
    ],
    [theme, notes, search, navigate, createNoteMutation, toggleTheme],
  );

  const staticCommands = useMemo<CommandItem[]>(
    () => [
      {
        action: () => {
          setIsOpen(false);
          navigate({ to: '/notes' });
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('open-new-note-modal'));
          }, 100);
        },
        subtitle: m.command_palette_subtitle_create_note(),
        title: m.command_palette_title_create_note(),
        id: 'create_note',
        icon: PlusIcon,
      },
      {
        action: () => {
          setIsOpen(false);
          navigate({ to: '/notes' });
        },
        subtitle: m.command_palette_subtitle_go_notes(),
        title: m.command_palette_title_go_notes(),
        icon: FileTextIcon,
        id: 'go_notes',
      },
      {
        action: () => {
          setIsOpen(false);
          navigate({ to: '/chat' });
        },
        subtitle: m.command_palette_subtitle_go_copilot(),
        title: m.command_palette_title_go_copilot(),
        icon: MessageSquareIcon,
        id: 'go_copilot',
      },
      {
        action: () => {
          toggleTheme();
          toast.success(
            m.command_palette_toast_theme({
              mode: theme === 'dark' ? 'LIGHT' : 'DARK',
            }),
          );
          setIsOpen(false);
        },
        subtitle: m.command_palette_subtitle_theme({
          theme: theme.toUpperCase(),
        }),
        icon: theme === 'dark' ? SunIcon : MoonIcon,
        title: m.command_palette_title_theme(),
        id: 'toggle_theme',
      },
      {
        action: async () => {
          if (window.confirm(m.command_palette_confirm_logout())) {
            setIsOpen(false);
            await signOut();
          }
        },
        subtitle: m.command_palette_subtitle_logout(),
        title: m.command_palette_title_logout(),
        icon: LogOutIcon,
        id: 'logout',
      },
    ],
    [navigate, theme, toggleTheme],
  );

  const handleOpenNote = (note: NoteItem) => {
    setIsOpen(false);
    navigate({ to: '/notes' });
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-edit-note', { detail: note }));
    }, 100);
  };

  const searchResults = useMemo<CommandItem[]>(() => {
    const term = search.trim();

    if (term.startsWith('/')) {
      return slashCommands.filter((cmd) =>
        cmd.command?.toLowerCase().startsWith(term.split(' ')[0].toLowerCase()),
      );
    }

    if (term === '') {
      return staticCommands;
    }

    const notesResults: CommandItem[] = notes
      .filter(
        (note) =>
          note.title.toLowerCase().includes(term.toLowerCase()) ||
          note.content?.toLowerCase().includes(term.toLowerCase()),
      )
      .map((note) => {
        const content = note.content ?? '';
        const preview =
          content.length > 80 ? `${content.slice(0, 80)}...` : content;

        return {
          subtitle: preview || m.command_palette_note_no_content(),
          title: note.title || m.command_palette_note_untitled(),
          action: () => handleOpenNote(note),
          id: `note_${note.id}`,
          icon: FileTextIcon,
        };
      });

    const filteredCommands = staticCommands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(term.toLowerCase()) ||
        cmd.subtitle.toLowerCase().includes(term.toLowerCase()),
    );

    return [...notesResults, ...filteredCommands];
  }, [search, notes, staticCommands, slashCommands]);

  // Derive bounded selection index during render safely without state side-effects
  const boundedSelectedIndex =
    searchResults.length > 0
      ? Math.min(selectedIndex, searchResults.length - 1)
      : 0;

  useEffect(() => {
    if (!isOpen || !resultsRef.current) return;
    const el = resultsRef.current.querySelector(
      `[data-index="${boundedSelectedIndex}"]`,
    );
    if (el) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [boundedSelectedIndex, isOpen]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSelectedIndex(0);
  };

  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (commandOutput) {
      if (e.key === 'Escape' || (e.key === 'Backspace' && search === '')) {
        e.preventDefault();
        setCommandOutput(null);
        focusInput();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (searchResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(
        (prev) =>
          (prev - 1 + searchResults.length) % (searchResults.length || 1),
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[boundedSelectedIndex]) {
        void searchResults[boundedSelectedIndex].action();
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
          <CommandPaletteOutput
            commandOutput={commandOutput}
            slashCommands={slashCommands}
            notes={notes}
            onBack={() => {
              setCommandOutput(null);
              focusInput();
            }}
            onOpenNote={handleOpenNote}
          />
        ) : (
          <>
            <CommandPaletteSearchInput
              inputRef={inputRef}
              search={search}
              onSearchChange={handleSearchChange}
              onKeyDown={handleKeyDown}
            />
            <CommandPaletteSearchResults
              resultsRef={resultsRef}
              searchResults={searchResults}
              selectedIndex={boundedSelectedIndex}
              onSelectIndex={setSelectedIndex}
              search={search}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
