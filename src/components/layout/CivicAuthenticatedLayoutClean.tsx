import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ModernSidebar } from '@/components/layout/ModernSidebar';
import { ModernHeader } from '@/components/layout/ModernHeader';
import { Toaster } from '@/components/ui/toaster';
import { OnboardingManager } from '@/components/onboarding/OnboardingManager';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { useMobileDetection } from '@/hooks/useMobileDetection';

interface CivicAuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function CivicAuthenticatedLayout({ children }: CivicAuthenticatedLayoutProps) {
  const { isMobile } = useMobileDetection();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {!isMobile && <ModernSidebar />}
        <div className="flex-1 flex flex-col">
          <ModernHeader />
          <main className={`flex-1 overflow-auto ${isMobile ? 'pb-16' : ''}`}>
            {children}
          </main>
        </div>
      </div>
      {isMobile && <MobileBottomNav />}
      <OnboardingManager />
      <Toaster />
    </SidebarProvider>
  );
}