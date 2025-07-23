import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting tender AI analysis...');

    // Get recent tenders (last 24 hours) that don't have suggestions yet
    const { data: recentTenders, error: tendersError } = await supabaseClient
      .from('tenders')
      .select('id, title, budget_min, budget_max, category, region, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (tendersError) {
      throw tendersError;
    }

    console.log(`Found ${recentTenders?.length || 0} recent tenders to analyze`);

    let suggestionsGenerated = 0;

    for (const tender of recentTenders || []) {
      // Check if suggestions already exist for this tender
      const { data: existingSuggestions } = await supabaseClient
        .from('tender_ai_suggestions')
        .select('id')
        .eq('tender_id', tender.id)
        .limit(1);

      if (existingSuggestions && existingSuggestions.length > 0) {
        console.log(`Skipping tender ${tender.id} - suggestions already exist`);
        continue;
      }

      // Generate suggestions for this tender
      const { data: suggestions, error: suggestionsError } = await supabaseClient
        .rpc('generate_tender_ai_suggestions', {
          p_tender_id: tender.id
        });

      if (suggestionsError) {
        console.error(`Error generating suggestions for tender ${tender.id}:`, suggestionsError);
        continue;
      }

      suggestionsGenerated += suggestions?.[0]?.suggestion_count || 0;
      console.log(`Generated suggestions for tender: ${tender.title}`);

      // Add a small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Update analytics cache
    await supabaseClient.rpc('update_tender_analytics_cache');

    const result = {
      status: 'success',
      message: `AI analysis completed. Generated ${suggestionsGenerated} suggestions for ${recentTenders?.length || 0} tenders.`,
      tenders_analyzed: recentTenders?.length || 0,
      suggestions_generated: suggestionsGenerated,
      timestamp: new Date().toISOString()
    };

    console.log('AI analysis result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in tender AI analysis:', error);
    
    return new Response(JSON.stringify({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});