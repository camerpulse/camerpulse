import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function runScheduledImport(): Promise<{ success: boolean; results: any[] }> {
  console.log('Starting scheduled data import...');
  const results = [];
  
  try {
    // Import MPs
    console.log('Importing MPs...');
    const mpResult = await supabase.functions.invoke('mp-data-importer');
    results.push({
      type: 'MPs',
      success: mpResult.error === null,
      data: mpResult.data,
      error: mpResult.error?.message
    });
    
    // Import Ministers
    console.log('Importing Ministers...');
    const ministerResult = await supabase.functions.invoke('minister-data-importer');
    results.push({
      type: 'Ministers',
      success: ministerResult.error === null,
      data: ministerResult.data,
      error: ministerResult.error?.message
    });
    
    // Log the import activity
    const { error: logError } = await supabase
      .from('import_logs')
      .insert({
        import_type: 'scheduled_import',
        status: results.every(r => r.success) ? 'success' : 'partial_success',
        results: results,
        imported_at: new Date().toISOString()
      });
    
    if (logError) {
      console.error('Error logging import activity:', logError);
    }
    
    console.log('Scheduled import completed');
    return { success: true, results };
    
  } catch (error) {
    console.error('Error in scheduled import:', error);
    return { 
      success: false, 
      results: [{
        type: 'scheduler',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }]
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log('Data Import Scheduler function called');
    
    const result = await runScheduledImport();
    
    return new Response(JSON.stringify({
      success: result.success,
      message: 'Scheduled import completed',
      results: result.results,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: result.success ? 200 : 500
    });
    
  } catch (error) {
    console.error('Error in data import scheduler:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});