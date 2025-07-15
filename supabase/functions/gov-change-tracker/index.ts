import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChangeDetection {
  change_type: 'new_official' | 'removed_official' | 'role_switch' | 'party_change' | 'deceased_status' | 'data_update';
  official_name: string;
  official_id?: string;
  previous_data?: any;
  new_data?: any;
  change_description: string;
  source_type: 'MINAT' | 'PRC' | 'Senate' | 'AssNat' | 'Auto';
  source_url?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Government Change Tracker...');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, source_type, manual_check } = await req.json();
    
    if (action === 'monitor_changes') {
      return await monitorGovernmentChanges(supabase, source_type);
    } else if (action === 'get_change_log') {
      return await getChangeLog(supabase);
    } else if (action === 'process_change') {
      const { change_id, admin_notes } = await req.json();
      return await processChange(supabase, change_id, admin_notes);
    } else if (action === 'get_monitoring_status') {
      return await getMonitoringStatus(supabase);
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action specified' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error) {
    console.error('Gov Change Tracker error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function monitorGovernmentChanges(supabase: any, sourceType?: string) {
  console.log('Monitoring government changes...');
  
  // Get active monitoring sources
  const { data: sources, error: sourcesError } = await supabase
    .from('gov_change_monitoring_config')
    .select('*')
    .eq('is_active', true)
    .gte('last_check_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (sourcesError) {
    throw new Error(`Failed to fetch monitoring sources: ${sourcesError.message}`);
  }

  let totalChanges = 0;
  const detectedChanges: ChangeDetection[] = [];

  for (const source of sources) {
    try {
      console.log(`Checking source: ${source.source_name}`);
      
      // Update last check time
      await supabase
        .from('gov_change_monitoring_config')
        .update({ 
          last_check_at: new Date().toISOString(),
          total_checks: source.total_checks + 1
        })
        .eq('id', source.id);

      let sourceChanges: ChangeDetection[] = [];

      // Route to appropriate monitoring function
      switch (source.source_type) {
        case 'MINAT':
          sourceChanges = await checkMINATChanges(supabase, source);
          break;
        case 'PRC':
          sourceChanges = await checkPRCChanges(supabase, source);
          break;
        case 'Senate':
          sourceChanges = await checkSenateChanges(supabase, source);
          break;
        case 'AssNat':
          sourceChanges = await checkAssemblyChanges(supabase, source);
          break;
      }

      // Log detected changes
      for (const change of sourceChanges) {
        await logChange(supabase, change);
        detectedChanges.push(change);
        totalChanges++;
      }

      if (sourceChanges.length > 0) {
        await supabase
          .from('gov_change_monitoring_config')
          .update({ 
            last_successful_check_at: new Date().toISOString(),
            successful_checks: source.successful_checks + 1
          })
          .eq('id', source.id);
      }

    } catch (sourceError) {
      console.error(`Error checking ${source.source_name}:`, sourceError);
    }
  }

  console.log(`Monitoring complete. Total changes detected: ${totalChanges}`);

  return new Response(
    JSON.stringify({
      success: true,
      changes_detected: totalChanges,
      sources_checked: sources.length,
      changes: detectedChanges.map(c => ({
        type: c.change_type,
        official: c.official_name,
        source: c.source_type,
        description: c.change_description
      }))
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function checkMINATChanges(supabase: any, source: any): Promise<ChangeDetection[]> {
  console.log('Checking MINAT for party and appointment changes...');
  const changes: ChangeDetection[] = [];
  
  try {
    // Get current political parties from database
    const { data: currentParties } = await supabase
      .from('political_parties')
      .select('*');

    // Call existing party scraper to get latest data
    const { data: scrapedData } = await supabase.functions.invoke('minat-party-scraper', {
      body: { action: 'scrape_parties', verify_only: true }
    });

    if (scrapedData?.success && scrapedData?.parties) {
      // Compare with current data to detect changes
      for (const scrapedParty of scrapedData.parties) {
        const existingParty = currentParties?.find(p => 
          p.name.toLowerCase() === scrapedParty.name.toLowerCase()
        );

        if (!existingParty) {
          changes.push({
            change_type: 'new_official',
            official_name: scrapedParty.name,
            new_data: scrapedParty,
            change_description: `New political party registered: ${scrapedParty.name}`,
            source_type: 'MINAT',
            source_url: source.base_url
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking MINAT changes:', error);
  }

  return changes;
}

async function checkPRCChanges(supabase: any, source: any): Promise<ChangeDetection[]> {
  console.log('Checking PRC for ministerial changes...');
  const changes: ChangeDetection[] = [];

  try {
    // Get current ministers from database
    const { data: currentMinisters } = await supabase
      .from('politicians')
      .select('*')
      .ilike('role_title', '%minister%');

    // Call existing minister scraper
    const { data: scrapedData } = await supabase.functions.invoke('government-minister-scraper', {
      body: { sources: [source.base_url] }
    });

    if (scrapedData?.success && scrapedData?.ministers) {
      for (const scrapedMinister of scrapedData.ministers) {
        const existingMinister = currentMinisters?.find(m => 
          m.name.toLowerCase() === scrapedMinister.name.toLowerCase()
        );

        if (!existingMinister) {
          changes.push({
            change_type: 'new_official',
            official_name: scrapedMinister.name,
            new_data: scrapedMinister,
            change_description: `New minister appointed: ${scrapedMinister.name} - ${scrapedMinister.role_title}`,
            source_type: 'PRC',
            source_url: source.base_url
          });
        } else if (existingMinister.role_title !== scrapedMinister.role_title) {
          changes.push({
            change_type: 'role_switch',
            official_name: scrapedMinister.name,
            official_id: existingMinister.id,
            previous_data: { role_title: existingMinister.role_title },
            new_data: { role_title: scrapedMinister.role_title },
            change_description: `Minister role changed: ${existingMinister.role_title} → ${scrapedMinister.role_title}`,
            source_type: 'PRC',
            source_url: source.base_url
          });
        }
      }

      // Check for removed ministers
      for (const currentMinister of currentMinisters || []) {
        const stillExists = scrapedData.ministers.find((m: any) => 
          m.name.toLowerCase() === currentMinister.name.toLowerCase()
        );
        
        if (!stillExists) {
          changes.push({
            change_type: 'removed_official',
            official_name: currentMinister.name,
            official_id: currentMinister.id,
            previous_data: currentMinister,
            change_description: `Minister no longer in cabinet: ${currentMinister.name}`,
            source_type: 'PRC',
            source_url: source.base_url
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking PRC changes:', error);
  }

  return changes;
}

async function checkSenateChanges(supabase: any, source: any): Promise<ChangeDetection[]> {
  console.log('Checking Senate for senator changes...');
  const changes: ChangeDetection[] = [];

  try {
    // Get current senators
    const { data: currentSenators } = await supabase
      .from('politicians')
      .select('*')
      .ilike('role_title', '%senator%');

    // Call existing senate scraper
    const { data: scrapedData } = await supabase.functions.invoke('senate-scraper', {
      body: { 
        source_url: source.base_url,
        verify_images: false,
        link_parties: true 
      }
    });

    if (scrapedData?.success && scrapedData?.senators) {
      for (const scrapedSenator of scrapedData.senators) {
        const existingSenator = currentSenators?.find(s => 
          s.name.toLowerCase() === scrapedSenator.name.toLowerCase()
        );

        if (!existingSenator) {
          changes.push({
            change_type: 'new_official',
            official_name: scrapedSenator.name,
            new_data: scrapedSenator,
            change_description: `New senator: ${scrapedSenator.name} from ${scrapedSenator.region}`,
            source_type: 'Senate',
            source_url: source.base_url
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking Senate changes:', error);
  }

  return changes;
}

async function checkAssemblyChanges(supabase: any, source: any): Promise<ChangeDetection[]> {
  console.log('Checking National Assembly for MP changes...');
  const changes: ChangeDetection[] = [];

  try {
    // Get current MPs
    const { data: currentMPs } = await supabase
      .from('politicians')
      .select('*')
      .eq('position', 'MP');

    // Call existing assembly scraper
    const { data: scrapedData } = await supabase.functions.invoke('assembly-scraper', {
      body: { 
        action: 'verify_mps',
        source_url: source.base_url,
        legislative_session: '2020-2025'
      }
    });

    if (scrapedData?.success) {
      // This would need more sophisticated change detection
      // For now, log as data update
      changes.push({
        change_type: 'data_update',
        official_name: 'National Assembly',
        change_description: 'MP data verification completed',
        source_type: 'AssNat',
        source_url: source.base_url
      });
    }
  } catch (error) {
    console.error('Error checking Assembly changes:', error);
  }

  return changes;
}

async function logChange(supabase: any, change: ChangeDetection) {
  try {
    const { error } = await supabase
      .from('official_change_log')
      .insert({
        official_id: change.official_id || null,
        change_type: change.change_type,
        official_name: change.official_name,
        previous_data: change.previous_data || null,
        new_data: change.new_data || null,
        change_description: change.change_description,
        source_type: change.source_type,
        source_url: change.source_url || null,
        processed: false,
        admin_reviewed: false
      });

    if (error) {
      console.error('Error logging change:', error);
    } else {
      console.log(`Logged change: ${change.change_description}`);
    }
  } catch (error) {
    console.error('Error in logChange:', error);
  }
}

async function getChangeLog(supabase: any) {
  try {
    const { data: changes, error } = await supabase
      .from('official_change_log')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Failed to fetch change log: ${error.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        changes: changes || []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    throw error;
  }
}

async function processChange(supabase: any, changeId: string, adminNotes?: string) {
  try {
    const { error } = await supabase
      .from('official_change_log')
      .update({
        processed: true,
        admin_reviewed: true,
        admin_notes: adminNotes || null
      })
      .eq('id', changeId);

    if (error) {
      throw new Error(`Failed to process change: ${error.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Change processed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    throw error;
  }
}

async function getMonitoringStatus(supabase: any) {
  try {
    const { data: sources, error } = await supabase
      .from('gov_change_monitoring_config')
      .select('*')
      .order('source_name');

    if (error) {
      throw new Error(`Failed to fetch monitoring status: ${error.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sources: sources || [],
        total_active: sources?.filter(s => s.is_active).length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    throw error;
  }
}