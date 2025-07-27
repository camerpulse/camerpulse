import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import AuthFlow from "./pages/AuthFlow";
import Messages from "./pages/Messages";
import CivicFeed from "./pages/CivicFeed";
import PulseFeed from "./pages/PulseFeed";
import Feed from "./pages/Feed";
import AdvancedFeed from "./pages/AdvancedFeed";
import Politicians from "./pages/Politicians";
import Security from "./pages/Security";
import AdvancedDirectory from "./pages/AdvancedDirectory";
import MinistryProfile from "./pages/MinistryProfile";
import CouncilProfile from "./pages/CouncilProfile";
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
import Officials from '@/pages/Officials';
import Judiciary from '@/pages/Judiciary';
import CamerPlayUpload from "./pages/CamerPlayUpload";
import CamerPlayPlayer from "./pages/CamerPlayPlayer";
import CamerPlaySearch from "./pages/CamerPlaySearch";
import CamerPlayArtistProfile from "./pages/CamerPlayArtistProfile";
import CamerPlayEvents from "./pages/CamerPlayEvents";
import CamerPlayRankings from "./pages/CamerPlayRankings";
import CamerPlayMusicPlayer from "./pages/CamerPlayMusicPlayer";
import CamerPlayTicketPurchase from "./pages/CamerPlayTicketPurchase";
import CamerPlayAwards from "./pages/CamerPlayAwards";
import ArtistSubmissionPage from "./pages/ArtistSubmissionPage";
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
import AdminPanel from "./pages/AdminPanel";
import NotificationFlow from "./pages/NotificationFlow";
import CamerPulseMaster from "./pages/CamerPulseMaster";
import CamerPlayHome from "./pages/CamerPlayHome";
import EcosystemDashboard from "./pages/EcosystemDashboard";
import FanPortal from "./pages/FanPortal";
import UserProfile from "./pages/UserProfile";
import ProfileSlugPage from "./pages/ProfileSlugPage";
import { ProfileValidationTest } from "./components/Profile/ProfileValidationTest";
import { ProfileFeatureTest } from "./components/Profile/ProfileFeatureTest";
import { ProfileSystemTester } from "./components/Profile/ProfileSystemTester";
import Events from "./pages/Events";
import EventCalendarPage from "./pages/EventCalendarPage";
import CertificateVerificationPage from "./pages/CertificateVerificationPage";
import VillagesDirectory from "./pages/VillagesDirectory";
import ChiefsDirectory from "./pages/ChiefsDirectory";
import VillageProfile from "./pages/VillageProfile";
import VillageRatingsLeaderboard from "./pages/VillageRatingsLeaderboard";
import VillagesPetitioned from "./pages/VillagesPetitioned";
import VillagesDiasporaBacked from "./pages/VillagesDiasporaBacked";
import { Analytics } from "./pages/Analytics";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import SentimentAnalysis from "./pages/SentimentAnalysis";
import PredictiveAnalytics from "./pages/PredictiveAnalytics";
import { AdvancedSearchPage } from "./pages/AdvancedSearchPage";
import { EconomicsPage } from "./pages/EconomicsPage";
import { CivicParticipationPage } from "./pages/CivicParticipationPage";
import { OneAndIndivisiblePage } from "./pages/OneAndIndivisiblePage";
import SchoolsDirectory from "./pages/SchoolsDirectory";
import HospitalsDirectory from "./pages/HospitalsDirectory";
import PharmaciesDirectory from "./pages/PharmaciesDirectory";
import ServicesMap from "./pages/ServicesMap";
import UnifiedServicesSearch from "./pages/UnifiedServicesSearch";
import UnifiedSearch from "./pages/UnifiedSearch";
import InteractiveMap from "./pages/InteractiveMap";
import MonetizationDashboard from "./pages/MonetizationDashboard";
import ClaimsDashboard from "./pages/ClaimsDashboard";
import UnifiedDirectorySearch from "./pages/UnifiedDirectorySearch";
import InstitutionAnalytics from "./pages/InstitutionAnalytics";
import PetitionsPlatform from "./pages/PetitionsPlatform";
import CreatePetition from "./pages/CreatePetition";
import PetitionDetail from "./pages/PetitionDetail";
import PetitionAdmin from "./pages/PetitionAdmin";
import PetitionSecurity from "./pages/PetitionSecurity";
import PetitionMobile from "./pages/PetitionMobile";
import PetitionAPI from "./pages/PetitionAPI";
import CivicTools from "./pages/CivicTools";
import EnhancedPolls from "./pages/EnhancedPolls";
import PoliticianPerformance from "./pages/PoliticianPerformance";
import CivicEducationHub from "./pages/CivicEducationHub";
import DiasporaConnect from "./pages/DiasporaConnect";
import InstitutionDirectory from "./pages/InstitutionDirectory";
import ClaimModerationDashboard from "./pages/ClaimModerationDashboard";
import InstitutionOwnerDashboard from "./pages/InstitutionOwnerDashboard";
import { GovProjectTracker } from "./pages/GovProjectTracker";
import SettingsPage from "./pages/SettingsPage";
import CivicParticipationHub from "./pages/CivicParticipationHub";
import ModerationCenter from "./pages/ModerationCenter";
import SocialCommunity from "./pages/SocialCommunity";
import GovernmentPortal from "./pages/GovernmentPortal";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import VillageReputationAdmin from "./pages/admin/VillageReputationAdmin";
import NotificationCampaigns from "./pages/NotificationCampaigns";
import APIIntegrations from "./pages/APIIntegrations";
import { LegislationTracker } from "./pages/LegislationTracker";
import MinistriesDirectory from "./pages/MinistriesDirectory";
import CouncilsDirectory from "./pages/CouncilsDirectory";
import BudgetExplorer from "./pages/BudgetExplorer";
import { PluginManagerDashboard } from "./components/Admin/PluginManager/PluginManagerDashboard";
import { PluginRoute } from "./components/Plugin/PluginWrapper";
import { PluginMarketplace } from "./components/Admin/PluginMarketplace/PluginMarketplace";
import { DeveloperConsole } from "./components/Admin/PluginMarketplace/DeveloperConsole";
import { PluginDeveloperHub } from "./components/Developer/PluginDeveloperHub";
import SenatorsPage from "./pages/Senators";
import SenatorProfilePage from "./pages/SenatorProfilePage";
import MPsPage from "./pages/MPsPage";
import MinistersPage from "./pages/MinistersPage";
import { MPDetailPage } from "./pages/MPDetailPage";
import { MinisterDetailPage } from "./pages/MinisterDetailPage";
import { PoliticianDetailPage } from "./pages/PoliticianDetailPage";
import { SenatorDetailPage } from "./pages/SenatorDetailPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDataImport from "./pages/AdminDataImport";
import AuditRegistryPage from "./pages/AuditRegistryPage";
import UserPollOverview from "./pages/UserPollOverview";

import AddVillage from "./pages/AddVillage";
import VillageLeaderboards from "./pages/VillageLeaderboards";
import ModeratorPortal from "./pages/ModeratorPortal";
import ModeratorOnboarding from "./pages/ModeratorOnboarding";
import ModerationDashboard from "./pages/ModerationDashboard";
import TestPage from "./pages/TestPage";
import JobsHome from "./pages/jobs/JobsHome";
import JobBoard from "./pages/jobs/JobBoard";
import { CompanyPortal } from "./pages/jobs/CompanyPortal";
import RegionalHiringLeaderboard from "./pages/jobs/RegionalHiringLeaderboard";
import CampaignDashboard from "./pages/jobs/CampaignDashboard";
import CampaignPublicPage from "./pages/jobs/CampaignPublicPage";
import SponsorAnalyticsDashboard from "./pages/jobs/SponsorAnalyticsDashboard";
import WorkforceEcosystemHub from "./pages/jobs/WorkforceEcosystemHub";
import TransparencyHub from "./pages/transparency/TransparencyHub";
import { GovernmentTransparency } from "./pages/transparency/GovernmentTransparency";
import { JudicialTransparency } from "./pages/transparency/JudicialTransparency";
import { ElectoralTransparency } from "./pages/transparency/ElectoralTransparency";
import PublicWorkforceDashboard from "./pages/transparency/PublicWorkforceDashboard";
import PolicyImpactDashboard from "./pages/transparency/PolicyImpactDashboard";
import { ExpertMarketplace } from "./pages/experts/ExpertMarketplace";
import { ExpertPortal } from "./pages/experts/ExpertPortal";
import { ProfilePage } from "./pages/profile/ProfilePage";
import Profile from "./pages/Profile";
import PollTemplatesPage from "./pages/PollTemplatesPage";
import JobsSetupTest from "./tests/JobsSetupTest";
import Dashboard from "./pages/Dashboard";
import InteractiveVillageMap from "./pages/InteractiveVillageMap";
import WeatherAgricultureHub from "./pages/WeatherAgricultureHub";
import OpportunityTracker from "./pages/OpportunityTracker";
import AdvancedScholarshipPortal from "./pages/AdvancedScholarshipPortal";
import { CulturalHeritageCenter } from "./pages/CulturalHeritageCenter";

import { MobileProvider } from "./contexts/MobileContext";
import { PanAfricaProvider } from "./contexts/PanAfricaContext";
import { AuthProvider } from "./contexts/AuthContext";
import { PluginProvider } from "./contexts/PluginContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import { PWAInstallPrompt } from "./components/pwa/PWAInstallPrompt";
import { OfflineIndicator } from "./components/pwa/OfflineIndicator";
import DynamicCountryRouter from "./components/routing/DynamicCountryRouter";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PluginProvider>
          <TooltipProvider>
            <PanAfricaProvider>
              <MobileProvider>
                <BrowserRouter>
                  <Toaster />
                  <Sonner />
                  <PWAInstallPrompt />
                  <OfflineIndicator />
                  <Routes>
                    <Route path="/test" element={<TestPage />} />
          <Route path="/jobs" element={<JobBoard />} />
          <Route path="/jobs/home" element={<JobsHome />} />
          <Route path="/jobs/ecosystem" element={<WorkforceEcosystemHub />} />
          <Route path="/jobs/company" element={<CompanyPortal />} />
          <Route path="/jobs/leaderboard" element={<RegionalHiringLeaderboard />} />
          <Route path="/jobs/campaigns" element={<CampaignDashboard />} />
          <Route path="/jobs/campaigns/:campaignId" element={<CampaignPublicPage />} />
          <Route path="/jobs/analytics" element={<SponsorAnalyticsDashboard />} />
        <Route path="/transparency" element={<TransparencyHub />} />
        <Route path="/transparency/government" element={<GovernmentTransparency />} />
        <Route path="/judiciary" element={<JudicialTransparency />} />
        <Route path="/transparency/elections" element={<ElectoralTransparency />} />
           <Route path="/transparency/workforce" element={<PublicWorkforceDashboard />} />
           <Route path="/transparency/policy-impact" element={<PolicyImpactDashboard />} />
          <Route path="/experts" element={<ExpertMarketplace />} />
          <Route path="/experts/portal" element={<ExpertPortal />} />
          <Route path="/poll-templates" element={<PollTemplatesPage />} />
           <Route path="/profile" element={
             <ProtectedRoute>
               <Profile />
             </ProtectedRoute>
           } />
           <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/jobs/setup-test" element={<JobsSetupTest />} />
                    <Route path="/" element={<Index />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/auth" element={<AuthFlow />} />
                <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                <Route path="/feed" element={
                  <ProtectedRoute>
                    <Feed />
                  </ProtectedRoute>
                } />
                <Route path="/advanced-feed" element={
                  <ProtectedRoute>
                    <AdvancedFeed />
                  </ProtectedRoute>
                } />
              <Route path="/civic-feed" element={<CivicFeed />} />
              <Route path="/politicians" element={<Politicians />} />
              <Route path="/politicians/:id" element={<PoliticianDetailPage />} />
              <Route path="/senators" element={<SenatorsPage />} />
              <Route path="/senators/:id" element={<SenatorDetailPage />} />
              <Route path="/mps" element={<MPsPage />} />
              <Route path="/mps/:id" element={<MPDetailPage />} />
              <Route path="/ministers" element={<MinistersPage />} />
              <Route path="/ministers/:id" element={<MinisterDetailPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/data-import" element={<AdminDataImport />} />
              <Route path="/audit-registry" element={<AuditRegistryPage />} />
              <Route path="/security" element={<Security />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/polls" element={<PollsLandingPage />} />
              <Route path="/polls/discover" element={<PollsDiscovery />} />
          <Route path="/polls/results/:poll_id" element={<PollResultsPage />} />
          <Route path="/polls/embed/:poll_id" element={<PollEmbedViewerPage />} />
          <Route path="/polls/embed-generator/:poll_id" element={<PollEmbedGeneratorPage />} />
           <Route path="/messenger" element={
             <ProtectedRoute>
               <MessengerPage />
             </ProtectedRoute>
           } />
           <Route path="/notification-settings" element={
             <ProtectedRoute>
               <NotificationSettingsPage />
             </ProtectedRoute>
           } />
               <Route path="/dashboard/polls" element={
                 <ProtectedRoute>
                   <PollsDashboard />
                 </ProtectedRoute>
               } />
               <Route path="/polls/overview" element={
                 <ProtectedRoute>
                   <UserPollOverview />
                 </ProtectedRoute>
               } />
              <Route path="/political-parties" element={<PoliticalParties />} />
              <Route path="/donate" element={<Donations />} />
              <Route path="/social" element={<Social />} />
              <Route path="/news" element={<News />} />
              <Route path="/political-parties" element={<PoliticalParties />} />
              <Route path="/political-parties/:id" element={<PoliticalPartyDetail />} />
               <Route path="/admin" element={<Admin />} />
               <Route path="/admin/village-reputation" element={
                 <ProtectedRoute>
                   <VillageReputationAdmin />
                 </ProtectedRoute>
               } />
              <Route path="/admin/plugins" element={
                <PluginRoute pluginName="CamerPulse.Admin.PluginManager" adminAccess>
                  <div className="min-h-screen bg-background p-6">
                    <PluginManagerDashboard />
                  </div>
                </PluginRoute>
              } />
              <Route path="/marketplace/plugins" element={
                <PluginRoute pluginName="CamerPulse.PluginMarketplaceAndRemoteLoader">
                  <div className="min-h-screen bg-background p-6">
                    <PluginMarketplace />
                  </div>
                </PluginRoute>
              } />
              <Route path="/developer/hub" element={
                <PluginRoute pluginName="CamerPulse.PluginSubmissionAndDevDocs">
                  <PluginDeveloperHub />
                </PluginRoute>
              } />
              <Route path="/developer/console" element={
                <PluginRoute pluginName="CamerPulse.PluginMarketplaceAndRemoteLoader">
                  <div className="min-h-screen bg-background p-6">
                    <DeveloperConsole />
                  </div>
                </PluginRoute>
              } />
              <Route path="/admin/design-core" element={<DesignSystemCore />} />
              <Route path="/admin/core" element={<CamerPulseAdminCore />} />
              <Route path="/admin/whatsapp" element={<AdminPanel />} />
              <Route path="/notification-flow" element={<NotificationFlow />} />
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
          <Route path="/camerplay/search" element={<CamerPlaySearch />} />
          <Route path="/camerplay/artists/:artistId" element={<CamerPlayArtistProfile />} />
          <Route path="/camerplay/events" element={<CamerPlayEvents />} />
            <Route path="/camerplay/music-player" element={<CamerPlayMusicPlayer />} />
            <Route path="/camerplay/tickets/:eventId" element={<CamerPlayTicketPurchase />} />
            <Route path="/camerplay/awards" element={<CamerPlayAwards />} />
            <Route path="/camerplay/rankings" element={<CamerPlayRankings />} />
            <Route path="/camerplay/submit-artist" element={<ArtistSubmissionPage />} />
              <Route path="/camerplay" element={
                <PluginRoute pluginName="CamerPulse.Entertainment.CamerPlayMusic">
                  <CamerPlayHome />
                </PluginRoute>
              } />
              <Route path="/ecosystem" element={
                <PluginRoute pluginName="CamerPulse.Entertainment.ArtistEcosystem">
                  <EcosystemDashboard />
                </PluginRoute>
              } />
              <Route path="/fan-portal" element={
                <PluginRoute pluginName="CamerPulse.Entertainment.ArtistEcosystem">
                  <FanPortal />
                </PluginRoute>
              } />
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
              <Route path="/user/:userId" element={<UserProfile />} />
              <Route path="/@:slug" element={<UserProfile />} />
        <Route path="/profile-test" element={<ProfileValidationTest />} />
        <Route path="/feature-test" element={<ProfileFeatureTest />} />
        <Route path="/system-test" element={<ProfileSystemTester />} />
          <Route path="/events" element={<Events />} />
          <Route path="/calendar" element={<EventCalendarPage />} />
          <Route path="/verify-certificate" element={<CertificateVerificationPage />} />
          <Route path="/villages" element={<VillagesDirectory />} />
          <Route path="/villages/directory" element={<VillagesDirectory />} />
          <Route path="/villages/ratings-leaderboard" element={<VillageRatingsLeaderboard />} />
          <Route path="/villages/petitioned" element={<VillagesPetitioned />} />
          <Route path="/villages/diaspora-backed" element={<VillagesDiasporaBacked />} />
          <Route path="/villages/add" element={<AddVillage />} />
          <Route path="/villages/leaderboards" element={<VillageLeaderboards />} />
          <Route path="/villages/:id" element={<VillageProfile />} />
          <Route path="/village/:slug" element={<VillageProfile />} />
          <Route path="/chiefs" element={<ChiefsDirectory />} />
          <Route path="/traditional-leaders" element={<ChiefsDirectory />} />
          <Route path="/search" element={<AdvancedSearchPage />} />
          <Route path="/economics" element={<EconomicsPage />} />
          <Route path="/civic" element={<CivicParticipationPage />} />
          <Route path="/unity" element={<OneAndIndivisiblePage />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/analytics/dashboard" element={<AnalyticsDashboard />} />
              <Route path="/analytics/sentiment" element={<SentimentAnalysis />} />
              <Route path="/analytics/predictive" element={<PredictiveAnalytics />} />
              <Route path="/schools" element={<SchoolsDirectory />} />
          <Route path="/hospitals" element={<HospitalsDirectory />} />
          <Route path="/pharmacies" element={<PharmaciesDirectory />} />
          <Route path="/map" element={<ServicesMap />} />
          <Route path="/interactive-map" element={<InteractiveMap />} />
          <Route path="/services-search" element={<UnifiedServicesSearch />} />
           <Route path="/search-directory" element={<UnifiedSearch />} />
           <Route path="/directory-search" element={<UnifiedDirectorySearch />} />
           <Route path="/monetization-dashboard" element={<MonetizationDashboard />} />
           <Route path="/claims-dashboard" element={<ClaimsDashboard />} />
           <Route path="/analytics/:institutionId" element={<InstitutionAnalytics />} />
           <Route path="/moderators/onboarding" element={<ModeratorOnboarding />} />
           <Route path="/moderators/dashboard" element={<ModerationDashboard />} />
           <Route path="/petitions" element={<PetitionsPlatform />} />
           <Route path="/petitions/:id" element={<PetitionDetail />} />
           <Route path="/petitions/create" element={<CreatePetition />} />
           <Route path="/civic-tools" element={<CivicTools />} />
           <Route path="/enhanced-polls" element={<EnhancedPolls />} />
           <Route path="/politician-performance" element={<PoliticianPerformance />} />
                 <Route path="/civic-education" element={<CivicEducationHub />} />
                 <Route path="/diaspora-connect" element={<DiasporaConnect />} />
            <Route path="/admin/petitions" element={<PetitionAdmin />} />
            <Route path="/petitions/security" element={<PetitionSecurity />} />
            <Route path="/petitions/mobile" element={<PetitionMobile />} />
             <Route path="/petitions/api" element={<PetitionAPI />} />
             <Route path="/institutions" element={<InstitutionDirectory />} />
              <Route path="/admin/claims" element={<ClaimModerationDashboard />} />
              <Route path="/institution/dashboard" element={<InstitutionOwnerDashboard />} />
               <Route path="/government-projects" element={<GovProjectTracker />} />
               
               <Route path="/civic-participation-hub" element={<CivicParticipationHub />} />
               <Route path="/moderation-center" element={<ModerationCenter />} />
               <Route path="/social-community" element={<SocialCommunity />} />
            <Route path="/directory" element={<AdvancedDirectory />} />
            <Route path="/directory/ministry/:id" element={<MinistryProfile />} />
            <Route path="/directory/council/:id" element={<CouncilProfile />} />
            <Route path="/government-portal" element={<GovernmentPortal />} />
                <Route path="/advanced-analytics" element={<AdvancedAnalytics />} />
                <Route path="/notification-campaigns" element={<NotificationCampaigns />} />
                <Route path="/api-integrations" element={<APIIntegrations />} />
                <Route path="/legislation" element={<LegislationTracker />} />
                <Route path="/ministries" element={<MinistriesDirectory />} />
                <Route path="/councils" element={<CouncilsDirectory />} />
              <Route path="/budget-explorer" element={<BudgetExplorer />} />
              <Route path="/interactive-village-map" element={<InteractiveVillageMap />} />
              <Route path="/weather-agriculture" element={<WeatherAgricultureHub />} />
              <Route path="/opportunity-tracker" element={<OpportunityTracker />} />
               <Route path="/scholarship-portal" element={<AdvancedScholarshipPortal />} />
               <Route path="/cultural-heritage" element={<CulturalHeritageCenter />} />
               <Route path="/officials" element={<Officials />} />
               <Route path="/judiciary" element={<Judiciary />} />
                 <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </MobileProvider>
            </PanAfricaProvider>
          </TooltipProvider>
        </PluginProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
