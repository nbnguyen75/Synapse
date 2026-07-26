import { useNavigate, useRouter } from '@tanstack/react-router';

import { useSession, signOut } from '@/lib/auth-client';
import { m } from '@/paraglide/messages';

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { ChevronsUpDownIcon, LogOutIcon } from 'lucide-react';

export function SidebarUserMenu() {
   const { data: session, isPending } = useSession();
   const { isMobile } = useSidebar();
   const router = useRouter();
   const navigate = useNavigate();
   const user = session?.user;

   const handleSignOut = async () => {
      await signOut({
         fetchOptions: {
            onSuccess: async () => {
               await navigate({ replace: true, to: '/login' });

               await router.invalidate();
            },
         },
      });
   };

   return (
      <SidebarMenu>
         <SidebarMenuItem>
            <DropdownMenu>
               <DropdownMenuTrigger
                  render={
                     <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-lg"
                     />
                  }
               >
                  <Avatar className="size-8 rounded-lg">
                     {user?.image && <AvatarImage src={user.image} />}
                     <AvatarFallback className="rounded-lg">
                        {user?.name?.charAt(0)?.toUpperCase() || '?'}
                     </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                     <span className="truncate font-medium">
                        {user?.name || 'User'}
                     </span>
                     <span className="truncate text-xs text-muted-foreground">
                        {user?.email || ''}
                     </span>
                  </div>
                  <ChevronsUpDownIcon className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
               </DropdownMenuTrigger>
               <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side={isMobile ? 'bottom' : 'right'}
                  align="end"
                  sideOffset={4}
               >
                  <DropdownMenuGroup>
                     <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                           <Avatar className="size-8 rounded-lg">
                              {user?.image && <AvatarImage src={user.image} />}
                              <AvatarFallback className="rounded-lg">
                                 {user?.name?.charAt(0)?.toUpperCase() || '?'}
                              </AvatarFallback>
                           </Avatar>
                           <div className="grid flex-1 text-left text-sm leading-tight">
                              <span className="truncate font-medium">
                                 {user?.name || 'User'}
                              </span>
                              <span className="truncate text-xs text-muted-foreground">
                                 {user?.email || ''}
                              </span>
                           </div>
                        </div>
                     </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                     variant="destructive"
                     onClick={handleSignOut}
                     disabled={isPending}
                  >
                     <LogOutIcon className="size-4" />
                     <span>{m.sidebar_log_out()}</span>
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         </SidebarMenuItem>
      </SidebarMenu>
   );
}
