import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { AuthPage } from "./pages/AuthPage";
import CivicFeed from "./pages/CivicFeed";
import PulseFeed from "./pages/PulseFeed";
import Feed from "./pages/Feed";
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
import UserProfilePage from "./pages/UserProfilePage";
import ProfileSlugPage from "./pages/ProfileSlugPage";
import { ProfileValidationTest } from "./components/Profile/ProfileValidationTest";
import { ProfileFeatureTest } from "./components/Profile/ProfileFeatureTest";
import { ProfileSystemTester } from "./components/Profile/ProfileSystemTester";
import Events from "./pages/Events";
import EventCalendarPage from "./pages/EventCalendarPage";
import CertificateVerificationPage from "./pages/CertificateVerificationPage";
import VillagesDirectory from "./pages/VillagesDirectory";
import VillageProfile from "./pages/VillageProfile";
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
import UserManagement from "./pages/UserManagement";
import CivicParticipationHub from "./pages/CivicParticipationHub";
import ModerationCenter from "./pages/ModerationCenter";
import SocialCommunity from "./pages/SocialCommunity";
import GovernmentPortal from "./pages/GovernmentPortal";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
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
import JobsSetupTest from "./tests/JobsSetupTest";

import { MobileProvider } from "./contexts/MobileContext";
import { PanAfricaProvider } from "./contexts/PanAfricaContext";
import { AuthProvider } from "./contexts/AuthContext";
import { PluginProvider } from "./contexts/PluginContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AppRouter } from "./components/routing/LanguageRoutes";

import { PWAInstallPrompt } from "./components/pwa/PWAInstallPrompt";
import { OfflineIndicator } from "./components/pwa/OfflineIndicator";

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
                  <LanguageProvider>
                    <Toaster />
                    <Sonner />
                    <PWAInstallPrompt />
                    <OfflineIndicator />
                    <AppRouter />
                  </LanguageProvider>
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
