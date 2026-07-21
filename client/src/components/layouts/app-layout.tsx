import { type ReactNode } from 'react';

import { useTheme } from '@/components/providers/theme-providers';

import {
   Sidebar,
   SidebarContent,
   SidebarFooter,
   SidebarGroup,
   SidebarGroupContent,
   SidebarHeader,
   SidebarInset,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
   SidebarProvider,
   SidebarSeparator,
   SidebarTrigger,
} from '@/components/ui/sidebar';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

import {
   FileText,
   MessageSquare,
   Tag,
   Archive,
   Sun,
   Moon,
   Monitor,
   LogOut,
   ChevronDown,
   Sparkles,
} from 'lucide-react';

import { useSession, signOut } from '@/core/client/auth-client';
import { useSettingsStore } from '@/store/settings-store';
import * as m from '@/paraglides/messages';

export type AppTab = 'notes' | 'chat' | 'tags' | 'archived';

interface AppLayoutProps {
   onNavigate: (tab: AppTab) => void;
   children: ReactNode;
   activeTab: AppTab;
}

const NAV_ITEMS: { icon: typeof FileText; labelKey: string; tab: AppTab }[] = [
   { labelKey: 'sidebar_notes', icon: FileText, tab: 'notes' },
   { labelKey: 'sidebar_chat', icon: MessageSquare, tab: 'chat' },
   { labelKey: 'sidebar_tags', tab: 'tags', icon: Tag },
   { labelKey: 'sidebar_archived', tab: 'archived', icon: Archive },
];

const LABEL_MAP: Record<string, () => string> = {
   sidebar_archived: m.sidebar_archived,
   sidebar_notes: m.sidebar_notes,
   sidebar_chat: m.sidebar_chat,
   sidebar_tags: m.sidebar_tags,
};

function ThemeToggle({ className }: { className?: string }) {
   const { setTheme, theme } = useTheme();

   const cycle = () => {
      if (theme === 'light') setTheme('dark');
      else if (theme === 'dark') setTheme('system');
      else setTheme('light');
   };

   return (
      <Button
         variant="ghost"
         size="icon-sm"
         onClick={cycle}
         className={className}
         title={theme}
      >
         {theme === 'light' && <Sun className="size-4" />}
         {theme === 'dark' && <Moon className="size-4" />}
         {theme === 'system' && <Monitor className="size-4" />}
      </Button>
   );
}

function SidebarLogo() {
   return (
      <div className="flex items-center gap-2.5">
         <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white shadow-sm shadow-violet-500/20">
            <Sparkles className="size-4" />
         </div>
         <div className="group-data-[collapsible=icon]:hidden">
            <div className="text-sm font-semibold leading-tight text-neutral-900 dark:text-neutral-50">
               {import.meta.env.VITE_APP_NAME}
            </div>
            <div className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 leading-none">
               Intelligence Hub
            </div>
         </div>
      </div>
   );
}

function UserMenu() {
   const { data: session } = useSession();
   const user = session?.user;

   const handleSignOut = async () => {
      await signOut();
      window.location.href = '/login';
   };

   return (
      <DropdownMenu>
         <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl p-2 text-sm outline-none hover:bg-sidebar-accent w-full">
            <Avatar size="sm">
               {user?.image && <AvatarImage src={user.image} />}
               <AvatarFallback>
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
               </AvatarFallback>
            </Avatar>
            <div className="group-data-[collapsible=icon]:hidden flex-1 text-left min-w-0">
               <div className="truncate text-sm font-medium">
                  {user?.name || 'User'}
               </div>
               <div className="truncate text-xs text-muted-foreground">
                  {user?.email || ''}
               </div>
            </div>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
         </DropdownMenuTrigger>
         <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuGroup>
               <DropdownMenuLabel>
                  <div className="flex flex-col">
                     <span className="font-medium">{user?.name || 'User'}</span>
                     <span className="text-xs text-muted-foreground font-normal">
                        {user?.email || ''}
                     </span>
                  </div>
               </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
               <LogOut className="size-4" />
               <span>{m.sidebar_log_out()}</span>
            </DropdownMenuItem>
         </DropdownMenuContent>
      </DropdownMenu>
   );
}

function SidebarContentInner({
   onNavigate,
   activeTab,
}: Omit<AppLayoutProps, 'children'>) {
   const labels = NAV_ITEMS.map((item) => ({
      ...item,
      label: LABEL_MAP[item.labelKey](),
   }));

   return (
      <>
         <SidebarHeader className="h-16 items-center px-6 border-b border-neutral-100 dark:border-neutral-900/60">
            <SidebarLogo />
         </SidebarHeader>

         <SidebarSeparator />

         <SidebarContent>
            <SidebarGroup>
               <SidebarGroupContent>
                  <SidebarMenu>
                     {labels.map((item) => (
                        <SidebarMenuItem key={item.tab}>
                           <SidebarMenuButton
                              isActive={activeTab === item.tab}
                              onClick={() => onNavigate(item.tab)}
                              tooltip={item.label}
                              className={`data-active:bg-violet-50 data-active:text-violet-600 dark:data-active:bg-violet-950/20 dark:data-active:text-violet-400 data-active:shadow-xs rounded-lg text-xs font-medium [&>svg]:data-active:text-violet-600 dark:[&>svg]:data-active:text-violet-400`}
                           >
                              <item.icon className="size-4.5" />
                              <span>{item.label}</span>
                           </SidebarMenuButton>
                        </SidebarMenuItem>
                     ))}
                  </SidebarMenu>
               </SidebarGroupContent>
            </SidebarGroup>
         </SidebarContent>

         <SidebarSeparator />

         <SidebarFooter>
            <SidebarMenu>
               <SidebarMenuItem>
                  <UserMenu />
               </SidebarMenuItem>
            </SidebarMenu>
         </SidebarFooter>
      </>
   );
}

function Header() {
   return (
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
         <SidebarTrigger />
         <Separator orientation="vertical" className="mr-2 h-4" />
         <div className="flex-1" />
         <ThemeToggle />
      </header>
   );
}

export function AppLayout({ onNavigate, activeTab, children }: AppLayoutProps) {
   const { setSidebarOpen, sidebar } = useSettingsStore();

   return (
      <SidebarProvider open={sidebar.open} onOpenChange={setSidebarOpen}>
         <Sidebar>
            <SidebarContentInner
               activeTab={activeTab}
               onNavigate={onNavigate}
            />
         </Sidebar>
         <SidebarInset>
            <Header />
            <div className="flex-1 overflow-auto">{children}</div>
         </SidebarInset>
      </SidebarProvider>
   );
}
