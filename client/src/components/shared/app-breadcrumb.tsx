import { Link } from '@tanstack/react-router';

import { Fragment } from 'react/jsx-runtime';

import {
  useBreadcrumb,
  type BreadcrumbItem as BreadcrumbItemData,
} from '@/hooks/use-breadcrumb';

import { m } from '@/paraglide/messages';

import { HEADER_BREADCRUMB_COLLAPSE_WIDTH } from '@/components/layouts/constants';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

function renderCrumb(crumb: BreadcrumbItemData) {
  return (
    <BreadcrumbItem className="min-w-0">
      {crumb.isLast ? (
        <BreadcrumbPage className="text-sm font-medium truncate max-w-35 sm:max-w-50 md:max-w-70">
          {crumb.title}
        </BreadcrumbPage>
      ) : (
        <BreadcrumbLink
          render={
            <Link to={crumb.path} className="truncate max-w-25 sm:max-w-35">
              {crumb.title}
            </Link>
          }
        />
      )}
    </BreadcrumbItem>
  );
}

export default function AppBreadcrumb({
  containerWidth = Number.POSITIVE_INFINITY,
}: {
  containerWidth?: number;
}) {
  const crumbs = useBreadcrumb();

  if (crumbs.length === 0) return null;

  const collapsed =
    containerWidth <= HEADER_BREADCRUMB_COLLAPSE_WIDTH && crumbs.length > 2;
  const intermediates = collapsed ? crumbs.slice(1, -1) : [];
  const last = crumbs[crumbs.length - 1];

  return (
    <Breadcrumb className="min-w-0 flex-1">
      <BreadcrumbList className="flex-nowrap min-w-0">
        {!collapsed ? (
          crumbs.map((crumb) => (
            <Fragment key={crumb.path}>
              {renderCrumb(crumb)}
              {!crumb.isLast && <BreadcrumbSeparator className="shrink-0" />}
            </Fragment>
          ))
        ) : (
          <>
            {renderCrumb(crumbs[0])}

            <BreadcrumbSeparator className="shrink-0" />

            <BreadcrumbItem className="shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label={m.header_breadcrumb_more()}
                      className="cursor-pointer rounded-md"
                    >
                      <BreadcrumbEllipsis />
                    </Button>
                  }
                />
                <DropdownMenuContent align="start" className="max-w-60">
                  {intermediates.map((crumb) => (
                    <DropdownMenuItem
                      key={crumb.path}
                      render={
                        <Link to={crumb.path} className="truncate">
                          {crumb.title}
                        </Link>
                      }
                      className="cursor-pointer text-xs"
                    />
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>

            <BreadcrumbSeparator className="shrink-0" />

            {renderCrumb({ ...last, isLast: true })}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
