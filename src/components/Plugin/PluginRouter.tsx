import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useEnabledPlugins } from '@/hooks/usePluginSystem';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Toaster } from '@/components/ui/toaster';
import { CamerLogisticsLandingPage } from '@/pages/CamerLogisticsLandingPage';
import { TrackingPage } from '@/components/LabelDesigner/TrackingPage';
import DeliveryCompaniesDirectory from '@/pages/DeliveryCompaniesDirectory';
import DeliveryCompanyRegister from '@/pages/DeliveryCompanyRegister';
import { Dashboard } from '@/pages/Dashboard';
import { ShipPackagePage } from '@/pages/logistics/ShipPackagePage';
import { ServicesPage } from '@/pages/logistics/ServicesPage';
import { ExpressDeliveryPage } from '@/pages/logistics/ExpressDeliveryPage';
import { BusinessSolutionsPage } from '@/pages/logistics/BusinessSolutionsPage';

// Logistics Authenticated Layout
function LogisticsAuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <AppHeader />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

export function PluginRouter({ user }: { user: any }) {
  const { data: enabledPlugins = [], isLoading } = useEnabledPlugins();

  if (isLoading) return null;

  const isPluginEnabled = (pluginName: string) => {
    return enabledPlugins.some(plugin => plugin.plugin_name === pluginName);
  };

  return (
    <Routes>
      {/* Camer Logistics Plugin Routes */}
      {isPluginEnabled('camer-logistics') && (
        <>
          {/* Public Routes */}
          <Route path="/" element={<CamerLogisticsLandingPage />} />
          <Route path="/ship" element={<ShipPackagePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/express" element={<ExpressDeliveryPage />} />
          <Route path="/business" element={<BusinessSolutionsPage />} />
          <Route path="/tracking" element={<TrackingPage />} />
          <Route path="/tracking/:trackingNumber" element={<TrackingPage />} />
          <Route path="/companies" element={<DeliveryCompaniesDirectory />} />
          <Route path="/join-company" element={<DeliveryCompanyRegister />} />
          
          {/* Authenticated Routes */}
          {user && (
            <Route 
              path="/dashboard" 
              element={
                <LogisticsAuthenticatedLayout>
                  <Dashboard />
                </LogisticsAuthenticatedLayout>
              }
            />
          )}
        </>
      )}
    </Routes>
  );
}