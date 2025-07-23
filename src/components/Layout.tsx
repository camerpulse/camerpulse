import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileNavigation from '@/components/MobileNavigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  showBreadcrumbs?: boolean;
  showFooter?: boolean;
  breadcrumbItems?: Array<{
    label: string;
    path?: string;
    icon?: React.ComponentType<any>;
  }>;
  userRole?: 'citizen' | 'bidder' | 'issuer' | 'admin' | 'government';
}

export default function Layout({ 
  showBreadcrumbs = true, 
  showFooter = true,
  breadcrumbItems,
  userRole = 'citizen'
}: LayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Enhanced Header */}
      <Header />
      
      {/* Mobile Navigation Fallback - Only show if needed */}
      <div className="md:hidden">
        <MobileNavigation userRole={userRole} user={user} />
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

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
}