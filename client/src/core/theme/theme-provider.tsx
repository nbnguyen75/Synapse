import { createContext, useContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
   children: React.ReactNode;
   defaultTheme?: Theme;
   storageKey?: string;
};

type ThemeProviderState = {
   setTheme: (theme: Theme) => void;
   toggleTheme: () => void;
   theme: Theme;
};

const initialState: ThemeProviderState = {
   toggleTheme: () => null,
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

   useEffect(() => {
      const root = window.document.documentElement;

      root.classList.remove('light', 'dark');

      if (theme === 'system') {
         const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
            .matches
            ? 'dark'
            : 'light';

         root.classList.add(systemTheme);
         return;
      }

      root.classList.add(theme);
   }, [theme]);

   const setTheme = (newTheme: Theme) => {
      // Fallback if View Transitions API is not supported or user prefers reduced motion
      if (
         !document.startViewTransition ||
         window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
         localStorage.setItem(storageKey, newTheme);
         setThemeState(newTheme);
         return;
      }

      // Calculate center coordinates
      const x = document.documentElement.clientWidth;
      const y = document.documentElement.clientHeight;

      const maxRadius = Math.hypot(x, y);

      document.documentElement.style.setProperty('--theme-circle-x', `${x}px`);
      document.documentElement.style.setProperty('--theme-circle-y', `${y}px`);
      document.documentElement.style.setProperty(
         '--theme-circle-radius',
         `${maxRadius}px`,
      );

      // Trigger View Transition
      document.startViewTransition(() => {
         flushSync(() => {
            localStorage.setItem(storageKey, newTheme);
            setThemeState(newTheme);

            // Update DOM classes synchronously for transition snapshot capture
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
      // Check if current active state is dark (including system preference)
      const isCurrentlyDark =
         theme === 'dark' ||
         (theme === 'system' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

      const nextTheme: Theme = isCurrentlyDark ? 'light' : 'dark';
      setTheme(nextTheme);
   };

   const value = {
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
