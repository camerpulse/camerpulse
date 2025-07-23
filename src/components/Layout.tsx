import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import MobileNavigation from '@/components/MobileNavigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  showBreadcrumbs?: boolean;
  breadcrumbItems?: Array<{
    label: string;
    path?: string;
    icon?: React.ComponentType<any>;
  }>;
  userRole?: 'citizen' | 'bidder' | 'issuer' | 'admin' | 'government';
}

export default function Layout({ 
  showBreadcrumbs = true, 
  breadcrumbItems,
  userRole = 'citizen'
}: LayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <Navigation />
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden bg-background border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">CT</span>
              </div>
              <span className="text-lg font-bold">CamerTenders</span>
            </div>
            
            {/* Mobile Menu & Notifications */}
            <div className="flex items-center space-x-2">
              {user && <div className="mr-2"><NotificationBell /></div>}
              <MobileNavigation userRole={userRole} user={user} />
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <div className="bg-muted/30 border-b">
          <div className="container mx-auto px-4 py-3">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}