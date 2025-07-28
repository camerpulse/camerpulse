import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { CamerPulseDashboard } from '@/pages/CamerPulseDashboard';
import { CivicAuthenticatedLayout } from '@/components/layout/CivicAuthenticatedLayout';
import { Dashboard } from '@/pages/Dashboard';
import { TrackingPage } from '@/components/LabelDesigner/TrackingPage';
import { SettingsPage } from '@/pages/SettingsPage';
import AuthPage from '@/pages/AuthPage';
import DeliveryCompaniesDirectory from '@/pages/DeliveryCompaniesDirectory';
import DeliveryCompanyRegister from '@/pages/DeliveryCompanyRegister';
import { PublicHomePage } from '@/pages/PublicHomePage';
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
        
        {/* Logistics Dashboard - Authenticated Routes */}
        {user && (
          <>
            <Route path="/logistics/dashboard" element={<AuthenticatedLayout><Dashboard /></AuthenticatedLayout>} />
          </>
        )}
        
        {/* Auth Route */}
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Default redirect based on authentication */}
        {!user && <Route path="*" element={<PublicHomePage />} />}
        
        {/* Authenticated Routes */}
        {user && (
          <>
            <Route path="/" element={<CivicAuthenticatedLayout><CamerPulseDashboard /></CivicAuthenticatedLayout>} />
            <Route path="/dashboard" element={<CivicAuthenticatedLayout><CamerPulseDashboard /></CivicAuthenticatedLayout>} />
            <Route path="/settings" element={<CivicAuthenticatedLayout><SettingsPage /></CivicAuthenticatedLayout>} />
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