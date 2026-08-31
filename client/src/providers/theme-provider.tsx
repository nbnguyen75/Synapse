import type { Theme, ThemeProviderState } from './use-theme';

import { useEffect, useMemo, useState } from 'react';

import { ThemeProviderContext } from './use-theme';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

const getSystemTheme = (): 'light' | 'dark' => {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  return mq.matches ? 'dark' : 'light';
};

const getStoredTheme = (key: string, fallback: Theme): Theme => {
  const stored = localStorage.getItem(key);
  return stored === 'system' || stored === 'light' || stored === 'dark' ? stored : fallback;
};

export function ThemeProvider({
  storageKey = 'synapse-ui-theme',
  defaultTheme = 'system',
  children,
  ...props
}: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() =>
    getStoredTheme(storageKey, defaultTheme),
  );

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (): void => setSystemTheme(getSystemTheme());
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const resolvedTheme: 'light' | 'dark' = useMemo(
    () => (currentTheme === 'system' ? systemTheme : currentTheme),
    [currentTheme, systemTheme],
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = (newTheme: Theme) => {
    const hasAPI = !!document.startViewTransition;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // oxlint-disable-next-line typescript/no-unnecessary-condition -- document.startViewTransition may not exist in all browsers
    if (!hasAPI || reducedMotion) {
      localStorage.setItem(storageKey, newTheme);
      setCurrentTheme(newTheme);
      return;
    }

    document.startViewTransition(() => {
      localStorage.setItem(storageKey, newTheme);
      setCurrentTheme(newTheme);

      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');

      if (newTheme === 'system') {
        root.classList.add(getSystemTheme());
      } else {
        root.classList.add(newTheme);
      }
    });
  };

  const toggleTheme = () => {
    const isCurrentlyDark =
      currentTheme === 'dark' || (currentTheme === 'system' && getSystemTheme() === 'dark');

    const nextTheme: Theme = isCurrentlyDark ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const value: ThemeProviderState = {
    theme: currentTheme,
    resolvedTheme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeProviderContext {...props} value={value}>
      {children}
    </ThemeProviderContext>
  );
}
