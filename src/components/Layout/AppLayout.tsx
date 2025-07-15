import { ReactNode } from 'react';
import { ThemeAwareHeader } from './ThemeAwareHeader';
import { MobileNavigation } from './MobileNavigation';
import { PWAInstallPrompt } from './PWAInstallPrompt';

interface AppLayoutProps {
  children: ReactNode;
  showMobileNav?: boolean;
}

export const AppLayout = ({ children, showMobileNav = true }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <ThemeAwareHeader />
      
      <main className="flex-1">
        {children}
      </main>
      
      {showMobileNav && <MobileNavigation />}
      <PWAInstallPrompt />
    </div>
  );
};