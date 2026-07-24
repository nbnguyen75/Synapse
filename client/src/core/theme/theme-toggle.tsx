import { Button } from '@/shared/components/ui/button';

import { SunIcon, MoonIcon, MonitorIcon } from 'lucide-react';

import { useTheme } from '@/core/theme/theme-provider';

export function ThemeToggle({ className }: { className?: string }) {
   const { setTheme, theme } = useTheme();

   const cycle = () => {
      if (theme === 'light') setTheme('dark');
      else if (theme === 'dark') setTheme('system');
      else setTheme('light');
   };

   return (
      <Button
         variant="ghost"
         size="icon-sm"
         onClick={cycle}
         className={className}
         title={`Current theme: ${theme}`}
         aria-label="Toggle theme"
      >
         {theme === 'light' && <SunIcon className="size-4" />}
         {theme === 'dark' && <MoonIcon className="size-4" />}
         {theme === 'system' && <MonitorIcon className="size-4" />}
      </Button>
   );
}
