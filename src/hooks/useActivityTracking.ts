import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type ActivityType = 'view' | 'download' | 'search' | 'favorite' | 'share' | 'bid';
type EntityType = 'tender' | 'document' | 'business' | 'search';

export const useActivityTracking = () => {
  const { user } = useAuth();

  // Track user activity
  const trackActivity = useCallback(async (
    activityType: ActivityType,
    entityType: EntityType,
    entityId?: string,
    activityData: any = {}
  ) => {
    if (!user) return;

    try {
      // Note: These tables will be available after types are regenerated
      console.log('Tracking activity:', { activityType, entityType, entityId, activityData });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }, [user]);

  // Track view
  const trackView = useCallback((entityType: EntityType, entityId: string, metadata: any = {}) => {
    trackActivity('view', entityType, entityId, metadata);
  }, [trackActivity]);

  // Track download
  const trackDownload = useCallback(async (
    tenderId: string,
    documentName: string,
    documentUrl: string,
    fileSize?: number
  ) => {
    if (!user) return;

    try {
      // Note: These tables will be available after types are regenerated
      console.log('Tracking download:', { tenderId, documentName, documentUrl, fileSize });
      
      // Track in activity logs
      trackActivity('download', 'document', tenderId, {
        document_name: documentName,
        document_url: documentUrl,
        file_size: fileSize
      });
    } catch (error) {
      console.error('Error tracking download:', error);
    }
  }, [user, trackActivity]);

  // Track search
  const trackSearch = useCallback((searchQuery: string, filters: any = {}, resultsCount: number = 0) => {
    trackActivity('search', 'search', undefined, {
      query: searchQuery,
      filters,
      results_count: resultsCount
    });
  }, [trackActivity]);

  // Add to recently viewed
  const addToRecentlyViewed = useCallback(async (
    entityType: EntityType,
    entityId: string,
    entityData: any = {}
  ) => {
    if (!user) return;

    try {
      // Note: This table will be available after types are regenerated
      console.log('Adding to recently viewed:', { entityType, entityId, entityData });
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
    }
  }, [user]);

  return {
    trackActivity,
    trackView,
    trackDownload,
    trackSearch,
    addToRecentlyViewed
  };
};