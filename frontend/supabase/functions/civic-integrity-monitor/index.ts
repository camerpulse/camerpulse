import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScanRequest {
  action: 'scan' | 'get_alerts' | 'review_alert' | 'get_stats' | 'flag_inconsistency'
  scanType?: string
  alertId?: string
  reviewAction?: string
  reviewNotes?: string
  entityType?: string
  entityId?: string
  entityName?: string
  inconsistencyDetails?: string
  evidenceData?: any
  severity?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, scanType, alertId, reviewAction, reviewNotes, entityType, entityId, entityName, inconsistencyDetails, evidenceData, severity }: ScanRequest = await req.json();

    console.log(`Civic Integrity Monitor: ${action} action requested`);

    switch (action) {
      case 'scan':
        return new Response(JSON.stringify(await runIntegrityScan(supabaseClient, scanType)), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_alerts':
        return new Response(JSON.stringify(await getIntegrityAlerts(supabaseClient)), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'review_alert':
        return new Response(JSON.stringify(await reviewAlert(supabaseClient, alertId!, reviewAction!, reviewNotes)), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_stats':
        return new Response(JSON.stringify(await getIntegrityStats(supabaseClient)), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'flag_inconsistency':
        return new Response(JSON.stringify(await flagInconsistency(supabaseClient, entityType!, entityId, entityName!, inconsistencyDetails!, evidenceData, severity)), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Civic Integrity Monitor error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function runIntegrityScan(supabaseClient: any, scanType?: string) {
  console.log(`Running integrity scan: ${scanType || 'all'}`);
  
  let scanResults = {
    scanType: scanType || 'all',
    alertsGenerated: 0,
    scannedSources: [],
    newFlags: [],
    status: 'completed'
  };

  // Get active scan sources
  const { data: sources, error: sourcesError } = await supabaseClient
    .from('integrity_scan_sources')
    .select('*')
    .eq('is_active', true);

  if (sourcesError) {
    throw new Error(`Failed to get scan sources: ${sourcesError.message}`);
  }

  for (const source of sources) {
    console.log(`Scanning source: ${source.source_name}`);
    
    // Simulate scanning different source types
    const sourceResult = await scanDataSource(supabaseClient, source);
    scanResults.scannedSources.push({
      sourceName: source.source_name,
      sourceType: source.source_type,
      flagsFound: sourceResult.flagsFound,
      lastScanned: new Date().toISOString()
    });
    
    scanResults.alertsGenerated += sourceResult.flagsFound;
    scanResults.newFlags.push(...sourceResult.alerts);

    // Update last scanned timestamp
    await supabaseClient
      .from('integrity_scan_sources')
      .update({ last_scanned_at: new Date().toISOString() })
      .eq('id', source.id);
  }

  return scanResults;
}

async function scanDataSource(supabaseClient: any, source: any) {
  const alerts = [];
  let flagsFound = 0;

  switch (source.source_type) {
    case 'promise_tracker':
      // Scan for broken promises
      const { data: promises } = await supabaseClient
        .from('promises')
        .select('*')
        .eq('status', 'broken')
        .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      for (const promise of promises || []) {
        const alert = await createIntegrityAlert(supabaseClient, {
          alertType: 'broken_promise',
          title: `Broken Promise Detected: ${promise.title}`,
          description: `Promise "${promise.title}" marked as broken. Originally due: ${promise.due_date}`,
          targetEntityType: 'politician',
          targetEntityId: promise.politician_id,
          targetEntityName: promise.politician_name || 'Unknown',
          severity: 'medium',
          sourceData: { promise_id: promise.id, original_due_date: promise.due_date }
        });
        alerts.push(alert);
        flagsFound++;
      }
      break;

    case 'budget_database':
      // Simulate budget inconsistency detection
      const budgetAlert = await createIntegrityAlert(supabaseClient, {
        alertType: 'spending_red_flag',
        title: 'Budget Allocation Variance Detected',
        description: 'Road infrastructure project shows 40% budget overrun without progress reports',
        targetEntityType: 'project',
        targetEntityId: null,
        targetEntityName: 'North Region Road Project',
        severity: 'high',
        sourceData: { 
          allocated_amount: '500000000',
          actual_spending: '700000000',
          variance_percentage: 40,
          missing_reports: true
        }
      });
      alerts.push(budgetAlert);
      flagsFound++;
      break;

    case 'politician_votes':
      // Simulate voting inconsistency detection
      const votingAlert = await createIntegrityAlert(supabaseClient, {
        alertType: 'behavioral_inconsistency',
        title: 'Voting Pattern Inconsistency',
        description: 'MP voted against healthcare budget but requested healthcare facility funding for constituency',
        targetEntityType: 'politician',
        targetEntityId: null,
        targetEntityName: 'Sample MP',
        severity: 'medium',
        sourceData: {
          vote_against: 'Healthcare Budget 2024',
          request_for: 'Healthcare Facility Funding',
          inconsistency_type: 'contradiction'
        }
      });
      alerts.push(votingAlert);
      flagsFound++;
      break;

    case 'appointment_records':
      // Simulate sudden appointment change detection
      const appointmentAlert = await createIntegrityAlert(supabaseClient, {
        alertType: 'power_shift',
        title: 'Unexpected Leadership Change',
        description: 'Sudden resignation of ministry official 2 days after corruption allegations surfaced',
        targetEntityType: 'ministry',
        targetEntityId: null,
        targetEntityName: 'Ministry of Infrastructure',
        severity: 'high',
        sourceData: {
          official_name: 'Sample Official',
          resignation_date: new Date().toISOString(),
          days_after_allegations: 2,
          position: 'Deputy Minister'
        }
      });
      alerts.push(appointmentAlert);
      flagsFound++;
      break;
  }

  return { flagsFound, alerts };
}

async function createIntegrityAlert(supabaseClient: any, alertData: any) {
  const riskScore = calculateRiskScore(alertData.severity);
  
  const { data, error } = await supabaseClient
    .from('integrity_alert_log')
    .insert({
      alert_type: alertData.alertType,
      alert_title: alertData.title,
      alert_description: alertData.description,
      target_entity_type: alertData.targetEntityType,
      target_entity_id: alertData.targetEntityId,
      target_entity_name: alertData.targetEntityName,
      severity_level: alertData.severity,
      risk_score: riskScore,
      suggested_cause: getSuggestedCause(alertData.alertType),
      civil_implications: getCivilImplications(alertData.severity),
      source_data: alertData.sourceData || {}
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating integrity alert:', error);
    throw error;
  }

  return data;
}

function calculateRiskScore(severity: string): number {
  switch (severity) {
    case 'low': return 25;
    case 'medium': return 50;
    case 'high': return 75;
    case 'critical': return 90;
    default: return 50;
  }
}

function getSuggestedCause(alertType: string): string {
  switch (alertType) {
    case 'behavioral_inconsistency':
      return 'Contradictory actions or statements detected through automated analysis';
    case 'spending_red_flag':
      return 'Budget allocation and spending patterns indicate potential irregularities';
    case 'broken_promise':
      return 'Political commitment not fulfilled within expected timeframe';
    case 'power_shift':
      return 'Unexpected leadership or administrative changes detected';
    default:
      return 'Automated integrity monitoring detected potential issue';
  }
}

function getCivilImplications(severity: string): string {
  switch (severity) {
    case 'low':
      return 'Minor transparency concerns that may affect public trust';
    case 'medium':
      return 'Moderate accountability issues requiring attention';
    case 'high':
      return 'Significant integrity concerns that may impact governance';
    case 'critical':
      return 'Critical issues requiring immediate investigation and potential legal action';
    default:
      return 'Impact on civic trust and democratic accountability';
  }
}

async function getIntegrityAlerts(supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('integrity_alert_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Failed to get alerts: ${error.message}`);
  }

  return { alerts: data };
}

async function reviewAlert(supabaseClient: any, alertId: string, reviewAction: string, reviewNotes?: string) {
  // Update alert status
  const { error: updateError } = await supabaseClient
    .from('integrity_alert_log')
    .update({
      status: reviewAction === 'approve_public' ? 'under_review' : 
              reviewAction === 'dismiss' ? 'dismissed' : 'under_review',
      is_public_visible: reviewAction === 'approve_public',
      review_notes: reviewNotes,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', alertId);

  if (updateError) {
    throw new Error(`Failed to update alert: ${updateError.message}`);
  }

  // Log review action
  const { error: logError } = await supabaseClient
    .from('integrity_review_actions')
    .insert({
      alert_id: alertId,
      action_type: reviewAction,
      action_reason: reviewNotes,
      admin_id: '00000000-0000-0000-0000-000000000000', // Would be actual admin ID
      admin_notes: reviewNotes,
      public_release_approved: reviewAction === 'approve_public',
      external_sharing_approved: false
    });

  if (logError) {
    console.error('Failed to log review action:', logError);
  }

  return { success: true, action: reviewAction };
}

async function getIntegrityStats(supabaseClient: any) {
  const { data, error } = await supabaseClient
    .rpc('get_integrity_monitor_stats');

  if (error) {
    throw new Error(`Failed to get stats: ${error.message}`);
  }

  return data;
}

async function flagInconsistency(supabaseClient: any, entityType: string, entityId: string | null, entityName: string, inconsistencyDetails: string, evidenceData?: any, severity = 'medium') {
  const { data, error } = await supabaseClient
    .rpc('flag_behavioral_inconsistency', {
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_entity_name: entityName,
      p_inconsistency_details: inconsistencyDetails,
      p_evidence_data: evidenceData || {},
      p_severity: severity
    });

  if (error) {
    throw new Error(`Failed to flag inconsistency: ${error.message}`);
  }

  return { alertId: data, success: true };
}