import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { CamerPulseDashboard } from '@/pages/CamerPulseDashboard';
import { CivicAuthenticatedLayout } from '@/components/layout/CivicAuthenticatedLayoutClean';
import { Dashboard } from '@/pages/Dashboard';
import { TrackingPage } from '@/components/LabelDesigner/TrackingPage';
import { SettingsPage } from '@/pages/SettingsPage';
import Feed from '@/pages/Feed';
import AuthPage from '@/pages/AuthPage';
import ShippingLabels from '@/pages/ShippingLabels';
import { PublicHomePage } from '@/pages/PublicHomePage';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { PluginProvider } from '@/contexts/PluginContext';
import { PluginRouter } from '@/components/Plugin/PluginRouter';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

// Admin imports
import Admin from '@/pages/Admin';
import CamerPulseAdminCore from '@/pages/CamerPulseAdminCore';
import AdminRoutes from '@/pages/AdminRoutes';
import ModerationDashboard from '@/pages/ModerationDashboard';
import MarketplaceAdmin from '@/pages/MarketplaceAdmin';
import AdminDataImport from '@/pages/AdminDataImport';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});


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
        
        {/* Plugin Routes */}
        <Route path="/logistics/*" element={<PluginRouter user={user} />} />
        
        {/* Auth Route */}
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Default redirect based on authentication */}
        {!user && <Route path="*" element={<PublicHomePage />} />}
        
        {/* Authenticated Routes */}
        {user && (
          <>
            <Route path="/" element={<CivicAuthenticatedLayout><Feed /></CivicAuthenticatedLayout>} />
            <Route path="/feed" element={<CivicAuthenticatedLayout><Feed /></CivicAuthenticatedLayout>} />
            <Route path="/dashboard" element={<CivicAuthenticatedLayout><CamerPulseDashboard /></CivicAuthenticatedLayout>} />
            <Route path="/settings" element={<CivicAuthenticatedLayout><SettingsPage /></CivicAuthenticatedLayout>} />
            <Route path="/shipping-labels" element={<CivicAuthenticatedLayout><ShippingLabels /></CivicAuthenticatedLayout>} />
            
            {/* Unified Admin Routes */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/core" element={<CamerPulseAdminCore />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
            
            {/* Legacy Admin Routes (Redirected to Core) */}
            <Route path="/admin/moderation" element={<CamerPulseAdminCore />} />
            <Route path="/admin/marketplace" element={<CamerPulseAdminCore />} />
            <Route path="/admin/data-import" element={<CamerPulseAdminCore />} />
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
        <PluginProvider>
          <Router>
            <AppContent />
          </Router>
        </PluginProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;