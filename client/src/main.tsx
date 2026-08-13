import type { AuthContext } from '@/types/app';

import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { HotkeysProvider } from '@tanstack/react-hotkeys';

import { routeTree } from '@/routeTree.gen';

import { useSession } from '@/lib/auth';

import { DefaultLoaderPage, ErrorPage } from '@/components/app/pages';

import { ThemeProvider } from '@/providers';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60, // 1 minute
      retry: 3,
    },
  },
});

const router = createRouter({
  defaultErrorComponent: ({ error, reset }) => (
    <ErrorPage error={error} reset={reset} />
  ),
  defaultNotFoundComponent: () => <ErrorPage statusCode={404} />,
  context: {
    auth: undefined!,
    queryClient,
  },
  defaultPendingComponent: () => <DefaultLoaderPage />,
  defaultPendingMinMs: 1000,
  routeTree,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function InnerApp() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return null;
  }

  const auth: AuthContext = session
    ? { isAuthenticated: true, user: session.user }
    : { isAuthenticated: false, user: null };

  return <RouterProvider router={router} context={{ queryClient, auth }} />;
}

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <StrictMode>
      <HotkeysProvider
        defaultOptions={{
          hotkey: { conflictBehavior: 'allow', ignoreInputs: true },
        }}
      >
        <ThemeProvider defaultTheme="system" storageKey="synapse-app-theme">
          <QueryClientProvider client={queryClient}>
            <InnerApp />
          </QueryClientProvider>
        </ThemeProvider>
      </HotkeysProvider>
    </StrictMode>,
  );
}
