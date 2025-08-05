import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { CivicAppSidebar } from '@/components/layout/CivicAppSidebar';
import { CivicAppHeader } from '@/components/layout/CivicAppHeader';
import { Toaster } from '@/components/ui/toaster';
import { UserOnboarding } from '@/components/onboarding/UserOnboarding';
import { MobileBottomNav } from '@/components/camerpulse/MobileBottomNav';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

interface CivicAuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function CivicAuthenticatedLayout({ children }: CivicAuthenticatedLayoutProps) {
  const { user } = useAuth();
  const { isMobile } = useMobileDetection();
  const location = useLocation();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    // Check if user needs onboarding
    const hasCompletedOnboarding = localStorage.getItem(`onboarding_completed_${user?.id}`);
    const hasSkippedOnboarding = localStorage.getItem(`onboarding_skipped_${user?.id}`);
    
    if (!hasCompletedOnboarding && !hasSkippedOnboarding && user) {
      setShowOnboarding(true);
    }
  }, [user?.id]);

  useEffect(() => {
    // Update active tab based on current route
    const pathToTab: Record<string, string> = {
      '/': 'home',
      '/dashboard': 'home',
      '/feed': 'messages',
      '/villages': 'create',
      '/petitions': 'polls',
      '/profile': 'profile',
      '/settings': 'profile'
    };
    
    const currentTab = pathToTab[location.pathname] || 'home';
    setActiveTab(currentTab);
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Navigate to appropriate route
    const tabToPath: Record<string, string> = {
      'home': '/',
      'polls': '/petitions',
      'create': '/villages',
      'messages': '/feed',
      'profile': '/settings'
    };
    
    const path = tabToPath[tab];
    if (path && path !== location.pathname) {
      navigate(path);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {!isMobile && <CivicAppSidebar />}
        <div className="flex-1 flex flex-col">
          {!isMobile && <CivicAppHeader />}
          <main className={`flex-1 overflow-auto ${isMobile ? 'pb-20' : ''}`}>
            {children}
          </main>
        </div>
        
        {isMobile && (
          <MobileBottomNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
            unreadMessages={0}
            unreadNotifications={0}
          />
        )}
      </div>
      
      <UserOnboarding
        isVisible={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
        onDismiss={() => setShowOnboarding(false)}
      />
      
      <Toaster />
    </SidebarProvider>
  );
}