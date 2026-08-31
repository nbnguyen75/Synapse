import { cn } from '@/lib/utils';

export function PageHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-4 px-6 py-5 border-b bg-background', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function PageHeaderRow({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 md:flex-row md:items-center md:justify-between',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PageHeaderContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-1', className)} {...props}>
      {children}
    </div>
  );
}

export function PageHeaderTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        'text-2xl font-bold tracking-tight text-foreground flex items-center gap-2',
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

export function PageHeaderDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  );
}

export function PageHeaderActions({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center gap-2 shrink-0', className)} {...props}>
      {children}
    </div>
  );
}

export function PageHeaderToolbar({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)} {...props}>
      {children}
    </div>
  );
}
