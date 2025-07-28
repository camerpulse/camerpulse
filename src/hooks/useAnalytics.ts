import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  session_id?: string;
  event_type: string;
  event_category: string;
  event_label?: string;
  event_value?: number;
  page_url?: string;
  referrer?: string;
  user_agent?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  custom_properties: any;
  timestamp: string;
}

export interface AnalyticsReport {
  id: string;
  user_id: string;
  report_name: string;
  report_type: string;
  description?: string;
  configuration: any;
  data_sources: any[];
  filters: any;
  visualization_config: any;
  schedule_config?: any;
  is_public: boolean;
  shared_with?: string[];
  status: string;
  last_generated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ExportJob {
  id: string;
  user_id: string;
  export_name: string;
  export_type: string;
  data_query: any;
  filters: any;
  format: string;
  status: string;
  progress_percentage: number;
  total_records?: number;
  processed_records?: number;
  file_path?: string;
  file_size_bytes?: number;
  error_message?: string;
  expires_at?: string;
  created_at: string;
  completed_at?: string;
}

export function useAnalytics() {
  const { user } = useAuth();
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(false);

  const getSessionId = useCallback(() => {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }, []);

  const trackEvent = useCallback(async (eventData: {
    event_type: string;
    event_category: string;
    event_label?: string;
    event_value?: number;
    custom_properties?: any;
  }) => {
    try {
      const sessionId = getSessionId();
      
      const { error } = await supabase.functions.invoke('analytics-processor', {
        body: {
          action: 'track_event',
          data: {
            user_id: user?.id,
            session_id: sessionId,
            ...eventData,
            page_url: window.location.href,
            referrer: document.referrer,
            user_agent: navigator.userAgent,
            custom_properties: eventData.custom_properties || {}
          }
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [user?.id, getSessionId]);

  const trackPerformance = useCallback(async (metricData: {
    metric_name: string;
    metric_category: string;
    metric_value: number;
    metric_unit: string;
    dimensions?: any;
  }) => {
    try {
      const sessionId = getSessionId();

      const { error } = await supabase.functions.invoke('analytics-processor', {
        body: {
          action: 'process_performance',
          data: {
            user_id: user?.id,
            session_id: sessionId,
            ...metricData,
            dimensions: metricData.dimensions || {}
          }
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking performance:', error);
    }
  }, [user?.id, getSessionId]);

  const fetchEvents = useCallback(async (filters?: any) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('realtime_analytics_events')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch analytics events');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchReports = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('analytics_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports((data || []).map(report => ({
        ...report,
        data_sources: Array.isArray(report.data_sources) ? report.data_sources : [],
        shared_with: Array.isArray(report.shared_with) ? report.shared_with : undefined
      })));
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    }
  }, [user?.id]);

  const createReport = useCallback(async (reportData: {
    report_name: string;
    report_type: string;
    description?: string;
    configuration: any;
    data_sources: any[];
    filters: any;
    visualization_config: any;
    schedule_config?: any;
    is_public?: boolean;
  }) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('analytics_reports')
        .insert({
          user_id: user.id,
          ...reportData,
          is_public: reportData.is_public || false
        })
        .select()
        .single();

      if (error) throw error;

      await fetchReports();
      toast.success('Report created successfully');
      return data;
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Failed to create report');
      throw error;
    }
  }, [user?.id, fetchReports]);

  const executeReport = useCallback(async (reportId: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const { error } = await supabase.functions.invoke('analytics-processor', {
        body: {
          action: 'generate_report',
          data: {
            report_id: reportId,
            user_id: user.id
          }
        }
      });

      if (error) throw error;
      toast.success('Report execution started');
    } catch (error) {
      console.error('Error executing report:', error);
      toast.error('Failed to execute report');
      throw error;
    }
  }, [user?.id]);

  const createExportJob = useCallback(async (exportData: {
    export_name: string;
    export_type: string;
    data_query: any;
    filters: any;
    format: string;
  }) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('data_export_jobs')
        .insert({
          user_id: user.id,
          ...exportData
        })
        .select()
        .single();

      if (error) throw error;

      const { error: processError } = await supabase.functions.invoke('data-export', {
        body: {
          job_id: data.id,
          format: exportData.format
        }
      });

      if (processError) throw processError;

      toast.success('Export job created successfully');
      return data;
    } catch (error) {
      console.error('Error creating export job:', error);
      toast.error('Failed to create export job');
      throw error;
    }
  }, [user?.id]);

  const fetchExportJobs = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('data_export_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExportJobs(data || []);
    } catch (error) {
      console.error('Error fetching export jobs:', error);
      toast.error('Failed to fetch export jobs');
    }
  }, [user?.id]);

  const getAnalyticsSummary = useCallback(async (startDate?: string, endDate?: string) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase.rpc('get_analytics_summary', {
        p_user_id: user.id,
        p_start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        p_end_date: endDate || new Date().toISOString().split('T')[0]
      });

      if (error) throw error;
      return data[0] || null;
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      return null;
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchReports();
      fetchExportJobs();
    }
  }, [user?.id, fetchReports, fetchExportJobs]);

  const trackSearch = useCallback(async (searchData: {
    query: string;
    results_count: number;
    filters?: any;
  }) => {
    await trackEvent({
      event_type: 'search',
      event_category: 'user_action',
      event_label: searchData.query,
      event_value: searchData.results_count,
      custom_properties: {
        filters: searchData.filters || {}
      }
    });
  }, [trackEvent]);

  return {
    events,
    reports,
    exportJobs,
    loading,
    trackEvent,
    trackPerformance,
    trackSearch,
    fetchEvents,
    createReport,
    executeReport,
    createExportJob,
    getAnalyticsSummary,
    refreshData: () => Promise.all([
      fetchEvents(),
      fetchReports(),
      fetchExportJobs()
    ])
  };
}