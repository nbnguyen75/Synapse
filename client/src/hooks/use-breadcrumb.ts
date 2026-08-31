import { useMemo } from 'react';

import { useMatches } from '@tanstack/react-router';

export interface BreadcrumbItem {
  isLast: boolean;
  title: string;
  path: string;
}

interface UseBreadcrumbOptions {
  aliases?: Record<string, string>;
}

export function useBreadcrumb(options?: UseBreadcrumbOptions): Array<BreadcrumbItem> {
  const matches = useMatches();
  const aliases = options?.aliases;

  return useMemo(() => {
    const crumbs = matches
      .filter((match) => {
        const bc = match.staticData.breadcrumb;
        return Boolean(bc);
      })
      .map((match) => {
        const bc = match.staticData.breadcrumb!;
        let title: string;

        if (typeof bc === 'function') {
          title = bc({
            loaderData: match.loaderData,
            params: match.params,
          });
        } else {
          title = bc;
        }

        const alias = aliases?.[match.routeId] ?? aliases?.[match.pathname];
        if (alias) title = alias;

        return {
          path: match.pathname,
          title,
        };
      });

    return crumbs.map((c, i) => ({
      ...c,
      isLast: i === crumbs.length - 1,
    }));
  }, [matches, aliases]);
}
