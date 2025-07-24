import { ReactNode } from 'react';
import { CamerJobsHeader } from './CamerJobsHeader';
import { CamerJobsFooter } from './CamerJobsFooter';
import { MobileNavigation } from './MobileNavigation';
import { PWAInstallPrompt } from './PWAInstallPrompt';

interface CamerJobsLayoutProps {
  children: ReactNode;
  showMobileNav?: boolean;
}

export const CamerJobsLayout = ({ children, showMobileNav = true }: CamerJobsLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CamerJobsHeader />
      
      <main className="flex-1 relative z-10">
        {children}
      </main>
      
      <CamerJobsFooter />
      
      {showMobileNav && <MobileNavigation />}
      <PWAInstallPrompt />
    </div>
  );
};