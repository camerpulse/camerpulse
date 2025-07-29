import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();

    switch (action) {
      case 'track_event':
        return await trackEvent(data);
      case 'process_performance':
        return await processPerformanceMetrics(data);
      case 'generate_report':
        return await generateReport(data);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Analytics processor error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

async function trackEvent(eventData: any): Promise<Response> {
  const {
    user_id,
    session_id,
    event_type,
    event_category,
    event_label,
    event_value,
    page_url,
    referrer,
    user_agent,
    custom_properties
  } = eventData;

  // Parse user agent for device info
  const deviceInfo = parseUserAgent(user_agent);

  const { error } = await supabase
    .from('realtime_analytics_events')
    .insert({
      user_id,
      session_id,
      event_type,
      event_category,
      event_label,
      event_value,
      page_url,
      referrer,
      user_agent,
      device_type: deviceInfo.device_type,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      custom_properties: custom_properties || {}
    });

  if (error) {
    throw new Error(`Failed to track event: ${error.message}`);
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function processPerformanceMetrics(metricsData: any): Promise<Response> {
  const metrics = Array.isArray(metricsData) ? metricsData : [metricsData];

  const { error } = await supabase
    .from('performance_metrics')
    .insert(metrics);

  if (error) {
    throw new Error(`Failed to process performance metrics: ${error.message}`);
  }

  return new Response(JSON.stringify({ success: true, processed: metrics.length }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function generateReport(reportConfig: any): Promise<Response> {
  const { report_id, user_id } = reportConfig;

  // Update execution status to running
  await supabase
    .from('report_executions')
    .update({ execution_status: 'running' })
    .eq('id', report_id);

  try {
    // Get report configuration
    const { data: report, error: reportError } = await supabase
      .from('analytics_reports')
      .select('*')
      .eq('id', report_id)
      .single();

    if (reportError || !report) {
      throw new Error('Report not found');
    }

    const startTime = Date.now();

    // Generate report data based on configuration
    const reportData = await generateReportData(report, user_id);

    const executionTime = Date.now() - startTime;

    // Update execution with results
    await supabase
      .from('report_executions')
      .update({
        execution_status: 'completed',
        execution_time_ms: executionTime,
        result_data: reportData,
        result_metadata: {
          row_count: reportData.rows?.length || 0,
          generated_at: new Date().toISOString()
        },
        completed_at: new Date().toISOString()
      })
      .eq('id', report_id);

    return new Response(JSON.stringify({ 
      success: true, 
      execution_time_ms: executionTime,
      data: reportData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // Update execution with error
    await supabase
      .from('report_executions')
      .update({
        execution_status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', report_id);

    throw error;
  }
}

async function generateReportData(report: any, user_id: string): Promise<any> {
  const { report_type, configuration, data_sources, filters } = report;

  switch (report_type) {
    case 'analytics_summary':
      return await generateAnalyticsSummary(user_id, filters);
    case 'user_behavior':
      return await generateUserBehaviorReport(user_id, filters);
    case 'performance':
      return await generatePerformanceReport(user_id, filters);
    default:
      return await generateCustomReport(configuration, data_sources, filters, user_id);
  }
}

async function generateAnalyticsSummary(user_id: string, filters: any): Promise<any> {
  const startDate = filters.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = filters.end_date || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase.rpc('get_analytics_summary', {
    p_user_id: user_id,
    p_start_date: startDate,
    p_end_date: endDate
  });

  if (error) {
    throw new Error(`Failed to generate analytics summary: ${error.message}`);
  }

  return {
    type: 'analytics_summary',
    period: { start: startDate, end: endDate },
    summary: data[0] || {},
    rows: data
  };
}

async function generateUserBehaviorReport(user_id: string, filters: any): Promise<any> {
  const { data, error } = await supabase
    .from('realtime_analytics_events')
    .select('*')
    .eq('user_id', user_id)
    .gte('timestamp', filters.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .lte('timestamp', filters.end_date || new Date().toISOString())
    .order('timestamp', { ascending: false })
    .limit(1000);

  if (error) {
    throw new Error(`Failed to generate user behavior report: ${error.message}`);
  }

  return {
    type: 'user_behavior',
    rows: data,
    summary: {
      total_events: data?.length || 0,
      unique_sessions: new Set(data?.map(e => e.session_id)).size,
      top_events: getTopEvents(data || [])
    }
  };
}

async function generatePerformanceReport(user_id: string, filters: any): Promise<any> {
  const { data, error } = await supabase
    .from('performance_metrics')
    .select('*')
    .eq('user_id', user_id)
    .gte('timestamp', filters.start_date || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .lte('timestamp', filters.end_date || new Date().toISOString())
    .order('timestamp', { ascending: false });

  if (error) {
    throw new Error(`Failed to generate performance report: ${error.message}`);
  }

  return {
    type: 'performance',
    rows: data,
    summary: {
      avg_page_load: calculateAverageMetric(data || [], 'page_load'),
      avg_api_response: calculateAverageMetric(data || [], 'api_response'),
      total_metrics: data?.length || 0
    }
  };
}

async function generateCustomReport(configuration: any, dataSources: any[], filters: any, user_id: string): Promise<any> {
  // Custom report generation logic based on configuration
  return {
    type: 'custom',
    configuration,
    data_sources: dataSources,
    filters,
    rows: [],
    summary: { message: 'Custom report generated' }
  };
}

function parseUserAgent(userAgent: string): any {
  if (!userAgent) {
    return { device_type: 'unknown', browser: 'unknown', os: 'unknown' };
  }

  const mobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
  const tablet = /iPad|Tablet/.test(userAgent);
  
  let device_type = 'desktop';
  if (tablet) device_type = 'tablet';
  else if (mobile) device_type = 'mobile';

  let browser = 'unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  let os = 'unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';

  return { device_type, browser, os };
}

function getTopEvents(events: any[]): any[] {
  const eventCounts = events.reduce((acc, event) => {
    const key = event.event_type;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(eventCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([event_type, count]) => ({ event_type, count }));
}

function calculateAverageMetric(metrics: any[], category: string): number {
  const filtered = metrics.filter(m => m.metric_category === category);
  if (filtered.length === 0) return 0;
  return filtered.reduce((sum, m) => sum + m.metric_value, 0) / filtered.length;
}

serve(handler);