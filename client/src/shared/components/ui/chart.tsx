/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
'use client';

import type { TooltipValueType } from 'recharts';

import * as React from 'react';

import * as RechartsPrimitive from 'recharts';

import { cn } from '@/shared/lib/utils';

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { dark: '.dark', light: '' } as const;

const INITIAL_DIMENSION = { height: 200, width: 320 } as const;
type TooltipNameType = number | string;

export type ChartConfig = Record<
   string,
   {
      icon?: React.ComponentType;
      label?: React.ReactNode;
   } & (
      | { color?: string; theme?: never }
      | { theme: Record<keyof typeof THEMES, string>; color?: never }
   )
>;

type ChartContextProps = {
   config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
   const context = React.useContext(ChartContext);

   if (!context) {
      throw new Error('useChart must be used within a <ChartContainer />');
   }

   return context;
}

function ChartContainer({
   initialDimension = INITIAL_DIMENSION,
   className,
   children,
   config,
   id,
   ...props
}: React.ComponentProps<'div'> & {
   children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
   >['children'];
   initialDimension?: {
      height: number;
      width: number;
   };
   config: ChartConfig;
}) {
   const uniqueId = React.useId();
   const chartId = `chart-${id ?? uniqueId.replace(/:/g, '')}`;

   return (
      <ChartContext.Provider value={{ config }}>
         <div
            data-slot="chart"
            data-chart={chartId}
            className={cn(
               "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
               className,
            )}
            {...props}
         >
            <ChartStyle id={chartId} config={config} />
            <RechartsPrimitive.ResponsiveContainer
               initialDimension={initialDimension}
            >
               {children}
            </RechartsPrimitive.ResponsiveContainer>
         </div>
      </ChartContext.Provider>
   );
}

const ChartStyle = ({ config, id }: { config: ChartConfig; id: string }) => {
   const colorConfig = Object.entries(config).filter(
      ([, config]) => config.theme ?? config.color,
   );

   if (!colorConfig.length) {
      return null;
   }

   return (
      <style
         dangerouslySetInnerHTML={{
            __html: Object.entries(THEMES)
               .map(
                  ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
   .map(([key, itemConfig]) => {
      const color =
         itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ??
         itemConfig.color;
      return color ? `  --color-${key}: ${color};` : null;
   })
   .join('\n')}
}
`,
               )
               .join('\n'),
         }}
      />
   );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

function ChartTooltipContent({
   hideIndicator = false,
   indicator = 'dot',
   hideLabel = false,
   labelFormatter,
   labelClassName,
   className,
   formatter,
   labelKey,
   payload,
   nameKey,
   active,
   label,
   color,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
   React.ComponentProps<'div'> & {
      indicator?: 'line' | 'dot' | 'dashed';
      hideIndicator?: boolean;
      hideLabel?: boolean;
      labelKey?: string;
      nameKey?: string;
   } & Omit<
      RechartsPrimitive.DefaultTooltipContentProps<
         TooltipValueType,
         TooltipNameType
      >,
      'accessibilityLayer'
   >) {
   const { config } = useChart();

   const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
         return null;
      }

      const [item] = payload;
      const key = `${labelKey ?? item?.dataKey ?? item?.name ?? 'value'}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value =
         !labelKey && typeof label === 'string'
            ? (config[label]?.label ?? label)
            : itemConfig?.label;

      if (labelFormatter) {
         return (
            <div className={cn('font-medium', labelClassName)}>
               {labelFormatter(value, payload)}
            </div>
         );
      }

      if (!value) {
         return null;
      }

      return <div className={cn('font-medium', labelClassName)}>{value}</div>;
   }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
   ]);

   if (!active || !payload?.length) {
      return null;
   }

   const nestLabel = payload.length === 1 && indicator !== 'dot';

   return (
      <div
         className={cn(
            'grid min-w-32 items-start gap-1.5 rounded-xl bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-lg ring-1 ring-foreground/5 dark:ring-foreground/10',
            className,
         )}
      >
         {!nestLabel ? tooltipLabel : null}
         <div className="grid gap-1.5">
            {payload
               .filter((item) => item.type !== 'none')
               .map((item, index) => {
                  const key = `${nameKey ?? item.name ?? item.dataKey ?? 'value'}`;
                  const itemConfig = getPayloadConfigFromPayload(
                     config,
                     item,
                     key,
                  );
                  const indicatorColor =
                     color ?? item.payload?.fill ?? item.color;

                  return (
                     <div
                        key={index}
                        className={cn(
                           'flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
                           indicator === 'dot' && 'items-center',
                        )}
                     >
                        {formatter && item?.value !== undefined && item.name ? (
                           formatter(
                              item.value,
                              item.name,
                              item,
                              index,
                              item.payload,
                           )
                        ) : (
                           <>
                              {itemConfig?.icon ? (
                                 <itemConfig.icon />
                              ) : (
                                 !hideIndicator && (
                                    <div
                                       className={cn(
                                          'shrink-0 rounded-xs border-(--color-border) bg-(--color-bg)',
                                          {
                                             'my-0.5':
                                                nestLabel &&
                                                indicator === 'dashed',
                                             'w-0 border-[1.5px] border-dashed bg-transparent':
                                                indicator === 'dashed',
                                             'h-2.5 w-2.5': indicator === 'dot',
                                             'w-1': indicator === 'line',
                                          },
                                       )}
                                       style={
                                          {
                                             '--color-border': indicatorColor,
                                             '--color-bg': indicatorColor,
                                          } as React.CSSProperties
                                       }
                                    />
                                 )
                              )}
                              <div
                                 className={cn(
                                    'flex flex-1 justify-between leading-none',
                                    nestLabel ? 'items-end' : 'items-center',
                                 )}
                              >
                                 <div className="grid gap-1.5">
                                    {nestLabel ? tooltipLabel : null}
                                    <span className="text-muted-foreground">
                                       {itemConfig?.label ?? item.name}
                                    </span>
                                 </div>
                                 {item.value != null && (
                                    <span className="font-mono font-medium text-foreground tabular-nums">
                                       {typeof item.value === 'number'
                                          ? item.value.toLocaleString()
                                          : String(item.value)}
                                    </span>
                                 )}
                              </div>
                           </>
                        )}
                     </div>
                  );
               })}
         </div>
      </div>
   );
}

const ChartLegend = RechartsPrimitive.Legend;

function ChartLegendContent({
   verticalAlign = 'bottom',
   hideIcon = false,
   className,
   payload,
   nameKey,
}: React.ComponentProps<'div'> & {
   hideIcon?: boolean;
   nameKey?: string;
} & RechartsPrimitive.DefaultLegendContentProps) {
   const { config } = useChart();

   if (!payload?.length) {
      return null;
   }

   return (
      <div
         className={cn(
            'flex items-center justify-center gap-4',
            verticalAlign === 'top' ? 'pb-3' : 'pt-3',
            className,
         )}
      >
         {payload
            .filter((item) => item.type !== 'none')
            .map((item, index) => {
               const key = `${nameKey ?? item.dataKey ?? 'value'}`;
               const itemConfig = getPayloadConfigFromPayload(
                  config,
                  item,
                  key,
               );

               return (
                  <div
                     key={index}
                     className={cn(
                        'flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground',
                     )}
                  >
                     {itemConfig?.icon && !hideIcon ? (
                        <itemConfig.icon />
                     ) : (
                        <div
                           className="h-2 w-2 shrink-0 rounded-xs"
                           style={{
                              backgroundColor: item.color,
                           }}
                        />
                     )}
                     {itemConfig?.label}
                  </div>
               );
            })}
      </div>
   );
}

function getPayloadConfigFromPayload(
   config: ChartConfig,
   payload: unknown,
   key: string,
) {
   if (typeof payload !== 'object' || payload === null) {
      return undefined;
   }

   const payloadPayload =
      'payload' in payload &&
      typeof payload.payload === 'object' &&
      payload.payload !== null
         ? payload.payload
         : undefined;

   let configLabelKey: string = key;

   if (
      key in payload &&
      typeof payload[key as keyof typeof payload] === 'string'
   ) {
      configLabelKey = payload[key as keyof typeof payload];
   } else if (
      payloadPayload &&
      key in payloadPayload &&
      typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
   ) {
      configLabelKey = payloadPayload[key as keyof typeof payloadPayload];
   }

   return configLabelKey in config ? config[configLabelKey] : config[key];
}

export {
   ChartContainer,
   ChartTooltip,
   ChartTooltipContent,
   ChartLegend,
   ChartLegendContent,
   ChartStyle,
};
