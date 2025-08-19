/**
 * CamerPulse Component Library Index
 * 
 * Centralized exports for all optimized components with lazy loading support.
 * Organized by category for better maintainability and tree-shaking.
 */

import { lazy } from 'react';

// === CORE UI COMPONENTS ===
export { LoadingSpinner } from '../common/LoadingSpinner';
export { ErrorBoundary } from '../common/ErrorBoundary';

// === LAYOUT COMPONENTS ===
export { OptimizedHeader as Header } from '../Layout/OptimizedHeader';
export { OptimizedFooter as Footer } from '../Layout/OptimizedFooter';
export { OptimizedMobileNavigation as MobileNavigation } from '../Layout/OptimizedMobileNavigation';

// Lazy-loaded layout components for better performance
export const AppLayout = lazy(() => import('../Layout/AppLayout').then(m => ({ default: m.AppLayout })));
export const CamerJobsLayout = lazy(() => import('../Layout/CamerJobsLayout').then(m => ({ default: m.CamerJobsLayout })));
export const CamerPlayLayout = lazy(() => import('../Layout/CamerPlayLayout').then(m => ({ default: m.CamerPlayLayout })));
export const ServicesLayout = lazy(() => import('../Layout/ServicesLayout').then(m => ({ default: m.ServicesLayout })));

// === CIVIC ENGAGEMENT COMPONENTS ===
export const CivicDashboard = lazy(() => import('../civic/CivicDashboard').then(m => ({ default: m.CivicDashboard })));
export const PetitionSystem = lazy(() => import('../civic/PetitionSystem').then(m => ({ default: m.PetitionSystem })));
export const VillageRegistry = lazy(() => import('../civic/VillageRegistry').then(m => ({ default: m.VillageRegistry })));

// === POLITICAL COMPONENTS ===
export const PoliticalGrid = lazy(() => import('../Politics/EnhancedPoliticalGrid').then(m => ({ default: m.EnhancedPoliticalGrid })));
export const PoliticalCard = lazy(() => import('../Politics/UnifiedPoliticalCard').then(m => ({ default: m.UnifiedPoliticalCard })));

// === MESSAGING COMPONENTS ===
export const EnhancedMessenger = lazy(() => import('../Messenger/EnhancedMessenger').then(m => ({ default: m.EnhancedMessenger })));
export const PulseMessenger = lazy(() => import('../Messenger/PulseMessenger').then(m => ({ default: m.PulseMessenger })));

// === POLL COMPONENTS ===
export const CreatePollDialog = lazy(() => import('../Polls/CreatePollDialog').then(m => ({ default: m.CreatePollDialog })));
export const PollTemplateRenderer = lazy(() => import('../PollTemplates/PollTemplateRenderer').then(m => ({ default: m.PollTemplateRenderer })));

// === ADMIN COMPONENTS ===
export const AdminCoreV2 = lazy(() => import('../Admin/AdminCoreV2/AdminCoreV2').then(m => ({ default: m.AdminCoreV2 })));
export const AshenDebugCore = lazy(() => import('../Admin/AshenDebugCore').then(m => ({ default: m.AshenDebugCore })));

// === AI COMPONENTS ===
export const CivicAIChatbot = lazy(() => import('../AI/CivicAIChatbot').then(m => ({ default: m.CivicAIChatbot })));
export const CivicFactCheckWidget = lazy(() => import('../AI/CivicFactCheckWidget').then(m => ({ default: m.CivicFactCheckWidget })));

// === DIASPORA COMPONENTS ===
export const DiasporaConnect = lazy(() => import('../diaspora/DiasporaConnect').then(m => ({ default: m.DiasporaConnect })));
export const AdvancedAnalytics = lazy(() => import('../diaspora/AdvancedAnalytics').then(m => ({ default: m.AdvancedAnalytics })));

// === TYPES ===
export type { 
  LoadingState,
  ComponentSize,
  ComponentVariant 
} from '../../types';

// === HOOKS ===
export { 
  useAsync,
  useDebounce,
  useLocalStorage,
  useToggle,
  useCounter,
  useMediaQuery,
  useIsMobile
} from '../../hooks';

// === UTILITIES ===
export { cn } from '../../lib/utils';
export { performanceUtils, usePerformanceMonitor } from '../../utils/performance';

/**
 * Component registry for dynamic imports
 */
export const COMPONENT_REGISTRY = {
  // Layouts
  'AppLayout': () => import('../Layout/AppLayout'),
  'CamerJobsLayout': () => import('../Layout/CamerJobsLayout'),
  'CamerPlayLayout': () => import('../Layout/CamerPlayLayout'),
  'ServicesLayout': () => import('../Layout/ServicesLayout'),
  
  // Civic
  'CivicDashboard': () => import('../civic/CivicDashboard'),
  'PetitionSystem': () => import('../civic/PetitionSystem'),
  'VillageRegistry': () => import('../civic/VillageRegistry'),
  
  // Political
  'PoliticalGrid': () => import('../Politics/EnhancedPoliticalGrid'),
  'PoliticalCard': () => import('../Politics/UnifiedPoliticalCard'),
  
  // Messaging
  'EnhancedMessenger': () => import('../Messenger/EnhancedMessenger'),
  'PulseMessenger': () => import('../Messenger/PulseMessenger'),
  
  // Polls
  'CreatePollDialog': () => import('../Polls/CreatePollDialog'),
  'PollTemplateRenderer': () => import('../PollTemplates/PollTemplateRenderer'),
  
  // Admin
  'AdminCoreV2': () => import('../Admin/AdminCoreV2/AdminCoreV2'),
  'AshenDebugCore': () => import('../Admin/AshenDebugCore'),
  
  // AI
  'CivicAIChatbot': () => import('../AI/CivicAIChatbot'),
  'CivicFactCheckWidget': () => import('../AI/CivicFactCheckWidget'),
  
  // Diaspora
  'DiasporaConnect': () => import('../diaspora/DiasporaConnect'),
  'AdvancedAnalytics': () => import('../diaspora/AdvancedAnalytics'),
} as const;

/**
 * Dynamic component loader
 */
export async function loadComponent(name: keyof typeof COMPONENT_REGISTRY) {
  try {
    const module = await COMPONENT_REGISTRY[name]();
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load component: ${name}`, error);
    throw error;
  }
}