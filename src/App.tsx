import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Dashboard } from '@/pages/Dashboard';
import { LabelDesignerPage } from '@/components/LabelDesigner/LabelDesignerPage';
import { AdvancedLabelBuilder } from '@/components/LabelDesigner/AdvancedLabelBuilder';
import { TrackingPage } from '@/components/LabelDesigner/TrackingPage';
import { PrintHistoryPage } from '@/components/LabelDesigner/PrintHistoryPage';
import { ScannerInterface } from '@/components/LabelDesigner/ScannerInterface';
import { TemplateManager } from '@/components/LabelDesigner/TemplateManager';
import { BulkLabelGenerator } from '@/components/LabelDesigner/BulkLabelGenerator';
import { SettingsPage } from '@/pages/SettingsPage';
import AuthPage from '@/pages/AuthPage';
import DeliveryCompaniesDirectory from '@/pages/DeliveryCompaniesDirectory';
import DeliveryCompanyRegister from '@/pages/DeliveryCompanyRegister';
import { PublicHomePage } from '@/pages/PublicHomePage';
import { PlatformSelectorPage } from '@/pages/PlatformSelectorPage';
import { CamerLogisticsLandingPage } from '@/pages/CamerLogisticsLandingPage';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

// Authenticated Layout Component
function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
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

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Platform Selector - Main Entry Point */}
        <Route path="/" element={<PlatformSelectorPage />} />
        
        {/* Public Routes - No auth required */}
        <Route path="/public" element={<PublicHomePage />} />
        <Route path="/public/tracking" element={<TrackingPage />} />
        <Route path="/public/tracking/:trackingNumber" element={<TrackingPage />} />
        <Route path="/public/directory" element={<DeliveryCompaniesDirectory />} />
        <Route path="/public/register-company" element={<DeliveryCompanyRegister />} />
        
        {/* CamerLogistics Routes - No auth required */}
        <Route path="/logistics" element={<CamerLogisticsLandingPage />} />
        <Route path="/logistics/tracking" element={<TrackingPage />} />
        <Route path="/logistics/tracking/:trackingNumber" element={<TrackingPage />} />
        <Route path="/logistics/companies" element={<DeliveryCompaniesDirectory />} />
        <Route path="/logistics/join-company" element={<DeliveryCompanyRegister />} />
        
        {/* Auth Route */}
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Label Designer Platform - Authenticated Routes */}
        {user && (
          <>
            <Route path="/dashboard" element={<AuthenticatedLayout><Dashboard /></AuthenticatedLayout>} />
            <Route path="/designer" element={<AuthenticatedLayout><LabelDesignerPage /></AuthenticatedLayout>} />
            <Route path="/advanced-builder" element={<AuthenticatedLayout><AdvancedLabelBuilder /></AuthenticatedLayout>} />
            <Route path="/templates" element={<AuthenticatedLayout><TemplateManager /></AuthenticatedLayout>} />
            <Route path="/bulk-generator" element={<AuthenticatedLayout><BulkLabelGenerator /></AuthenticatedLayout>} />
            <Route path="/scanner" element={<AuthenticatedLayout><ScannerInterface /></AuthenticatedLayout>} />
            <Route path="/tracking" element={<AuthenticatedLayout><TrackingPage /></AuthenticatedLayout>} />
            <Route path="/tracking/:trackingNumber" element={<AuthenticatedLayout><TrackingPage /></AuthenticatedLayout>} />
            <Route path="/history" element={<AuthenticatedLayout><PrintHistoryPage /></AuthenticatedLayout>} />
            <Route path="/settings" element={<AuthenticatedLayout><SettingsPage /></AuthenticatedLayout>} />
          </>
        )}
      </Routes>
      
      {/* Toaster for public routes */}
      {!user && <Toaster />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;