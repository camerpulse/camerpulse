import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import AuthPage from '@/pages/AuthPage';
import { CamerPulseDashboard } from '@/pages/CamerPulseDashboard';
import { CivicAuthenticatedLayout } from '@/components/layout/CivicAuthenticatedLayout';
import { PoliticiansPage } from '@/pages/PoliticiansPage';
import { PoliticalPartiesPage } from '@/pages/PoliticalPartiesPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { VillagesPage } from '@/pages/VillagesPage';
import { CivicEducationPage } from '@/pages/CivicEducationPage';
import { TransparencyPage } from '@/pages/TransparencyPage';
import NewFeed from '@/pages/NewFeed';
import JobBoard from '@/pages/jobs/JobBoard';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { PluginProvider } from '@/contexts/PluginContext';
import Petitions from '@/pages/Petitions';
import PetitionDetail from '@/pages/PetitionDetail';
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
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading CamerPulse...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Home Route - Shows different content based on auth */}
        <Route path="/" element={
          user ? (
            <CivicAuthenticatedLayout>
              <CamerPulseDashboard />
            </CivicAuthenticatedLayout>
          ) : (
            <HomePage />
          )
        } />
        
        {/* Authenticated Routes */}
        {user && (
          <>
            <Route path="/dashboard" element={
              <CivicAuthenticatedLayout>
                <CamerPulseDashboard />
              </CivicAuthenticatedLayout>
            } />
            <Route path="/feed" element={
              <CivicAuthenticatedLayout>
                <NewFeed />
              </CivicAuthenticatedLayout>
            } />
            <Route path="/politicians" element={
              <CivicAuthenticatedLayout>
                <PoliticiansPage />
              </CivicAuthenticatedLayout>
            } />
            <Route path="/political-parties" element={
              <CivicAuthenticatedLayout>
                <PoliticalPartiesPage />
              </CivicAuthenticatedLayout>
            } />
            <Route path="/petitions" element={
              <CivicAuthenticatedLayout>
                <Petitions />
              </CivicAuthenticatedLayout>
            } />
            <Route path="/petitions/:id" element={
              <CivicAuthenticatedLayout>
                <PetitionDetail />
              </CivicAuthenticatedLayout>
            } />
            <Route path="/jobs" element={
              <CivicAuthenticatedLayout>
                <JobBoard />
              </CivicAuthenticatedLayout>
            } />
            <Route path="/villages" element={
              <CivicAuthenticatedLayout>
                <VillagesPage />
              </CivicAuthenticatedLayout>
            } />
            <Route path="/civic-education" element={
              <CivicAuthenticatedLayout>
                <CivicEducationPage />
              </CivicAuthenticatedLayout>
            } />
            <Route path="/transparency" element={
              <CivicAuthenticatedLayout>
                <TransparencyPage />
              </CivicAuthenticatedLayout>
            } />
            <Route path="/settings" element={
              <CivicAuthenticatedLayout>
                <SettingsPage />
              </CivicAuthenticatedLayout>
            } />
          </>
        )}

        {/* Catch all for non-authenticated users */}
        {!user && <Route path="*" element={<HomePage />} />}
      </Routes>
      
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <PluginProvider>
            <Router>
              <AppContent />
            </Router>
          </PluginProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;