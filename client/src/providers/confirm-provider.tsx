import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ConfirmOptions = {
  variant?: 'default' | 'destructive';
  description?: string;
  confirmText?: string;
  cancelText?: string;
  title?: string;
};

type ConfirmContextType = (options?: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const resolveRef = useRef<((value: boolean) => void) | undefined>(undefined);

  const confirm = useCallback((opts: ConfirmOptions = {}) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleClose = (result: boolean) => {
    setOpen(false);
    resolveRef.current?.(result);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={open} onOpenChange={(o) => !o && handleClose(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {options.title ?? 'Bạn có chắc chắn không?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {options.description ?? 'Hành động này không thể hoàn tác.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleClose(false)}>
              {options.cancelText ?? 'Hủy'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleClose(true)}
              className={
                options.variant === 'destructive'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : undefined
              }
            >
              {options.confirmText ?? 'Xác nhận'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return ctx;
}
