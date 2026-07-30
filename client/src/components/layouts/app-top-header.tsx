import { useNavigate } from '@tanstack/react-router';

import LangEnIcon from '@iconify-react/circle-flags/lang-en';
import LangViIcon from '@iconify-react/circle-flags/lang-vi';
import { Fragment } from 'react/jsx-runtime';

import { useIsMobile } from '@/hooks/use-mobile';
import { useIsMac } from '@/hooks/use-is-os';

import { useSettingsStore } from '@/store/settings-store';

import { useTheme } from '@/providers/theme-provider';

import { getLocale, setLocale, type Locale } from '@/paraglide/runtime';
import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';

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
        <span className="locale-text">Tiếng Việt</span>
      </Fragment>
    ),
    value: 'vi',
  },
  {
    label: (
      <Fragment>
        <LangEnIcon />
        <span className="locale-text">English</span>
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

  const cycle = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 md:px-6 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <SidebarManagerTrigger
          name="left"
          className="-ml-1 cursor-pointer shrink-0"
        />

        <AppBreadcrumb />
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size={isMobile ? 'icon-sm' : 'lg'}
          onClick={() =>
            window.dispatchEvent(new CustomEvent('open-command-palette'))
          }
          className={cn('cursor-pointer', !isMobile && 'w-fit')}
        >
          <SearchIcon className="size-4" />
          {!isMobile && (
            <>
              Search or type a command...
              <KbdGroup className="ml-3">
                <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
                <span>+</span>
                <Kbd>K</Kbd>
              </KbdGroup>
            </>
          )}
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
              <TooltipContent side="bottom">{'New'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => navigate({ to: '/notes/create' })}
              className="cursor-pointer"
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
                  aria-label="Toggle theme"
                  className="cursor-pointer"
                >
                  {theme === 'light' && <SunIcon className="size-4" />}
                  {theme === 'dark' && <MoonIcon className="size-4" />}
                  {theme === 'system' && <MonitorIcon className="size-4" />}
                </Button>
              }
            />
            <TooltipContent side="bottom">{`Current theme: ${theme}`}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Select
          items={locales}
          onValueChange={(v) => setLocale(v as Locale)}
          value={getLocale()}
        >
          <SelectTrigger
            className="h-8 w-fit gap-1 border-none bg-transparent px-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer [&_.locale-text]:hidden md:[&_.locale-text]:inline"
            hideIndicatorIcon
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="min-w-30" align="end">
            {locales.map((option) => (
              <SelectItem
                value={option.value}
                className="text-xs cursor-pointer"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator
          orientation="vertical"
          className="ml-1 my-auto data-[orientation=vertical]:h-4"
        />

        <Button
          data-sidebar="manager-trigger"
          data-slot="manager-sidebar-trigger"
          variant="ghost"
          size="icon-sm"
          className="-mr-1 cursor-pointer"
          onClick={() =>
            useSettingsStore
              .getState()
              .setRightSidebarOpen(
                !useSettingsStore.getState().rightSidebar.open,
              )
          }
        >
          <PanelRightIcon />
          <span className="sr-only">Toggle right Sidebar</span>
        </Button>
      </div>
    </header>
  );
}
