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
import Admin from './pages/Admin';
import { CivicTenderWatchlist } from '@/plugins/camertenders/CivicTenderWatchlist';
import { RecommendationEngine } from '@/components/RecommendationEngine';
import UserProfilePage from '@/pages/UserProfilePage';
import CompanyDashboard from '@/pages/CompanyDashboard';
import JobsPage from '@/pages/JobsPage';
import AboutPage from '@/pages/AboutPage';
import ActivityPage from '@/pages/ActivityPage';
import SchoolsPage from '@/pages/SchoolsPage';
import PharmaciesPage from '@/pages/PharmaciesPage';
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
import PollsDashboard from "./pages/PollsDashboard";
import PoliticiansPage from "./pages/PoliticiansPage";
import VillagesPage from "./pages/VillagesPage";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import SupportPage from "./pages/SupportPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import CookiesPage from "./pages/CookiesPage";
import JudiciaryPage from "./pages/JudiciaryPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import VillagesSearchPage from "./pages/VillagesSearchPage";

// Missing page imports that need to be created
const ChurchesPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Churches Directory</h1><p>Coming soon...</p></div>;
const TraditionalLeadersPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Traditional Leaders</h1><p>Coming soon...</p></div>;
const BillionairesPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Billionaires Directory</h1><p>Coming soon...</p></div>;
import CamerPlayHome from "./pages/CamerPlayHome";
import ArtistDashboard from "./pages/ArtistDashboard";
const VideosPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Video Center</h1><p>Coming soon...</p></div>;
const SenatorsPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Senators</h1><p>Coming soon...</p></div>;
const MPsPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">MPs (Members of Parliament)</h1><p>Coming soon...</p></div>;
const MinistersPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Ministers</h1><p>Coming soon...</p></div>;
const MayorsPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Mayors</h1><p>Coming soon...</p></div>;
const GovernorsPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Governors</h1><p>Coming soon...</p></div>;
const CouncilsPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Councils</h1><p>Coming soon...</p></div>;
const ProjectsPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Government Projects</h1><p>Coming soon...</p></div>;
const PetitionsPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Petitions</h1><p>Coming soon...</p></div>;
const ComplaintsPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Complaints</h1><p>Coming soon...</p></div>;
const RatingsPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Ratings & Reviews</h1><p>Coming soon...</p></div>;
const PulseMessengerPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Pulse Messenger</h1><p>Coming soon...</p></div>;
const LawsPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Laws & Constitution</h1><p>Coming soon...</p></div>;
const GovernmentHierarchyPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Government Hierarchy</h1><p>Coming soon...</p></div>;
const FAQsPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">FAQs</h1><p>Coming soon...</p></div>;
const ContactPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Contact</h1><p>Coming soon...</p></div>;
const PartnershipsPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Partnerships</h1><p>Coming soon...</p></div>;
const PressPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Press</h1><p>Coming soon...</p></div>;
const DonatePage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Donate</h1><p>Coming soon...</p></div>;
const ReportBugPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Report a Bug</h1><p>Coming soon...</p></div>;
const EventsPage = () => <div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Events</h1><p>Coming soon...</p></div>;


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
                        <Route path="polls" element={<PollsDashboard />} />
                        <Route path="politicians" element={<PoliticiansPage />} />
                        <Route path="villages" element={<VillagesPage />} />
                        <Route path="villages/search" element={<VillagesSearchPage />} />
                        <Route path="pulse" element={<AnalyticsDashboard />} />
                       <Route path="profile" element={<ProfilePage />} />
                       <Route path="settings" element={<SettingsPage />} />
                       <Route path="support" element={<SupportPage />} />
                       <Route path="privacy" element={<PrivacyPage />} />
                       <Route path="terms" element={<TermsPage />} />
                       <Route path="cookies" element={<CookiesPage />} />
                       <Route path="judiciary" element={<JudiciaryPage />} />
                       <Route path="analytics" element={<AnalyticsDashboard />} />
                       
                       {/* Civic Directories */}
                       <Route path="churches" element={<ChurchesPage />} />
                       <Route path="traditional-leaders" element={<TraditionalLeadersPage />} />
                       
                       {/* Businesses */}
                       <Route path="billionaires" element={<BillionairesPage />} />
                       
                        {/* Media & Engagement */}
                        <Route path="camerplay" element={<CamerPlayHome />} />
                        <Route path="events" element={<EventsPage />} />
                        <Route path="artists" element={<ArtistDashboard />} />
                       <Route path="videos" element={<VideosPage />} />
                       
                       {/* Government & Officials */}
                       <Route path="senators" element={<SenatorsPage />} />
                       <Route path="mps" element={<MPsPage />} />
                       <Route path="ministers" element={<MinistersPage />} />
                       <Route path="mayors" element={<MayorsPage />} />
                       <Route path="governors" element={<GovernorsPage />} />
                       <Route path="councils" element={<CouncilsPage />} />
                       <Route path="projects" element={<ProjectsPage />} />
                       
                       {/* Civic Tools */}
                       <Route path="petitions" element={<PetitionsPage />} />
                       <Route path="complaints" element={<ComplaintsPage />} />
                       <Route path="ratings" element={<RatingsPage />} />
                       <Route path="pulse-messenger" element={<PulseMessengerPage />} />
                       
                       {/* Knowledge */}
                       <Route path="laws" element={<LawsPage />} />
                       <Route path="government-hierarchy" element={<GovernmentHierarchyPage />} />
                       <Route path="faqs" element={<FAQsPage />} />
                       
                       {/* More */}
                       <Route path="contact" element={<ContactPage />} />
                       <Route path="partnerships" element={<PartnershipsPage />} />
                       <Route path="press" element={<PressPage />} />
                       <Route path="donate" element={<DonatePage />} />
                       <Route path="report-bug" element={<ReportBugPage />} />
                       
                       {/* Existing Routes */}
                       <Route path="search" element={<AdvancedSearch />} />
                       <Route path="verification" element={<VerificationCenter />} />
                       <Route path="recommendations" element={<RecommendationEngine />} />
                       <Route path="profile/:userId" element={<UserProfilePage />} />
                       <Route path="company" element={<CompanyDashboard />} />
                       <Route path="jobs" element={<JobsPage />} />
                       <Route path="about" element={<AboutPage />} />
                       <Route path="activity" element={<ActivityPage />} />
                       <Route path="schools" element={<SchoolsPage />} />
                       <Route path="pharmacies" element={<PharmaciesPage />} />
                       <Route path="legislation" element={<LegislationTracker />} />
                       <Route path="hospitals" element={<HospitalsDirectory />} />
                       <Route path="tenders" element={<Tenders />} />
                       <Route path="tenders/create" element={<CreateTender />} />
                       <Route path="tenders/:id" element={<TenderDetail />} />
                       <Route path="tenders/:id/bid" element={<BidSubmissionForm />} />
                       <Route path="tenders/:id/analytics" element={<TenderAnalytics />} />
                       <Route path="dashboard" element={<UserDashboard />} />
                       <Route path="business-logic" element={<BusinessLogicDashboard />} />
                       <Route path="admin" element={<Admin />} />
                       <Route path="admin/tenders" element={<CamertendersAdminPanel />} />
                       <Route path="tenders/watchlist" element={<CivicTenderWatchlist />} />
                       <Route path="tender-management" element={<TenderManagementDashboard />} />
                       <Route path="user-management" element={<UserManagementDashboard />} />
                       <Route path="document-verification" element={<DocumentVerificationDashboard />} />
                       <Route path="notifications" element={<NotificationCenter />} />
                       <Route path="search-interface" element={<SearchInterface />} />
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
