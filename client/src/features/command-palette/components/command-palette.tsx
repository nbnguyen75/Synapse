import type { GroupedCommandItem } from '@/features/command-palette/components/command-palette-search-results';
import type { CommandOutput, NoteItem } from '@/features/command-palette/types';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { formatForDisplay, useHotkeys } from '@tanstack/react-hotkeys';
import { useNavigate } from '@tanstack/react-router';

import { toast } from 'sonner';

import { useHotkeyShortcut } from '@/hooks/use-hotkey-shortcut';
import { useDebounce } from '@/hooks/use-debounce';

import { useTheme } from '@/providers/use-theme';

import { KEYBOARD_SHORTCUTS } from '@/config/keyboard-shortcuts';

import { m } from '@/paraglide/messages';

import { Dialog, DialogContent } from '@/components/ui/dialog';

import {
  FileTextIcon,
  MessageSquareIcon,
  PlusIcon,
  MoonIcon,
  SunIcon,
  HelpCircleIcon,
  BarChart2Icon,
  ArrowRightIcon,
} from 'lucide-react';

import {
  CommandPaletteOutput,
  CommandPaletteSearchInput,
  CommandPaletteSearchResults,
  CommandPaletteFooter,
} from '@/features/command-palette/components';
import { useGetNotes, type Note, useNoteCreatePrefillStore } from '@/features/notes';
import { useGoToCompanion } from '@/features/companion/hooks/use-go-to-companion';
import { NOTE_CONTENT_MAX_LENGTH } from '@/features/notes/constants';
import { getMarkdownReadTimeSync } from '@/features/notes/service';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commandOutput, setCommandOutput] = useState<CommandOutput | null>(null);

  const navigate = useNavigate();
  const { toggleTheme, theme } = useTheme();
  const goToCompanion = useGoToCompanion();

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(search, 150);
  const { data } = useGetNotes({
    q: debouncedSearch.replace(/^([>/])/, '').trim(),
    sort: ['updatedAt,desc'],
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

  const contentPart = search.replace(/^\/(create|note)\s*/i, '').trim();

  // 1. Slash Commands (/help, /theme, /stats, /notes, /create)
  const slashCommands = useMemo<GroupedCommandItem[]>(
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
        group: 'commands',
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
        group: 'commands',
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

          setCommandOutput({
            data: {
              tagsList: [],
              tagsCount: 0,
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
        group: 'commands',
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
        group: 'commands',
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
          void navigate({ to: '/notes/create' });
        },
        title: contentPart
          ? m.command_palette_create_title_with_title({ content: contentPart })
          : m.command_palette_title_create_note(),
        subtitle: contentPart
          ? m.command_palette_create_subtitle_with_title()
          : m.command_palette_create_subtitle_empty(),
        shortcut: formatForDisplay(KEYBOARD_SHORTCUTS['go-to-create-note'].combos[0]),
        command: '/create',
        id: 'cmd_create',
        icon: PlusIcon,
        group: 'quick',
      },
    ],
    [theme, notes, contentPart, navigate, toggleTheme],
  );

  // 2. Static Commands
  const staticCommands = useMemo<GroupedCommandItem[]>(
    () => [
      {
        action: () => {
          setIsOpen(false);
          void navigate({ to: '/notes' });
        },
        subtitle: m.command_palette_subtitle_go_notes(),
        title: m.command_palette_title_go_notes(),
        icon: FileTextIcon,
        group: 'commands',
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
        group: 'commands',
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
        shortcut: formatForDisplay(KEYBOARD_SHORTCUTS['toggle-theme'].combos[0]),
        icon: theme === 'dark' ? SunIcon : MoonIcon,
        title: m.command_palette_title_theme(),
        id: 'toggle_theme',
        group: 'commands',
      },
    ],
    [navigate, goToCompanion, theme, toggleTheme],
  );

  const handleOpenNote = useCallback(
    (note: NoteItem) => {
      setIsOpen(false);
      void navigate({ params: { noteId: note.id }, to: '/notes/$noteId' });
    },
    [navigate],
  );

  // 3. Tổng hợp danh sách kết quả hiển thị
  const totalElements = data?.totalElements;
  const searchResults = useMemo<GroupedCommandItem[]>(() => {
    const term = search.trim();

    // 3.1. Lọc theo Lệnh (>/)
    if (term.startsWith('>') || term.startsWith('/')) {
      const cmdQuery = term.slice(1).toLowerCase();
      const allCmds = [...slashCommands, ...staticCommands];
      return allCmds.filter(
        (cmd) =>
          cmd.title.toLowerCase().includes(cmdQuery) ||
          cmd.command?.toLowerCase().includes(cmdQuery),
      );
    }

    // 3.2. Mặc định khi chưa nhập ô tìm kiếm (Default Layout)
    if (term === '') {
      const createCmd = slashCommands.find((cmd) => cmd.id === 'cmd_create');
      const quickItems: GroupedCommandItem[] = createCmd ? [createCmd] : [];

      if (notes.length > 0) {
        const recentNote = notes[0];
        quickItems.push({
          title: recentNote.title || m.command_palette_note_untitled(),
          meta: getMarkdownReadTimeSync(recentNote.content),
          action: () => handleOpenNote(recentNote),
          id: `recent_${recentNote.id}`,
          icon: FileTextIcon,
          group: 'quick',
        });
      }

      const noteItems: GroupedCommandItem[] = notes.slice(0, 3).map((note) => ({
        meta: new Date(note.updatedAt).toLocaleDateString(),
        title: note.title || m.command_palette_note_untitled(),
        action: () => handleOpenNote(note),
        id: `note_${note.id}`,
        icon: FileTextIcon,
        group: 'notes',
      }));

      return [...quickItems, ...staticCommands, ...noteItems];
    }

    // 3.3. Tìm kiếm nội dung tổng hợp khi gõ từ khóa
    const notesResults: GroupedCommandItem[] = notes.map((note) => ({
      subtitle: note.content?.slice(0, 80) || m.command_palette_note_no_content(),
      title: note.title || m.command_palette_note_untitled(),
      meta: new Date(note.updatedAt).toLocaleDateString(),
      action: () => handleOpenNote(note),
      id: `note_${note.id}`,
      icon: FileTextIcon,
      group: 'notes',
    }));

    const filteredStaticCmds = staticCommands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(term.toLowerCase()) ||
        cmd.subtitle?.toLowerCase().includes(term.toLowerCase()),
    );

    const combined = [...notesResults, ...filteredStaticCmds];

    const totalCount = totalElements ?? 0;
    if (totalCount > 10) {
      combined.push({
        action: () => {
          setIsOpen(false);
          void navigate({ search: { q: term }, to: '/notes' });
        },
        title: m.command_palette_view_all_title({ count: totalCount, term }),
        subtitle: m.command_palette_view_all_subtitle(),
        id: 'view_all_results',
        icon: ArrowRightIcon,
        group: 'notes',
      });
    }

    return combined;
  }, [search, notes, slashCommands, staticCommands, handleOpenNote, totalElements, navigate]);

  const boundedSelectedIndex =
    searchResults.length > 0 ? Math.min(selectedIndex, searchResults.length - 1) : 0;

  useEffect(() => {
    if (!isOpen || !resultsRef.current) return;
    const el = resultsRef.current.querySelector(`[data-index="${boundedSelectedIndex}"]`);
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
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % (searchResults.length || 1));
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
            (prev) => (prev - 1 + searchResults.length) % (searchResults.length || 1),
          ),
        hotkey: 'ArrowUp',
      },
      {
        callback: () => setSelectedIndex((prev) => (prev + 1) % (searchResults.length || 1)),
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
        className="sm:max-w-2xl max-h-130 bg-popover/95 backdrop-blur-md rounded-2xl border border-border/60 shadow-2xl p-0 overflow-hidden gap-0 flex flex-col"
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

            <CommandPaletteFooter />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
