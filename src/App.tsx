import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CivicFeed from "./pages/CivicFeed";
import PulseFeed from "./pages/PulseFeed";
import Feed from "./pages/Feed";
import Politicians from "./pages/Politicians";
import Security from "./pages/Security";
import Marketplace from "./pages/Marketplace";
import Polls from "./pages/Polls";
import PollsLandingPage from "./pages/PollsLandingPage";
import PollsDashboard from "./pages/PollsDashboard";
import PollsDiscovery from "./pages/PollsDiscovery";
import Donations from "./pages/Donations";
import Social from "./pages/Social";
import News from "./pages/News";
import Admin from "./pages/Admin";
import DesignSystemCore from "./pages/DesignSystemCore";
import CamerPulseAdminCore from "./pages/CamerPulseAdminCore";
import PoliticalParties from "./pages/PoliticalParties";
import PoliticalPartyDetail from "./pages/PoliticalPartyDetail";
import PoliticaAI from "./pages/PoliticaAI";
import CamerPulseIntelligence from "./pages/CamerPulseIntelligence";
import IntelligenceDashboard from "./pages/IntelligenceDashboard";
import IntelligenceDashboardDebug from "./pages/IntelligenceDashboardDebug";
import CivicPublicPortal from "./pages/CivicPublicPortal";
import ArtistLanding from "./pages/ArtistLanding";
import ArtistRegister from "./pages/ArtistRegister";
import ArtistDashboard from "./pages/ArtistDashboard";
import CamerPlayUpload from "./pages/CamerPlayUpload";
import CamerPlayPlayer from "./pages/CamerPlayPlayer";
import Promises from "./pages/Promises";
import RegionalAnalytics from "./pages/RegionalAnalytics";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";
import CompanyDirectory from "./pages/CompanyDirectory";
import CompanyRegister from "./pages/CompanyRegister";
import CompanyProfile from "./pages/CompanyProfile";
import CompanyDashboard from "./pages/CompanyDashboard";
import CompanyCreationRequest from "./pages/CompanyCreationRequest";
import BillionaireTracker from "./pages/BillionaireTracker";
import BillionaireApplication from "./pages/BillionaireApplication";
import BillionaireProfile from "./pages/BillionaireProfile";
import BillionaireAdmin from "./pages/BillionaireAdmin";
import NationalDebtTracker from "./pages/NationalDebtTracker";
import DebtAdmin from "./pages/DebtAdmin";
import ElectionForecast from "./pages/ElectionForecast";
import RewardsCenter from "./pages/RewardsCenter";
import PollArchive from "./pages/PollArchive";
import PollResultsPage from "./pages/PollResultsPage";
import PollEmbedGeneratorPage from "./pages/PollEmbedGeneratorPage";
import PollEmbedViewerPage from "./pages/PollEmbedViewerPage";
import MessengerPage from "./pages/MessengerPage";
import NotificationSettingsPage from "./pages/NotificationSettingsPage";
import CamerPulseMaster from "./pages/CamerPulseMaster";
import CamerPlayHome from "./pages/CamerPlayHome";
import CamerPlayAwards from "./pages/CamerPlayAwards";
import EcosystemDashboard from "./pages/EcosystemDashboard";
import FanPortal from "./pages/FanPortal";
import UserProfilePage from "./pages/UserProfilePage";
import ProfileSlugPage from "./pages/ProfileSlugPage";
import Events from "./pages/Events";
import EventCalendarPage from "./pages/EventCalendarPage";
import CertificateVerificationPage from "./pages/CertificateVerificationPage";
import VillagesDirectory from "./pages/VillagesDirectory";
import VillageProfile from "./pages/VillageProfile";
import { Analytics } from "./pages/Analytics";
import AddVillage from "./pages/AddVillage";
import VillageLeaderboards from "./pages/VillageLeaderboards";
import ModeratorPortal from "./pages/ModeratorPortal";
import { AuthProvider } from "./contexts/AuthContext";
import { MobileProvider } from "./contexts/MobileContext";
import { PanAfricaProvider } from "./contexts/PanAfricaContext";
import { PWAInstallPrompt } from "./components/pwa/PWAInstallPrompt";
import { OfflineIndicator } from "./components/pwa/OfflineIndicator";
import DynamicCountryRouter from "./components/routing/DynamicCountryRouter";

const queryClient = new QueryClient();

const App = () => {
  React.useEffect(() => {
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
    <QueryClientProvider client={queryClient}>
        <MobileProvider>
          <PanAfricaProvider>
            <AuthProvider>
              <TooltipProvider>
          <Toaster />
          <Sonner />
          <PWAInstallPrompt />
          <OfflineIndicator />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/civic-feed" element={<CivicFeed />} />
              <Route path="/politicians" element={<Politicians />} />
              <Route path="/security" element={<Security />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/polls" element={<PollsLandingPage />} />
              <Route path="/polls/discover" element={<PollsDiscovery />} />
          <Route path="/polls/results/:poll_id" element={<PollResultsPage />} />
          <Route path="/polls/embed/:poll_id" element={<PollEmbedViewerPage />} />
          <Route path="/polls/embed-generator/:poll_id" element={<PollEmbedGeneratorPage />} />
          <Route path="/messenger" element={<MessengerPage />} />
          <Route path="/notification-settings" element={<NotificationSettingsPage />} />
              <Route path="/dashboard/polls" element={<PollsDashboard />} />
              <Route path="/political-parties" element={<PoliticalParties />} />
              <Route path="/donate" element={<Donations />} />
              <Route path="/social" element={<Social />} />
              <Route path="/news" element={<News />} />
              <Route path="/political-parties" element={<PoliticalParties />} />
              <Route path="/political-parties/:id" element={<PoliticalPartyDetail />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/design-core" element={<DesignSystemCore />} />
              <Route path="/admin/core" element={<CamerPulseAdminCore />} />
              <Route path="/politica-ai" element={<PoliticaAI />} />
              <Route path="/camerpulse-intelligence" element={
                <DynamicCountryRouter>
                  <CamerPulseIntelligence />
                </DynamicCountryRouter>
              } />
              <Route path="/intelligence-dashboard" element={<IntelligenceDashboard />} />
              <Route path="/intel-dashboard/debug" element={<IntelligenceDashboardDebug />} />
              <Route path="/camerpulse/:countryCode" element={
                <DynamicCountryRouter>
                  <CamerPulseIntelligence />
                </DynamicCountryRouter>
              } />
              <Route path="/civic-portal" element={<CivicPublicPortal />} />
              <Route path="/promises" element={<Promises />} />
              <Route path="/regional-analytics" element={<RegionalAnalytics />} />
              <Route path="/marketplace/order-success" element={<OrderSuccess />} />
              <Route path="/companies" element={<CompanyDirectory />} />
              <Route path="/companies/register" element={<CompanyRegister />} />
              <Route path="/companies/create-request" element={<CompanyCreationRequest />} />
              <Route path="/companies/dashboard" element={<CompanyDashboard />} />
              <Route path="/companies/:id" element={<CompanyProfile />} />
              <Route path="/artist-landing" element={<ArtistLanding />} />
              <Route path="/artist-register" element={<ArtistRegister />} />
              <Route path="/artist-dashboard" element={<ArtistDashboard />} />
          <Route path="/camerplay/upload" element={<CamerPlayUpload />} />
          <Route path="/camerplay/player" element={<CamerPlayPlayer />} />
          <Route path="/camerplay/awards" element={<CamerPlayAwards />} />
          <Route path="/ecosystem" element={<EcosystemDashboard />} />
          <Route path="/fan-portal" element={<FanPortal />} />
          <Route path="/camerplay" element={<CamerPlayHome />} />
          <Route path="/billionaires" element={<BillionaireTracker />} />
          <Route path="/billionaires/apply" element={<BillionaireApplication />} />
          <Route path="/billionaires/:id" element={<BillionaireProfile />} />
          <Route path="/admin/billionaires" element={<BillionaireAdmin />} />
          <Route path="/national-debt" element={<NationalDebtTracker />} />
          <Route path="/admin/debt" element={<DebtAdmin />} />
          <Route path="/election-forecast" element={<ElectionForecast />} />
          <Route path="/rewards" element={<RewardsCenter />} />
              <Route path="/poll-archive" element={<PollArchive />} />
              <Route path="/camerpulse-master" element={<CamerPulseMaster />} />
              <Route path="/profile/:userId" element={<UserProfilePage />} />
              <Route path="/@:slug" element={<ProfileSlugPage />} />
          <Route path="/events" element={<Events />} />
          <Route path="/calendar" element={<EventCalendarPage />} />
          <Route path="/verify-certificate" element={<CertificateVerificationPage />} />
          <Route path="/villages" element={<VillagesDirectory />} />
          <Route path="/villages/add" element={<AddVillage />} />
          <Route path="/villages/leaderboards" element={<VillageLeaderboards />} />
          <Route path="/villages/:id" element={<VillageProfile />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/moderators" element={<ModeratorPortal />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </PanAfricaProvider>
  </MobileProvider>
</QueryClientProvider>
  );
};

export default App;
