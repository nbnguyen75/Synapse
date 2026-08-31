import { createContext, use } from 'react';

export type ConfirmOptions = {
  variant?: 'destructive' | 'default';
  description?: string;
  confirmText?: string;
  cancelText?: string;
  title?: string;
};

export type ConfirmContextType = (options?: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm(): ConfirmContextType {
  const ctx = use(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return ctx;
}
