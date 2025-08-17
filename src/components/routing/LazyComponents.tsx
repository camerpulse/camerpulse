import { lazy } from 'react';

// Core Pages
export const LazyIndex = lazy(() => import('@/pages/Index'));
export const LazyAuthPage = lazy(() => import('@/pages/AuthPage').then(module => ({ default: module.AuthPage })));

// Civic & Democracy
export const LazyCivicDashboard = lazy(() => import('@/pages/CivicDashboard'));
export const LazyCivicFeed = lazy(() => import('@/pages/CivicFeed'));
export const LazyCivicEducationHub = lazy(() => import('@/pages/CivicEducationHub'));
export const LazyCivicContributionsPage = lazy(() => import('@/pages/CivicContributionsPage'));

// Political System
export const LazyPoliticians = lazy(() => import('@/pages/Politicians'));
export const LazyPoliticianDetailPage = lazy(() => import('@/pages/PoliticianDetailPage').then(module => ({ default: module.PoliticianDetailPage })));
export const LazySenatorsPage = lazy(() => import('@/pages/Senators'));
export const LazySenatorDetailPage = lazy(() => import('@/pages/SenatorDetailPage').then(module => ({ default: module.SenatorDetailPage })));
export const LazyMPsPage = lazy(() => import('@/pages/MPsPage'));
export const LazyMPDetailPage = lazy(() => import('@/pages/MPDetailPage').then(module => ({ default: module.MPDetailPage })));
export const LazyMinistersPage = lazy(() => import('@/pages/MinistersPage'));
export const LazyMinisterDetailPage = lazy(() => import('@/pages/MinisterDetailPage').then(module => ({ default: module.MinisterDetailPage })));
export const LazyPoliticalParties = lazy(() => import('@/pages/PoliticalParties'));
export const LazyPoliticalPartyDetail = lazy(() => import('@/pages/PoliticalPartyDetail'));

// Directories & Institutions
export const LazyVillagesDirectoryPage = lazy(() => import('@/pages/VillagesDirectoryPage'));
export const LazyVillageProfile = lazy(() => import('@/pages/VillageProfile'));
export const LazyFonsDirectory = lazy(() => import('@/pages/FonsDirectory'));
export const LazyFonProfile = lazy(() => import('@/pages/FonProfile'));
export const LazySchoolsDirectory = lazy(() => import('@/pages/SchoolsDirectory'));
export const LazyHospitalsDirectory = lazy(() => import('@/pages/HospitalsDirectory'));
export const LazyCompanyProfile = lazy(() => import('@/pages/CompanyProfile'));

// Community & Services

// Jobs
export const LazyJobBoard = lazy(() => import('@/pages/jobs/JobBoard'));
export const LazyJobDetailPage = lazy(() => import('@/pages/JobDetailPage'));
export const LazyCompanyDashboard = lazy(() => import('@/pages/CompanyDashboard'));
export const LazyRegionalHiringLeaderboard = lazy(() => import('@/pages/jobs/RegionalHiringLeaderboard'));

// Petitions & Polls
export const LazyPetitionsPage = lazy(() => import('@/pages/PetitionsPage'));
export const LazyPetitionDetailPage = lazy(() => import('@/pages/PetitionDetailPage'));
export const LazyPollsLandingPage = lazy(() => import('@/pages/PollsLandingPage'));
export const LazyPollsDiscovery = lazy(() => import('@/pages/PollsDiscovery'));
export const LazyPollResultsPage = lazy(() => import('@/pages/PollResultsPage'));
export const LazyPollEmbedViewerPage = lazy(() => import('@/pages/PollEmbedViewerPage'));
export const LazyPollEmbedGeneratorPage = lazy(() => import('@/pages/PollEmbedGeneratorPage'));

// User & Profile
export const LazyProfilePage = lazy(() => import('@/pages/profile/ProfilePage').then(module => ({ default: module.ProfilePage })));
export const LazyProfileSlugPage = lazy(() => import('@/pages/ProfileSlugPage'));
export const LazyUnifiedProfilePage = lazy(() => import('@/pages/UnifiedProfilePage'));
export const LazyMusicProfile = lazy(() => import('@/pages/profiles/MusicProfile'));
export const LazyJobProfile = lazy(() => import('@/pages/profiles/JobProfile'));
export const LazyVillageMemberProfile = lazy(() => import('@/pages/profiles/VillageMemberProfile'));


// Communication
export const LazyMessengerPage = lazy(() => import('@/pages/MessengerPage'));
export const LazyNotificationSettingsPage = lazy(() => import('@/pages/NotificationSettingsPage'));

// Advanced Features
export const LazyAdvancedSearchPage = lazy(() => import('@/pages/AdvancedSearchPage').then(module => ({ default: module.AdvancedSearchPage })));
export const LazyPerformanceMonitoringPage = lazy(() => import('@/pages/PerformanceMonitoringPage'));

// Admin Routes
export const LazyAdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
export const LazyAdminCoreV2Page = lazy(() => import('@/pages/admin/AdminCoreV2Page'));
export const LazyPriorityAssessmentDashboard = lazy(() => import('@/pages/admin/PriorityAssessmentDashboard'));
export const LazyUserMigrationAdminPage = lazy(() => import('@/pages/admin/UserMigrationAdminPage'));

// Error Pages
export const LazyNotFound = lazy(() => import('@/pages/NotFound'));
export const LazyUnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'));