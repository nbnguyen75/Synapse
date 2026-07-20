import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
   // beforeLoad: ({ context }) => {
   //    if (context.auth.isAuthenticated) {
   //       throw redirect({ to: '/notes' })
   //    }
   // },
   component: RouteComponent,
});

function RouteComponent() {
   return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] text-zinc-100 px-4 py-12 selection:bg-zinc-800 selection:text-white transition-colors duration-300">
         <Outlet />
      </div>
   );
}
