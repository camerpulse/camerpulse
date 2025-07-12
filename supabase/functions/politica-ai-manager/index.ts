import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

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

    const { action } = await req.json();

    if (action === 'trigger_scan') {
      return await triggerScheduledScan(supabaseClient);
    }

    if (action === 'get_stats') {
      return await getAIStats(supabaseClient);
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in Politica AI manager:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function triggerScheduledScan(supabaseClient: any) {
  console.log('Starting scheduled Politica AI scan...');

  // Get all politicians and parties for scanning
  const [politiciansResult, partiesResult] = await Promise.all([
    supabaseClient.from('politicians').select('id').eq('is_active', true),
    supabaseClient.from('political_parties').select('id').eq('is_active', true)
  ]);

  const politicians = politiciansResult.data || [];
  const parties = partiesResult.data || [];

  console.log(`Found ${politicians.length} politicians and ${parties.length} parties to scan`);

  // Batch scan requests (limit to avoid overwhelming the system)
  const batchSize = 5;
  let totalScans = 0;

  // Scan politicians in batches
  for (let i = 0; i < politicians.length; i += batchSize) {
    const batch = politicians.slice(i, i + batchSize);
    const scanPromises = batch.map(politician => 
      triggerScan(politician.id, 'politician')
    );
    
    await Promise.allSettled(scanPromises);
    totalScans += batch.length;
    
    // Add delay between batches
    if (i + batchSize < politicians.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Scan parties in batches
  for (let i = 0; i < parties.length; i += batchSize) {
    const batch = parties.slice(i, i + batchSize);
    const scanPromises = batch.map(party => 
      triggerScan(party.id, 'political_party')
    );
    
    await Promise.allSettled(scanPromises);
    totalScans += batch.length;
    
    // Add delay between batches
    if (i + batchSize < parties.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`Completed scheduled scan for ${totalScans} targets`);

  return new Response(
    JSON.stringify({
      success: true,
      message: `Scheduled scan completed for ${totalScans} targets`,
      politicians_scanned: politicians.length,
      parties_scanned: parties.length
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function triggerScan(targetId: string, targetType: 'politician' | 'political_party') {
  try {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/politica-ai-scanner`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target_id: targetId,
        target_type: targetType,
        manual_scan: false
      })
    });

    if (!response.ok) {
      throw new Error(`Scan failed for ${targetType} ${targetId}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`Scan completed for ${targetType} ${targetId}`);
    return result;
  } catch (error) {
    console.error(`Error scanning ${targetType} ${targetId}:`, error);
    return { error: error.message };
  }
}

async function getAIStats(supabaseClient: any) {
  const [logsResult, politiciansResult, partiesResult] = await Promise.all([
    supabaseClient.from('politica_ai_logs').select('id, status, created_at, action_type'),
    supabaseClient.from('politician_ai_verification').select('verification_status, last_verified_at'),
    supabaseClient.from('party_ai_verification').select('verification_status, last_verified_at')
  ]);

  const logs = logsResult.data || [];
  const politicians = politiciansResult.data || [];
  const parties = partiesResult.data || [];

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const stats = {
    total_scans: logs.length,
    verified_politicians: politicians.filter(p => p.verification_status === 'verified').length,
    verified_parties: parties.filter(p => p.verification_status === 'verified').length,
    pending_reviews: logs.filter(l => l.status === 'requires_review').length,
    recent_activity: logs.filter(l => new Date(l.created_at) > twentyFourHoursAgo).length,
    last_scheduled_scan: logs
      .filter(l => l.action_type === 'verification')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.created_at
  };

  return new Response(
    JSON.stringify({ success: true, stats }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}