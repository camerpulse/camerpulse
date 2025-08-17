import { lazy } from 'react';

/**
 * Lazy-loaded route components for performance optimization
 */

// Main pages
export const LazyIndex = lazy(() => import('@/pages/Index'));
export const LazyAuthPage = lazy(() => import('@/pages/AuthPage').then(m => ({ default: m.AuthPage })));
export const LazyFeed = lazy(() => import('@/pages/Feed'));
export const LazyCivicFeed = lazy(() => import('@/pages/CivicFeed'));

// Dashboard and civic pages
export const LazyCivicDashboard = lazy(() => import('@/pages/CivicDashboard'));
export const LazyCivicEducationHub = lazy(() => import('@/pages/CivicEducationHub'));
export const LazyCivicContributionsPage = lazy(() => import('@/pages/CivicContributionsPage'));

// Political pages
export const LazyPoliticians = lazy(() => import('@/pages/Politicians'));
export const LazyPoliticianDetailPage = lazy(() => import('@/pages/PoliticianDetailPage').then(m => ({ default: m.PoliticianDetailPage })));
export const LazySenatorsPage = lazy(() => import('@/pages/Senators'));
export const LazySenatorDetailPage = lazy(() => import('@/pages/SenatorDetailPage').then(m => ({ default: m.SenatorDetailPage })));
export const LazyMPsPage = lazy(() => import('@/pages/MPsPage'));
export const LazyMPDetailPage = lazy(() => import('@/pages/MPDetailPage').then(m => ({ default: m.MPDetailPage })));
export const LazyMinistersPage = lazy(() => import('@/pages/MinistersPage'));
export const LazyMinisterDetailPage = lazy(() => import('@/pages/MinisterDetailPage').then(m => ({ default: m.MinisterDetailPage })));
export const LazyPoliticalParties = lazy(() => import('@/pages/PoliticalParties'));
export const LazyPoliticalPartyDetail = lazy(() => import('@/pages/PoliticalPartyDetail'));

// Village and community pages
export const LazyVillagesDirectoryPage = lazy(() => import('@/pages/VillagesDirectoryPage'));
export const LazyVillageProfile = lazy(() => import('@/pages/VillageProfile'));
export const LazyFonsDirectory = lazy(() => import('@/pages/FonsDirectory'));
export const LazyFonProfile = lazy(() => import('@/pages/FonProfile'));

// Marketplace pages
export const LazyMarketplace = lazy(() => import('@/pages/Marketplace'));
export const LazyMarketplaceProducts = lazy(() => import('@/pages/MarketplaceProducts'));
export const LazyMarketplaceVendors = lazy(() => import('@/pages/MarketplaceVendors'));
export const LazyVendorDetailPage = lazy(() => import('@/pages/VendorDetailPage'));
export const LazyProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));

// Job pages
export const LazyJobBoard = lazy(() => import('@/pages/jobs/JobBoard'));
export const LazyJobDetailPage = lazy(() => import('@/pages/JobDetailPage'));
export const LazyCompanyDashboard = lazy(() => import('@/pages/CompanyDashboard'));
export const LazyRegionalHiringLeaderboard = lazy(() => import('@/pages/jobs/RegionalHiringLeaderboard'));

// Petition and poll pages
export const LazyPetitionsPage = lazy(() => import('@/pages/PetitionsPage'));
export const LazyPetitionDetailPage = lazy(() => import('@/pages/PetitionDetailPage'));
export const LazyPollsLandingPage = lazy(() => import('@/pages/PollsLandingPage'));
export const LazyPollsDiscovery = lazy(() => import('@/pages/PollsDiscovery'));
export const LazyPollResultsPage = lazy(() => import('@/pages/PollResultsPage'));
export const LazyPollEmbedViewerPage = lazy(() => import('@/pages/PollEmbedViewerPage'));
export const LazyPollEmbedGeneratorPage = lazy(() => import('@/pages/PollEmbedGeneratorPage'));

// Profile pages
export const LazyProfilePage = lazy(() => import('@/pages/profile/ProfilePage').then(m => ({ default: m.ProfilePage })));
export const LazyProfileSlugPage = lazy(() => import('@/pages/ProfileSlugPage'));
export const LazyUnifiedProfilePage = lazy(() => import('@/pages/UnifiedProfilePage'));

// Module-specific profile pages
export const LazyMusicProfile = lazy(() => import('@/pages/profiles/MusicProfile'));
export const LazyJobProfile = lazy(() => import('@/pages/profiles/JobProfile'));
export const LazyVillageMemberProfile = lazy(() => import('@/pages/profiles/VillageMemberProfile'));
export const LazyMarketplaceProfile = lazy(() => import('@/pages/profiles/MarketplaceProfile'));

// Directory pages
export const LazySchoolsDirectory = lazy(() => import('@/pages/SchoolsDirectory'));
export const LazyHospitalsDirectory = lazy(() => import('@/pages/HospitalsDirectory'));
export const LazyCompanyProfile = lazy(() => import('@/pages/CompanyProfile'));

// Communication pages
export const LazyMessengerPage = lazy(() => import('@/pages/MessengerPage'));
export const LazyNotificationSettingsPage = lazy(() => import('@/pages/NotificationSettingsPage'));

// Advanced features
export const LazyAdvancedSearchPage = lazy(() => import('@/pages/AdvancedSearchPage').then(m => ({ default: m.AdvancedSearchPage })));
export const LazyPerformanceMonitoringPage = lazy(() => import('@/pages/PerformanceMonitoringPage'));

// Admin pages (loaded on demand for better security)
export const LazyAdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
export const LazyAdminCoreV2Page = lazy(() => import('@/pages/admin/AdminCoreV2Page'));
export const LazyPriorityAssessmentDashboard = lazy(() => import('@/pages/admin/PriorityAssessmentDashboard'));
export const LazyUserMigrationAdminPage = lazy(() => import('@/pages/admin/UserMigrationAdminPage'));

// Error pages
export const LazyNotFound = lazy(() => import('@/pages/NotFound'));