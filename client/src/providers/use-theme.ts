import { createContext, use } from 'react';

export type Theme = 'system' | 'light' | 'dark';

export type ThemeProviderState = {
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;
  theme: Theme;
};

export const initialState: ThemeProviderState = {
  toggleTheme: () => null,
  resolvedTheme: 'light',
  setTheme: () => null,
  theme: 'system',
};

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export const useTheme = (): ThemeProviderState => {
  const context = use(ThemeProviderContext);

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
