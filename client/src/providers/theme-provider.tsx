import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
   children: React.ReactNode;
   defaultTheme?: Theme;
   storageKey?: string;
};

type ThemeProviderState = {
   setTheme: (theme: Theme) => void;
   resolvedTheme: 'dark' | 'light';
   toggleTheme: () => void;
   theme: Theme;
};

const initialState: ThemeProviderState = {
   toggleTheme: () => null,
   resolvedTheme: 'light',
   setTheme: () => null,
   theme: 'system',
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
   storageKey = 'synapse-ui-theme',
   defaultTheme = 'system',
   children,
   ...props
}: ThemeProviderProps) {
   const [theme, setThemeState] = useState<Theme>(
      () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
   );

   const getSystemTheme = (): 'dark' | 'light' => {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      return mq.matches ? 'dark' : 'light';
   };

   const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>(
      getSystemTheme,
   );

   useEffect(() => {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (): void => setSystemTheme(getSystemTheme());
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
   }, []);

   const resolvedTheme: 'dark' | 'light' = useMemo(
      () => (theme === 'system' ? systemTheme : theme),
      [theme, systemTheme],
   );

   useEffect(() => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolvedTheme);
   }, [resolvedTheme]);

   const setTheme = (newTheme: Theme) => {
      const hasAPI = !!document.startViewTransition;
      const reducedMotion = window.matchMedia(
         '(prefers-reduced-motion: reduce)',
      ).matches;

      if (!hasAPI || reducedMotion) {
         localStorage.setItem(storageKey, newTheme);
         setThemeState(newTheme);
         return;
      }

      document.startViewTransition(() => {
         flushSync(() => {
            localStorage.setItem(storageKey, newTheme);
            setThemeState(newTheme);

            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');

            if (newTheme === 'system') {
               const systemTheme = window.matchMedia(
                  '(prefers-color-scheme: dark)',
               ).matches
                  ? 'dark'
                  : 'light';
               root.classList.add(systemTheme);
            } else {
               root.classList.add(newTheme);
            }
         });
      });
   };

   const toggleTheme = () => {
      const isCurrentlyDark =
         theme === 'dark' ||
         (theme === 'system' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

      const nextTheme: Theme = isCurrentlyDark ? 'light' : 'dark';
      setTheme(nextTheme);
   };

   const value = {
      resolvedTheme,
      toggleTheme,
      setTheme,
      theme,
   };

   return (
      <ThemeProviderContext.Provider {...props} value={value}>
         {children}
      </ThemeProviderContext.Provider>
   );
}

export const useTheme = () => {
   const context = useContext(ThemeProviderContext);

   if (context === undefined)
      throw new Error('useTheme must be used within a ThemeProvider');

   return context;
};
