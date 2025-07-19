import { ReactNode } from 'react';
import { ServicesHeader } from './ServicesHeader';
import { ServicesFooter } from './ServicesFooter';
import { MobileNavigation } from './MobileNavigation';
import { PWAInstallPrompt } from './PWAInstallPrompt';

interface ServicesLayoutProps {
  children: ReactNode;
  showMobileNav?: boolean;
  serviceType?: 'villages' | 'hospitals' | 'schools' | 'pharmacies';
}

export const ServicesLayout = ({ children, showMobileNav = true, serviceType = 'villages' }: ServicesLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ServicesHeader serviceType={serviceType} />
      
      <main className="flex-1 relative z-10">
        {children}
      </main>
      
      <ServicesFooter serviceType={serviceType} />
      
      {showMobileNav && <MobileNavigation />}
      <PWAInstallPrompt />
    </div>
  );
};