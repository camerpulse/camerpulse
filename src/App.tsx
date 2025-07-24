import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PluginProvider } from "./contexts/PluginContext";
import { RealtimeProvider } from "./contexts/RealtimeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { OfflineIndicator } from "./components/pwa/OfflineIndicator";
import Layout from '@/components/Layout';
import CamerPulseHome from '@/pages/CamerPulseHome';
import Auth from './pages/Auth';
import { AdvancedSearch } from '@/components/AdvancedSearch';
import { VerificationCenter } from '@/components/VerificationCenter';
import { BusinessLogicDashboard } from '@/components/business-logic/BusinessLogicDashboard';
import { CamertendersAdminPanel } from '@/plugins/camertenders/CamertendersAdminPanel';
import { CivicTenderWatchlist } from '@/plugins/camertenders/CivicTenderWatchlist';
import { RecommendationEngine } from '@/components/RecommendationEngine';
import UserProfilePage from '@/pages/UserProfilePage';
import CompanyDashboard from '@/pages/CompanyDashboard';
// import DiasporaAuth from '@/pages/DiasporaAuth';
import { LegislationTracker } from "./pages/LegislationTracker";
import CivicReputationPage from "@/pages/CivicReputationPage";
import TopPoliticiansPage from "@/pages/rankings/TopPoliticiansPage";
import TrustedMayorsPage from "@/pages/rankings/TrustedMayorsPage";
import FallingReputationPage from "@/pages/rankings/FallingReputationPage";
import CivicModerationPage from "@/pages/admin/CivicModerationPage";
import AdminSettingsPanel from "@/pages/admin/AdminSettingsPanel";
import HospitalsDirectory from "./pages/HospitalsDirectory";
import Tenders from "./pages/Tenders";
import TenderDetail from "./pages/TenderDetail";
import { BidSubmissionForm } from './components/BidSubmissionForm';
import { UserDashboard } from './components/UserDashboard';
import { NotFoundPage } from './components/NotFoundPage';
import { CreateTender } from './components/CreateTender';
import { TenderManagementDashboard } from './components/TenderManagementDashboard';
import { UserManagementDashboard } from './components/UserManagement/UserManagementDashboard';
import { DocumentVerificationDashboard } from './components/Documents/DocumentVerificationDashboard';
import { NotificationCenter } from './components/Notifications/NotificationCenter';

import TenderAnalytics from "./pages/TenderAnalytics";
import SearchInterface from "./components/SearchInterface";
import TenderIssuerDashboard from "./pages/TenderIssuerDashboard";
import BidderDashboard from "./pages/BidderDashboard";
import DiasporaConnect from "./pages/DiasporaConnect";
import { TenderPlatformDashboard } from "./components/Admin/TenderPlatformDashboard";
import { UserModerationTools } from "./components/Admin/UserModerationTools";
import { TenderApprovalWorkflow } from "./components/Admin/TenderApprovalWorkflow";
import { MobileAppFeatures } from "./components/ui/mobile-app-features";
import { EnhancedTenderList } from "./components/enhanced/EnhancedTenderList";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PluginProvider>
            <RealtimeProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <OfflineIndicator />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Layout />}>
                      <Route index element={<CamerPulseHome />} />
                      <Route path="search" element={<AdvancedSearch />} />
                      <Route path="verification" element={<VerificationCenter />} />
                      <Route path="recommendations" element={<RecommendationEngine />} />
                      <Route path="profile/:userId" element={<UserProfilePage />} />
                      <Route path="company" element={<CompanyDashboard />} />
                      <Route path="legislation" element={<LegislationTracker />} />
                      <Route path="hospitals" element={<HospitalsDirectory />} />
                      <Route path="tenders" element={<Tenders />} />
                      <Route path="tenders/create" element={<CreateTender />} />
                      <Route path="tenders/:id" element={<TenderDetail />} />
                      <Route path="tenders/:id/bid" element={<BidSubmissionForm />} />
                      <Route path="tenders/:id/analytics" element={<TenderAnalytics />} />
                      <Route path="dashboard" element={<UserDashboard />} />
                      <Route path="business-logic" element={<BusinessLogicDashboard />} />
                      <Route path="admin/tenders" element={<CamertendersAdminPanel />} />
                      <Route path="tenders/watchlist" element={<CivicTenderWatchlist />} />
                      <Route path="tender-management" element={<TenderManagementDashboard />} />
                      <Route path="user-management" element={<UserManagementDashboard />} />
                      <Route path="document-verification" element={<DocumentVerificationDashboard />} />
                      <Route path="notifications" element={<NotificationCenter />} />
                      <Route path="search-interface" element={<SearchInterface />} />
                      <Route path="analytics" element={<TenderAnalytics />} />
                      <Route path="dashboard/tenders" element={<TenderIssuerDashboard />} />
                      <Route path="my-bids" element={<BidderDashboard />} />
                      <Route path="diaspora-connect" element={<DiasporaConnect />} />
                      <Route path="admin/platform" element={<TenderPlatformDashboard />} />
                      <Route path="admin/moderation" element={<UserModerationTools />} />
                      <Route path="admin/approvals" element={<TenderApprovalWorkflow />} />
                      <Route path="mobile-features" element={<MobileAppFeatures />} />
                      <Route path="enhanced-list" element={<EnhancedTenderList />} />
                      <Route path="civic-reputation" element={<CivicReputationPage />} />
                      <Route path="rankings/top-politicians" element={<TopPoliticiansPage />} />
                      <Route path="rankings/trusted-mayors" element={<TrustedMayorsPage />} />
                      <Route path="rankings/falling-reputation" element={<FallingReputationPage />} />
                      <Route path="admin/civic-moderation" element={<CivicModerationPage />} />
                      <Route path="admin/reputation-settings" element={<AdminSettingsPanel />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>
                    <Route path="/auth" element={<Layout showFooter={false} />}>
                      <Route index element={<Auth />} />
                    </Route>
                    <Route path="/diaspora-auth" element={<Layout showFooter={false} />}>
                      <Route index element={<div>Diaspora Auth Page</div>} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </RealtimeProvider>
          </PluginProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;