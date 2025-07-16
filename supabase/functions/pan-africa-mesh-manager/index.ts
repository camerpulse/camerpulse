import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { operation, payload } = await req.json()

    console.log(`Pan-Africa Mesh Manager - Operation: ${operation}`)

    switch (operation) {
      case 'get_mesh_overview':
        return await getMeshOverview(supabase)
      
      case 'add_country_node':
        return await addCountryNode(supabase, payload)
      
      case 'update_node_status':
        return await updateNodeStatus(supabase, payload)
      
      case 'trigger_cross_border_analysis':
        return await triggerCrossBorderAnalysis(supabase, payload)
      
      case 'sync_country_data':
        return await syncCountryData(supabase, payload)
      
      case 'generate_mesh_alert':
        return await generateMeshAlert(supabase, payload)
      
      case 'get_regional_insights':
        return await getRegionalInsights(supabase, payload)
      
      default:
        throw new Error(`Unknown operation: ${operation}`)
    }

  } catch (error) {
    console.error('Pan-Africa Mesh Manager Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to process mesh operation' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function getMeshOverview(supabase: any) {
  console.log('Getting mesh overview...')
  
  // Get mesh status overview
  const { data: meshStatus } = await supabase.rpc('get_mesh_status_overview')
  
  // Get active countries with their status
  const { data: countries } = await supabase
    .from('pan_africa_civic_mesh_nodes')
    .select('*')
    .eq('is_active', true)
    .order('country_name')
  
  // Get recent cross-border analytics
  const { data: analytics } = await supabase
    .from('pan_africa_cross_border_analytics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  
  // Get active alerts
  const { data: alerts } = await supabase
    .from('pan_africa_mesh_alerts')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(10)
  
  // Generate regional breakdown
  const regionalBreakdown = {}
  countries?.forEach((country: any) => {
    if (!regionalBreakdown[country.region]) {
      regionalBreakdown[country.region] = {
        total: 0,
        active: 0,
        countries: []
      }
    }
    regionalBreakdown[country.region].total++
    if (country.mesh_status === 'active') {
      regionalBreakdown[country.region].active++
    }
    regionalBreakdown[country.region].countries.push(country)
  })

  return new Response(
    JSON.stringify({
      success: true,
      mesh_status: meshStatus,
      countries: countries || [],
      analytics: analytics || [],
      alerts: alerts || [],
      regional_breakdown: regionalBreakdown,
      timestamp: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function addCountryNode(supabase: any, payload: any) {
  console.log('Adding new country node:', payload.country_code)
  
  const {
    country_code,
    country_name,
    flag_emoji,
    region,
    primary_language,
    supported_languages,
    currency_code,
    capital_city,
    data_sources,
    scraper_config
  } = payload

  // Insert new mesh node
  const { data, error } = await supabase
    .from('pan_africa_civic_mesh_nodes')
    .insert({
      country_code,
      country_name,
      flag_emoji,
      region,
      primary_language,
      supported_languages: supported_languages || [primary_language],
      currency_code,
      capital_city,
      data_sources: data_sources || {},
      scraper_config: scraper_config || { enabled: true, frequency_hours: 12 },
      mesh_status: 'pending'
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to add country node: ${error.message}`)
  }

  // Log the mesh expansion
  await supabase
    .from('pan_africa_mesh_sync_logs')
    .insert({
      country_code,
      sync_type: 'manual',
      sync_operation: 'node_creation',
      status: 'completed',
      records_processed: 1,
      records_added: 1,
      triggered_by: 'admin_panel'
    })

  return new Response(
    JSON.stringify({
      success: true,
      node: data,
      message: `Successfully added ${country_name} to the Pan-African mesh`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateNodeStatus(supabase: any, payload: any) {
  console.log('Updating node status:', payload.country_code, payload.status)
  
  const { country_code, mesh_status, sync_frequency_hours } = payload

  const { data, error } = await supabase
    .from('pan_africa_civic_mesh_nodes')
    .update({
      mesh_status,
      sync_frequency_hours,
      updated_at: new Date().toISOString()
    })
    .eq('country_code', country_code)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update node status: ${error.message}`)
  }

  return new Response(
    JSON.stringify({
      success: true,
      node: data,
      message: `Node status updated to ${mesh_status}`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function triggerCrossBorderAnalysis(supabase: any, payload: any) {
  console.log('Triggering cross-border analysis:', payload.analysis_type)
  
  const { analysis_type, countries, region_scope } = payload

  // Get data for analysis (mock implementation)
  const analysisResults = await performCrossBorderAnalysis(analysis_type, countries)

  // Store analysis results
  const { data, error } = await supabase
    .from('pan_africa_cross_border_analytics')
    .insert({
      analysis_type,
      countries_analyzed: countries,
      region_scope,
      analysis_results: analysisResults.results,
      insights: analysisResults.insights,
      anomalies_detected: analysisResults.anomalies,
      confidence_score: analysisResults.confidence,
      urgency_level: analysisResults.urgency
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to store analysis results: ${error.message}`)
  }

  return new Response(
    JSON.stringify({
      success: true,
      analysis: data,
      message: `Cross-border analysis completed for ${countries.length} countries`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function syncCountryData(supabase: any, payload: any) {
  console.log('Syncing country data:', payload.country_code)
  
  const { country_code, sync_operations } = payload

  // Mock data sync implementation
  const syncResults = []
  
  for (const operation of sync_operations) {
    const startTime = Date.now()
    
    // Simulate data sync
    const mockResults = {
      ministers: Math.floor(Math.random() * 20) + 5,
      parties: Math.floor(Math.random() * 15) + 3,
      legislators: Math.floor(Math.random() * 200) + 50,
      civic_issues: Math.floor(Math.random() * 100) + 20
    }

    const processed = mockResults[operation] || 0
    const duration = Date.now() - startTime

    // Log sync operation
    await supabase
      .from('pan_africa_mesh_sync_logs')
      .insert({
        country_code,
        sync_type: 'manual',
        sync_operation: operation,
        status: 'completed',
        records_processed: processed,
        records_added: Math.floor(processed * 0.3),
        records_updated: Math.floor(processed * 0.6),
        duration_seconds: Math.floor(duration / 1000),
        triggered_by: 'admin_panel'
      })

    syncResults.push({
      operation,
      processed,
      duration: Math.floor(duration / 1000)
    })
  }

  // Update node stats
  await supabase
    .from('pan_africa_civic_mesh_nodes')
    .update({
      last_sync_at: new Date().toISOString(),
      data_quality_score: 0.8 + Math.random() * 0.2, // Mock quality score
      ministers_count: syncResults.find(r => r.operation === 'ministers')?.processed || 0,
      parties_count: syncResults.find(r => r.operation === 'parties')?.processed || 0,
      legislators_count: syncResults.find(r => r.operation === 'legislators')?.processed || 0,
      civic_issues_count: syncResults.find(r => r.operation === 'civic_issues')?.processed || 0
    })
    .eq('country_code', country_code)

  return new Response(
    JSON.stringify({
      success: true,
      sync_results: syncResults,
      message: `Data sync completed for ${country_code}`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function generateMeshAlert(supabase: any, payload: any) {
  console.log('Generating mesh alert:', payload.alert_type)
  
  const {
    alert_type,
    affected_countries,
    region,
    alert_title,
    alert_description,
    severity_level,
    evidence_data
  } = payload

  const { data, error } = await supabase
    .from('pan_africa_mesh_alerts')
    .insert({
      alert_type,
      affected_countries,
      region,
      alert_title,
      alert_description,
      severity_level,
      evidence_data: evidence_data || {},
      recommended_actions: generateRecommendedActions(alert_type, severity_level)
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to generate mesh alert: ${error.message}`)
  }

  return new Response(
    JSON.stringify({
      success: true,
      alert: data,
      message: `Mesh alert generated for ${affected_countries.join(', ')}`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getRegionalInsights(supabase: any, payload: any) {
  console.log('Getting regional insights for:', payload.region)
  
  const { region } = payload

  // Get countries in region
  const { data: countries } = await supabase
    .from('pan_africa_civic_mesh_nodes')
    .select('*')
    .eq('region', region)
    .eq('is_active', true)

  // Get recent analytics for the region
  const { data: analytics } = await supabase
    .from('pan_africa_cross_border_analytics')
    .select('*')
    .eq('region_scope', region)
    .order('created_at', { ascending: false })
    .limit(10)

  // Generate insights
  const insights = {
    region,
    total_countries: countries?.length || 0,
    active_nodes: countries?.filter(c => c.mesh_status === 'active').length || 0,
    data_quality_avg: countries?.reduce((acc, c) => acc + (c.data_quality_score || 0), 0) / (countries?.length || 1),
    recent_analytics: analytics?.length || 0,
    key_trends: generateRegionalTrends(region, countries, analytics)
  }

  return new Response(
    JSON.stringify({
      success: true,
      insights,
      countries: countries || [],
      analytics: analytics || []
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function performCrossBorderAnalysis(analysisType: string, countries: string[]) {
  // Mock cross-border analysis implementation
  const mockResults = {
    sentiment_comparison: {
      results: {
        average_sentiment: 0.1,
        most_positive: countries[Math.floor(Math.random() * countries.length)],
        most_negative: countries[Math.floor(Math.random() * countries.length)],
        variance: 0.3
      },
      insights: {
        trends: ['Regional sentiment improving in West Africa', 'Youth engagement increasing'],
        concerns: ['Election season volatility', 'Economic pressures']
      },
      anomalies: [],
      confidence: 0.8,
      urgency: 'medium'
    },
    corruption_signals: {
      results: {
        risk_countries: countries.slice(0, 2),
        improvement_countries: countries.slice(-2),
        risk_indicators: ['budget_transparency', 'procurement_irregularities']
      },
      insights: {
        patterns: ['Cross-border corruption networks', 'Improved transparency initiatives'],
        recommendations: ['Enhanced monitoring', 'Regional cooperation']
      },
      anomalies: ['Unusual procurement patterns in border regions'],
      confidence: 0.7,
      urgency: 'high'
    }
  }

  return mockResults[analysisType] || mockResults.sentiment_comparison
}

function generateRecommendedActions(alertType: string, severityLevel: string) {
  const actions = {
    democratic_backsliding: [
      'Increase monitoring frequency',
      'Engage civil society organizations',
      'Coordinate with international observers'
    ],
    election_interference: [
      'Deploy election monitoring systems',
      'Activate fact-checking networks',
      'Alert international election observers'
    ],
    corruption_spike: [
      'Launch investigation protocols',
      'Increase transparency reporting',
      'Activate whistleblower protection'
    ],
    civil_unrest: [
      'Monitor social media sentiment',
      'Engage community leaders',
      'Prepare crisis communication'
    ]
  }

  return actions[alertType] || ['Monitor situation', 'Gather additional data']
}

function generateRegionalTrends(region: string, countries: any[], analytics: any[]) {
  return [
    `${region} showing ${countries?.length || 0} active mesh nodes`,
    'Democratic indicators trending positive',
    'Cross-border collaboration increasing',
    'Youth engagement programs expanding'
  ]
}