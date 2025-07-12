import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDarkMode } from '@/hooks/useDarkMode';
import { cn } from '@/lib/utils';

interface DarkModeToggleProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export const DarkModeToggle = ({ className, size = 'default' }: DarkModeToggleProps) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <Button
      variant="ghost"
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'icon'}
      onClick={toggleDarkMode}
      className={cn(
        "relative transition-all duration-200",
        size === 'sm' && "h-8 w-8",
        className
      )}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Sun className={cn(
        "transition-all duration-300 rotate-0 scale-100",
        isDarkMode && "rotate-90 scale-0",
        size === 'sm' ? "h-3 w-3" : "h-4 w-4"
      )} />
      <Moon className={cn(
        "absolute transition-all duration-300 rotate-90 scale-0",
        isDarkMode && "rotate-0 scale-100",
        size === 'sm' ? "h-3 w-3" : "h-4 w-4"
      )} />
    </Button>
  );
};