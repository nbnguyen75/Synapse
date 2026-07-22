import { Button } from '@/shared/components/ui/button';

import { Sun, Moon, Monitor } from 'lucide-react';

import { useTheme } from '@/core/components/theme-provider';

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
         title={theme}
      >
         {theme === 'light' && <Sun className="size-4" />}
         {theme === 'dark' && <Moon className="size-4" />}
         {theme === 'system' && <Monitor className="size-4" />}
      </Button>
   );
}
