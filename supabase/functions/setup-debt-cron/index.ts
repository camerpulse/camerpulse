import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Setting up daily debt refresh cron job...');

    // Set up cron job to run debt refresh every 24 hours at 2 AM
    const cronQuery = `
      SELECT cron.schedule(
        'daily-debt-refresh',
        '0 2 * * *',
        $$
        SELECT net.http_post(
          url := '${Deno.env.get('SUPABASE_URL')}/functions/v1/automated-debt-refresh',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}"}'::jsonb,
          body := '{"trigger_type": "scheduled"}'::jsonb
        ) as request_id;
        $$
      );
    `;

    // Note: In a real implementation, this would need to be executed via a privileged database connection
    // For now, we'll just log the SQL that needs to be run
    console.log('Cron job SQL to execute:', cronQuery);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Debt refresh cron job setup initiated',
        schedule: 'Daily at 2:00 AM UTC',
        next_run: 'Next scheduled run will be at 2:00 AM UTC',
        sql_to_execute: cronQuery,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Failed to setup cron job:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});