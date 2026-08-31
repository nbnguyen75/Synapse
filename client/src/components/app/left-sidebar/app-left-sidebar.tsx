import { Link } from '@tanstack/react-router';

import { env } from '@/config/env';

import { m } from '@/paraglide/messages';

import { AppLogo } from '@/components/app/logo';

import { Badge } from '@/components/ui/badge';
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
import NavMain from './nav-main';
import NavSecondary from './nav-secondary';
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
                    <AppLogo className="rounded-sm" />
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

        <div className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground font-mono">
          <span className="truncate">{env.VITE_APP_VERSION}</span>
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 h-4 font-sans font-normal border-muted-foreground/30"
          >
            Showcase
          </Badge>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
