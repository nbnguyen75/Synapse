import type {
  CommandItem,
  CommandOutput,
  NoteItem,
} from '@/features/command-palette/types';

import { useState, useEffect, useRef, useMemo } from 'react';

import { useNavigate, useRouter } from '@tanstack/react-router';
import { useHotkeys } from '@tanstack/react-hotkeys';

import { toast } from 'sonner';

import {
  CommandPaletteOutput,
  CommandPaletteSearchInput,
  CommandPaletteSearchResults,
} from '@/features/command-palette/components';
import { useGoToCompanion } from '@/features/companion/hooks/use-go-to-companion';
import { NOTE_CONTENT_MAX_LENGTH } from '@/features/notes/constants';
import { useGetNotes, type Note } from '@/features/notes';

import { useHotkeyShortcut } from '@/hooks/use-hotkey-shortcut';
import { useDebounce } from '@/hooks/use-debounce';

import { useNoteCreatePrefillStore } from '@/store/note-create-prefill-store';

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
  const goToCompanion = useGoToCompanion();

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(search, 150);
  const { data } = useGetNotes({
    sort: ['updatedAt,desc'],
    q: debouncedSearch,
    pageSize: 10,
    page: 1,
  });
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

  useHotkeyShortcut(
    'command-palette',
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
    { allowWhenTyping: true },
  );

  const contentPart = search.replace(/^\/create\s*/i, '').trim();

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
          if (contentPart) {
            useNoteCreatePrefillStore
              .getState()
              .set(contentPart.trim().slice(0, NOTE_CONTENT_MAX_LENGTH));
          }
          navigate({
            to: '/notes/create',
          });
        },
        title: contentPart
          ? m.command_palette_create_title_with_title({ content: contentPart })
          : m.command_palette_title_create_note(),
        subtitle: contentPart
          ? m.command_palette_create_subtitle_with_title()
          : m.command_palette_create_subtitle_empty(),
        command: '/create',
        id: 'cmd_create',
        icon: PlusIcon,
      },
    ],
    [theme, notes, search, navigate, toggleTheme, contentPart],
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
          goToCompanion();
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
    [navigate, goToCompanion, theme, toggleTheme],
  );

  const handleOpenNote = (note: NoteItem) => {
    setIsOpen(false);
    navigate({ params: { noteId: note.id }, to: '/notes/$noteId' });
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

    // 1. Map danh sách notes từ BE với xử lý fallback ngôn ngữ và cắt ngắn preview
    const notesResults: CommandItem[] = notes.map((note) => {
      const content = note.content ?? '';
      const preview =
        content.length > 150 ? `${content.slice(0, 150)}...` : content;

      return {
        subtitle: preview || m.command_palette_note_no_content(),
        title: note.title || m.command_palette_note_untitled(),
        action: () => handleOpenNote(note),
        id: `note_${note.id}`,
        icon: FileTextIcon,
      };
    });

    // 2. Lọc staticCommands theo từ khóa tìm kiếm
    const filteredCommands = staticCommands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(term.toLowerCase()) ||
        cmd.subtitle.toLowerCase().includes(term.toLowerCase()),
    );

    const combinedResults: CommandItem[] = [
      ...notesResults,
      ...filteredCommands,
    ];

    const totalCount = data?.totalElements ?? 0;
    if (totalCount > 10) {
      combinedResults.push({
        action: () => {
          setIsOpen(false);
          navigate({
            search: { q: term },
            to: '/notes',
          });
        },
        title: m.command_palette_view_all_title({
          count: totalCount,
          term,
        }),
        subtitle: m.command_palette_view_all_subtitle(),
        id: 'view_all_results',
        icon: ArrowRightIcon,
      });
    }

    return combinedResults;
  }, [
    search,
    notes,
    data?.totalElements,
    staticCommands,
    slashCommands,
    navigate,
  ]);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  useHotkeys(
    [
      {
        callback: () =>
          setSelectedIndex(
            (prev) =>
              (prev - 1 + searchResults.length) % (searchResults.length || 1),
          ),
        hotkey: 'ArrowUp',
      },
      {
        callback: () =>
          setSelectedIndex((prev) => (prev + 1) % (searchResults.length || 1)),
        hotkey: 'ArrowDown',
      },
      {
        callback: () => {
          if (searchResults[boundedSelectedIndex]) {
            void searchResults[boundedSelectedIndex].action();
          }
        },
        hotkey: 'Enter',
      },
    ],
    {
      enabled: isOpen && !commandOutput,
      ignoreInputs: false,
    },
  );

  useHotkeys(
    [
      {
        callback: () => {
          setCommandOutput(null);
          focusInput();
        },
        hotkey: 'Escape',
      },
      {
        callback: () => {
          setCommandOutput(null);
          focusInput();
        },
        hotkey: 'Backspace',
      },
    ],
    {
      enabled: isOpen && !!commandOutput,
      ignoreInputs: false,
      target: dialogRef,
    },
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        ref={dialogRef}
        showCloseButton={false}
        className="sm:max-w-2xl max-h-120 bg-popover/95 backdrop-blur-md rounded-2xl border border-border/60 shadow-2xl p-0 overflow-hidden gap-0 flex flex-col"
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
