export { useAuth } from '@/contexts/AuthContext';
export { useErrorHandler } from './useErrorHandler';
export { useRealtimeNotifications } from './useRealtimeNotifications';

// Performance and caching utilities
export { debounce, throttle, monitorMemoryUsage } from '@/utils/performance';
export { apiCache, userCache, assetCache } from '@/utils/cacheManager';