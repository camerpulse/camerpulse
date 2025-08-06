import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LegacyRedirectHandler } from './LegacyRedirectHandler';

// Import all pages
import Index from '@/pages/Index';
import { AuthPage } from '@/pages/AuthPage';
import Feed from '@/pages/Feed';
import CivicFeed from '@/pages/CivicFeed';
import Politicians from '@/pages/Politicians';
import { PoliticianDetailPage } from '@/pages/PoliticianDetailPage';
import SenatorsPage from '@/pages/Senators';
import { SenatorDetailPage } from '@/pages/SenatorDetailPage';
import MPsPage from '@/pages/MPsPage';
import { MPDetailPage } from '@/pages/MPDetailPage';
import MinistersPage from '@/pages/MinistersPage';
import { MinisterDetailPage } from '@/pages/MinisterDetailPage';
import PoliticalParties from '@/pages/PoliticalParties';
import PoliticalPartyDetail from '@/pages/PoliticalPartyDetail';
import VillagesDirectory from '@/pages/VillagesDirectory';
import VillageProfile from '@/pages/VillageProfile';
import Marketplace from '@/pages/Marketplace';
import JobBoard from '@/pages/jobs/JobBoard';
import MessengerPage from '@/pages/MessengerPage';
import NotificationSettingsPage from '@/pages/NotificationSettingsPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import ProfileSlugPage from '@/pages/ProfileSlugPage';
import UnifiedProfilePage from '@/pages/UnifiedProfilePage';
import AdminDashboard from '@/pages/AdminDashboard';
import Admin from '@/pages/Admin';
import AdminCoreV2Page from '@/pages/admin/AdminCoreV2Page';
import PriorityAssessmentDashboard from '@/pages/admin/PriorityAssessmentDashboard';
import PollsLandingPage from '@/pages/PollsLandingPage';
import PollsDiscovery from '@/pages/PollsDiscovery';
import PollResultsPage from '@/pages/PollResultsPage';
import PollEmbedViewerPage from '@/pages/PollEmbedViewerPage';
import PollEmbedGeneratorPage from '@/pages/PollEmbedGeneratorPage';

// Import new pages
import CivicDashboard from '@/pages/CivicDashboard';
import PetitionsPage from '@/pages/PetitionsPage';
import VillagesDirectoryPage from '@/pages/VillagesDirectoryPage';
import CivicEducationHub from '@/pages/CivicEducationHub';
import { AdvancedSearchPage } from '@/pages/AdvancedSearchPage';
import PerformanceMonitoringPage from '@/pages/PerformanceMonitoringPage';
import CivicContributionsPage from '@/pages/CivicContributionsPage';
import SchoolsDirectory from '@/pages/SchoolsDirectory';
import HospitalsDirectory from '@/pages/HospitalsDirectory';
import CompanyProfile from '@/pages/CompanyProfile';
import PetitionDetailPage from '@/pages/PetitionDetailPage';
import JobDetailPage from '@/pages/JobDetailPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import VendorsPage from '@/pages/VendorsPage';
import UserMigrationAdminPage from '@/pages/admin/UserMigrationAdminPage';

// Module-specific profile pages
import MusicProfile from '@/pages/profiles/MusicProfile';
import JobProfile from '@/pages/profiles/JobProfile';
import VillageMemberProfile from '@/pages/profiles/VillageMemberProfile';
import MarketplaceProfile from '@/pages/profiles/MarketplaceProfile';

/**
 * Main application router with clean, focused routing structure
 */
export const AppRouter: React.FC = () => {
  return (
    <>
      <LegacyRedirectHandler />
      <Routes>
        {/* Homepage */}
        <Route path="/" element={<Index />} />
        
        {/* Authentication */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Civic Dashboard */}
        <Route path="/civic-dashboard" element={<CivicDashboard />} />
        
        {/* Feeds */}
        <Route path="/feed" element={<Feed />} />
        <Route path="/civic-feed" element={<CivicFeed />} />
        
        {/* Villages */}
        <Route path="/villages" element={<VillagesDirectoryPage />} />
        <Route path="/villages/:slug" element={<VillageProfile />} />
        
        {/* Civic Education */}
        <Route path="/civic-education" element={<CivicEducationHub />} />
        
        {/* Politicians */}
        <Route path="/politicians" element={<Politicians />} />
        <Route path="/politicians/:slug" element={<PoliticianDetailPage />} />
        
        {/* Senators */}
        <Route path="/senators" element={<SenatorsPage />} />
        <Route path="/senators/:slug" element={<SenatorDetailPage />} />
        
        {/* MPs */}
        <Route path="/mps" element={<MPsPage />} />
        <Route path="/mps/:slug" element={<MPDetailPage />} />
        
        {/* Ministers */}
        <Route path="/ministers" element={<MinistersPage />} />
        <Route path="/ministers/:slug" element={<MinisterDetailPage />} />
        
        {/* Political Parties */}
        <Route path="/parties/:slug" element={<PoliticalPartyDetail />} />
        <Route path="/political-parties" element={<PoliticalParties />} />
        <Route path="/political-parties/:slug" element={<PoliticalPartyDetail />} />
        
        {/* Petitions */}
        <Route path="/petitions" element={<PetitionsPage />} />
        <Route path="/petitions/:petitionSlug-:id" element={<PetitionDetailPage />} />
        
        {/* Marketplace */}
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/vendors" element={<VendorsPage />} />
        <Route path="/marketplace/products/:productSlug-:id" element={<ProductDetailPage />} />
        
        {/* Jobs */}
        <Route path="/jobs" element={<JobBoard />} />
        <Route path="/jobs/:jobSlug-:id" element={<JobDetailPage />} />
        
        {/* Messaging */}
        <Route path="/messages" element={<MessengerPage />} />
        <Route path="/messages/:threadId" element={<MessengerPage />} />
        
        {/* Notifications */}
        <Route path="/notifications" element={<NotificationSettingsPage />} />
        
        {/* User Profiles */}
        <Route path="/profile/:username" element={<UnifiedProfilePage />} />
        <Route path="/u/:userId" element={<UnifiedProfilePage />} />
        <Route path="/@:username" element={<UnifiedProfilePage />} />
        
        {/* Module-specific profiles */}
        <Route path="/music/artists/:artistSlug-:id" element={<MusicProfile />} />
        <Route path="/jobs/profile/:username-:id" element={<JobProfile />} />
        <Route path="/villages/members/:username" element={<VillageMemberProfile />} />
        <Route path="/marketplace/vendors/:username-:id" element={<MarketplaceProfile />} />
        
        {/* Legacy Profile Routes */}
        <Route path="/profile/:username/legacy" element={<ProfilePage />} />
        <Route path="/profile-slug/:slug" element={<ProfileSlugPage />} />
        
        {/* Polls */}
        <Route path="/polls" element={<PollsLandingPage />} />
        <Route path="/polls/discover" element={<PollsDiscovery />} />
        <Route path="/polls/results/:poll_id" element={<PollResultsPage />} />
        <Route path="/polls/embed/:poll_id" element={<PollEmbedViewerPage />} />
        <Route path="/polls/embed-generator/:poll_id" element={<PollEmbedGeneratorPage />} />
        
        {/* Civic Contributions */}
        <Route path="/civic-contributions" element={<CivicContributionsPage />} />
        
        {/* Directories */}
        <Route path="/schools" element={<SchoolsDirectory />} />
        <Route path="/hospitals" element={<HospitalsDirectory />} />
        <Route path="/companies/:id" element={<CompanyProfile />} />

        {/* Advanced Features */}
        <Route path="/search" element={<AdvancedSearchPage />} />
        <Route path="/performance" element={<PerformanceMonitoringPage />} />
        
        {/* Admin */}
        <Route path="/admin" element={<AdminCoreV2Page />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/priority-assessment" element={<PriorityAssessmentDashboard />} />
        <Route path="/admin/user-migration" element={<UserMigrationAdminPage />} />
      </Routes>
    </>
  );
};