import { ReactNode } from 'react';
import { CamerPlayHeader } from './CamerPlayHeader';
import { CamerPlayFooter } from './CamerPlayFooter';
import { MobileNavigation } from './MobileNavigation';
import { PWAInstallPrompt } from './PWAInstallPrompt';

interface CamerPlayLayoutProps {
  children: ReactNode;
  showMobileNav?: boolean;
}

export const CamerPlayLayout = ({ children, showMobileNav = true }: CamerPlayLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CamerPlayHeader />
      
      <main className="flex-1 relative z-10">
        {children}
      </main>
      
      <CamerPlayFooter />
      
      {showMobileNav && <MobileNavigation />}
      <PWAInstallPrompt />
    </div>
  );
};