import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileNavigation } from './MobileNavigation';
import { PWAInstallPrompt } from './PWAInstallPrompt';

interface AppLayoutProps {
  children: ReactNode;
  showMobileNav?: boolean;
}

export const AppLayout = ({ children, showMobileNav = true }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 relative z-10">
        {children}
      </main>
      
      <Footer />
      
      {showMobileNav && <MobileNavigation />}
      <PWAInstallPrompt />
    </div>
  );
};