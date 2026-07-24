'use client';

import { useNavigate } from '@tanstack/react-router';

import {
   Style as DiceBearStyle,
   Avatar as DiceBearAvatar,
} from '@dicebear/core';
import definition from '@dicebear/styles/identicon.json' with { type: 'json' };

import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
   useSidebar,
} from '@/shared/components/ui/sidebar';
import {
   Avatar,
   AvatarFallback,
   AvatarImage,
} from '@/shared/components/ui/avatar';
import { Skeleton } from '@/shared/components/ui/skeleton';

import {
   BadgeCheckIcon,
   BellIcon,
   ChevronsUpDown,
   LogOutIcon,
   SparklesIcon,
} from 'lucide-react';

import { signOut, useSession } from '@/core/auth/auth-client';

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

   const { isMobile } = useSidebar();
   const navigate = useNavigate();

   if (isPending) return <Loading />;

   const style = new DiceBearStyle(definition);
   const defaultAvatar = new DiceBearAvatar(style, {
      // ... options
      idRandomization: true,
   });

   const user = {
      avatar: session?.user?.image ?? defaultAvatar.toDataUri(),
      email: session?.user?.email || 'unknown@example.com',
      name: session?.user?.name || 'Unknown User',
      fallbackName: 'UU',
   };

   const handleSignOut = async () => {
      await signOut();
      navigate({ to: '/login' });
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
                           <span className="truncate font-medium">
                              {user.name}
                           </span>
                           <span className="truncate text-xs">
                              {user.email}
                           </span>
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
                              <span className="truncate font-medium">
                                 {user.name}
                              </span>
                              <span className="truncate text-xs">
                                 {user.email}
                              </span>
                           </div>
                        </div>
                     </DropdownMenuLabel>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                     <DropdownMenuItem>
                        <SparklesIcon />
                        Upgrade to Pro
                     </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                     <DropdownMenuItem>
                        <BadgeCheckIcon />
                        Account
                     </DropdownMenuItem>
                     <DropdownMenuItem>
                        <BellIcon />
                        Notifications
                     </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                     onClick={handleSignOut}
                     className="cursor-pointer"
                  >
                     <LogOutIcon />
                     Log out
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         </SidebarMenuItem>
      </SidebarMenu>
   );
}
