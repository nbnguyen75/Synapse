import type { QueryClient } from '@tanstack/react-query';
import type { AuthContext } from '@/types/shared';

import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  useNavigate,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';

import { DefaultLoaderPage } from '@/features/loader/components';

import { env } from '@/config/env';

import CommandPalette from '@/components/shared/global-keybinds';

import appCss from '@/assets/styles.css?url';

interface RouterContext {
  queryClient: QueryClient;
  auth: AuthContext;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        content: 'width=device-width, initial-scale=1',
        name: 'viewport',
      },
      {
        title: env.VITE_APP_NAME,
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  pendingComponent: () => <DefaultLoaderPage />,
  component: RootLayout,
});

function RootLayout() {
  const navigate = useNavigate();

  return (
    <>
      <HeadContent />
      <Outlet />

      <CommandPalette
        onNewNote={() => navigate({ to: '/notes' })}
        onFocusSearch={() => navigate({ to: '/notes' })}
      />

      <TanStackDevtools
        config={{
          hideUntilHover: true,
        }}
        plugins={[
          {
            render: <ReactQueryDevtoolsPanel />,
            name: 'TanStack Query',
          },
          {
            render: <TanStackRouterDevtoolsPanel />,
            name: 'TanStack Router',
          },
        ]}
      />
    </>
  );
}
