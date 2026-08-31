import '@tanstack/react-router';

export type BreadcrumbFn = (opts: {
  params: Record<string, string>;
  loaderData: unknown;
}) => string;

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    breadcrumb?: BreadcrumbFn | string;
  }
}
