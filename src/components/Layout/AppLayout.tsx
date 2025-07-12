import { ReactNode } from 'react';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { ThemeStatusBadge } from '@/components/Theme/ThemeStatusBadge';
import { PowerIndicator } from '@/components/Theme/PowerIndicator';
import { useTheme } from '@/contexts/ThemeContext';

interface AppLayoutProps {
  children: ReactNode;
  showMobileNav?: boolean;
}

export const AppLayout = ({ children, showMobileNav = true }: AppLayoutProps) => {
  const { currentTheme } = useTheme();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="flex-1">
        {children}
      </main>
      
      {showMobileNav && <MobileNavigation />}
      <PWAInstallPrompt />
      
      {/* Theme Status Badge - Shows current active theme */}
      <ThemeStatusBadge position="top-right" />
      
      {/* Power Indicator - Only for Emergence 2035 theme */}
      {currentTheme.id === 'emergence-2035' && (
        <PowerIndicator position="fixed" />
      )}
    </div>
  );
};