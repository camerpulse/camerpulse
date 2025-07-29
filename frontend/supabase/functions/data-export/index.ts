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
    const { job_id, format } = await req.json();

    if (!job_id) {
      return new Response(JSON.stringify({ error: 'Job ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get export job details
    const { data: job, error: jobError } = await supabase
      .from('data_export_jobs')
      .select('*')
      .eq('id', job_id)
      .single();

    if (jobError || !job) {
      return new Response(JSON.stringify({ error: 'Export job not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update job status to processing
    await supabase
      .from('data_export_jobs')
      .update({ 
        status: 'processing', 
        progress_percentage: 0 
      })
      .eq('id', job_id);

    try {
      const result = await processExportJob(job);
      
      // Update job with completion
      await supabase
        .from('data_export_jobs')
        .update({
          status: 'completed',
          progress_percentage: 100,
          file_path: result.file_path,
          file_size_bytes: result.file_size,
          total_records: result.total_records,
          processed_records: result.total_records,
          completed_at: new Date().toISOString()
        })
        .eq('id', job_id);

      return new Response(JSON.stringify({ 
        success: true, 
        file_path: result.file_path,
        total_records: result.total_records
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      // Update job with error
      await supabase
        .from('data_export_jobs')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString()
        })
        .eq('id', job_id);

      throw error;
    }

  } catch (error) {
    console.error('Data export error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

async function processExportJob(job: any): Promise<any> {
  const { export_type, data_query, filters, format, user_id } = job;

  let data: any[] = [];
  let tableName = '';

  switch (export_type) {
    case 'analytics':
      tableName = 'realtime_analytics_events';
      data = await exportAnalyticsData(user_id, filters);
      break;
    case 'performance':
      tableName = 'performance_metrics';
      data = await exportPerformanceData(user_id, filters);
      break;
    case 'reports':
      tableName = 'analytics_reports';
      data = await exportReportsData(user_id, filters);
      break;
    case 'custom':
      data = await exportCustomData(data_query, user_id);
      tableName = 'custom_export';
      break;
    default:
      throw new Error(`Unsupported export type: ${export_type}`);
  }

  // Generate file content based on format
  const fileContent = await generateFileContent(data, format);
  const fileName = `${export_type}_export_${Date.now()}.${format}`;
  const filePath = `exports/${user_id}/${fileName}`;

  // In a real implementation, you would save this to storage
  // For now, we'll simulate the file creation
  console.log(`Generated export file: ${filePath}`);
  console.log(`File size: ${fileContent.length} bytes`);

  return {
    file_path: filePath,
    file_size: fileContent.length,
    total_records: data.length
  };
}

async function exportAnalyticsData(user_id: string, filters: any): Promise<any[]> {
  const startDate = filters.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const endDate = filters.end_date || new Date().toISOString();

  const { data, error } = await supabase
    .from('realtime_analytics_events')
    .select('*')
    .eq('user_id', user_id)
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: false });

  if (error) {
    throw new Error(`Failed to export analytics data: ${error.message}`);
  }

  return data || [];
}

async function exportPerformanceData(user_id: string, filters: any): Promise<any[]> {
  const startDate = filters.start_date || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const endDate = filters.end_date || new Date().toISOString();

  const { data, error } = await supabase
    .from('performance_metrics')
    .select('*')
    .eq('user_id', user_id)
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: false });

  if (error) {
    throw new Error(`Failed to export performance data: ${error.message}`);
  }

  return data || [];
}

async function exportReportsData(user_id: string, filters: any): Promise<any[]> {
  const { data, error } = await supabase
    .from('analytics_reports')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to export reports data: ${error.message}`);
  }

  return data || [];
}

async function exportCustomData(query: any, user_id: string): Promise<any[]> {
  // Custom query execution would go here
  // For now, return empty array
  return [];
}

async function generateFileContent(data: any[], format: string): Promise<string> {
  switch (format) {
    case 'csv':
      return generateCSV(data);
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'xlsx':
      // In a real implementation, you would use a library like xlsx
      return generateCSV(data); // Fallback to CSV for now
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function generateCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    }).join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
}

serve(handler);