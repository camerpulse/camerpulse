import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SecurityTestRequest {
  action: 'run_penetration_tests' | 'replay_breaches' | 'get_security_status' | 'update_config' | 'apply_patch'
  target?: string
  test_types?: string[]
  config_updates?: Record<string, any>
  patch_details?: any
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
    )

    const { action, target, test_types, config_updates, patch_details }: SecurityTestRequest = await req.json()

    console.log(`Security Engine: Processing ${action}`, { target, test_types })

    switch (action) {
      case 'run_penetration_tests':
        return await runPenetrationTests(supabaseClient, target, test_types)
      case 'replay_breaches':
        return await replaySecurityBreaches(supabaseClient, target)
      case 'get_security_status':
        return await getSecurityStatus(supabaseClient)
      case 'update_config':
        return await updateSecurityConfig(supabaseClient, config_updates)
      case 'apply_patch':
        return await applySecurityPatch(supabaseClient, patch_details)
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Security Engine Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function runPenetrationTests(supabaseClient: any, target?: string, testTypes?: string[]) {
  const endpoints = target ? [target] : ['/auth', '/admin', '/api', '/upload', '/feedback']
  const types = testTypes || ['xss', 'csrf', 'sql_injection', 'auth_bypass', 'cors', 'clickjacking']
  
  const testResults = []

  for (const endpoint of endpoints) {
    for (const testType of types) {
      try {
        const testResult = await simulatePenetrationTest(supabaseClient, endpoint, testType)
        testResults.push(testResult)
      } catch (error) {
        console.error(`Failed to test ${testType} on ${endpoint}:`, error)
        
        const errorResult = {
          test_name: `${testType}_${endpoint}_test`,
          test_type: testType,
          target_endpoint: endpoint,
          attack_vector: `Simulated ${testType} attack`,
          test_result: 'error',
          exploit_risk_score: 0,
          vulnerability_found: false,
          metadata: { error: error.message }
        }
        
        await supabaseClient.from('ashen_security_tests').insert(errorResult)
        testResults.push(errorResult)
      }
    }
  }

  // Update security logs with findings
  const vulnerabilities = testResults.filter(r => r.vulnerability_found)
  
  for (const vuln of vulnerabilities) {
    await supabaseClient.from('ashen_security_logs').insert({
      module_name: vuln.target_endpoint,
      vulnerability_type: vuln.test_type,
      attack_vector: vuln.attack_vector,
      severity: vuln.exploit_risk_score > 70 ? 'critical' : vuln.exploit_risk_score > 40 ? 'high' : 'medium',
      exploit_risk_score: vuln.exploit_risk_score,
      detection_method: 'automated_scan',
      exploit_details: vuln.metadata
    })
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      tests_run: testResults.length,
      vulnerabilities_found: vulnerabilities.length,
      results: testResults 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function simulatePenetrationTest(supabaseClient: any, endpoint: string, testType: string) {
  const testName = `${testType}_${endpoint}_test`
  const baseRiskScore = Math.floor(Math.random() * 100)
  
  // Simulate different attack scenarios
  let attackVector = ''
  let testPayload = ''
  let vulnerabilityFound = false
  let riskScore = baseRiskScore

  switch (testType) {
    case 'xss':
      attackVector = 'Cross-Site Scripting payload injection'
      testPayload = '<script>alert("XSS")</script>'
      vulnerabilityFound = endpoint.includes('feedback') && baseRiskScore > 70
      riskScore = vulnerabilityFound ? Math.max(75, baseRiskScore) : Math.min(30, baseRiskScore)
      break
      
    case 'csrf':
      attackVector = 'Cross-Site Request Forgery token validation bypass'
      testPayload = 'Missing CSRF token validation'
      vulnerabilityFound = endpoint.includes('admin') && baseRiskScore > 60
      riskScore = vulnerabilityFound ? Math.max(65, baseRiskScore) : Math.min(25, baseRiskScore)
      break
      
    case 'sql_injection':
      attackVector = 'SQL injection via parameter manipulation'
      testPayload = "'; DROP TABLE users; --"
      vulnerabilityFound = endpoint.includes('api') && baseRiskScore > 80
      riskScore = vulnerabilityFound ? Math.max(85, baseRiskScore) : Math.min(20, baseRiskScore)
      break
      
    case 'auth_bypass':
      attackVector = 'Authentication bypass attempt'
      testPayload = 'JWT token manipulation'
      vulnerabilityFound = endpoint.includes('auth') && baseRiskScore > 75
      riskScore = vulnerabilityFound ? Math.max(80, baseRiskScore) : Math.min(35, baseRiskScore)
      break
      
    case 'cors':
      attackVector = 'CORS policy bypass attempt'
      testPayload = 'Origin header manipulation'
      vulnerabilityFound = baseRiskScore > 50
      riskScore = vulnerabilityFound ? Math.max(55, baseRiskScore) : Math.min(20, baseRiskScore)
      break
      
    case 'clickjacking':
      attackVector = 'UI redirection and frame injection'
      testPayload = 'X-Frame-Options header missing'
      vulnerabilityFound = baseRiskScore > 40
      riskScore = vulnerabilityFound ? Math.max(45, baseRiskScore) : Math.min(15, baseRiskScore)
      break
      
    default:
      attackVector = 'Unknown attack vector'
      testPayload = 'Generic security test'
  }

  const testResult = {
    test_name: testName,
    test_type: testType,
    target_endpoint: endpoint,
    attack_vector: attackVector,
    test_payload: testPayload,
    test_result: vulnerabilityFound ? 'failed' : 'passed',
    exploit_risk_score: riskScore,
    vulnerability_found: vulnerabilityFound,
    patch_suggested: vulnerabilityFound && riskScore > 60,
    patch_applied: false,
    metadata: {
      test_duration_ms: Math.floor(Math.random() * 5000) + 1000,
      response_code: vulnerabilityFound ? 500 : 200,
      payload_blocked: !vulnerabilityFound,
      timestamp: new Date().toISOString()
    }
  }

  // Insert test result into database
  await supabaseClient.from('ashen_security_tests').insert(testResult)
  
  return testResult
}

async function replaySecurityBreaches(supabaseClient: any, targetModule?: string) {
  // Historical security breaches to replay
  const knownBreaches = [
    {
      breach_name: 'Auth Token Exposure 2024',
      breach_type: 'authentication',
      target_module: 'auth_system',
      exploit_method: 'JWT token manipulation',
      original_date: '2024-03-15T10:00:00Z'
    },
    {
      breach_name: 'Admin Panel Bypass',
      breach_type: 'authorization',
      target_module: 'admin_panel',
      exploit_method: 'Role privilege escalation',
      original_date: '2024-02-20T14:30:00Z'
    },
    {
      breach_name: 'File Upload Vulnerability',
      breach_type: 'file_upload',
      target_module: 'file_system',
      exploit_method: 'Malicious file execution',
      original_date: '2024-01-10T09:15:00Z'
    },
    {
      breach_name: 'SQL Injection in Search',
      breach_type: 'sql_injection',
      target_module: 'search_api',
      exploit_method: 'Parameter injection',
      original_date: '2023-12-05T16:45:00Z'
    }
  ]

  const replayResults = []

  for (const breach of knownBreaches) {
    if (targetModule && breach.target_module !== targetModule) continue

    const replayResult = await simulateBreachReplay(supabaseClient, breach)
    replayResults.push(replayResult)
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      breaches_replayed: replayResults.length,
      results: replayResults 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function simulateBreachReplay(supabaseClient: any, breach: any) {
  const isVulnerable = Math.random() > 0.7 // 30% chance still vulnerable
  const riskLevel = isVulnerable ? 
    (Math.random() > 0.5 ? 'high' : 'critical') : 
    (Math.random() > 0.5 ? 'low' : 'none')

  const replayResult = {
    breach_name: breach.breach_name,
    breach_type: breach.breach_type,
    original_date: breach.original_date,
    target_module: breach.target_module,
    exploit_method: breach.exploit_method,
    replay_result: isVulnerable ? 'vulnerable' : 'patched',
    current_risk_level: riskLevel,
    patch_status: isVulnerable ? 'manual_required' : 'applied',
    replay_details: {
      test_date: new Date().toISOString(),
      exploit_successful: isVulnerable,
      detection_bypassed: isVulnerable && Math.random() > 0.6,
      estimated_impact: isVulnerable ? 'high' : 'none'
    },
    fix_suggestions: isVulnerable ? [
      'Update authentication middleware',
      'Implement additional input validation',
      'Add rate limiting',
      'Review access controls'
    ] : []
  }

  // Insert replay result
  await supabaseClient.from('ashen_security_breaches').insert(replayResult)

  // Log if vulnerability still exists
  if (isVulnerable) {
    await supabaseClient.from('ashen_security_logs').insert({
      module_name: breach.target_module,
      vulnerability_type: breach.breach_type,
      attack_vector: breach.exploit_method,
      severity: riskLevel === 'critical' ? 'critical' : 'high',
      exploit_risk_score: riskLevel === 'critical' ? 90 : 75,
      detection_method: 'breach_replay',
      exploit_details: replayResult.replay_details,
      remediation_steps: replayResult.fix_suggestions
    })
  }

  return replayResult
}

async function getSecurityStatus(supabaseClient: any) {
  // Get recent security test results
  const { data: recentTests } = await supabaseClient
    .from('ashen_security_tests')
    .select('*')
    .gte('executed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('executed_at', { ascending: false })

  // Get open vulnerabilities
  const { data: openVulns } = await supabaseClient
    .from('ashen_security_logs')
    .select('*')
    .eq('status', 'open')
    .order('exploit_risk_score', { ascending: false })

  // Get security configuration
  const { data: config } = await supabaseClient
    .from('ashen_security_config')
    .select('*')
    .eq('is_active', true)

  // Calculate security score
  const totalTests = recentTests?.length || 0
  const failedTests = recentTests?.filter(t => t.test_result === 'failed').length || 0
  const criticalVulns = openVulns?.filter(v => v.severity === 'critical').length || 0
  const highVulns = openVulns?.filter(v => v.severity === 'high').length || 0

  let securityGrade = 'A'
  if (criticalVulns > 0) securityGrade = 'F'
  else if (highVulns > 2) securityGrade = 'D'
  else if (failedTests > totalTests * 0.3) securityGrade = 'C'
  else if (failedTests > totalTests * 0.1) securityGrade = 'B'

  const securityScore = Math.max(0, 100 - (criticalVulns * 25) - (highVulns * 10) - (failedTests * 5))

  return new Response(
    JSON.stringify({
      success: true,
      security_status: {
        security_grade: securityGrade,
        security_score: securityScore,
        total_tests_run: totalTests,
        failed_tests: failedTests,
        open_vulnerabilities: openVulns?.length || 0,
        critical_vulnerabilities: criticalVulns,
        high_vulnerabilities: highVulns,
        last_scan: recentTests?.[0]?.executed_at || null
      },
      recent_tests: recentTests?.slice(0, 10) || [],
      vulnerabilities: openVulns?.slice(0, 10) || [],
      configuration: config || []
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateSecurityConfig(supabaseClient: any, configUpdates: Record<string, any>) {
  const results = []

  for (const [key, value] of Object.entries(configUpdates)) {
    const { data, error } = await supabaseClient
      .from('ashen_security_config')
      .upsert({
        config_key: key,
        config_value: JSON.stringify(value),
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error(`Failed to update config ${key}:`, error)
    } else {
      results.push({ key, value, updated: true })
    }
  }

  return new Response(
    JSON.stringify({ success: true, updated_configs: results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function applySecurityPatch(supabaseClient: any, patchDetails: any) {
  // Simulate applying a security patch
  const patchSuccess = Math.random() > 0.2 // 80% success rate
  
  if (patchSuccess) {
    // Update vulnerability status
    if (patchDetails.vulnerability_id) {
      await supabaseClient
        .from('ashen_security_logs')
        .update({
          status: 'patched',
          patch_applied: true,
          patched_at: new Date().toISOString(),
          patch_details: patchDetails
        })
        .eq('id', patchDetails.vulnerability_id)
    }

    // Update security test if applicable
    if (patchDetails.test_id) {
      await supabaseClient
        .from('ashen_security_tests')
        .update({
          patch_applied: true,
          patch_details: patchDetails
        })
        .eq('id', patchDetails.test_id)
    }
  }

  return new Response(
    JSON.stringify({
      success: patchSuccess,
      patch_applied: patchSuccess,
      patch_details: patchDetails,
      message: patchSuccess ? 'Patch applied successfully' : 'Patch application failed'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}