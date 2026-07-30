import { Link } from '@tanstack/react-router';

import { Fragment } from 'react/jsx-runtime';

import { useBreadcrumb } from '@/hooks/use-breadcrumb';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function AppBreadcrumb() {
  const crumbs = useBreadcrumb();

  if (crumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb) => (
          <Fragment key={crumb.path}>
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage className="text-sm font-medium">
                  {crumb.title}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  render={<Link to={crumb.path}>{crumb.title}</Link>}
                />
              )}
            </BreadcrumbItem>

            {!crumb.isLast && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
