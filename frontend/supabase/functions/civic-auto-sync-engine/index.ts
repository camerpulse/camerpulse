import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SyncConfig {
  source: 'MINAT' | 'SENAT' | 'ASSNAT' | 'PRC';
  entity_type: 'political_parties' | 'senators' | 'mps' | 'ministers';
  last_synced: string;
  is_active: boolean;
  sync_frequency_hours: number;
  fallback_enabled: boolean;
  auto_fallback: boolean;
  sync_status: 'healthy' | 'degraded' | 'failing' | 'disabled';
  consecutive_failures: number;
  entities_found: number;
  entities_updated: number;
  entities_with_fallback: number;
}

interface SyncSession {
  id: string;
  started_at: string;
  completed_at?: string;
  sources_synced: string[];
  entities_found: number;
  entities_updated: number;
  fallbacks_applied: number;
  errors_encountered: any[];
}

// Default sync configurations
const DEFAULT_SYNC_CONFIGS: Partial<SyncConfig>[] = [
  {
    source: 'MINAT',
    entity_type: 'political_parties',
    sync_frequency_hours: 168, // Weekly
    fallback_enabled: true,
    auto_fallback: true
  },
  {
    source: 'SENAT',
    entity_type: 'senators',
    sync_frequency_hours: 168, // Weekly
    fallback_enabled: true,
    auto_fallback: true
  },
  {
    source: 'ASSNAT',
    entity_type: 'mps',
    sync_frequency_hours: 168, // Weekly
    fallback_enabled: true,
    auto_fallback: true
  },
  {
    source: 'PRC',
    entity_type: 'ministers',
    sync_frequency_hours: 168, // Weekly
    fallback_enabled: true,
    auto_fallback: true
  }
];

// Initialize sync configurations
async function initializeSyncConfigs(): Promise<SyncConfig[]> {
  console.log('Initializing civic sync configurations...');
  
  const configs: SyncConfig[] = [];
  
  for (const defaultConfig of DEFAULT_SYNC_CONFIGS) {
    const config: SyncConfig = {
      source: defaultConfig.source!,
      entity_type: defaultConfig.entity_type!,
      last_synced: new Date().toISOString(),
      is_active: true,
      sync_frequency_hours: defaultConfig.sync_frequency_hours!,
      fallback_enabled: defaultConfig.fallback_enabled!,
      auto_fallback: defaultConfig.auto_fallback!,
      sync_status: 'healthy',
      consecutive_failures: 0,
      entities_found: 0,
      entities_updated: 0,
      entities_with_fallback: 0
    };
    
    configs.push(config);
  }
  
  // Store configurations in database
  await storeSyncConfigs(configs);
  
  return configs;
}

// Store sync configurations
async function storeSyncConfigs(configs: SyncConfig[]) {
  try {
    for (const config of configs) {
      await supabase
        .from('country_civic_config')
        .upsert({
          country_code: 'CM',
          config_key: `civic_sync_${config.source.toLowerCase()}`,
          config_type: 'sync_config',
          config_value: config,
          is_active: true
        }, {
          onConflict: 'country_code,config_key'
        });
    }
    
    console.log('Stored sync configurations for', configs.length, 'sources');
  } catch (error) {
    console.error('Error storing sync configs:', error);
    throw error;
  }
}

// Load sync configurations
async function loadSyncConfigs(): Promise<SyncConfig[]> {
  try {
    const { data, error } = await supabase
      .from('country_civic_config')
      .select('config_value')
      .eq('country_code', 'CM')
      .eq('config_type', 'sync_config')
      .like('config_key', 'civic_sync_%');

    if (error) throw error;

    if (!data || data.length === 0) {
      console.log('No sync configs found, initializing defaults...');
      return await initializeSyncConfigs();
    }

    return data.map(item => item.config_value as SyncConfig);
  } catch (error) {
    console.error('Error loading sync configs:', error);
    return await initializeSyncConfigs();
  }
}

// Apply fallback data for missing fields
async function applyFallbackData(entityType: string, entityId: string, missingFields: string[]): Promise<boolean> {
  try {
    const fallbackData: Record<string, any> = {};
    
    for (const field of missingFields) {
      switch (field) {
        case 'photo_url':
        case 'image_url':
          fallbackData[field] = '/placeholder-silhouette.png';
          fallbackData['image_verified'] = false;
          break;
        case 'bio':
        case 'biography':
          fallbackData[field] = 'Biography not available. Verified source pending.';
          break;
        case 'party_id':
        case 'political_party':
          fallbackData['affiliation_status'] = 'unknown';
          break;
        case 'region':
        case 'constituency':
          fallbackData['region_status'] = 'unknown';
          break;
        case 'date_of_birth':
        case 'dob':
          fallbackData['dob_status'] = 'missing';
          break;
        default:
          fallbackData[field] = null;
      }
    }
    
    // Add status flags
    fallbackData['is_verified'] = false;
    fallbackData['has_fallback_data'] = true;
    fallbackData['last_synced'] = new Date().toISOString();
    fallbackData['flagged_for_review'] = true;
    
    // Update the entity based on type
    let tableName = '';
    switch (entityType) {
      case 'political_parties':
        tableName = 'political_parties';
        break;
      case 'senators':
      case 'mps':
      case 'ministers':
        tableName = 'politicians';
        fallbackData['data_source'] = entityType.toUpperCase();
        break;
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }
    
    const { error } = await supabase
      .from(tableName)
      .update(fallbackData)
      .eq('id', entityId);
    
    if (error) throw error;
    
    console.log(`Applied fallback data for ${entityType} ${entityId}:`, missingFields);
    return true;
  } catch (error) {
    console.error('Error applying fallback data:', error);
    return false;
  }
}

// Sync data from a specific source
async function syncFromSource(config: SyncConfig): Promise<{
  success: boolean;
  entities_found: number;
  entities_updated: number;
  fallbacks_applied: number;
  error?: string;
}> {
  try {
    console.log(`Syncing from ${config.source}...`);
    
    // Simulate API calls to government sources
    // In reality, these would be actual API calls or web scraping
    let entities_found = 0;
    let entities_updated = 0;
    let fallbacks_applied = 0;
    
    switch (config.source) {
      case 'MINAT':
        // Sync political parties
        const { data: parties, error: partiesError } = await supabase
          .from('political_parties')
          .select('*');
        
        if (partiesError) throw partiesError;
        
        entities_found = parties?.length || 0;
        
        // Check for missing data and apply fallbacks
        for (const party of parties || []) {
          const missingFields = [];
          
          if (!party.logo_url || party.logo_url.includes('placeholder')) {
            missingFields.push('logo_url');
          }
          if (!party.description || party.description.length < 10) {
            missingFields.push('description');
          }
          if (!party.founded_date) {
            missingFields.push('founded_date');
          }
          
          if (missingFields.length > 0 && config.auto_fallback) {
            const applied = await applyFallbackData('political_parties', party.id, missingFields);
            if (applied) {
              fallbacks_applied++;
              entities_updated++;
            }
          }
        }
        break;
        
      case 'SENAT':
        // Sync senators
        const { data: senators, error: senatorsError } = await supabase
          .from('politicians')
          .select('*')
          .eq('office_level', 'senate');
        
        if (senatorsError) throw senatorsError;
        
        entities_found = senators?.length || 0;
        
        for (const senator of senators || []) {
          const missingFields = [];
          
          if (!senator.photo_url || senator.photo_url.includes('placeholder')) {
            missingFields.push('photo_url');
          }
          if (!senator.bio || senator.bio.length < 20) {
            missingFields.push('bio');
          }
          if (!senator.region) {
            missingFields.push('region');
          }
          
          if (missingFields.length > 0 && config.auto_fallback) {
            const applied = await applyFallbackData('senators', senator.id, missingFields);
            if (applied) {
              fallbacks_applied++;
              entities_updated++;
            }
          }
        }
        break;
        
      case 'ASSNAT':
        // Sync MPs
        const { data: mps, error: mpsError } = await supabase
          .from('politicians')
          .select('*')
          .eq('office_level', 'national_assembly');
        
        if (mpsError) throw mpsError;
        
        entities_found = mps?.length || 0;
        
        for (const mp of mps || []) {
          const missingFields = [];
          
          if (!mp.photo_url || mp.photo_url.includes('placeholder')) {
            missingFields.push('photo_url');
          }
          if (!mp.bio || mp.bio.length < 20) {
            missingFields.push('bio');
          }
          if (!mp.constituency) {
            missingFields.push('constituency');
          }
          
          if (missingFields.length > 0 && config.auto_fallback) {
            const applied = await applyFallbackData('mps', mp.id, missingFields);
            if (applied) {
              fallbacks_applied++;
              entities_updated++;
            }
          }
        }
        break;
        
      case 'PRC':
        // Sync ministers
        const { data: ministers, error: ministersError } = await supabase
          .from('politicians')
          .select('*')
          .eq('office_level', 'minister');
        
        if (ministersError) throw ministersError;
        
        entities_found = ministers?.length || 0;
        
        for (const minister of ministers || []) {
          const missingFields = [];
          
          if (!minister.photo_url || minister.photo_url.includes('placeholder')) {
            missingFields.push('photo_url');
          }
          if (!minister.bio || minister.bio.length < 20) {
            missingFields.push('bio');
          }
          if (!minister.ministry) {
            missingFields.push('ministry');
          }
          
          if (missingFields.length > 0 && config.auto_fallback) {
            const applied = await applyFallbackData('ministers', minister.id, missingFields);
            if (applied) {
              fallbacks_applied++;
              entities_updated++;
            }
          }
        }
        break;
    }
    
    // Log sync activity
    await logSyncActivity(config.source, 'sync_completed', {
      entities_found,
      entities_updated,
      fallbacks_applied,
      source: config.source
    });
    
    return {
      success: true,
      entities_found,
      entities_updated,
      fallbacks_applied
    };
    
  } catch (error: any) {
    console.error(`Error syncing from ${config.source}:`, error.message);
    
    // Log failed sync
    await logSyncActivity(config.source, 'sync_failed', {
      error: error.message,
      source: config.source
    });
    
    return {
      success: false,
      entities_found: 0,
      entities_updated: 0,
      fallbacks_applied: 0,
      error: error.message
    };
  }
}

// Log sync activity
async function logSyncActivity(source: string, action: string, metadata: any) {
  try {
    await supabase
      .from('civic_service_events')
      .insert({
        event_title: `${source} Sync ${action}`,
        event_description: `Civic sync activity for ${source}`,
        event_type: 'civic_sync',
        event_category: 'data_management',
        region: 'National',
        data_source: 'civic-auto-sync-engine',
        metadata
      });
  } catch (error) {
    console.error('Error logging sync activity:', error);
  }
}

// Update configuration after sync attempt
async function updateConfigAfterSync(
  config: SyncConfig, 
  result: { success: boolean; entities_found: number; entities_updated: number; fallbacks_applied: number; error?: string }
): Promise<SyncConfig> {
  
  const updatedConfig = { ...config };
  
  if (result.success) {
    updatedConfig.last_synced = new Date().toISOString();
    updatedConfig.consecutive_failures = 0;
    updatedConfig.sync_status = 'healthy';
    updatedConfig.entities_found = result.entities_found;
    updatedConfig.entities_updated = result.entities_updated;
    updatedConfig.entities_with_fallback = result.fallbacks_applied;
    
  } else {
    updatedConfig.consecutive_failures += 1;
    
    // Determine sync status
    if (updatedConfig.consecutive_failures >= 3) {
      updatedConfig.sync_status = 'failing';
      updatedConfig.is_active = false; // Temporarily disable
    } else if (updatedConfig.consecutive_failures >= 2) {
      updatedConfig.sync_status = 'degraded';
    }
  }
  
  // Store updated config
  await supabase
    .from('country_civic_config')
    .update({
      config_value: updatedConfig,
      updated_at: new Date().toISOString()
    })
    .eq('country_code', 'CM')
    .eq('config_key', `civic_sync_${config.source.toLowerCase()}`);
    
  return updatedConfig;
}

// Execute full sync cycle
async function executeSyncCycle(): Promise<SyncSession> {
  const session: SyncSession = {
    id: crypto.randomUUID(),
    started_at: new Date().toISOString(),
    sources_synced: [],
    entities_found: 0,
    entities_updated: 0,
    fallbacks_applied: 0,
    errors_encountered: []
  };
  
  console.log('Starting civic sync cycle:', session.id);
  
  try {
    // Load current configurations
    const configs = await loadSyncConfigs();
    const activeConfigs = configs.filter(c => c.is_active);
    
    console.log(`Found ${activeConfigs.length} active sync configs`);
    
    // Check which sources are due for sync
    const dueConfigs = activeConfigs.filter(config => {
      const lastSync = new Date(config.last_synced).getTime();
      const intervalMs = config.sync_frequency_hours * 60 * 60 * 1000;
      const nextSyncTime = lastSync + intervalMs;
      
      return Date.now() >= nextSyncTime;
    });
    
    console.log(`${dueConfigs.length} sources due for sync`);
    
    // Execute syncs with staggered timing
    for (const config of dueConfigs) {
      session.sources_synced.push(config.source);
      
      const result = await syncFromSource(config);
      const updatedConfig = await updateConfigAfterSync(config, result);
      
      if (result.success) {
        session.entities_found += result.entities_found;
        session.entities_updated += result.entities_updated;
        session.fallbacks_applied += result.fallbacks_applied;
      } else {
        session.errors_encountered.push({
          source: config.source,
          error: result.error,
          timestamp: new Date().toISOString()
        });
      }
      
      // Stagger requests to avoid overwhelming sources
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    session.completed_at = new Date().toISOString();
    
    console.log('Sync cycle completed:', {
      sources: session.sources_synced.length,
      found: session.entities_found,
      updated: session.entities_updated,
      fallbacks: session.fallbacks_applied
    });
    
  } catch (error: any) {
    console.error('Error in sync cycle:', error);
    session.errors_encountered.push({
      type: 'cycle_error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
  
  return session;
}

// Get engine status
async function getEngineStatus() {
  try {
    const configs = await loadSyncConfigs();
    
    // Get transparency settings
    const { data: transparencyData } = await supabase
      .from('country_civic_config')
      .select('config_value')
      .eq('country_code', 'CM')
      .eq('config_key', 'transparency_settings')
      .single();
    
    const transparencySettings = transparencyData?.config_value || {
      show_fallback_to_public: false,
      require_admin_approval: true,
      auto_verify_threshold: 85
    };
    
    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('civic_service_events')
      .select('*')
      .eq('event_type', 'civic_sync')
      .order('created_at', { ascending: false })
      .limit(20);
    
    // Calculate summary statistics
    const { data: allPoliticians } = await supabase
      .from('politicians')
      .select('is_verified, has_fallback_data');
    
    const { data: allParties } = await supabase
      .from('political_parties')
      .select('verified, logo_verified');
    
    const totalOfficials = (allPoliticians?.length || 0) + (allParties?.length || 0);
    const verifiedOfficials = (allPoliticians?.filter(p => p.is_verified)?.length || 0) + 
                             (allParties?.filter(p => p.verified)?.length || 0);
    const fallbackOfficials = allPoliticians?.filter(p => p.has_fallback_data)?.length || 0;
    const missingDataOfficials = totalOfficials - verifiedOfficials - fallbackOfficials;
    
    return {
      engine_status: configs.some(c => c.is_active) ? 'active' : 'paused',
      sync_sources: configs,
      transparency_settings: transparencySettings,
      recent_activity: recentActivity || [],
      summary: {
        total_officials: totalOfficials,
        verified_officials: verifiedOfficials,
        fallback_officials: fallbackOfficials,
        missing_data_officials: Math.max(0, missingDataOfficials),
        last_full_sync: configs.reduce((latest, config) => 
          config.last_synced > latest ? config.last_synced : latest, 
          '1970-01-01T00:00:00.000Z'
        )
      }
    };
  } catch (error) {
    console.error('Error getting engine status:', error);
    throw error;
  }
}

// Update transparency settings
async function updateTransparencySettings(showFallback: boolean) {
  try {
    const transparencySettings = {
      show_fallback_to_public: showFallback,
      require_admin_approval: true,
      auto_verify_threshold: 85,
      updated_at: new Date().toISOString()
    };
    
    await supabase
      .from('country_civic_config')
      .upsert({
        country_code: 'CM',
        config_key: 'transparency_settings',
        config_type: 'transparency',
        config_value: transparencySettings,
        is_active: true
      }, {
        onConflict: 'country_code,config_key'
      });
    
    console.log('Updated transparency settings:', transparencySettings);
    return transparencySettings;
  } catch (error) {
    console.error('Error updating transparency settings:', error);
    throw error;
  }
}

// Reset source sync status
async function resetSourceSync(source: string) {
  try {
    const { data: configData } = await supabase
      .from('country_civic_config')
      .select('config_value')
      .eq('country_code', 'CM')
      .eq('config_key', `civic_sync_${source.toLowerCase()}`)
      .single();
    
    if (configData) {
      const config = configData.config_value as SyncConfig;
      config.sync_status = 'healthy';
      config.consecutive_failures = 0;
      config.is_active = true;
      
      await supabase
        .from('country_civic_config')
        .update({
          config_value: config,
          updated_at: new Date().toISOString()
        })
        .eq('country_code', 'CM')
        .eq('config_key', `civic_sync_${source.toLowerCase()}`);
    }
    
    console.log(`Reset sync status for ${source}`);
    return true;
  } catch (error) {
    console.error(`Error resetting ${source}:`, error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();

    switch (action) {
      case 'get_status':
        const status = await getEngineStatus();
        return new Response(JSON.stringify({ status }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'execute_sync_cycle':
        const session = await executeSyncCycle();
        return new Response(JSON.stringify({ session }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'update_transparency':
        const settings = await updateTransparencySettings(params.show_fallback_to_public);
        return new Response(JSON.stringify({ settings }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'reset_source':
        await resetSourceSync(params.source);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error: any) {
    console.error('Civic Auto-Sync Engine error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});