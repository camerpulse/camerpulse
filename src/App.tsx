import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Dashboard } from '@/pages/Dashboard';
import { LabelDesignerPage } from '@/components/LabelDesigner/LabelDesignerPage';
import { PrintHistoryPage } from '@/components/LabelDesigner/PrintHistoryPage';
import { ScannerInterface } from '@/components/LabelDesigner/ScannerInterface';
import { TemplateManager } from '@/components/LabelDesigner/TemplateManager';
import { BulkLabelGenerator } from '@/components/LabelDesigner/BulkLabelGenerator';
import { SettingsPage } from '@/pages/SettingsPage';
import AuthPage from '@/pages/AuthPage';
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

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <AppHeader />
          
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/designer" element={<LabelDesignerPage />} />
              <Route path="/templates" element={<TemplateManager />} />
              <Route path="/bulk-generator" element={<BulkLabelGenerator />} />
              <Route path="/scanner" element={<ScannerInterface />} />
              <Route path="/history" element={<PrintHistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </div>
      
      <Toaster />
    </SidebarProvider>
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