import { Link } from '@tanstack/react-router';

import { env } from '@/config/env';

import { m } from '@/paraglide/messages';

import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  Sidebar,
} from '@/components/ui/sidebar';

import NavCompanion from './nav-companion';
import NavSecondary from './nav-secondary';
import NavMain from './nav-main';
import NavUser from './nav-user';

export default function AppLeftSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { side: _, ...restProps } = props;

  return (
    <Sidebar side="left" {...restProps}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <Link to="/">
                  <div className="flex aspect-square size-8 items-center justify-center">
                    <img
                      src="/images/logo.png"
                      className="rounded-sm"
                      width={32}
                      height={32}
                    />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {env.VITE_APP_NAME}
                    </span>
                    <span className="truncate text-xs">
                      {m.sidebar_knowledge_hub()}
                    </span>
                  </div>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
        <NavCompanion />
        <NavSecondary />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
