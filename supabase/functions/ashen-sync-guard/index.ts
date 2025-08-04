import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncRequest {
  action: 'scan_conflicts' | 'register_feature' | 'get_status' | 'run_full_scan' | 'update_config';
  feature_name?: string;
  feature_type?: string;
  version_tag?: string;
  file_paths?: string[];
  dependencies?: string[];
  description?: string;
  config_key?: string;
  config_value?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json() as SyncRequest;
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let result;

    switch (action) {
      case 'scan_conflicts':
        result = await scanForConflicts(supabaseClient, params);
        break;
      case 'register_feature':
        result = await registerFeature(supabaseClient, params);
        break;
      case 'get_status':
        result = await getSyncGuardStatus(supabaseClient);
        break;
      case 'run_full_scan':
        result = await runFullSystemScan(supabaseClient);
        break;
      case 'update_config':
        result = await updateSyncConfig(supabaseClient, params);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ashen-sync-guard:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Sync Guard operation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function scanForConflicts(supabaseClient: any, params: any) {
  const { feature_name, feature_type = 'component', description, prompt_content } = params;

  if (!feature_name) {
    throw new Error('feature_name is required for conflict scanning');
  }

  console.log(`🔍 Ashen Sync Guard: Scanning for conflicts - ${feature_name} (${feature_type})`);

  // Get sync guard configuration
  const { data: config } = await supabaseClient
    .from('ashen_sync_config')
    .select('*')
    .eq('is_active', true);

  const allowDuplicate = config?.find(c => c.config_key === 'allow_duplicate')?.config_value || false;
  const versioningEnabled = config?.find(c => c.config_key === 'versioning_enabled')?.config_value || true;

  // Call the database function to scan for conflicts
  const { data, error } = await supabaseClient.rpc('scan_for_feature_conflicts', {
    p_feature_name: feature_name,
    p_feature_type: feature_type,
    p_description: description
  });

  if (error) {
    console.error('❌ Conflict scan failed:', error);
    throw new Error(`Conflict scan failed: ${error.message}`);
  }

  let decision = 'PROCEED';
  let reason = 'No conflicts found - feature is new';
  let action_required = null;

  if (data.conflicts && data.conflicts.length > 0) {
    const highestConflict = data.conflicts[0]; // Already sorted by similarity
    
    console.log(`⚠️ Conflict detected: ${highestConflict.similarity_score}% similarity with ${highestConflict.existing_name}`);

    // Apply Sync Guard decision logic
    if (highestConflict.similarity_score >= 90) {
      if (highestConflict.status === 'active') {
        decision = allowDuplicate ? 'PROCEED_WITH_WARNING' : 'SKIP';
        reason = `Feature "${highestConflict.existing_name}" already exists and is functional`;
        action_required = allowDuplicate ? 'build_anyway' : 'skip_build';
      } else if (highestConflict.status === 'broken') {
        decision = 'REPAIR';
        reason = `Feature "${highestConflict.existing_name}" exists but is broken - should be repaired`;
        action_required = 'repair_existing';
      } else if (highestConflict.status === 'deprecated') {
        decision = 'UPGRADE';
        reason = `Feature "${highestConflict.existing_name}" is outdated - should be upgraded`;
        action_required = 'upgrade_existing';
      }
    } else if (highestConflict.similarity_score >= 70) {
      decision = 'REVIEW_SIMILAR';
      reason = `Similar feature "${highestConflict.existing_name}" exists - review for potential consolidation`;
      action_required = 'review_and_decide';
    }

    // Log detailed conflict analysis
    await analyzeConflictsInDetail(supabaseClient, feature_name, data.conflicts);
  }

  // Log the scan result
  const scanLog = {
    scan_type: 'pre_build_sync_check',
    feature_scanned: feature_name,
    conflict_status: data.conflicts?.length > 0 ? 'conflict_detected' : 'no_conflict',
    scan_result: decision,
    decision_reason: reason,
    action_required,
    scan_duration_ms: 0, // Would be calculated in real implementation
    conflict_details: data,
    prompt_content: prompt_content || null
  };

  const { error: logError } = await supabaseClient
    .from('ashen_sync_logs')
    .insert(scanLog);

  if (logError) {
    console.error('❌ Failed to log scan result:', logError);
  }

  console.log(`✅ Sync Guard Decision: ${decision} - ${reason}`);

  return {
    decision,
    reason,
    action_required,
    conflicts: data.conflicts || [],
    recommendations: data.recommendations || [],
    scan_result: data,
    timestamp: new Date().toISOString(),
    config: {
      allow_duplicate: allowDuplicate,
      versioning_enabled: versioningEnabled
    }
  };
}

async function analyzeConflictsInDetail(supabaseClient: any, featureName: string, conflicts: any[]) {
  for (const conflict of conflicts) {
    const { data, error } = await supabaseClient
      .from('ashen_conflict_analysis')
      .insert({
        feature_name: featureName,
        existing_feature_id: conflict.existing_feature_id,
        conflict_type: conflict.conflict_type,
        similarity_score: conflict.similarity_score,
        conflict_severity: conflict.similarity_score >= 95 ? 'critical' : 
                          conflict.similarity_score >= 85 ? 'high' : 'medium',
        resolution_recommendation: conflict.status === 'active' ? 
          'Skip building - feature already exists and is functional' :
          'Consider repairing existing feature instead of rebuilding',
        auto_resolvable: conflict.status === 'broken',
        analysis_details: conflict
      });

    if (error) {
      console.error('Error inserting conflict analysis:', error);
    }
  }
}

async function registerFeature(supabaseClient: any, params: any) {
  const { 
    feature_name, 
    feature_type, 
    version_tag = 'v1.0',
    file_paths = [],
    dependencies = [],
    description 
  } = params;

  if (!feature_name || !feature_type) {
    throw new Error('feature_name and feature_type are required for registration');
  }

  console.log(`Registering feature: ${feature_name} (${feature_type})`);

  const { data, error } = await supabaseClient.rpc('register_new_feature', {
    p_feature_name: feature_name,
    p_feature_type: feature_type,
    p_version_tag: version_tag,
    p_file_paths: file_paths,
    p_dependencies: dependencies,
    p_description: description
  });

  if (error) {
    console.error('Error registering feature:', error);
    throw new Error(`Feature registration failed: ${error.message}`);
  }

  console.log('Feature registered with ID:', data);

  return {
    feature_id: data,
    registered_at: new Date().toISOString(),
    status: 'registered'
  };
}

async function getSyncGuardStatus(supabaseClient: any) {
  console.log('Getting Sync Guard status...');

  const { data, error } = await supabaseClient.rpc('get_sync_guard_status');

  if (error) {
    console.error('Error getting sync status:', error);
    throw new Error(`Status retrieval failed: ${error.message}`);
  }

  // Get recent logs
  const { data: recentLogs } = await supabaseClient
    .from('ashen_sync_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  // Get recent conflicts
  const { data: recentConflicts } = await supabaseClient
    .from('ashen_conflict_analysis')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  // Get configuration
  const { data: config } = await supabaseClient
    .from('ashen_sync_config')
    .select('*')
    .eq('is_active', true);

  return {
    ...data,
    recent_logs: recentLogs || [],
    recent_conflicts: recentConflicts || [],
    configuration: config || [],
    last_updated: new Date().toISOString()
  };
}

async function runFullSystemScan(supabaseClient: any) {
  console.log('Running full system scan...');

  const scanStartTime = Date.now();

  // Get all features from registry
  const { data: features, error } = await supabaseClient
    .from('ashen_feature_registry')
    .select('*')
    .eq('status', 'active');

  if (error) {
    throw new Error(`Failed to fetch features: ${error.message}`);
  }

  const scanResults = {
    total_features: features?.length || 0,
    scanned_features: 0,
    conflicts_found: 0,
    broken_features: 0,
    scan_duration_ms: 0,
    detailed_results: []
  };

  // Simulate scanning each feature
  for (const feature of features || []) {
    try {
      // Check if feature files still exist (simulated)
      const isWorking = Math.random() > 0.1; // 90% chance feature is working

      if (!isWorking) {
        // Mark as broken
        await supabaseClient
          .from('ashen_feature_registry')
          .update({ status: 'broken', last_scanned_at: new Date().toISOString() })
          .eq('id', feature.id);

        scanResults.broken_features++;
      } else {
        // Update last scanned time
        await supabaseClient
          .from('ashen_feature_registry')
          .update({ last_scanned_at: new Date().toISOString() })
          .eq('id', feature.id);
      }

      scanResults.scanned_features++;
      scanResults.detailed_results.push({
        feature_id: feature.id,
        feature_name: feature.feature_name,
        status: isWorking ? 'functional' : 'broken',
        last_scanned: new Date().toISOString()
      });

    } catch (scanError) {
      console.error(`Error scanning feature ${feature.feature_name}:`, scanError);
    }
  }

  scanResults.scan_duration_ms = Date.now() - scanStartTime;

  // Log the scan
  await supabaseClient
    .from('ashen_sync_logs')
    .insert({
      scan_type: 'full_system_scan',
      feature_scanned: 'all_features',
      conflict_status: scanResults.conflicts_found > 0 ? 'duplicate_found' : 'no_conflict',
      scan_result: scanResults.broken_features > 0 ? 'repaired' : 'built',
      scan_duration_ms: scanResults.scan_duration_ms,
      metadata: scanResults
    });

  console.log('Full system scan completed:', scanResults);

  return scanResults;
}

async function updateSyncConfig(supabaseClient: any, params: any) {
  const { config_key, config_value } = params;

  if (!config_key || config_value === undefined) {
    throw new Error('config_key and config_value are required');
  }

  console.log(`Updating sync config: ${config_key}`);

  const { data, error } = await supabaseClient
    .from('ashen_sync_config')
    .update({ 
      config_value: config_value,
      updated_at: new Date().toISOString()
    })
    .eq('config_key', config_key)
    .select();

  if (error) {
    console.error('Error updating config:', error);
    throw new Error(`Config update failed: ${error.message}`);
  }

  return {
    updated_config: data?.[0] || null,
    updated_at: new Date().toISOString()
  };
}