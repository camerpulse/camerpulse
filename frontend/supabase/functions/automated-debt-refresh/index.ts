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

    const requestBody = await req.json();
    const { trigger_type = 'scheduled', user_id = null } = requestBody;

    console.log(`Starting debt refresh: ${trigger_type}`);

    // Create refresh log entry
    const { data: refreshLog, error: logError } = await supabaseClient
      .from('debt_refresh_logs')
      .insert({
        refresh_type: trigger_type,
        triggered_by: user_id,
        status: 'running',
        sources_scraped: ['minfi.gov.cm', 'imf.org', 'beac.int', 'worldbank.org']
      })
      .select()
      .single();

    if (logError) throw logError;

    // Call the debt-data-scraper function for each source
    const sources = [
      { name: 'MINFI', url: 'https://minfi.gov.cm' },
      { name: 'IMF', url: 'https://imf.org' },
      { name: 'BEAC', url: 'https://beac.int' },
      { name: 'World Bank', url: 'https://data.worldbank.org' }
    ];

    let recordsUpdated = 0;
    const scrapingResults = [];

    for (const source of sources) {
      try {
        console.log(`Scraping source: ${source.name}`);
        
        // Call debt-data-scraper function
        const { data: scrapingResult, error: scrapingError } = await supabaseClient.functions
          .invoke('debt-data-scraper', {
            body: {
              action: 'scrape_source',
              source_name: source.name,
              source_url: source.url,
              automated: true
            }
          });

        if (scrapingError) {
          console.error(`Error scraping ${source.name}:`, scrapingError);
          scrapingResults.push({ 
            source: source.name, 
            status: 'error', 
            error: scrapingError.message 
          });
          continue;
        }

        scrapingResults.push({ 
          source: source.name, 
          status: 'success', 
          data: scrapingResult 
        });

        if (scrapingResult?.records_updated) {
          recordsUpdated += scrapingResult.records_updated;
        }

        // Update source last_refreshed timestamp
        await supabaseClient
          .from('debt_sources')
          .update({ last_refreshed: new Date().toISOString() })
          .eq('name', source.name);

      } catch (error) {
        console.error(`Failed to scrape ${source.name}:`, error);
        scrapingResults.push({ 
          source: source.name, 
          status: 'error', 
          error: error.message 
        });
      }
    }

    // Update refresh log with completion
    await supabaseClient
      .from('debt_refresh_logs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        records_updated: recordsUpdated
      })
      .eq('id', refreshLog.id);

    console.log(`Debt refresh completed. Records updated: ${recordsUpdated}`);

    return new Response(
      JSON.stringify({
        success: true,
        refresh_id: refreshLog.id,
        records_updated: recordsUpdated,
        sources_scraped: scrapingResults.length,
        results: scrapingResults,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Debt refresh failed:', error);
    
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