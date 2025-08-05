import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LegacyRedirectHandler } from './LegacyRedirectHandler';

// Import all existing pages from App.tsx
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import { AuthPage } from '@/pages/AuthPage';
import CivicFeed from '@/pages/CivicFeed';
import PulseFeed from '@/pages/PulseFeed';
import Feed from '@/pages/Feed';
import Politicians from '@/pages/Politicians';
import Security from '@/pages/Security';
import AdvancedDirectory from '@/pages/AdvancedDirectory';
import MinistryProfile from '@/pages/MinistryProfile';
import CouncilProfile from '@/pages/CouncilProfile';
import Marketplace from '@/pages/Marketplace';
import Polls from '@/pages/Polls';
import PollsLandingPage from '@/pages/PollsLandingPage';
import PollsDashboard from '@/pages/PollsDashboard';
import PollsDiscovery from '@/pages/PollsDiscovery';
import Donations from '@/pages/Donations';
import Social from '@/pages/Social';
import News from '@/pages/News';
import Admin from '@/pages/Admin';
import DesignSystemCore from '@/pages/DesignSystemCore';
import CamerPulseAdminCore from '@/pages/CamerPulseAdminCore';
import PoliticalParties from '@/pages/PoliticalParties';
import PoliticalPartyDetail from '@/pages/PoliticalPartyDetail';
import PoliticaAI from '@/pages/PoliticaAI';
import CamerPulseIntelligence from '@/pages/CamerPulseIntelligence';
import IntelligenceDashboard from '@/pages/IntelligenceDashboard';
import IntelligenceDashboardDebug from '@/pages/IntelligenceDashboardDebug';
import CivicPublicPortal from '@/pages/CivicPublicPortal';
import ArtistLanding from '@/pages/ArtistLanding';
import ArtistRegister from '@/pages/ArtistRegister';
import ArtistDashboard from '@/pages/ArtistDashboard';
import Officials from '@/pages/Officials';
import Judiciary from '@/pages/Judiciary';
import MessengerPage from '@/pages/MessengerPage';
import NotificationSettingsPage from '@/pages/NotificationSettingsPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import ProfileSlugPage from '@/pages/ProfileSlugPage';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminDataImport from '@/pages/AdminDataImport';
import AuditRegistryPage from '@/pages/AuditRegistryPage';
import SenatorsPage from '@/pages/Senators';
import { SenatorDetailPage } from '@/pages/SenatorDetailPage';
import MPsPage from '@/pages/MPsPage';
import { MPDetailPage } from '@/pages/MPDetailPage';
import MinistersPage from '@/pages/MinistersPage';
import { MinisterDetailPage } from '@/pages/MinisterDetailPage';
import { PoliticianDetailPage } from '@/pages/PoliticianDetailPage';
import VillagesDirectory from '@/pages/VillagesDirectory';
import VillageProfile from '@/pages/VillageProfile';
import JobBoard from '@/pages/jobs/JobBoard';
import PollResultsPage from '@/pages/PollResultsPage';
import PollEmbedViewerPage from '@/pages/PollEmbedViewerPage';
import PollEmbedGeneratorPage from '@/pages/PollEmbedGeneratorPage';

// Import new pages
import CivicDashboard from '@/pages/CivicDashboard';
import PetitionsPage from '@/pages/PetitionsPage';
import PetitionDetailPage from '@/pages/PetitionDetailPage';
import JobDetailPage from '@/pages/JobDetailPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import VendorsPage from '@/pages/VendorsPage';

/**
 * Language-prefixed routes component that handles all the main application routes
 * with proper language prefix support (/en, /fr)
 */
export const LanguageRoutes: React.FC = () => {
  return (
    <>
      <LegacyRedirectHandler />
      <Routes>
        {/* Root redirect to /en */}
        <Route path="/" element={<Navigate to="/en" replace />} />
        
        {/* Language-prefixed routes */}
        <Route path="/:lang/*" element={<LanguageRoutesInner />} />
        
        {/* Fallback for routes without language prefix - redirect to /en */}
        <Route path="*" element={<Navigate to="/en" replace />} />
      </Routes>
    </>
  );
};

/**
 * Inner routes component that handles all routes within a language prefix
 */
const LanguageRoutesInner: React.FC = () => {
  return (
    <Routes>
      {/* Homepage */}
      <Route index element={<Index />} />
      
      {/* Authentication */}
      <Route path="login" element={<AuthPage />} />
      <Route path="register" element={<AuthPage />} />
      <Route path="logout" element={<AuthPage />} />
      <Route path="auth" element={<AuthPage />} />
      
      {/* Civic Dashboard */}
      <Route path="civic-dashboard" element={<CivicDashboard />} />
      
      {/* Feeds */}
      <Route path="feed" element={<Feed />} />
      <Route path="civic-feed" element={<CivicFeed />} />
      
      {/* Politicians */}
      <Route path="politicians" element={<Politicians />} />
      <Route path="politicians/:id" element={<PoliticianDetailPage />} />
      
      {/* Senators */}
      <Route path="senators" element={<SenatorsPage />} />
      <Route path="senators/:id" element={<SenatorDetailPage />} />
      
      {/* MPs */}
      <Route path="mps" element={<MPsPage />} />
      <Route path="mps/:id" element={<MPDetailPage />} />
      
      {/* Ministers */}
      <Route path="ministers" element={<MinistersPage />} />
      <Route path="ministers/:id" element={<MinisterDetailPage />} />
      
      {/* Political Parties */}
      <Route path="parties/:slug" element={<PoliticalPartyDetail />} />
      <Route path="political-parties" element={<PoliticalParties />} />
      <Route path="political-parties/:id" element={<PoliticalPartyDetail />} />
      
      {/* Villages */}
      <Route path="villages" element={<VillagesDirectory />} />
      <Route path="villages/:slug" element={<VillageProfile />} />
      
      {/* Petitions */}
      <Route path="petitions" element={<PetitionsPage />} />
      <Route path="petitions/:slug" element={<PetitionDetailPage />} />
      
      {/* Marketplace */}
      <Route path="marketplace" element={<Marketplace />} />
      <Route path="marketplace/vendors" element={<VendorsPage />} />
      <Route path="marketplace/products/:slug" element={<ProductDetailPage />} />
      
      {/* Jobs */}
      <Route path="jobs" element={<JobBoard />} />
      <Route path="jobs/:slug" element={<JobDetailPage />} />
      
      {/* Messaging */}
      <Route path="messages" element={<MessengerPage />} />
      <Route path="messages/:threadId" element={<MessengerPage />} />
      
      {/* Notifications */}
      <Route path="notifications" element={<NotificationSettingsPage />} />
      
      {/* User Profiles */}
      <Route path="profile/:username" element={<ProfilePage />} />
      <Route path="@:username" element={<ProfileSlugPage />} />
      
      {/* Polls */}
      <Route path="polls" element={<PollsLandingPage />} />
      <Route path="polls/discover" element={<PollsDiscovery />} />
      <Route path="polls/results/:poll_id" element={<PollResultsPage />} />
      <Route path="polls/embed/:poll_id" element={<PollEmbedViewerPage />} />
      <Route path="polls/embed-generator/:poll_id" element={<PollEmbedGeneratorPage />} />
      
      {/* Admin */}
      <Route path="admin" element={<Admin />} />
      <Route path="admin/dashboard" element={<AdminDashboard />} />
      <Route path="admin/users" element={<AdminDashboard />} />
      <Route path="admin/content" element={<AdminDashboard />} />
      <Route path="admin/data-import" element={<AdminDataImport />} />
      <Route path="admin/design-core" element={<DesignSystemCore />} />
      <Route path="admin/core" element={<CamerPulseAdminCore />} />
      
      {/* Additional routes from original App.tsx */}
      <Route path="security" element={<Security />} />
      <Route path="donations" element={<Donations />} />
      <Route path="social" element={<Social />} />
      <Route path="news" element={<News />} />
      <Route path="pulse-feed" element={<PulseFeed />} />
      <Route path="politica-ai" element={<PoliticaAI />} />
      <Route path="intelligence" element={<CamerPulseIntelligence />} />
      <Route path="intelligence/dashboard" element={<IntelligenceDashboard />} />
      <Route path="intelligence/debug" element={<IntelligenceDashboardDebug />} />
      <Route path="civic-portal" element={<CivicPublicPortal />} />
      <Route path="artist-landing" element={<ArtistLanding />} />
      <Route path="artist-register" element={<ArtistRegister />} />
      <Route path="artist-dashboard" element={<ArtistDashboard />} />
      <Route path="officials" element={<Officials />} />
      <Route path="judiciary" element={<Judiciary />} />
      <Route path="audit-registry" element={<AuditRegistryPage />} />
      <Route path="advanced-directory" element={<AdvancedDirectory />} />
      <Route path="ministry/:id" element={<MinistryProfile />} />
      <Route path="council/:id" element={<CouncilProfile />} />
      <Route path="dashboard/polls" element={<PollsDashboard />} />
      
      {/* Fallback for 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};