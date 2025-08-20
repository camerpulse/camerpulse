import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LegacyRedirectHandler } from './LegacyRedirectHandler';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { ROUTES } from '@/config/routes';
import { PageHead } from '@/components/SEO/PageHead';
import { usePageAnalytics } from '@/hooks/usePageAnalytics';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Import all lazy components
import {
  LazyIndex,
  LazyAuthPage,
  LazyResetPasswordPage,
  LazyCivicDashboard,
  LazyCivicFeed,
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
  LazySchoolsDirectory,
  LazyHospitalsDirectory,
  LazyCompanyProfile,
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
  LazyMessengerPage,
  LazyNotificationSettingsPage,
  LazyAdvancedSearchPage,
  LazyPerformanceMonitoringPage,
  LazyAdminDashboard,
  LazyAdminCoreV2Page,
  LazyPriorityAssessmentDashboard,
  LazyUserMigrationAdminPage,
  LazyNotFound
} from './LazyComponents';

// Production Loading Component
const ProductionLoadingFallback: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
);

/**
 * Production-ready router with lazy loading, SEO, and analytics
 */
export const ProductionRouter: React.FC = () => {
  // Track page analytics
  usePageAnalytics({
    trackPageViews: true,
    trackUserInteractions: true,
    trackPerformance: true
  });

  return (
    <>
      <PageHead />
      <LegacyRedirectHandler />
      <Routes>
        {/* Homepage */}
        <Route 
          path="/" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading CamerPulse..." />}>
              <LazyIndex />
            </Suspense>
          } 
        />
        
        {/* Authentication */}
        <Route 
          path="/login" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading authentication..." />}>
              <LazyAuthPage />
            </Suspense>
          } 
        />
        <Route 
          path="/register" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading registration..." />}>
              <LazyAuthPage />
            </Suspense>
          } 
        />
        <Route 
          path="/auth" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading authentication..." />}>
              <LazyAuthPage />
            </Suspense>
          } 
        />
        <Route 
          path="/auth/reset-password" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading reset password..." />}>
              <LazyResetPasswordPage />
            </Suspense>
          } 
        />
        
        {/* Civic Dashboard */}
        <Route 
          path="/civic-dashboard" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading civic dashboard..." />}>
              <LazyCivicDashboard />
            </Suspense>
          } 
        />
        
        {/* Feeds */}
        <Route 
          path="/feed" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading feed..." />}>
              <LazyCivicFeed />
            </Suspense>
          } 
        />
        <Route 
          path="/civic-feed" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading civic feed..." />}>
              <LazyCivicFeed />
            </Suspense>
          } 
        />
        
        {/* Villages */}
        <Route 
          path="/villages" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading villages..." />}>
              <LazyVillagesDirectoryPage />
            </Suspense>
          } 
        />
        <Route 
          path="/villages/:slug" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading village profile..." />}>
              <LazyVillageProfile />
            </Suspense>
          } 
        />
        
        {/* Fons */}
        <Route path="/fon" element={<Navigate to="/fons" replace />} />
        <Route 
          path="/fons" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading traditional authorities..." />}>
              <LazyFonsDirectory />
            </Suspense>
          } 
        />
        <Route 
          path="/fons/:slug" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading Fon profile..." />}>
              <LazyFonProfile />
            </Suspense>
          } 
        />
        
        {/* Civic Education */}
        <Route 
          path="/civic-education" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading civic education..." />}>
              <LazyCivicEducationHub />
            </Suspense>
          } 
        />
        
        {/* Civic Contributions */}
        <Route 
          path="/civic-contributions" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading contributions..." />}>
              <LazyCivicContributionsPage />
            </Suspense>
          } 
        />
        
        {/* Politicians */}
        <Route 
          path="/politicians" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading politicians..." />}>
              <LazyPoliticians />
            </Suspense>
          } 
        />
        <Route 
          path="/politicians/:slug" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading politician profile..." />}>
              <LazyPoliticianDetailPage />
            </Suspense>
          } 
        />
        
        {/* Senators */}
        <Route 
          path="/senators" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading senators..." />}>
              <LazySenatorsPage />
            </Suspense>
          } 
        />
        <Route 
          path="/senators/:slug" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading senator profile..." />}>
              <LazySenatorDetailPage />
            </Suspense>
          } 
        />
        
        {/* MPs */}
        <Route 
          path="/mps" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading MPs..." />}>
              <LazyMPsPage />
            </Suspense>
          } 
        />
        <Route 
          path="/mps/:slug" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading MP profile..." />}>
              <LazyMPDetailPage />
            </Suspense>
          } 
        />
        
        {/* Ministers */}
        <Route 
          path="/ministers" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading ministers..." />}>
              <LazyMinistersPage />
            </Suspense>
          } 
        />
        <Route 
          path="/ministers/:slug" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading minister profile..." />}>
              <LazyMinisterDetailPage />
            </Suspense>
          } 
        />
        
        {/* Political Parties */}
        <Route 
          path="/parties/:slug" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading political party..." />}>
              <LazyPoliticalPartyDetail />
            </Suspense>
          } 
        />
        <Route 
          path="/political-parties" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading political parties..." />}>
              <LazyPoliticalParties />
            </Suspense>
          } 
        />
        <Route 
          path="/political-parties/:slug" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading political party..." />}>
              <LazyPoliticalPartyDetail />
            </Suspense>
          } 
        />
        
        {/* Petitions */}
        <Route 
          path="/petitions" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading petitions..." />}>
              <LazyPetitionsPage />
            </Suspense>
          } 
        />
        <Route 
          path="/petitions/:petitionSlug-:id" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading petition..." />}>
              <LazyPetitionDetailPage />
            </Suspense>
          } 
        />
        
        {/* Marketplace */}
        <Route 
          path="/marketplace" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading marketplace..." />}>
              <LazyMarketplace />
            </Suspense>
          } 
        />
        <Route 
          path="/marketplace/products" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading products..." />}>
              <LazyMarketplaceProducts />
            </Suspense>
          } 
        />
        <Route 
          path="/marketplace/vendors" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading vendors..." />}>
              <LazyMarketplaceVendors />
            </Suspense>
          } 
        />
        <Route 
          path="/marketplace/vendors/:vendorSlug" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading vendor..." />}>
              <LazyVendorDetailPage />
            </Suspense>
          } 
        />
        <Route 
          path="/marketplace/products/:productSlug-:id" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading product..." />}>
              <LazyProductDetailPage />
            </Suspense>
          } 
        />
        
        {/* Jobs */}
        <Route 
          path="/jobs" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading jobs..." />}>
              <LazyJobBoard />
            </Suspense>
          } 
        />
        <Route 
          path="/jobs/board" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading job board..." />}>
              <LazyJobBoard />
            </Suspense>
          } 
        />
        <Route 
          path="/jobs/company" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading company dashboard..." />}>
              <LazyCompanyDashboard />
            </Suspense>
          } 
        />
        <Route 
          path="/jobs/leaderboard" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading leaderboard..." />}>
              <LazyRegionalHiringLeaderboard />
            </Suspense>
          } 
        />
        <Route 
          path="/jobs/:jobSlug-:id" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading job details..." />}>
              <LazyJobDetailPage />
            </Suspense>
          } 
        />
        
        {/* Messaging */}
        <Route 
          path="/messages" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading messages..." />}>
              <LazyMessengerPage />
            </Suspense>
          } 
        />
        <Route 
          path="/messages/:threadId" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading conversation..." />}>
              <LazyMessengerPage />
            </Suspense>
          } 
        />
        
        {/* Notifications */}
        <Route 
          path="/notifications" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading notifications..." />}>
              <LazyNotificationSettingsPage />
            </Suspense>
          } 
        />
        
        {/* User Profiles */}
        <Route 
          path="/profile/:username" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading profile..." />}>
              <LazyUnifiedProfilePage />
            </Suspense>
          } 
        />
        <Route 
          path="/u/:userId" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading user profile..." />}>
              <LazyUnifiedProfilePage />
            </Suspense>
          } 
        />
        <Route 
          path="/@:username" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading profile..." />}>
              <LazyUnifiedProfilePage />
            </Suspense>
          } 
        />
        
        {/* Module-specific profiles */}
        <Route 
          path="/music/artists/:artistSlug-:id" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading artist profile..." />}>
              <LazyMusicProfile />
            </Suspense>
          } 
        />
        <Route 
          path="/jobs/profile/:username-:id" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading job profile..." />}>
              <LazyJobProfile />
            </Suspense>
          } 
        />
        <Route 
          path="/villages/members/:username" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading village member..." />}>
              <LazyVillageMemberProfile />
            </Suspense>
          } 
        />
        <Route 
          path="/marketplace/vendors/:username-:id" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading vendor profile..." />}>
              <LazyMarketplaceProfile />
            </Suspense>
          } 
        />
        
        {/* Legacy Profile Routes */}
        <Route 
          path="/profile/:username/legacy" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading profile..." />}>
              <LazyProfilePage />
            </Suspense>
          } 
        />
        <Route 
          path="/profile-slug/:slug" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading profile..." />}>
              <LazyProfileSlugPage />
            </Suspense>
          } 
        />
        
        {/* Polls */}
        <Route 
          path="/polls" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading polls..." />}>
              <LazyPollsLandingPage />
            </Suspense>
          } 
        />
        <Route 
          path="/polls/discover" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading poll discovery..." />}>
              <LazyPollsDiscovery />
            </Suspense>
          } 
        />
        <Route 
          path="/polls/results/:poll_id" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading poll results..." />}>
              <LazyPollResultsPage />
            </Suspense>
          } 
        />
        <Route 
          path="/polls/embed/:poll_id" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading poll..." />}>
              <LazyPollEmbedViewerPage />
            </Suspense>
          } 
        />
        <Route 
          path="/polls/embed-generator/:poll_id" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading embed generator..." />}>
              <LazyPollEmbedGeneratorPage />
            </Suspense>
          } 
        />
        
        {/* Directories */}
        <Route 
          path="/schools" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading schools..." />}>
              <LazySchoolsDirectory />
            </Suspense>
          } 
        />
        <Route 
          path="/hospitals" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading hospitals..." />}>
              <LazyHospitalsDirectory />
            </Suspense>
          } 
        />
        <Route 
          path="/companies/:id" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading company..." />}>
              <LazyCompanyProfile />
            </Suspense>
          } 
        />
        
        {/* Advanced Features */}
        <Route 
          path="/search" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading search..." />}>
              <LazyAdvancedSearchPage />
            </Suspense>
          } 
        />
        <Route 
          path="/performance" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <Suspense fallback={<ProductionLoadingFallback message="Loading performance monitor..." />}>
                <LazyPerformanceMonitoringPage />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes - All protected */}
        <Route
          path={ROUTES.ADMIN.DASHBOARD}
          element={
            <ProtectedRoute requireAdmin={true}>
              <Suspense fallback={<ProductionLoadingFallback message="Loading admin dashboard..." />}>
                <LazyAdminCoreV2Page />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Suspense fallback={<ProductionLoadingFallback message="Loading admin dashboard..." />}>
                <LazyAdminDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/priority-assessment"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Suspense fallback={<ProductionLoadingFallback message="Loading assessment dashboard..." />}>
                <LazyPriorityAssessmentDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/user-migration"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Suspense fallback={<ProductionLoadingFallback message="Loading migration tools..." />}>
                <LazyUserMigrationAdminPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        
        {/* 404 - Must be last */}
        <Route 
          path="*" 
          element={
            <Suspense fallback={<ProductionLoadingFallback message="Loading..." />}>
              <LazyNotFound />
            </Suspense>
          } 
        />
      </Routes>
    </>
  );
};