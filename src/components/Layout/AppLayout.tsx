import { ReactNode } from 'react';
import { ThemeAwareHeader } from './ThemeAwareHeader';
import { MobileNavigation } from './MobileNavigation';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { LuxAeternaParticles } from '@/components/Theme/LuxAeternaParticles';
import { LuxAeternaEffects } from '@/components/Theme/LuxAeternaEffects';

interface AppLayoutProps {
  children: ReactNode;
  showMobileNav?: boolean;
}

export const AppLayout = ({ children, showMobileNav = true }: AppLayoutProps) => {
  return (
    <LuxAeternaEffects>
      <div className="min-h-screen bg-background">
        <LuxAeternaParticles />
        <ThemeAwareHeader />
        
        <main className="flex-1 relative z-10">
          {children}
        </main>
        
        {showMobileNav && <MobileNavigation />}
        <PWAInstallPrompt />
      </div>
    </LuxAeternaEffects>
  );
};