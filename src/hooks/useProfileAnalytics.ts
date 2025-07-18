import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileAnalytics {
  total_views: number;
  unique_viewers: number;
  views_today: number;
  views_this_week: number;
  views_this_month: number;
  engagement_score: number;
  follower_growth: number;
  popular_times: { hour: number; views: number }[];
  viewer_demographics: {
    regions: { region: string; count: number }[];
    profile_types: { type: string; count: number }[];
  };
}

interface ViewRecord {
  id: string;
  profile_id: string;
  viewer_id?: string;
  viewer_ip?: string;
  view_date: string;
  viewer_region?: string;
  viewer_profile_type?: string;
}

export const useProfileAnalytics = (profileId: string) => {
  const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentViews, setRecentViews] = useState<ViewRecord[]>([]);

  useEffect(() => {
    if (profileId) {
      fetchAnalytics();
      fetchRecentViews();
    }
  }, [profileId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('profile_analytics')
        .select('*')
        .eq('profile_id', profileId)
        .single();

      if (analyticsError && analyticsError.code !== 'PGRST116') {
        throw analyticsError;
      }

      // Get view records for detailed analytics
      const { data: viewsData, error: viewsError } = await supabase
        .from('profile_view_logs')
        .select('*')
        .eq('profile_id', profileId)
        .order('view_date', { ascending: false })
        .limit(1000);

      if (viewsError) throw viewsError;

      // Calculate analytics
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const views = viewsData || [];
      const uniqueViewers = new Set(views.map(v => v.viewer_id || v.viewer_ip)).size;
      const viewsToday = views.filter(v => new Date(v.view_date) >= today).length;
      const viewsThisWeek = views.filter(v => new Date(v.view_date) >= weekAgo).length;
      const viewsThisMonth = views.filter(v => new Date(v.view_date) >= monthAgo).length;

      // Calculate popular times (hourly distribution)
      const hourlyViews = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        views: views.filter(v => new Date(v.view_date).getHours() === hour).length
      }));

      // Demographics
      const regionCounts: { [key: string]: number } = {};
      const typeCounts: { [key: string]: number } = {};

      views.forEach(view => {
        if (view.viewer_region) {
          regionCounts[view.viewer_region] = (regionCounts[view.viewer_region] || 0) + 1;
        }
        if (view.viewer_profile_type) {
          typeCounts[view.viewer_profile_type] = (typeCounts[view.viewer_profile_type] || 0) + 1;
        }
      });

      const calculatedAnalytics: ProfileAnalytics = {
        total_views: analyticsData?.total_views || views.length,
        unique_viewers: uniqueViewers,
        views_today: viewsToday,
        views_this_week: viewsThisWeek,
        views_this_month: viewsThisMonth,
        engagement_score: analyticsData?.engagement_score || 0,
        follower_growth: analyticsData?.follower_growth || 0,
        popular_times: hourlyViews,
        viewer_demographics: {
          regions: Object.entries(regionCounts).map(([region, count]) => ({ region, count })),
          profile_types: Object.entries(typeCounts).map(([type, count]) => ({ type, count }))
        }
      };

      setAnalytics(calculatedAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentViews = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_view_logs')
        .select('*')
        .eq('profile_id', profileId)
        .order('view_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setRecentViews(data || []);
    } catch (error) {
      console.error('Error fetching recent views:', error);
    }
  };

  const trackView = async (viewerData?: { 
    viewerId?: string; 
    viewerIp?: string; 
    viewerRegion?: string; 
    viewerProfileType?: string; 
  }) => {
    try {
      await supabase.rpc('track_profile_view', {
        p_profile_id: profileId,
        p_viewer_id: viewerData?.viewerId,
        p_viewer_ip: viewerData?.viewerIp,
        p_viewer_region: viewerData?.viewerRegion,
        p_viewer_profile_type: viewerData?.viewerProfileType
      });
      
      // Refresh analytics after tracking view
      fetchAnalytics();
    } catch (error) {
      console.error('Error tracking profile view:', error);
    }
  };

  return {
    analytics,
    recentViews,
    loading,
    trackView,
    refreshAnalytics: fetchAnalytics
  };
};