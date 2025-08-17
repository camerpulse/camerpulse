import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LegacyRedirectHandler } from './LegacyRedirectHandler';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ROUTES } from '@/config/routes';

// Lazy-loaded components for better performance
import {
  LazyIndex,
  LazyAuthPage,
  LazyFeed,
  LazyCivicFeed,
  LazyCivicDashboard,
  LazyCivicEducationHub,
  LazyCivicContributionsPage,
  LazyPoliticians,
  LazyPoliticianDetailPage,
  LazySenatorsPage,
  LazySenatorDetailPage,
  LazyMPsPage,
  LazyMPDetailPage,
  LazyMinistersPage,
  LazyMinisterDetailPage,
  LazyPoliticalParties,
  LazyPoliticalPartyDetail,
  LazyVillagesDirectoryPage,
  LazyVillageProfile,
  LazyFonsDirectory,
  LazyFonProfile,
  LazyMarketplace,
  LazyMarketplaceProducts,
  LazyMarketplaceVendors,
  LazyVendorDetailPage,
  LazyProductDetailPage,
  LazyJobBoard,
  LazyJobDetailPage,
  LazyCompanyDashboard,
  LazyRegionalHiringLeaderboard,
  LazyPetitionsPage,
  LazyPetitionDetailPage,
  LazyPollsLandingPage,
  LazyPollsDiscovery,
  LazyPollResultsPage,
  LazyPollEmbedViewerPage,
  LazyPollEmbedGeneratorPage,
  LazyProfilePage,
  LazyProfileSlugPage,
  LazyUnifiedProfilePage,
  LazyMusicProfile,
  LazyJobProfile,
  LazyVillageMemberProfile,
  LazyMarketplaceProfile,
  LazySchoolsDirectory,
  LazyHospitalsDirectory,
  LazyCompanyProfile,
  LazyMessengerPage,
  LazyNotificationSettingsPage,
  LazyAdvancedSearchPage,
  LazyPerformanceMonitoringPage,
  LazyAdminDashboard,
  LazyAdminCoreV2Page,
  LazyPriorityAssessmentDashboard,
  LazyUserMigrationAdminPage,
  LazyNotFound
} from './LazyRoutes';

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
import MarketplaceProducts from '@/pages/MarketplaceProducts';
import MarketplaceVendors from '@/pages/MarketplaceVendors';
import VendorDetailPage from '@/pages/VendorDetailPage';
import UserMigrationAdminPage from '@/pages/admin/UserMigrationAdminPage';
import CompanyDashboard from '@/pages/CompanyDashboard';
import RegionalHiringLeaderboard from '@/pages/jobs/RegionalHiringLeaderboard';
import NotFound from '@/pages/NotFound';

// Module-specific profile pages
import MusicProfile from '@/pages/profiles/MusicProfile';
import JobProfile from '@/pages/profiles/JobProfile';
import VillageMemberProfile from '@/pages/profiles/VillageMemberProfile';
import MarketplaceProfile from '@/pages/profiles/MarketplaceProfile';

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" text="Loading page..." />
  </div>
);

/**
 * Production-ready router with lazy loading, proper error boundaries, and SEO optimization
 */
export const AppRouter: React.FC = () => {
  return (
    <>
      <LegacyRedirectHandler />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Homepage */}
          <Route path="/" element={<LazyIndex />} />
          
          {/* Authentication */}
          <Route path="/login" element={<LazyAuthPage />} />
          <Route path="/register" element={<LazyAuthPage />} />
          <Route path="/auth" element={<LazyAuthPage />} />
          
          {/* Civic Dashboard */}
          <Route path="/civic-dashboard" element={<LazyCivicDashboard />} />
          
          {/* Feeds */}
          <Route path="/feed" element={<LazyFeed />} />
          <Route path="/civic-feed" element={<LazyCivicFeed />} />
          
          {/* Villages */}
          <Route path="/villages" element={<LazyVillagesDirectoryPage />} />
          <Route path="/villages/:slug" element={<LazyVillageProfile />} />
          
          {/* Fons */}
          <Route path="/fon" element={<Navigate to="/fons" replace />} />
          <Route path="/fons" element={<LazyFonsDirectory />} />
          <Route path="/fons/:slug" element={<LazyFonProfile />} />
          
          {/* Civic Education */}
          <Route path="/civic-education" element={<LazyCivicEducationHub />} />
          
          {/* Politicians */}
          <Route path="/politicians" element={<LazyPoliticians />} />
          <Route path="/politicians/:slug" element={<LazyPoliticianDetailPage />} />
          
          {/* Senators */}
          <Route path="/senators" element={<LazySenatorsPage />} />
          <Route path="/senators/:slug" element={<LazySenatorDetailPage />} />
          
          {/* MPs */}
          <Route path="/mps" element={<LazyMPsPage />} />
          <Route path="/mps/:slug" element={<LazyMPDetailPage />} />
          
          {/* Ministers */}
          <Route path="/ministers" element={<LazyMinistersPage />} />
          <Route path="/ministers/:slug" element={<LazyMinisterDetailPage />} />
          
          {/* Political Parties */}
          <Route path="/parties/:slug" element={<LazyPoliticalPartyDetail />} />
          <Route path="/political-parties" element={<LazyPoliticalParties />} />
          <Route path="/political-parties/:slug" element={<LazyPoliticalPartyDetail />} />
          
          {/* Petitions */}
          <Route path="/petitions" element={<LazyPetitionsPage />} />
          <Route path="/petitions/:petitionSlug-:id" element={<LazyPetitionDetailPage />} />
          
          {/* Marketplace */}
          <Route path="/marketplace" element={<LazyMarketplace />} />
          <Route path="/marketplace/products" element={<LazyMarketplaceProducts />} />
          <Route path="/marketplace/vendors" element={<LazyMarketplaceVendors />} />
          <Route path="/marketplace/vendors/:vendorSlug" element={<LazyVendorDetailPage />} />
          <Route path="/marketplace/products/:productSlug-:id" element={<LazyProductDetailPage />} />
          
          {/* Jobs */}
          <Route path="/jobs" element={<LazyJobBoard />} />
          <Route path="/jobs/board" element={<LazyJobBoard />} />
          <Route path="/jobs/company" element={<LazyCompanyDashboard />} />
          <Route path="/jobs/leaderboard" element={<LazyRegionalHiringLeaderboard />} />
          <Route path="/jobs/:jobSlug-:id" element={<LazyJobDetailPage />} />
          
          {/* Messaging */}
          <Route path="/messages" element={<LazyMessengerPage />} />
          <Route path="/messages/:threadId" element={<LazyMessengerPage />} />
          
          {/* Notifications */}
          <Route path="/notifications" element={<LazyNotificationSettingsPage />} />
          
          {/* User Profiles */}
          <Route path="/profile/:username" element={<LazyUnifiedProfilePage />} />
          <Route path="/u/:userId" element={<LazyUnifiedProfilePage />} />
          <Route path="/@:username" element={<LazyUnifiedProfilePage />} />
          
          {/* Module-specific profiles */}
          <Route path="/music/artists/:artistSlug-:id" element={<LazyMusicProfile />} />
          <Route path="/jobs/profile/:username-:id" element={<LazyJobProfile />} />
          <Route path="/villages/members/:username" element={<LazyVillageMemberProfile />} />
          <Route path="/marketplace/vendors/:username-:id" element={<LazyMarketplaceProfile />} />
          
          {/* Legacy Profile Routes */}
          <Route path="/profile/:username/legacy" element={<LazyProfilePage />} />
          <Route path="/profile-slug/:slug" element={<LazyProfileSlugPage />} />
          
          {/* Polls */}
          <Route path="/polls" element={<LazyPollsLandingPage />} />
          <Route path="/polls/discover" element={<LazyPollsDiscovery />} />
          <Route path="/polls/results/:poll_id" element={<LazyPollResultsPage />} />
          <Route path="/polls/embed/:poll_id" element={<LazyPollEmbedViewerPage />} />
          <Route path="/polls/embed-generator/:poll_id" element={<LazyPollEmbedGeneratorPage />} />
          
          {/* Civic Contributions */}
          <Route path="/civic-contributions" element={<LazyCivicContributionsPage />} />
          
          {/* Directories */}
          <Route path="/schools" element={<LazySchoolsDirectory />} />
          <Route path="/hospitals" element={<LazyHospitalsDirectory />} />
          <Route path="/companies/:id" element={<LazyCompanyProfile />} />
          
          {/* Advanced Features */}
          <Route path="/search" element={<LazyAdvancedSearchPage />} />
          <Route path="/performance" element={
            <ProtectedRoute requireAdmin={true}>
              <LazyPerformanceMonitoringPage />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes - All protected with lazy loading */}
          <Route
            path={ROUTES.ADMIN.DASHBOARD}
            element={
              <ProtectedRoute requireAdmin={true}>
                <LazyAdminCoreV2Page />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireAdmin={true}>
                <LazyAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/priority-assessment"
            element={
              <ProtectedRoute requireAdmin={true}>
                <LazyPriorityAssessmentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/user-migration"
            element={
              <ProtectedRoute requireAdmin={true}>
                <LazyUserMigrationAdminPage />
              </ProtectedRoute>
            }
          />
          
          {/* 404 - Must be last */}
          <Route path="*" element={<LazyNotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};