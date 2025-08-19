/**
 * Refactored AppRouter
 * Clean, organized routing with proper error handling and security
 */

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { LegacyRedirectHandler } from '@/components/routing/LegacyRedirectHandler';
import { ROUTES } from '@/config/routes';

// === LAZY LOADED PAGES ===
// Core Pages
const Index = lazy(() => import('@/pages/Index'));
const AboutUs = lazy(() => import('@/pages/AboutUs'));
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Political Pages
const EnhancedPoliticians = lazy(() => import('@/pages/EnhancedPoliticians'));
const PoliticianDetailPage = lazy(() => import('@/pages/PoliticianDetailPage'));
const EnhancedSenators = lazy(() => import('@/pages/EnhancedSenators'));
const SenatorDetailPage = lazy(() => import('@/pages/SenatorDetailPage'));
const EnhancedMPs = lazy(() => import('@/pages/EnhancedMPs'));
const MPDetailPage = lazy(() => import('@/pages/MPDetailPage'));
const EnhancedMinisters = lazy(() => import('@/pages/EnhancedMinisters'));
const EnhancedMinisterDetail = lazy(() => import('@/pages/EnhancedMinisterDetail'));

// Political Parties
const PoliticalPartiesPage = lazy(() => import('@/pages/PoliticalPartiesPage'));
const PoliticalPartyDetail = lazy(() => import('@/pages/PoliticalPartyDetail'));
const UnifiedPoliticalDirectoryPage = lazy(() => import('@/pages/UnifiedPoliticalDirectoryPage'));

// Civic Pages
const CivicDashboard = lazy(() => import('@/pages/CivicDashboard'));
const CivicFeed = lazy(() => import('@/pages/CivicFeed'));
const CivicEducationHub = lazy(() => import('@/pages/CivicEducationHub'));
const CivicContributionsPage = lazy(() => import('@/pages/CivicContributionsPage'));

// Village & Community
const VillagesDirectoryPage = lazy(() => import('@/pages/VillagesDirectoryPage'));
const VillageProfile = lazy(() => import('@/pages/VillageProfile'));
const FonsDirectory = lazy(() => import('@/pages/FonsDirectory'));
const FonProfile = lazy(() => import('@/pages/FonProfile'));

// Jobs & Employment
const JobBoard = lazy(() => import('@/pages/jobs/JobBoard'));
const JobDetailPage = lazy(() => import('@/pages/JobDetailPage'));
const CompanyDashboard = lazy(() => import('@/pages/CompanyDashboard'));
const RegionalHiringLeaderboard = lazy(() => import('@/pages/jobs/RegionalHiringLeaderboard'));

// Directories
const SchoolsDirectory = lazy(() => import('@/pages/SchoolsDirectory'));
const HospitalsDirectory = lazy(() => import('@/pages/HospitalsDirectory'));
const PharmaciesDirectoryV2 = lazy(() => import('@/pages/PharmaciesDirectoryV2'));
const CompaniesDirectory = lazy(() => import('@/pages/CompaniesDirectory'));
const CompanyProfile = lazy(() => import('@/pages/CompanyProfile'));

// Feeds & Social
const Feed = lazy(() => import('@/pages/Feed'));
const MessengerPage = lazy(() => import('@/pages/MessengerPage'));

// Transparency & Analytics
const CorruptionIndex = lazy(() => import('@/pages/CorruptionIndex'));
const DebtTracker = lazy(() => import('@/pages/DebtTracker'));
const BillionaireTracker = lazy(() => import('@/pages/BillionaireTracker'));
const MediaTrustRatings = lazy(() => import('@/pages/MediaTrustRatings'));
const SentimentAnalysisDashboard = lazy(() => import('@/pages/SentimentAnalysisDashboard'));

// Entertainment
const ArtistEcosystem = lazy(() => import('@/pages/ArtistEcosystem'));

// Civic Engagement
const PetitionsPage = lazy(() => import('@/pages/PetitionsPage'));
const PetitionDetailPage = lazy(() => import('@/pages/PetitionDetailPage'));
const PollsLandingPage = lazy(() => import('@/pages/PollsLandingPage'));
const PollsDiscovery = lazy(() => import('@/pages/PollsDiscovery'));
const PollResultsPage = lazy(() => import('@/pages/PollResultsPage'));
const PollEmbedViewerPage = lazy(() => import('@/pages/PollEmbedViewerPage'));
const PollEmbedGeneratorPage = lazy(() => import('@/pages/PollEmbedGeneratorPage'));
const DonatePage = lazy(() => import('@/pages/DonatePage'));

// User Profiles
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const ProfileSlugPage = lazy(() => import('@/pages/ProfileSlugPage'));
const UnifiedProfilePage = lazy(() => import('@/pages/UnifiedProfilePage'));
const MusicProfile = lazy(() => import('@/pages/profiles/MusicProfile'));
const JobProfile = lazy(() => import('@/pages/profiles/JobProfile'));
const VillageMemberProfile = lazy(() => import('@/pages/profiles/VillageMemberProfile'));

// Settings & Preferences
const NotificationSettingsPage = lazy(() => import('@/pages/NotificationSettingsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const AdvancedSearchPage = lazy(() => import('@/pages/AdvancedSearchPage'));

// Admin Pages
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminCoreV2Page = lazy(() => import('@/pages/admin/AdminCoreV2Page'));
const PriorityAssessmentDashboard = lazy(() => import('@/pages/admin/PriorityAssessmentDashboard'));
const UserMigrationAdminPage = lazy(() => import('@/pages/admin/UserMigrationAdminPage'));
const PerformanceMonitoringPage = lazy(() => import('@/pages/PerformanceMonitoringPage'));
const ProductionReadinessPage = lazy(() => import('@/pages/ProductionReadinessPage'));

// === ROUTE LOADING COMPONENT ===
const RouteLoading = ({ routeName }: { routeName: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <LoadingSpinner 
      size="md" 
      text={`Loading ${routeName}...`} 
      className="text-primary"
    />
  </div>
);

// === ROUTE ERROR BOUNDARY ===
const RouteErrorBoundary = ({ children, routeName }: { children: React.ReactNode; routeName: string }) => (
  <ErrorBoundary
    fallback={
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Error Loading {routeName}
          </h2>
          <p className="text-muted-foreground mb-4">
            Something went wrong while loading this page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    }
    onError={(error) => {
      console.error(`Error in route ${routeName}:`, error);
    }}
  >
    {children}
  </ErrorBoundary>
);

// === WRAPPED ROUTE COMPONENT ===
const WrappedRoute = ({ 
  element: Element, 
  routeName, 
  requiresAuth = false, 
  requiresAdmin = false 
}: { 
  element: React.ComponentType; 
  routeName: string; 
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}) => {
  const WrappedElement = () => (
    <RouteErrorBoundary routeName={routeName}>
      <Suspense fallback={<RouteLoading routeName={routeName} />}>
        {requiresAuth || requiresAdmin ? (
          <ProtectedRoute requireAdmin={requiresAdmin}>
            <Element />
          </ProtectedRoute>
        ) : (
          <Element />
        )}
      </Suspense>
    </RouteErrorBoundary>
  );

  return <WrappedElement />;
};

/**
 * Main Application Router
 * Organized routing structure with proper error handling and lazy loading
 */
export const AppRouter: React.FC = () => {
  return (
    <>
      <LegacyRedirectHandler />
      <Routes>
        {/* === CORE ROUTES === */}
        <Route 
          path="/" 
          element={<WrappedRoute element={Index} routeName="Homepage" />} 
        />
        
        {/* === ABOUT US === */}
        <Route 
          path="/about" 
          element={<WrappedRoute element={AboutUs} routeName="About Us" />} 
        />
        <Route 
          path="/about-us" 
          element={<WrappedRoute element={AboutUs} routeName="About Us" />} 
        />
        
        {/* === AUTHENTICATION === */}
        <Route 
          path="/login" 
          element={<WrappedRoute element={AuthPage} routeName="Login" />} 
        />
        <Route 
          path="/register" 
          element={<WrappedRoute element={AuthPage} routeName="Register" />} 
        />
        <Route 
          path="/auth" 
          element={<WrappedRoute element={AuthPage} routeName="Authentication" />} 
        />
        
        {/* === CIVIC DASHBOARD === */}
        <Route 
          path="/civic-dashboard" 
          element={<WrappedRoute element={CivicDashboard} routeName="Civic Dashboard" />} 
        />
        
        {/* === FEEDS === */}
        <Route 
          path="/feed" 
          element={<WrappedRoute element={Feed} routeName="Social Feed" />} 
        />
        <Route 
          path="/civic-feed" 
          element={<WrappedRoute element={CivicFeed} routeName="Civic Feed" />} 
        />
        
        {/* === POLITICAL ENTITIES === */}
        <Route 
          path="/politicians" 
          element={<WrappedRoute element={EnhancedPoliticians} routeName="Politicians Directory" />} 
        />
        <Route 
          path="/politicians/:slug" 
          element={<WrappedRoute element={PoliticianDetailPage} routeName="Politician Profile" />} 
        />
        <Route 
          path="/politicians/:slug-:id" 
          element={<WrappedRoute element={PoliticianDetailPage} routeName="Politician Profile" />} 
        />
        
        <Route 
          path="/senators" 
          element={<WrappedRoute element={EnhancedSenators} routeName="Senators Directory" />} 
        />
        <Route 
          path="/senators/:slug" 
          element={<WrappedRoute element={SenatorDetailPage} routeName="Senator Profile" />} 
        />
        <Route 
          path="/senators/:slug-:id" 
          element={<WrappedRoute element={SenatorDetailPage} routeName="Senator Profile" />} 
        />
        
        <Route 
          path="/mps" 
          element={<WrappedRoute element={EnhancedMPs} routeName="MPs Directory" />} 
        />
        <Route 
          path="/mps/:slug" 
          element={<WrappedRoute element={MPDetailPage} routeName="MP Profile" />} 
        />
        <Route 
          path="/mps/:slug-:id" 
          element={<WrappedRoute element={MPDetailPage} routeName="MP Profile" />} 
        />
        
        <Route 
          path="/ministers" 
          element={<WrappedRoute element={EnhancedMinisters} routeName="Ministers Directory" />} 
        />
        <Route 
          path="/ministers/:slug" 
          element={<WrappedRoute element={EnhancedMinisterDetail} routeName="Minister Profile" />} 
        />
        <Route 
          path="/ministers/:slug-:id" 
          element={<WrappedRoute element={EnhancedMinisterDetail} routeName="Minister Profile" />} 
        />
        
        {/* === POLITICAL PARTIES === */}
        <Route 
          path="/parties" 
          element={<WrappedRoute element={PoliticalPartiesPage} routeName="Political Parties" />} 
        />
        <Route 
          path="/parties/:slug" 
          element={<WrappedRoute element={PoliticalPartyDetail} routeName="Political Party" />} 
        />
        <Route 
          path="/political-parties" 
          element={<WrappedRoute element={PoliticalPartiesPage} routeName="Political Parties" />} 
        />
        <Route 
          path="/political-parties/:slug" 
          element={<WrappedRoute element={PoliticalPartyDetail} routeName="Political Party" />} 
        />
        <Route 
          path="/political-directory" 
          element={<WrappedRoute element={UnifiedPoliticalDirectoryPage} routeName="Political Directory" />} 
        />
        
        {/* === VILLAGES & COMMUNITIES === */}
        <Route 
          path="/villages" 
          element={<WrappedRoute element={VillagesDirectoryPage} routeName="Villages Directory" />} 
        />
        <Route 
          path="/villages/:slug" 
          element={<WrappedRoute element={VillageProfile} routeName="Village Profile" />} 
        />
        
        <Route path="/fon" element={<Navigate to="/fons" replace />} />
        <Route 
          path="/fons" 
          element={<WrappedRoute element={FonsDirectory} routeName="Fons Directory" />} 
        />
        <Route 
          path="/fons/:slug" 
          element={<WrappedRoute element={FonProfile} routeName="Fon Profile" />} 
        />
        
        {/* === CIVIC FEATURES === */}
        <Route 
          path="/civic-education" 
          element={<WrappedRoute element={CivicEducationHub} routeName="Civic Education" />} 
        />
        <Route 
          path="/civic-contributions" 
          element={<WrappedRoute element={CivicContributionsPage} routeName="Civic Contributions" />} 
        />
        
        {/* === TRANSPARENCY & ACCOUNTABILITY === */}
        <Route 
          path="/corruption-index" 
          element={<WrappedRoute element={CorruptionIndex} routeName="Corruption Index" />} 
        />
        <Route 
          path="/debt-tracker" 
          element={<WrappedRoute element={DebtTracker} routeName="Debt Tracker" />} 
        />
        <Route 
          path="/billionaire-tracker" 
          element={<WrappedRoute element={BillionaireTracker} routeName="Billionaire Tracker" />} 
        />
        <Route 
          path="/media-trust" 
          element={<WrappedRoute element={MediaTrustRatings} routeName="Media Trust Ratings" />} 
        />
        <Route 
          path="/sentiment-analysis" 
          element={<WrappedRoute element={SentimentAnalysisDashboard} routeName="Sentiment Analysis" />} 
        />
        
        {/* === ENTERTAINMENT & ARTS === */}
        <Route 
          path="/artist-ecosystem" 
          element={<WrappedRoute element={ArtistEcosystem} routeName="Artist Ecosystem" />} 
        />
        <Route 
          path="/music" 
          element={<WrappedRoute element={ArtistEcosystem} routeName="Music Platform" />} 
        />
        
        {/* === JOBS & EMPLOYMENT === */}
        <Route 
          path="/jobs" 
          element={<WrappedRoute element={JobBoard} routeName="Job Board" />} 
        />
        <Route 
          path="/jobs/board" 
          element={<WrappedRoute element={JobBoard} routeName="Job Board" />} 
        />
        <Route 
          path="/jobs/company" 
          element={<WrappedRoute element={CompanyDashboard} routeName="Company Dashboard" requiresAuth />} 
        />
        <Route 
          path="/jobs/leaderboard" 
          element={<WrappedRoute element={RegionalHiringLeaderboard} routeName="Hiring Leaderboard" />} 
        />
        <Route 
          path="/jobs/:jobSlug-:id" 
          element={<WrappedRoute element={JobDetailPage} routeName="Job Details" />} 
        />
        
        {/* === DIRECTORIES === */}
        <Route 
          path="/schools" 
          element={<WrappedRoute element={SchoolsDirectory} routeName="Schools Directory" />} 
        />
        <Route 
          path="/hospitals" 
          element={<WrappedRoute element={HospitalsDirectory} routeName="Hospitals Directory" />} 
        />
        <Route 
          path="/pharmacies" 
          element={<WrappedRoute element={PharmaciesDirectoryV2} routeName="Pharmacies Directory" />} 
        />
        <Route 
          path="/companies" 
          element={<WrappedRoute element={CompaniesDirectory} routeName="Companies Directory" />} 
        />
        <Route 
          path="/companies/:id" 
          element={<WrappedRoute element={CompanyProfile} routeName="Company Profile" />} 
        />
        
        {/* === MESSAGING === */}
        <Route 
          path="/messages" 
          element={<WrappedRoute element={MessengerPage} routeName="Messages" requiresAuth />} 
        />
        <Route 
          path="/messages/:threadId" 
          element={<WrappedRoute element={MessengerPage} routeName="Messages" requiresAuth />} 
        />
        
        {/* === USER PROFILES === */}
        <Route 
          path="/profile/:username" 
          element={<WrappedRoute element={UnifiedProfilePage} routeName="User Profile" />} 
        />
        <Route 
          path="/u/:userId" 
          element={<WrappedRoute element={UnifiedProfilePage} routeName="User Profile" />} 
        />
        <Route 
          path="/@:username" 
          element={<WrappedRoute element={UnifiedProfilePage} routeName="User Profile" />} 
        />
        
        {/* Module-specific profiles */}
        <Route 
          path="/music/artists/:artistSlug-:id" 
          element={<WrappedRoute element={MusicProfile} routeName="Artist Profile" />} 
        />
        <Route 
          path="/jobs/profile/:username-:id" 
          element={<WrappedRoute element={JobProfile} routeName="Job Profile" />} 
        />
        <Route 
          path="/villages/members/:username" 
          element={<WrappedRoute element={VillageMemberProfile} routeName="Village Member Profile" />} 
        />
        
        {/* Legacy Profile Routes */}
        <Route 
          path="/profile/:username/legacy" 
          element={<WrappedRoute element={ProfilePage} routeName="Legacy Profile" />} 
        />
        <Route 
          path="/profile-slug/:slug" 
          element={<WrappedRoute element={ProfileSlugPage} routeName="Profile" />} 
        />
        
        {/* === CIVIC ENGAGEMENT === */}
        <Route 
          path="/petitions" 
          element={<WrappedRoute element={PetitionsPage} routeName="Petitions" />} 
        />
        <Route 
          path="/petitions/:petitionSlug-:id" 
          element={<WrappedRoute element={PetitionDetailPage} routeName="Petition" />} 
        />
        
        <Route 
          path="/polls" 
          element={<WrappedRoute element={PollsLandingPage} routeName="Polls" />} 
        />
        <Route 
          path="/polls/discover" 
          element={<WrappedRoute element={PollsDiscovery} routeName="Discover Polls" />} 
        />
        <Route 
          path="/polls/results/:poll_id" 
          element={<WrappedRoute element={PollResultsPage} routeName="Poll Results" />} 
        />
        <Route 
          path="/polls/embed/:poll_id" 
          element={<WrappedRoute element={PollEmbedViewerPage} routeName="Poll Embed" />} 
        />
        <Route 
          path="/polls/embed-generator/:poll_id" 
          element={<WrappedRoute element={PollEmbedGeneratorPage} routeName="Poll Embed Generator" />} 
        />
        
        <Route 
          path="/donate" 
          element={<WrappedRoute element={DonatePage} routeName="Donate" />} 
        />
        
        {/* === SETTINGS & PREFERENCES === */}
        <Route 
          path="/notifications" 
          element={<WrappedRoute element={NotificationSettingsPage} routeName="Notification Settings" requiresAuth />} 
        />
        <Route 
          path="/settings" 
          element={<WrappedRoute element={SettingsPage} routeName="Settings" requiresAuth />} 
        />
        <Route 
          path="/search" 
          element={<WrappedRoute element={AdvancedSearchPage} routeName="Advanced Search" />} 
        />
        
        {/* === ADMIN ROUTES === */}
        <Route 
          path={ROUTES.ADMIN.DASHBOARD} 
          element={<WrappedRoute element={AdminCoreV2Page} routeName="Admin Core" requiresAdmin />} 
        />
        <Route 
          path="/admin/dashboard" 
          element={<WrappedRoute element={AdminDashboard} routeName="Admin Dashboard" requiresAdmin />} 
        />
        <Route 
          path="/admin/priority-assessment" 
          element={<WrappedRoute element={PriorityAssessmentDashboard} routeName="Priority Assessment" requiresAdmin />} 
        />
        <Route 
          path="/admin/user-migration" 
          element={<WrappedRoute element={UserMigrationAdminPage} routeName="User Migration" requiresAdmin />} 
        />
        <Route 
          path="/performance" 
          element={<WrappedRoute element={PerformanceMonitoringPage} routeName="Performance Monitoring" requiresAdmin />} 
        />
        <Route 
          path="/production-readiness" 
          element={<WrappedRoute element={ProductionReadinessPage} routeName="Production Readiness" requiresAdmin />} 
        />
        
        {/* === 404 - MUST BE LAST === */}
        <Route 
          path="*" 
          element={<WrappedRoute element={NotFound} routeName="Page Not Found" />} 
        />
      </Routes>
    </>
  );
};