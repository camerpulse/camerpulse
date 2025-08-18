import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LegacyRedirectHandler } from './LegacyRedirectHandler';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { ROUTES } from '@/config/routes';

// Import pages directly for stable production build
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
import PoliticalPartyPage from '@/pages/PoliticalPartyPage';
import PoliticalPartiesPage from '@/pages/PoliticalPartiesPage';
import UnifiedPoliticalDirectoryPage from '@/pages/UnifiedPoliticalDirectoryPage';
import VillagesDirectoryPage from '@/pages/VillagesDirectoryPage';
import VillageProfile from '@/pages/VillageProfile';
import FonsDirectory from '@/pages/FonsDirectory';
import FonProfile from '@/pages/FonProfile';
import JobBoard from '@/pages/jobs/JobBoard';
import JobDetailPage from '@/pages/JobDetailPage';
import CompanyDashboard from '@/pages/CompanyDashboard';
import RegionalHiringLeaderboard from '@/pages/jobs/RegionalHiringLeaderboard';
import PetitionsPage from '@/pages/PetitionsPage';
import PetitionDetailPage from '@/pages/PetitionDetailPage';
import PollsLandingPage from '@/pages/PollsLandingPage';
import PollsDiscovery from '@/pages/PollsDiscovery';
import PollResultsPage from '@/pages/PollResultsPage';
import PollEmbedViewerPage from '@/pages/PollEmbedViewerPage';
import PollEmbedGeneratorPage from '@/pages/PollEmbedGeneratorPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import ProfileSlugPage from '@/pages/ProfileSlugPage';
import UnifiedProfilePage from '@/pages/UnifiedProfilePage';
import MusicProfile from '@/pages/profiles/MusicProfile';
import JobProfile from '@/pages/profiles/JobProfile';
import VillageMemberProfile from '@/pages/profiles/VillageMemberProfile';

import SchoolsDirectory from '@/pages/SchoolsDirectory';
import HospitalsDirectory from '@/pages/HospitalsDirectory';
import PharmaciesDirectoryV2 from '@/pages/PharmaciesDirectoryV2';
import CompaniesDirectory from '@/pages/CompaniesDirectory';
import CompanyProfile from '@/pages/CompanyProfile';
import MessengerPage from '@/pages/MessengerPage';
import NotificationSettingsPage from '@/pages/NotificationSettingsPage';
import { AdvancedSearchPage } from '@/pages/AdvancedSearchPage';
import PerformanceMonitoringPage from '@/pages/PerformanceMonitoringPage';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminCoreV2Page from '@/pages/admin/AdminCoreV2Page';
import PriorityAssessmentDashboard from '@/pages/admin/PriorityAssessmentDashboard';
import UserMigrationAdminPage from '@/pages/admin/UserMigrationAdminPage';
import NotFound from '@/pages/NotFound';
import CivicDashboard from '@/pages/CivicDashboard';
import ProductionReadinessPage from '@/pages/ProductionReadinessPage';
import CivicEducationHub from '@/pages/CivicEducationHub';
import CivicContributionsPage from '@/pages/CivicContributionsPage';
import CorruptionIndex from '@/pages/CorruptionIndex';
import DebtTracker from '@/pages/DebtTracker';
import BillionaireTracker from '@/pages/BillionaireTracker';
import ArtistEcosystem from '@/pages/ArtistEcosystem';
import MediaTrustRatings from '@/pages/MediaTrustRatings';
import SentimentAnalysisDashboard from '@/pages/SentimentAnalysisDashboard';
import DonatePage from '@/pages/DonatePage';

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
        
        {/* Fons */}
        <Route path="/fon" element={<Navigate to="/fons" replace />} />
        <Route path="/fons" element={<FonsDirectory />} />
        <Route path="/fons/:slug" element={<FonProfile />} />
        
        {/* Civic Education */}
        <Route path="/civic-education" element={<CivicEducationHub />} />
        
        {/* Transparency & Accountability */}
        <Route path="/corruption-index" element={<CorruptionIndex />} />
        <Route path="/debt-tracker" element={<DebtTracker />} />
        <Route path="/billionaire-tracker" element={<BillionaireTracker />} />
        <Route path="/media-trust" element={<MediaTrustRatings />} />
        <Route path="/sentiment-analysis" element={<SentimentAnalysisDashboard />} />
        
        {/* Entertainment & Arts */}
        <Route path="/artist-ecosystem" element={<ArtistEcosystem />} />
        <Route path="/music" element={<ArtistEcosystem />} />
        
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
        <Route path="/parties" element={<PoliticalPartiesPage />} />
        <Route path="/parties/:slug" element={<PoliticalPartyPage />} />
        <Route path="/political-parties" element={<PoliticalPartiesPage />} />
        <Route path="/political-parties/:slug" element={<PoliticalPartyPage />} />
        <Route path="/political-directory" element={<UnifiedPoliticalDirectoryPage />} />
        
        {/* Petitions */}
        <Route path="/petitions" element={<PetitionsPage />} />
        <Route path="/petitions/:petitionSlug-:id" element={<PetitionDetailPage />} />
        
        
        {/* Jobs */}
        <Route path="/jobs" element={<JobBoard />} />
        <Route path="/jobs/board" element={<JobBoard />} />
        <Route path="/jobs/company" element={<CompanyDashboard />} />
        <Route path="/jobs/leaderboard" element={<RegionalHiringLeaderboard />} />
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
        
        {/* Donations */}
        <Route path="/donate" element={<DonatePage />} />
        
        {/* Directories */}
        <Route path="/schools" element={<SchoolsDirectory />} />
        <Route path="/hospitals" element={<HospitalsDirectory />} />
        <Route path="/pharmacies" element={<PharmaciesDirectoryV2 />} />
        <Route path="/companies" element={<CompaniesDirectory />} />
        <Route path="/companies/:id" element={<CompanyProfile />} />
        
        {/* Advanced Features */}
        <Route path="/search" element={<AdvancedSearchPage />} />
        <Route path="/performance" element={
          <ProtectedRoute requireAdmin={true}>
            <PerformanceMonitoringPage />
          </ProtectedRoute>
        } />
        <Route path="/production-readiness" element={
          <ProtectedRoute requireAdmin={true}>
            <ProductionReadinessPage />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes - All protected */}
        <Route
          path={ROUTES.ADMIN.DASHBOARD}
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminCoreV2Page />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/priority-assessment"
          element={
            <ProtectedRoute requireAdmin={true}>
              <PriorityAssessmentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/user-migration"
          element={
            <ProtectedRoute requireAdmin={true}>
              <UserMigrationAdminPage />
            </ProtectedRoute>
          }
        />
        
        {/* 404 - Must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};