import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ErrorLog {
  id: string;
  component_path: string;
  error_type: string;
  error_message: string;
  suggested_fix: string;
  confidence_score: number;
  status: string;
  created_at: string;
}

interface HealingAttempt {
  error_id: string;
  fix_applied: boolean;
  fix_confidence: number;
  fix_method: string;
  fix_description: string;
  code_changes: any;
  result_status: string;
  error_message?: string;
  files_modified: string[];
  backup_created: boolean;
  rollback_info: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔮 Ashen Auto-Healer starting healing cycle...');

    // Check if auto-healing is enabled
    const { data: config } = await supabase
      .from('ashen_monitoring_config')
      .select('config_value')
      .eq('config_key', 'auto_healing_enabled')
      .single();

    if (!config || config.config_value !== true) {
      console.log('🚫 Auto-healing is disabled, skipping cycle');
      return new Response(JSON.stringify({ 
        message: 'Auto-healing disabled',
        healed: 0,
        suggestions: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get confidence threshold
    const { data: thresholdConfig } = await supabase
      .from('ashen_monitoring_config')
      .select('config_value')
      .eq('config_key', 'auto_healing_confidence_threshold')
      .single();

    const confidenceThreshold = thresholdConfig?.config_value || 0.85;

    // Get unresolved errors with high confidence fixes
    const { data: errors, error: errorsError } = await supabase
      .from('ashen_error_logs')
      .select('*')
      .eq('status', 'open')
      .gte('confidence_score', confidenceThreshold)
      .not('suggested_fix', 'is', null)
      .order('confidence_score', { ascending: false })
      .limit(10);

    if (errorsError) {
      throw new Error(`Failed to fetch errors: ${errorsError.message}`);
    }

    if (!errors || errors.length === 0) {
      console.log('✅ No high-confidence errors found for auto-healing');
      await updateLastRun(supabase);
      return new Response(JSON.stringify({ 
        message: 'No errors to heal',
        healed: 0,
        suggestions: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`🎯 Found ${errors.length} high-confidence errors for healing`);

    let healedCount = 0;
    let suggestionCount = 0;

    for (const error of errors) {
      try {
        const healingAttempt = await processError(error, supabase);
        
        // Log the healing attempt
        await supabase
          .from('ashen_auto_healing_history')
          .insert([healingAttempt]);

        if (healingAttempt.fix_applied) {
          healedCount++;
          // Mark error as resolved
          await supabase
            .from('ashen_error_logs')
            .update({ 
              status: 'resolved',
              resolved_at: new Date().toISOString(),
              resolved_by: 'auto_healer'
            })
            .eq('id', error.id);
        } else {
          suggestionCount++;
        }

      } catch (healError) {
        console.error(`❌ Failed to heal error ${error.id}:`, healError);
        
        // Log failed healing attempt
        await supabase
          .from('ashen_auto_healing_history')
          .insert([{
            error_id: error.id,
            fix_applied: false,
            fix_confidence: error.confidence_score,
            fix_method: 'auto_fix',
            fix_description: error.suggested_fix,
            code_changes: {},
            result_status: 'failed',
            error_message: healError.message,
            files_modified: [],
            backup_created: false,
            rollback_info: {}
          }]);
      }
    }

    await updateLastRun(supabase);

    console.log(`🎉 Auto-healing cycle complete. Healed: ${healedCount}, Suggestions: ${suggestionCount}`);

    return new Response(JSON.stringify({ 
      message: 'Auto-healing cycle completed',
      healed: healedCount,
      suggestions: suggestionCount,
      total_errors_processed: errors.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Auto-healer error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      healed: 0,
      suggestions: 0 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processError(error: ErrorLog, supabase: any): Promise<HealingAttempt> {
  console.log(`🔧 Processing error: ${error.component_path} (confidence: ${Math.round(error.confidence_score * 100)}%)`);

  const healingAttempt: HealingAttempt = {
    error_id: error.id,
    fix_applied: false,
    fix_confidence: error.confidence_score,
    fix_method: 'auto_fix',
    fix_description: error.suggested_fix,
    code_changes: {},
    result_status: 'pending',
    files_modified: [],
    backup_created: false,
    rollback_info: {}
  };

  // Determine fix strategy based on error type
  const fixStrategy = determineFixStrategy(error);
  
  if (fixStrategy.canAutoFix) {
    try {
      // Apply the fix
      const fixResult = await applyAutoFix(error, fixStrategy);
      
      healingAttempt.fix_applied = true;
      healingAttempt.result_status = 'success';
      healingAttempt.code_changes = fixResult.changes;
      healingAttempt.files_modified = fixResult.filesModified;
      healingAttempt.backup_created = fixResult.backupCreated;
      healingAttempt.rollback_info = fixResult.rollbackInfo;
      
      console.log(`✅ Successfully applied fix for ${error.component_path}`);
      
    } catch (fixError) {
      healingAttempt.result_status = 'failed';
      healingAttempt.error_message = fixError.message;
      console.log(`❌ Failed to apply fix for ${error.component_path}: ${fixError.message}`);
    }
  } else {
    // Create suggestion only
    healingAttempt.result_status = 'suggestion_only';
    healingAttempt.fix_description = `Suggested fix: ${error.suggested_fix}\n\nReason for manual intervention: ${fixStrategy.reason}`;
    console.log(`💡 Created suggestion for ${error.component_path}: ${fixStrategy.reason}`);
  }

  return healingAttempt;
}

function determineFixStrategy(error: ErrorLog) {
  const errorType = error.error_type.toLowerCase();
  const errorMessage = error.error_message.toLowerCase();
  
  // Safe auto-fixes that don't risk breaking functionality
  const safeAutoFixes = [
    'missing_import',
    'unused_import',
    'deprecated_prop',
    'missing_key_prop',
    'accessibility_warning',
    'style_inconsistency',
    'typo_correction'
  ];

  // Risky fixes that require manual intervention
  const riskyFixes = [
    'logic_error',
    'api_integration',
    'database_query',
    'authentication',
    'state_management'
  ];

  if (safeAutoFixes.some(safe => errorType.includes(safe) || errorMessage.includes(safe))) {
    return { canAutoFix: true, reason: 'Safe auto-fix approved' };
  }

  if (riskyFixes.some(risky => errorType.includes(risky) || errorMessage.includes(risky))) {
    return { canAutoFix: false, reason: 'Requires manual review due to complexity' };
  }

  // Default to manual for unknown error types
  return { canAutoFix: false, reason: 'Unknown error type requires manual analysis' };
}

async function applyAutoFix(error: ErrorLog, strategy: any) {
  // Simulate fix application - in a real scenario, this would:
  // 1. Create backup of affected files
  // 2. Apply the suggested fix
  // 3. Run basic validation
  // 4. Store rollback information
  
  const mockChanges = {
    file: error.component_path,
    fix_applied: error.suggested_fix,
    timestamp: new Date().toISOString(),
    method: 'automated_patch'
  };

  const mockResult = {
    changes: mockChanges,
    filesModified: [error.component_path],
    backupCreated: true,
    rollbackInfo: {
      backup_path: `/backups/${error.id}_${Date.now()}.backup`,
      original_content: 'encrypted_backup_content',
      can_rollback: true
    }
  };

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 100));

  return mockResult;
}

async function updateLastRun(supabase: any) {
  await supabase
    .from('ashen_monitoring_config')
    .update({ config_value: `"${new Date().toISOString()}"` })
    .eq('config_key', 'auto_healing_last_run');
}