import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { CivicAppSidebar } from '@/components/layout/CivicAppSidebar';
import { CivicAppHeader } from '@/components/layout/CivicAppHeader';
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
        {!isMobile && <CivicAppSidebar />}
        <div className="flex-1 flex flex-col">
          <CivicAppHeader />
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