import { ReactNode } from 'react';
import { CamerLogisticsHeader } from './CamerLogisticsHeader';
import { CamerLogisticsFooter } from './CamerLogisticsFooter';
import { MobileNavigation } from './MobileNavigation';
import { PWAInstallPrompt } from './PWAInstallPrompt';

interface CamerLogisticsLayoutProps {
  children: ReactNode;
  showMobileNav?: boolean;
}

export const CamerLogisticsLayout = ({ children, showMobileNav = true }: CamerLogisticsLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CamerLogisticsHeader />
      
      <main className="flex-1 relative z-10">
        {children}
      </main>
      
      <CamerLogisticsFooter />
      
      {showMobileNav && <MobileNavigation />}
      <PWAInstallPrompt />
    </div>
  );
};