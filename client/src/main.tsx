import type { AuthContext } from '@/types/app';

import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { HotkeysProvider } from '@tanstack/react-hotkeys';

import { registerSW } from 'virtual:pwa-register';

import { routeTree } from '@/routeTree.gen';

import { useSession } from '@/lib/auth';

import { DefaultLoaderPage, ErrorPage } from '@/components/app/pages';

import { ThemeProvider, GlobalShortcutsProvider } from '@/providers';

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

  const auth: AuthContext = session?.user
    ? { isAuthenticated: true, user: session.user }
    : { isAuthenticated: false, user: null };

  return <RouterProvider router={router} context={{ queryClient, auth }} />;
}

registerSW({
  onRegisteredSW(_swScriptUrl, registration) {
    if (registration) {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          void registration.update();
        }
      });
    }
  },
  immediate: true,
});

const handleChunkError = (errorMessage?: string) => {
  if (!errorMessage) return;
  const isChunkError =
    /Failed to fetch dynamically imported module/i.test(errorMessage) ||
    /Importing a module script failed/i.test(errorMessage) ||
    /error loading dynamically imported module/i.test(errorMessage);

  if (isChunkError) {
    // Tránh lặp vô tận nếu reload liên tục bằng cách lưu flag tạm vào sessionStorage
    const lastReload = sessionStorage.getItem('chunk_reload_timestamp');
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
      sessionStorage.setItem('chunk_reload_timestamp', now.toString());
      window.location.reload();
    }
  }
};

window.addEventListener('error', (event) => handleChunkError(event.message));
window.addEventListener('unhandledrejection', (event) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  handleChunkError(event.reason?.message || String(event.reason)),
);

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
            <GlobalShortcutsProvider>
              <InnerApp />
            </GlobalShortcutsProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </HotkeysProvider>
    </StrictMode>,
  );
}
