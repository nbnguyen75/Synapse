'use client';

import type { ComponentProps, ReactNode } from 'react';

import {
   createContext,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useRef,
   useState,
} from 'react';

import { cn } from '@/shared/lib/utils';

import {
   Command,
   CommandEmpty,
   CommandInput,
   CommandItem,
   CommandList,
} from '@/shared/components/ui/command';
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Button } from '@/shared/components/ui/button';

import { useControllableState } from '@radix-ui/react-use-controllable-state';

import { ChevronsUpDownIcon } from 'lucide-react';

const deviceIdRegex = /\(([\da-fA-F]{4}:[\da-fA-F]{4})\)$/;

interface MicSelectorContextType {
   onValueChange?: (value: string) => void;
   onOpenChange?: (open: boolean) => void;
   setWidth?: (width: number) => void;
   value: string | undefined;
   data: MediaDeviceInfo[];
   open: boolean;
   width: number;
}

const MicSelectorContext = createContext<MicSelectorContextType>({
   onValueChange: undefined,
   onOpenChange: undefined,
   setWidth: undefined,
   value: undefined,
   open: false,
   width: 200,
   data: [],
});

export const useAudioDevices = () => {
   const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [hasPermission, setHasPermission] = useState(false);

   const loadDevicesWithoutPermission = useCallback(async () => {
      try {
         setLoading(true);
         setError(null);

         const deviceList = await navigator.mediaDevices.enumerateDevices();
         const audioInputs = deviceList.filter(
            (device) => device.kind === 'audioinput',
         );

         setDevices(audioInputs);
      } catch (caughtError) {
         const message =
            caughtError instanceof Error
               ? caughtError.message
               : 'Failed to get audio devices';

         setError(message);
         console.error('Error getting audio devices:', message);
      } finally {
         setLoading(false);
      }
   }, []);

   const loadDevicesWithPermission = useCallback(async () => {
      if (loading) {
         return;
      }

      try {
         setLoading(true);
         setError(null);

         const tempStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
         });

         for (const track of tempStream.getTracks()) {
            track.stop();
         }

         const deviceList = await navigator.mediaDevices.enumerateDevices();
         const audioInputs = deviceList.filter(
            (device) => device.kind === 'audioinput',
         );

         setDevices(audioInputs);
         setHasPermission(true);
      } catch (caughtError) {
         const message =
            caughtError instanceof Error
               ? caughtError.message
               : 'Failed to get audio devices';

         setError(message);
         console.error('Error getting audio devices:', message);
      } finally {
         setLoading(false);
      }
   }, [loading]);

   useEffect(() => {
      loadDevicesWithoutPermission();
   }, [loadDevicesWithoutPermission]);

   useEffect(() => {
      const handleDeviceChange = () => {
         if (hasPermission) {
            loadDevicesWithPermission();
         } else {
            loadDevicesWithoutPermission();
         }
      };

      navigator.mediaDevices.addEventListener(
         'devicechange',
         handleDeviceChange,
      );

      return () => {
         navigator.mediaDevices.removeEventListener(
            'devicechange',
            handleDeviceChange,
         );
      };
   }, [hasPermission, loadDevicesWithPermission, loadDevicesWithoutPermission]);

   return {
      loadDevices: loadDevicesWithPermission,
      hasPermission,
      devices,
      loading,
      error,
   };
};

export type MicSelectorProps = ComponentProps<typeof Popover> & {
   onValueChange?: (value: string | undefined) => void;
   onOpenChange?: (open: boolean) => void;
   value?: string | undefined;
   defaultValue?: string;
   open?: boolean;
};

export const MicSelector = ({
   onValueChange: controlledOnValueChange,
   onOpenChange: controlledOnOpenChange,
   value: controlledValue,
   open: controlledOpen,
   defaultOpen = false,
   defaultValue,
   ...props
}: MicSelectorProps) => {
   const [value, onValueChange] = useControllableState<string | undefined>({
      onChange: controlledOnValueChange,
      defaultProp: defaultValue,
      prop: controlledValue,
   });
   const [open, onOpenChange] = useControllableState({
      onChange: controlledOnOpenChange,
      defaultProp: defaultOpen,
      prop: controlledOpen,
   });
   const [width, setWidth] = useState(200);
   const { hasPermission, loadDevices, devices, loading } = useAudioDevices();

   useEffect(() => {
      if (open && !hasPermission && !loading) {
         loadDevices();
      }
   }, [open, hasPermission, loading, loadDevices]);

   const contextValue = useMemo(
      () => ({
         data: devices,
         onValueChange,
         onOpenChange,
         setWidth,
         value,
         width,
         open,
      }),
      [devices, onOpenChange, onValueChange, open, setWidth, value, width],
   );

   return (
      <MicSelectorContext.Provider value={contextValue}>
         <Popover {...props} onOpenChange={onOpenChange} open={open} />
      </MicSelectorContext.Provider>
   );
};

export type MicSelectorTriggerProps = ComponentProps<typeof Button>;

export const MicSelectorTrigger = ({
   children,
   ...props
}: MicSelectorTriggerProps) => {
   const { setWidth } = useContext(MicSelectorContext);
   const ref = useRef<HTMLButtonElement>(null);

   useEffect(() => {
      // Create a ResizeObserver to detect width changes
      const resizeObserver = new ResizeObserver((entries) => {
         for (const entry of entries) {
            const newWidth = (entry.target as HTMLElement).offsetWidth;
            if (newWidth) {
               setWidth?.(newWidth);
            }
         }
      });

      if (ref.current) {
         resizeObserver.observe(ref.current);
      }

      // Clean up the observer when component unmounts
      return () => {
         resizeObserver.disconnect();
      };
   }, [setWidth]);

   return (
      <PopoverTrigger
         render={<Button variant="outline" {...props} ref={ref} />}
      >
         {children}
         <ChevronsUpDownIcon
            className="shrink-0 text-muted-foreground"
            size={16}
         />
      </PopoverTrigger>
   );
};

export type MicSelectorContentProps = ComponentProps<typeof Command> & {
   popoverOptions?: ComponentProps<typeof PopoverContent>;
};

export const MicSelectorContent = ({
   popoverOptions,
   className,
   ...props
}: MicSelectorContentProps) => {
   const { onValueChange, width, value } = useContext(MicSelectorContext);

   return (
      <PopoverContent
         className={cn('p-0', className)}
         style={{ width }}
         {...popoverOptions}
      >
         <Command onValueChange={onValueChange} value={value} {...props} />
      </PopoverContent>
   );
};

export type MicSelectorInputProps = ComponentProps<typeof CommandInput> & {
   onValueChange?: (value: string) => void;
   defaultValue?: string;
   value?: string;
};

export const MicSelectorInput = ({ ...props }: MicSelectorInputProps) => (
   <CommandInput placeholder="Search microphones..." {...props} />
);

export type MicSelectorListProps = Omit<
   ComponentProps<typeof CommandList>,
   'children'
> & {
   children: (devices: MediaDeviceInfo[]) => ReactNode;
};

export const MicSelectorList = ({
   children,
   ...props
}: MicSelectorListProps) => {
   const { data } = useContext(MicSelectorContext);

   return <CommandList {...props}>{children(data)}</CommandList>;
};

export type MicSelectorEmptyProps = ComponentProps<typeof CommandEmpty>;

export const MicSelectorEmpty = ({
   children = 'No microphone found.',
   ...props
}: MicSelectorEmptyProps) => <CommandEmpty {...props}>{children}</CommandEmpty>;

export type MicSelectorItemProps = ComponentProps<typeof CommandItem>;

export const MicSelectorItem = (props: MicSelectorItemProps) => {
   const { onValueChange, onOpenChange } = useContext(MicSelectorContext);

   const handleSelect = useCallback(
      (currentValue: string) => {
         onValueChange?.(currentValue);
         onOpenChange?.(false);
      },
      [onValueChange, onOpenChange],
   );

   return <CommandItem onSelect={handleSelect} {...props} />;
};

export type MicSelectorLabelProps = ComponentProps<'span'> & {
   device: MediaDeviceInfo;
};

export const MicSelectorLabel = ({
   className,
   device,
   ...props
}: MicSelectorLabelProps) => {
   const matches = device.label.match(deviceIdRegex);

   if (!matches) {
      return (
         <span className={className} {...props}>
            {device.label}
         </span>
      );
   }

   const [, deviceId] = matches;
   const name = device.label.replace(deviceIdRegex, '');

   return (
      <span className={className} {...props}>
         <span>{name}</span>
         <span className="text-muted-foreground"> ({deviceId})</span>
      </span>
   );
};

export type MicSelectorValueProps = ComponentProps<'span'>;

export const MicSelectorValue = ({
   className,
   ...props
}: MicSelectorValueProps) => {
   const { value, data } = useContext(MicSelectorContext);
   const currentDevice = data.find((d) => d.deviceId === value);

   if (!currentDevice) {
      return (
         <span className={cn('flex-1 text-left', className)} {...props}>
            Select microphone...
         </span>
      );
   }

   return (
      <MicSelectorLabel
         className={cn('flex-1 text-left', className)}
         device={currentDevice}
         {...props}
      />
   );
};
