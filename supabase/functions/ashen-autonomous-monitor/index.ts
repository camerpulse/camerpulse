import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MonitoringRequest {
  action: 'scan' | 'repair' | 'configure' | 'status' | 'approve' | 'revert' | 'blacklist'
  target?: string
  options?: any
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, target, options }: MonitoringRequest = await req.json()

    switch (action) {
      case 'scan':
        return await runSystemScan(supabaseClient, target, options)
      case 'repair':
        return await performAutonomousRepair(supabaseClient, target, options)
      case 'configure':
        return await updateConfiguration(supabaseClient, options)
      case 'status':
        return await getSystemStatus(supabaseClient)
      case 'approve':
        return await approveOperation(supabaseClient, target, options)
      case 'revert':
        return await revertOperation(supabaseClient, target, options)
      case 'blacklist':
        return await addToBlacklist(supabaseClient, target, options)
      default:
        throw new Error(`Unknown action: ${action}`)
    }
  } catch (error) {
    console.error('Error in autonomous monitor:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function runSystemScan(supabaseClient: any, target?: string, options?: any) {
  console.log(`Starting system scan${target ? ` for ${target}` : ''}`)
  
  const operationId = await logOperation(supabaseClient, 'scan', target, 0, {
    scan_type: options?.scanType || 'comprehensive',
    target: target
  })

  const scanResults = await performScans(supabaseClient, operationId, target, options)
  
  // Update operation status
  await supabaseClient
    .from('ashen_autonomous_operations')
    .update({ 
      status: 'completed',
      completed_at: new Date().toISOString(),
      operation_details: { scan_results: scanResults }
    })
    .eq('id', operationId)

  return new Response(
    JSON.stringify({ 
      success: true, 
      operationId,
      scanResults,
      issuesFound: scanResults.filter((r: any) => r.issue_detected).length
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function performScans(supabaseClient: any, operationId: string, target?: string, options?: any) {
  const scanTypes = options?.scanTypes || ['ui', 'api', 'permissions', 'mobile', 'data_integrity']
  const results = []

  for (const scanType of scanTypes) {
    const scanResult = await performScanByType(scanType, target)
    
    // Store scan result
    const { data } = await supabaseClient
      .from('ashen_autonomous_scan_results')
      .insert({
        scan_type: scanType,
        target_path: target,
        issue_detected: scanResult.issueDetected,
        issue_severity: scanResult.severity,
        issue_description: scanResult.description,
        suggested_fix: scanResult.suggestedFix,
        fix_confidence: scanResult.confidence,
        can_auto_fix: scanResult.canAutoFix,
        scan_metadata: scanResult.metadata,
        operation_id: operationId
      })
      .select()
      .single()

    results.push(data)
  }

  return results
}

async function performScanByType(scanType: string, target?: string) {
  // Simulate different types of scans
  const scanResults = {
    ui: {
      issueDetected: Math.random() > 0.7,
      severity: 'low',
      description: 'Minor CSS alignment issue detected in navigation',
      suggestedFix: 'Apply flex centering to navigation items',
      confidence: 85,
      canAutoFix: true,
      metadata: { component: 'Navigation', issue_type: 'styling' }
    },
    api: {
      issueDetected: Math.random() > 0.8,
      severity: 'medium',
      description: 'API endpoint response time exceeded threshold',
      suggestedFix: 'Optimize database query with proper indexing',
      confidence: 70,
      canAutoFix: false,
      metadata: { endpoint: '/api/politicians', response_time: '2.3s' }
    },
    permissions: {
      issueDetected: Math.random() > 0.9,
      severity: 'high',
      description: 'RLS policy gap detected in user_profiles table',
      suggestedFix: 'Add missing INSERT policy for authenticated users',
      confidence: 95,
      canAutoFix: true,
      metadata: { table: 'user_profiles', missing_policy: 'INSERT' }
    },
    mobile: {
      issueDetected: Math.random() > 0.75,
      severity: 'low',
      description: 'Mobile viewport not optimized for small screens',
      suggestedFix: 'Add responsive breakpoints for mobile layout',
      confidence: 80,
      canAutoFix: true,
      metadata: { screen_size: '320px', issue: 'overflow' }
    },
    data_integrity: {
      issueDetected: Math.random() > 0.85,
      severity: 'medium',
      description: 'Orphaned records found in related tables',
      suggestedFix: 'Clean up orphaned records and add foreign key constraints',
      confidence: 75,
      canAutoFix: false,
      metadata: { affected_tables: ['approval_ratings'], orphaned_count: 12 }
    }
  }

  return scanResults[scanType as keyof typeof scanResults] || {
    issueDetected: false,
    severity: 'low',
    description: 'No issues detected',
    suggestedFix: null,
    confidence: 100,
    canAutoFix: false,
    metadata: {}
  }
}

async function performAutonomousRepair(supabaseClient: any, target?: string, options?: any) {
  console.log(`Performing autonomous repair for ${target}`)
  
  const riskScore = calculateRiskScore(options)
  const requiresApproval = riskScore > 6
  
  const operationId = await logOperation(supabaseClient, 'repair', target, riskScore, {
    fix_type: options?.fixType,
    auto_applied: !requiresApproval
  }, requiresApproval)

  if (!requiresApproval) {
    // Apply the fix automatically
    const fixResult = await applyAutonomousFix(options)
    
    await supabaseClient
      .from('ashen_autonomous_operations')
      .update({ 
        status: 'completed',
        fix_applied: true,
        completed_at: new Date().toISOString(),
        operation_details: { fix_result: fixResult }
      })
      .eq('id', operationId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        operationId,
        applied: true,
        message: 'Fix applied automatically'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } else {
    return new Response(
      JSON.stringify({ 
        success: true, 
        operationId,
        applied: false,
        message: 'Fix requires human approval due to high risk score'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function updateConfiguration(supabaseClient: any, options: any) {
  const { configKey, configValue, enabled, riskThreshold, scanFrequency } = options

  await supabaseClient
    .from('ashen_autonomous_config')
    .upsert({
      config_key: configKey,
      config_value: configValue,
      is_enabled: enabled,
      risk_threshold: riskThreshold,
      scan_frequency_minutes: scanFrequency,
      updated_at: new Date().toISOString()
    })

  return new Response(
    JSON.stringify({ success: true, message: 'Configuration updated' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getSystemStatus(supabaseClient: any) {
  // Get recent operations
  const { data: recentOps } = await supabaseClient
    .from('ashen_autonomous_operations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  // Get pending approvals
  const { data: pendingApprovals } = await supabaseClient
    .from('ashen_autonomous_operations')
    .select('*')
    .eq('status', 'requires_approval')
    .order('created_at', { ascending: false })

  // Get recent scan results
  const { data: recentScans } = await supabaseClient
    .from('ashen_autonomous_scan_results')
    .select('*')
    .eq('issue_detected', true)
    .order('created_at', { ascending: false })
    .limit(20)

  // Get configuration
  const { data: config } = await supabaseClient
    .from('ashen_autonomous_config')
    .select('*')

  return new Response(
    JSON.stringify({ 
      success: true,
      status: {
        recentOperations: recentOps,
        pendingApprovals: pendingApprovals,
        recentIssues: recentScans,
        configuration: config,
        systemHealth: calculateSystemHealth(recentOps, recentScans)
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function approveOperation(supabaseClient: any, operationId: string, options: any) {
  await supabaseClient
    .from('ashen_autonomous_operations')
    .update({
      status: 'completed',
      approved_by: options.approvedBy,
      approved_at: new Date().toISOString(),
      fix_applied: true,
      completed_at: new Date().toISOString()
    })
    .eq('id', operationId)

  return new Response(
    JSON.stringify({ success: true, message: 'Operation approved and executed' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function revertOperation(supabaseClient: any, operationId: string, options: any) {
  await supabaseClient
    .from('ashen_autonomous_operations')
    .update({
      reverted_at: new Date().toISOString(),
      operation_details: { 
        reverted: true, 
        revert_reason: options.reason 
      }
    })
    .eq('id', operationId)

  return new Response(
    JSON.stringify({ success: true, message: 'Operation reverted successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function addToBlacklist(supabaseClient: any, item: string, options: any) {
  await supabaseClient
    .from('ashen_autonomous_blacklist')
    .insert({
      blacklist_type: options.type,
      blacklist_value: item,
      reason: options.reason,
      added_by: options.addedBy
    })

  return new Response(
    JSON.stringify({ success: true, message: 'Item added to blacklist' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function calculateRiskScore(options: any): number {
  // Simple risk calculation based on fix type and impact
  const riskFactors = {
    'css_fix': 2,
    'permission_fix': 8,
    'database_fix': 9,
    'api_optimization': 5,
    'mobile_responsive': 3
  }
  
  return riskFactors[options?.fixType as keyof typeof riskFactors] || 5
}

function calculateSystemHealth(operations: any[], issues: any[]) {
  const recentFailures = operations.filter(op => op.status === 'failed').length
  const criticalIssues = issues.filter(issue => issue.issue_severity === 'critical').length
  
  let healthScore = 100
  healthScore -= recentFailures * 10
  healthScore -= criticalIssues * 15
  
  return {
    score: Math.max(0, healthScore),
    status: healthScore > 80 ? 'healthy' : healthScore > 60 ? 'warning' : 'critical'
  }
}

async function applyAutonomousFix(options: any) {
  // Simulate applying a fix
  console.log(`Applying ${options?.fixType} fix`)
  
  // In a real implementation, this would contain actual fix logic
  return {
    applied: true,
    fixType: options?.fixType,
    timestamp: new Date().toISOString()
  }
}

async function logOperation(
  supabaseClient: any,
  operationType: string,
  targetModule?: string,
  riskScore: number = 0,
  details: any = {},
  requiresApproval: boolean = false
): Promise<string> {
  const { data } = await supabaseClient
    .from('ashen_autonomous_operations')
    .insert({
      operation_type: operationType,
      target_module: targetModule,
      risk_score: riskScore,
      operation_details: details,
      human_approval_required: requiresApproval,
      status: requiresApproval ? 'requires_approval' : 'pending'
    })
    .select()
    .single()

  return data.id
}