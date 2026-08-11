import { useNavigate } from '@tanstack/react-router';

import LangEnIcon from '@iconify-react/circle-flags/lang-en';
import LangViIcon from '@iconify-react/circle-flags/lang-vi';
import { Fragment } from 'react/jsx-runtime';

import { useElementWidth } from '@/hooks/use-element-width';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsMac } from '@/hooks/use-is-os';

import { useSettingsStore } from '@/store/settings-store';

import { useTheme } from '@/providers/theme-provider';

import { getLocale, setLocale, type Locale } from '@/paraglide/runtime';
import { m } from '@/paraglide/messages';

import { AppBreadcrumb } from '@/components/shared';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { SidebarManagerTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { Button } from '@/components/ui/button';

import {
  PanelRightIcon,
  SearchIcon,
  PlusIcon,
  FileTextIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
} from 'lucide-react';

const locales = [
  {
    label: (
      <Fragment>
        <LangViIcon />
        <span className="locale-text">{m.header_language_vi()}</span>
      </Fragment>
    ),
    value: 'vi',
  },
  {
    label: (
      <Fragment>
        <LangEnIcon />
        <span className="locale-text">{m.header_language_en()}</span>
      </Fragment>
    ),
    value: 'en',
  },
] as const;

export default function AppTopHeader() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isMac = useIsMac();
  const { setTheme, theme } = useTheme();
  const { rightSidebar, layoutMode } = useSettingsStore();
  const [headerRef, headerWidth] = useElementWidth<HTMLElement>();

  const cycle = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <header
      ref={headerRef}
      className="flex h-14 items-center justify-between gap-2 border-b border-border bg-background/80 px-3 md:px-4 backdrop-blur-md shrink-0 @container/top-header"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <SidebarManagerTrigger
          name="left"
          className="-ml-1 cursor-pointer shrink-0"
        />
        <div className="min-w-0 flex-1 truncate">
          <AppBreadcrumb containerWidth={headerWidth} />
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() =>
            window.dispatchEvent(new CustomEvent('open-command-palette'))
          }
          className="cursor-pointer @[680px]/top-header:w-auto @[680px]/top-header:px-3"
        >
          <SearchIcon className="size-4 shrink-0" />
          <span className="truncate hidden @[680px]/top-header:inline text-xs text-muted-foreground ml-1.5">
            {m.header_search_placeholder()}
          </span>
          <KbdGroup className="ml-2 hidden @[680px]/top-header:inline-flex">
            <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
            <span>+</span>
            <Kbd>K</Kbd>
          </KbdGroup>
        </Button>

        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="cursor-pointer"
                      >
                        <PlusIcon className="size-4" />
                      </Button>
                    }
                  />
                }
              />
              <TooltipContent side="bottom">
                {m.header_new_tooltip()}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => navigate({ to: '/notes/create' })}
              className="cursor-pointer text-xs"
            >
              <FileTextIcon className="size-4 mr-2" />
              {m.header_new_note()}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={cycle}
                  aria-label={m.header_toggle_theme_aria()}
                  className="cursor-pointer"
                >
                  {theme === 'light' && <SunIcon className="size-4" />}
                  {theme === 'dark' && <MoonIcon className="size-4" />}
                  {theme === 'system' && <MonitorIcon className="size-4" />}
                </Button>
              }
            />
            <TooltipContent side="bottom">
              {m.header_current_theme({ theme })}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Select
          items={locales}
          onValueChange={(v) => setLocale(v as Locale)}
          value={getLocale()}
        >
          <SelectTrigger
            className="h-8 w-fit gap-1 border-none bg-transparent px-1.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer [&_.locale-text]:hidden @[720px]/top-header:[&_.locale-text]:inline"
            hideIndicatorIcon
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="min-w-30" align="end">
            {locales.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-xs cursor-pointer"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {layoutMode === 'agent' && (
          <>
            <Separator
              orientation="vertical"
              className="mx-0.5 data-[orientation=vertical]:h-4"
            />

            <Button
              variant="ghost"
              size="icon-sm"
              aria-pressed={rightSidebar.open}
              className="cursor-pointer"
              onClick={() =>
                useSettingsStore
                  .getState()
                  .setRightSidebarOpen(
                    !useSettingsStore.getState().rightSidebar.open,
                  )
              }
            >
              <PanelRightIcon className="size-4" />
              <span className="sr-only">{m.header_toggle_right_sidebar()}</span>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
