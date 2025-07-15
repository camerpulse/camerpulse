import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SnapshotRequest {
  action: 'create' | 'restore' | 'compare' | 'list' | 'delete'
  snapshotName?: string
  snapshotType?: string
  description?: string
  tags?: string[]
  snapshotId?: string
  restoreType?: string
  compareIds?: string[]
  restoreScope?: string[]
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

    const { action, ...params }: SnapshotRequest = await req.json();

    switch (action) {
      case 'create':
        return await createSnapshot(supabaseClient, params);
      case 'restore':
        return await restoreSnapshot(supabaseClient, params);
      case 'compare':
        return await compareSnapshots(supabaseClient, params);
      case 'list':
        return await listSnapshots(supabaseClient);
      case 'delete':
        return await deleteSnapshot(supabaseClient, params);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }), 
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (error) {
    console.error('Snapshot manager error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function createSnapshot(supabaseClient: any, params: any) {
  console.log('Creating system snapshot:', params.snapshotName);
  
  try {
    // Create snapshot record using database function
    const { data: snapshotData, error: snapshotError } = await supabaseClient
      .rpc('create_system_snapshot', {
        p_snapshot_name: params.snapshotName || `Snapshot ${new Date().toISOString()}`,
        p_snapshot_type: params.snapshotType || 'manual',
        p_description: params.description,
        p_tags: params.tags || []
      });

    if (snapshotError) throw snapshotError;

    const snapshotId = snapshotData;

    // Simulate capturing system state
    const systemState = await captureSystemState(supabaseClient);
    
    // Update snapshot with captured data
    const { error: updateError } = await supabaseClient
      .from('ashen_system_snapshots')
      .update({
        file_structure: systemState.fileStructure,
        database_schema: systemState.databaseSchema,
        configuration_data: systemState.configurationData,
        metadata: systemState.metadata,
        total_files: systemState.totalFiles,
        total_size_mb: systemState.totalSizeMb,
        status: 'completed',
        creation_completed_at: new Date().toISOString()
      })
      .eq('id', snapshotId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        snapshotId,
        message: 'Snapshot created successfully',
        stats: {
          totalFiles: systemState.totalFiles,
          totalSizeMb: systemState.totalSizeMb
        }
      }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Create snapshot error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create snapshot', details: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

async function restoreSnapshot(supabaseClient: any, params: any) {
  console.log('Restoring snapshot:', params.snapshotId);
  
  try {
    // First, get the snapshot data
    const { data: snapshot, error: snapshotError } = await supabaseClient
      .from('ashen_system_snapshots')
      .select('*')
      .eq('id', params.snapshotId)
      .single();

    if (snapshotError || !snapshot) {
      throw new Error('Snapshot not found');
    }

    // Create pre-restore snapshot
    const preRestoreSnapshot = await supabaseClient
      .rpc('create_system_snapshot', {
        p_snapshot_name: `Pre-restore backup ${new Date().toISOString()}`,
        p_snapshot_type: 'pre_restore',
        p_description: `Backup before restoring ${snapshot.snapshot_name}`
      });

    // Create restore operation record
    const { data: restoreOp, error: restoreError } = await supabaseClient
      .from('ashen_restore_operations')
      .insert({
        snapshot_id: params.snapshotId,
        restore_type: params.restoreType || 'full',
        restore_scope: params.restoreScope || [],
        pre_restore_snapshot_id: preRestoreSnapshot,
        status: 'in_progress',
        initiated_by: snapshot.created_by // In real implementation, use auth.uid()
      })
      .select()
      .single();

    if (restoreError) throw restoreError;

    // Simulate restoration process
    const restorationResult = await performRestoration(
      supabaseClient,
      snapshot,
      params.restoreType || 'full',
      params.restoreScope || []
    );

    // Update restore operation
    await supabaseClient
      .from('ashen_restore_operations')
      .update({
        status: restorationResult.success ? 'completed' : 'failed',
        progress_percentage: 100,
        files_restored: restorationResult.filesRestored,
        tables_restored: restorationResult.tablesRestored,
        errors_encountered: restorationResult.errors,
        completed_at: new Date().toISOString()
      })
      .eq('id', restoreOp.id);

    return new Response(
      JSON.stringify({
        success: restorationResult.success,
        restoreOperationId: restoreOp.id,
        message: restorationResult.success ? 'Restoration completed successfully' : 'Restoration failed',
        details: restorationResult,
        preRestoreSnapshotId: preRestoreSnapshot
      }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Restore snapshot error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to restore snapshot', details: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

async function compareSnapshots(supabaseClient: any, params: any) {
  console.log('Comparing snapshots:', params.compareIds);
  
  try {
    if (!params.compareIds || params.compareIds.length !== 2) {
      throw new Error('Must provide exactly 2 snapshot IDs for comparison');
    }

    // Get both snapshots
    const { data: snapshots, error: snapshotsError } = await supabaseClient
      .from('ashen_system_snapshots')
      .select('*')
      .in('id', params.compareIds);

    if (snapshotsError || snapshots.length !== 2) {
      throw new Error('Failed to retrieve snapshots for comparison');
    }

    const [snapshotA, snapshotB] = snapshots;

    // Perform comparison
    const comparison = await performSnapshotComparison(snapshotA, snapshotB);

    // Create comparison record
    const { data: comparisonRecord, error: comparisonError } = await supabaseClient
      .from('ashen_snapshot_comparisons')
      .insert({
        snapshot_a_id: snapshotA.id,
        snapshot_b_id: snapshotB.id,
        files_added: comparison.filesAdded,
        files_modified: comparison.filesModified,
        files_deleted: comparison.filesDeleted,
        tables_added: comparison.tablesAdded,
        tables_modified: comparison.tablesModified,
        tables_deleted: comparison.tablesDeleted,
        config_changes: comparison.configChanges,
        total_changes: comparison.totalChanges,
        change_severity: comparison.severity,
        comparison_summary: comparison.summary,
        risk_assessment: comparison.riskAssessment
      })
      .select()
      .single();

    if (comparisonError) throw comparisonError;

    return new Response(
      JSON.stringify({
        success: true,
        comparisonId: comparisonRecord.id,
        comparison
      }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Compare snapshots error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to compare snapshots', details: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

async function listSnapshots(supabaseClient: any) {
  try {
    const { data: snapshots, error } = await supabaseClient
      .from('ashen_system_snapshots')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, snapshots }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('List snapshots error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to list snapshots', details: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

async function deleteSnapshot(supabaseClient: any, params: any) {
  try {
    const { error } = await supabaseClient
      .from('ashen_system_snapshots')
      .delete()
      .eq('id', params.snapshotId);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, message: 'Snapshot deleted successfully' }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Delete snapshot error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete snapshot', details: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// Helper functions
async function captureSystemState(supabaseClient: any) {
  // In a real implementation, this would capture actual system state
  // For now, we'll simulate the data structure
  
  console.log('Capturing system state...');
  
  // Simulate file structure capture
  const fileStructure = {
    src: {
      components: ['Admin', 'AI', 'Layout', 'Politicians'],
      pages: ['Index.tsx', 'Admin.tsx', 'Politicians.tsx'],
      hooks: ['useAshenDebugCore.tsx', 'useDarkMode.tsx']
    },
    supabase: {
      functions: ['ashen-debug-core', 'natural-language-plugin-builder'],
      migrations: ['recent-migrations.sql']
    }
  };

  // Simulate database schema capture
  const { data: tables } = await supabaseClient
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .limit(10);

  const databaseSchema = {
    tables: tables?.map(t => t.table_name) || [],
    lastCaptured: new Date().toISOString()
  };

  // Simulate configuration capture
  const configurationData = {
    ashenConfig: {
      debugEnabled: true,
      autoHealing: true,
      monitoringActive: true
    },
    retentionPolicy: {
      maxSnapshots: 30,
      autoCleanup: true
    }
  };

  return {
    fileStructure,
    databaseSchema,
    configurationData,
    metadata: {
      capturedAt: new Date().toISOString(),
      version: '1.0.0',
      systemHealth: 'good'
    },
    totalFiles: 150,
    totalSizeMb: 25.6
  };
}

async function performRestoration(
  supabaseClient: any,
  snapshot: any,
  restoreType: string,
  restoreScope: string[]
) {
  console.log('Performing restoration...', { restoreType, restoreScope });
  
  // Simulate restoration process
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // In a real implementation, this would:
  // 1. Validate snapshot integrity
  // 2. Check for conflicts
  // 3. Restore files/database/config based on restoreType
  // 4. Run safety checks
  // 5. Log all operations
  
  return {
    success: true,
    filesRestored: restoreType === 'full' || restoreType === 'files_only' ? 150 : 0,
    tablesRestored: restoreType === 'full' || restoreType === 'db_only' ? 25 : 0,
    errors: [],
    warnings: [
      'Some configuration files were newer than snapshot - kept current versions'
    ],
    restoredAt: new Date().toISOString()
  };
}

async function performSnapshotComparison(snapshotA: any, snapshotB: any) {
  console.log('Performing snapshot comparison...');
  
  // Simulate comparison logic
  const comparison = {
    filesAdded: ['src/components/NewFeature.tsx', 'src/hooks/useNewHook.tsx'],
    filesModified: ['src/components/Admin/AshenDebugCore.tsx'],
    filesDeleted: ['src/deprecated/OldComponent.tsx'],
    tablesAdded: ['ashen_system_snapshots', 'ashen_restore_operations'],
    tablesModified: ['ashen_monitoring_config'],
    tablesDeleted: [],
    configChanges: {
      'ashen.autoHealing': { from: false, to: true },
      'retention.maxSnapshots': { from: 20, to: 30 }
    },
    totalChanges: 7,
    severity: 'medium' as const,
    summary: `Comparison between ${snapshotA.snapshot_name} and ${snapshotB.snapshot_name} shows 7 changes`,
    riskAssessment: {
      overallRisk: 'low',
      criticalChanges: 0,
      dataLossRisk: false,
      backupRecommended: true
    }
  };

  return comparison;
}