'use client';

import type { HTMLAttributes } from 'react';

import { createContext, useContext, useMemo } from 'react';

import { cn } from '@/shared/lib/utils';

import { Badge } from '@/shared/components/ui/badge';

import { ArrowRightIcon, MinusIcon, PackageIcon, PlusIcon } from 'lucide-react';

type ChangeType = 'major' | 'minor' | 'patch' | 'added' | 'removed';

interface PackageInfoContextType {
   currentVersion?: string;
   changeType?: ChangeType;
   newVersion?: string;
   name: string;
}

const PackageInfoContext = createContext<PackageInfoContextType>({
   name: '',
});

export type PackageInfoHeaderProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoHeader = ({
   className,
   children,
   ...props
}: PackageInfoHeaderProps) => (
   <div
      className={cn('flex items-center justify-between gap-2', className)}
      {...props}
   >
      {children}
   </div>
);

export type PackageInfoNameProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoName = ({
   className,
   children,
   ...props
}: PackageInfoNameProps) => {
   const { name } = useContext(PackageInfoContext);

   return (
      <div className={cn('flex items-center gap-2', className)} {...props}>
         <PackageIcon className="size-4 text-muted-foreground" />
         <span className="font-medium font-mono text-sm">
            {children ?? name}
         </span>
      </div>
   );
};

const changeTypeStyles: Record<ChangeType, string> = {
   minor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
   patch: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
   removed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
   added: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
   major: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const changeTypeIcons: Record<ChangeType, React.ReactNode> = {
   major: <ArrowRightIcon className="size-3" />,
   minor: <ArrowRightIcon className="size-3" />,
   patch: <ArrowRightIcon className="size-3" />,
   removed: <MinusIcon className="size-3" />,
   added: <PlusIcon className="size-3" />,
};

export type PackageInfoChangeTypeProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoChangeType = ({
   className,
   children,
   ...props
}: PackageInfoChangeTypeProps) => {
   const { changeType } = useContext(PackageInfoContext);

   if (!changeType) {
      return null;
   }

   return (
      <Badge
         className={cn(
            'gap-1 text-xs capitalize',
            changeTypeStyles[changeType],
            className,
         )}
         variant="secondary"
         {...props}
      >
         {changeTypeIcons[changeType]}
         {children ?? changeType}
      </Badge>
   );
};

export type PackageInfoVersionProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoVersion = ({
   className,
   children,
   ...props
}: PackageInfoVersionProps) => {
   const { currentVersion, newVersion } = useContext(PackageInfoContext);

   if (!(currentVersion || newVersion)) {
      return null;
   }

   return (
      <div
         className={cn(
            'mt-2 flex items-center gap-2 font-mono text-muted-foreground text-sm',
            className,
         )}
         {...props}
      >
         {children ?? (
            <>
               {currentVersion && <span>{currentVersion}</span>}
               {currentVersion && newVersion && (
                  <ArrowRightIcon className="size-3" />
               )}
               {newVersion && (
                  <span className="font-medium text-foreground">
                     {newVersion}
                  </span>
               )}
            </>
         )}
      </div>
   );
};

export type PackageInfoProps = HTMLAttributes<HTMLDivElement> & {
   currentVersion?: string;
   changeType?: ChangeType;
   newVersion?: string;
   name: string;
};

export const PackageInfo = ({
   currentVersion,
   newVersion,
   changeType,
   className,
   children,
   name,
   ...props
}: PackageInfoProps) => {
   const contextValue = useMemo(
      () => ({ currentVersion, changeType, newVersion, name }),
      [changeType, currentVersion, name, newVersion],
   );

   return (
      <PackageInfoContext.Provider value={contextValue}>
         <div
            className={cn('rounded-lg border bg-background p-4', className)}
            {...props}
         >
            {children ?? (
               <>
                  <PackageInfoHeader>
                     <PackageInfoName />
                     {changeType && <PackageInfoChangeType />}
                  </PackageInfoHeader>
                  {(currentVersion || newVersion) && <PackageInfoVersion />}
               </>
            )}
         </div>
      </PackageInfoContext.Provider>
   );
};

export type PackageInfoDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export const PackageInfoDescription = ({
   className,
   children,
   ...props
}: PackageInfoDescriptionProps) => (
   <p
      className={cn('mt-2 text-muted-foreground text-sm', className)}
      {...props}
   >
      {children}
   </p>
);

export type PackageInfoContentProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoContent = ({
   className,
   children,
   ...props
}: PackageInfoContentProps) => (
   <div className={cn('mt-3 border-t pt-3', className)} {...props}>
      {children}
   </div>
);

export type PackageInfoDependenciesProps = HTMLAttributes<HTMLDivElement>;

export const PackageInfoDependencies = ({
   className,
   children,
   ...props
}: PackageInfoDependenciesProps) => (
   <div className={cn('space-y-2', className)} {...props}>
      <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
         Dependencies
      </span>
      <div className="space-y-1">{children}</div>
   </div>
);

export type PackageInfoDependencyProps = HTMLAttributes<HTMLDivElement> & {
   version?: string;
   name: string;
};

export const PackageInfoDependency = ({
   className,
   children,
   version,
   name,
   ...props
}: PackageInfoDependencyProps) => (
   <div
      className={cn('flex items-center justify-between text-sm', className)}
      {...props}
   >
      {children ?? (
         <>
            <span className="font-mono text-muted-foreground">{name}</span>
            {version && <span className="font-mono text-xs">{version}</span>}
         </>
      )}
   </div>
);
