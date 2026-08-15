import type { QueryClient } from '@tanstack/react-query';
import type { AuthContext } from '@/types/app';

import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';

import { env } from '@/config/env';

import { DefaultLoaderPage } from '@/components/app/pages';

import { Toaster } from '@/components/ui/sonner';

import Favicon from '@/assets/images/favicon.ico';
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
      {
        type: 'image/favicon',
        href: Favicon,
        rel: 'icon',
      },
    ],
  }),
  pendingComponent: () => <DefaultLoaderPage />,
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <HeadContent />

      <Outlet />

      <Toaster richColors theme="light" closeButton position="top-center" />

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
