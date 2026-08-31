import { Link, useRouter } from '@tanstack/react-router';

import {
  Style as DiceBearStyle,
  Avatar as DiceBearAvatar,
} from '@dicebear/core';
import definition from '@dicebear/styles/identicon.json' with { type: 'json' };

import { signOut, useSession } from '@/lib/auth';
import { clearTokenCache } from '@/lib/fetch';
import { m } from '@/paraglide/messages';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

import {
  BadgeCheckIcon,
  BellIcon,
  ChevronsUpDown,
  LogOutIcon,
} from 'lucide-react';

function Loading() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-42" />
        <Skeleton className="h-4 w-32.5" />
      </div>
    </div>
  );
}

export default function NavUser() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const { isMobile } = useSidebar();

  if (isPending) return <Loading />;

  const style = new DiceBearStyle(definition);
  const defaultAvatar = new DiceBearAvatar(style, {
    idRandomization: true,
  });

  const user = {
    email: session?.user?.email || m.nav_user_fallback_email(),
    avatar: session?.user?.image ?? defaultAvatar.toDataUri(),
    name: session?.user?.name || m.nav_user_fallback_name(),
    fallbackName: m.nav_user_fallback_initials(),
  };

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: async () => {
          await router.invalidate();

          window.location.reload();
        },
      },
    });

    clearTokenCache();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.fallbackName}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            }
          />

          <DropdownMenuContent
            className="w-(--anchor-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                      {user.fallbackName}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                render={
                  <Link to="/profile">
                    <BadgeCheckIcon />
                    {m.sidebar_account()}
                  </Link>
                }
              />

              <DropdownMenuItem disabled>
                <BellIcon />
                {m.sidebar_notifications()}
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onClick={handleSignOut}
              className="cursor-pointer"
              disabled={isPending}
            >
              <LogOutIcon />
              {m.sidebar_log_out()}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
