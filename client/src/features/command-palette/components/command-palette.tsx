import type {
  CommandItem,
  CommandOutput,
  NoteItem,
} from '@/features/command-palette/types';

import { useState, useEffect, useRef, useMemo } from 'react';

import { useNavigate, useRouter } from '@tanstack/react-router';

import { toast } from 'sonner';

import {
  CommandPaletteOutput,
  CommandPaletteSearchInput,
  CommandPaletteSearchResults,
} from '@/features/command-palette/components';
import { useGetNotes, type Note } from '@/features/notes';

import { useKeyBinding, useKeyboardShortcut } from '@/hooks/use-key-binding';

import { useTheme } from '@/providers/theme-provider';

import { getShortcut } from '@/config/keyboard-shortcuts';

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
  ArrowRightIcon,
} from 'lucide-react';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commandOutput, setCommandOutput] = useState<CommandOutput | null>(
    null,
  );

  const router = useRouter();
  const navigate = useNavigate();
  const { toggleTheme, theme } = useTheme();

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { data } = useGetNotes();
  const notes = useMemo<Note[]>(() => data.items ?? [], [data.items]);

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

  useKeyboardShortcut(
    getShortcut('command-palette').combos,
    () => {
      setIsOpen((prev) => {
        const next = !prev;
        if (next) focusInput();
        return next;
      });
      setSearch('');
      setSelectedIndex(0);
      setCommandOutput(null);
    },
    { ignoreWhenTyping: false },
  );

  const titlePart = search.replace(/^\/create\s*/i, '').trim();

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
              mode: theme === 'dark' ? 'Light' : 'Dark',
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
        action: () => {
          setIsOpen(false);
          navigate({
            search: titlePart ? { title: titlePart } : undefined,
            to: '/notes/create',
          });
        },
        title: titlePart
          ? m.command_palette_create_title_with_title({ title: titlePart })
          : m.command_palette_title_create_note(),
        subtitle: titlePart
          ? m.command_palette_create_subtitle_with_title()
          : m.command_palette_create_subtitle_empty(),
        command: '/create',
        id: 'cmd_create',
        icon: PlusIcon,
      },
    ],
    [theme, notes, search, navigate, toggleTheme, titlePart],
  );

  const staticCommands = useMemo<CommandItem[]>(
    () => [
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
        subtitle: m.command_palette_subtitle_go_companion(),
        title: m.command_palette_title_go_companion(),
        icon: MessageSquareIcon,
        id: 'go_companion',
      },
      {
        action: () => {
          toggleTheme();
          toast.success(
            m.command_palette_toast_theme({
              mode: theme === 'dark' ? 'Light' : 'Dark',
            }),
          );
          setIsOpen(false);
        },
        subtitle: m.command_palette_subtitle_toggle_theme({
          mode: theme === 'dark' ? 'Light' : 'Dark',
        }),
        icon: theme === 'dark' ? SunIcon : MoonIcon,
        title: m.command_palette_title_theme(),
        id: 'toggle_theme',
      },
      {
        action: async () => {
          if (window.confirm(m.command_palette_confirm_logout())) {
            setIsOpen(false);
            await signOut({
              fetchOptions: {
                onSuccess: async () => {
                  await router.invalidate();

                  window.location.reload();
                },
              },
            });
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
      const createCmd = slashCommands.find((cmd) => cmd.id === 'cmd_create');
      return createCmd ? [createCmd, ...staticCommands] : staticCommands;
    }

    const matchingNotes = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(term.toLowerCase()) ||
        note.content?.toLowerCase().includes(term.toLowerCase()),
    );

    const MAX_DISPLAY_NOTES = 10;
    const topNotes = matchingNotes.slice(0, MAX_DISPLAY_NOTES);

    const notesResults: CommandItem[] = topNotes.map((note) => {
      const content = note.content ?? '';
      const preview =
        content.length > 70 ? `${content.slice(0, 70)}...` : content;

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

    const combinedResults: CommandItem[] = [
      ...notesResults,
      ...filteredCommands,
    ];

    if (matchingNotes.length > MAX_DISPLAY_NOTES) {
      combinedResults.push({
        action: () => {
          setIsOpen(false);
          navigate({
            search: { q: term },
            to: '/notes',
          });
        },
        title: m.command_palette_view_all_title({
          count: matchingNotes.length,
          term,
        }),
        subtitle: m.command_palette_view_all_subtitle(),
        id: 'view_all_results',
        icon: ArrowRightIcon,
      });
    }

    return combinedResults;
  }, [search, notes, staticCommands, slashCommands, navigate]);

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

  useKeyBinding(
    {
      arrowup: () =>
        setSelectedIndex(
          (prev) =>
            (prev - 1 + searchResults.length) % (searchResults.length || 1),
        ),
      enter: () => {
        if (searchResults[boundedSelectedIndex]) {
          void searchResults[boundedSelectedIndex].action();
        }
      },
      arrowdown: () =>
        setSelectedIndex((prev) => (prev + 1) % (searchResults.length || 1)),
    },
    { enabled: isOpen && !commandOutput, ignoreWhenTyping: false },
  );

  useKeyBinding(
    {
      backspace: (e) => {
        e.stopPropagation();
        setCommandOutput(null);
        focusInput();
      },
      escape: (e) => {
        e.stopPropagation();
        setCommandOutput(null);
        focusInput();
      },
    },
    {
      enabled: isOpen && !!commandOutput,
      ignoreWhenTyping: false,
      capture: true,
    },
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl max-h-120 h-full bg-popover/95 backdrop-blur-md rounded-2xl border border-border/60 shadow-2xl p-0 overflow-hidden gap-0 flex flex-col"
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
