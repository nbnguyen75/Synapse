import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: ({ location, context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: '/notes',
      });
    }

    // TODO: add marketing, privacy and terms page here
    throw redirect({
      search: {
        redirect: location.href,
      },
      to: '/login',
    });
  },
});
