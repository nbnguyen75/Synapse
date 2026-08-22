import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { AppLogo } from '@/components/app/logo';

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/notes' });
    }
  },
  preloadStaleTime: 1000 * 60 * 5,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 transition-colors duration-300">
      <div className="w-full max-w-95 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-4 flex h-10 w-10 items-center justify-center">
          <AppLogo size={40} />
        </div>

        <Outlet />
      </div>
    </div>
  );
}
