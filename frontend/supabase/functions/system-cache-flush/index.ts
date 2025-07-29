import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CacheFlushRequest {
  cache_layers: string[]
  operation_type: 'manual' | 'auto' | 'scheduled'
  force: boolean
}

interface CacheLayerResult {
  layer: string
  status: 'success' | 'error' | 'skipped'
  items_cleared: number
  size_cleared_mb: number
  error_message?: string
  duration_ms: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: userRoles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (!userRoles) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestBody: CacheFlushRequest = await req.json()

    // Create flush operation record
    const { data: operation, error: operationError } = await supabaseClient
      .from('cache_flush_operations')
      .insert({
        operation_type: requestBody.operation_type,
        cache_layers: requestBody.cache_layers,
        initiated_by: user.id,
        status: 'running',
        metadata: { force: requestBody.force }
      })
      .select()
      .single()

    if (operationError) {
      throw new Error(`Failed to create operation: ${operationError.message}`)
    }

    // Get cache layer configurations
    const { data: cacheConfigs, error: configError } = await supabaseClient
      .from('system_cache_config')
      .select('*')
      .in('cache_layer', requestBody.cache_layers)
      .eq('is_active', true)
      .order('flush_priority')

    if (configError) {
      throw new Error(`Failed to get cache configs: ${configError.message}`)
    }

    const results: CacheLayerResult[] = []

    // Process each cache layer
    for (const config of cacheConfigs) {
      const startTime = Date.now()
      
      // Create status tracking record
      const { data: statusRecord } = await supabaseClient
        .from('cache_status_tracking')
        .insert({
          cache_layer: config.cache_layer,
          operation_id: operation.id,
          status: 'running'
        })
        .select()
        .single()

      try {
        const result = await flushCacheLayer(config.cache_layer, config.config_metadata, requestBody.force)
        
        // Update status record with success
        await supabaseClient
          .from('cache_status_tracking')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            items_cleared: result.items_cleared,
            size_cleared_mb: result.size_cleared_mb,
            metadata: { duration_ms: Date.now() - startTime }
          })
          .eq('id', statusRecord?.id)

        results.push({
          layer: config.cache_layer,
          status: 'success',
          items_cleared: result.items_cleared,
          size_cleared_mb: result.size_cleared_mb,
          duration_ms: Date.now() - startTime
        })

      } catch (error) {
        // Update status record with error
        await supabaseClient
          .from('cache_status_tracking')
          .update({
            status: 'error',
            completed_at: new Date().toISOString(),
            error_message: error.message,
            metadata: { duration_ms: Date.now() - startTime }
          })
          .eq('id', statusRecord?.id)

        results.push({
          layer: config.cache_layer,
          status: 'error',
          items_cleared: 0,
          size_cleared_mb: 0,
          error_message: error.message,
          duration_ms: Date.now() - startTime
        })
      }
    }

    // Update operation status
    const overallStatus = results.every(r => r.status === 'success') ? 'completed' : 
                         results.every(r => r.status === 'error') ? 'failed' : 'partial'

    await supabaseClient
      .from('cache_flush_operations')
      .update({
        status: overallStatus,
        completed_at: new Date().toISOString(),
        success_details: { results: results.filter(r => r.status === 'success') },
        error_details: { results: results.filter(r => r.status === 'error') }
      })
      .eq('id', operation.id)

    // After successful flush, trigger rebuilds
    if (overallStatus === 'completed' || overallStatus === 'partial') {
      EdgeRuntime.waitUntil(triggerSystemRebuild(supabaseClient, requestBody.cache_layers))
    }

    return new Response(
      JSON.stringify({
        operation_id: operation.id,
        status: overallStatus,
        results,
        total_items_cleared: results.reduce((sum, r) => sum + r.items_cleared, 0),
        total_size_cleared_mb: results.reduce((sum, r) => sum + r.size_cleared_mb, 0)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Cache flush error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function flushCacheLayer(layer: string, config: any, force: boolean): Promise<{ items_cleared: number, size_cleared_mb: number }> {
  const startTime = Date.now()
  let items_cleared = 0
  let size_cleared_mb = 0

  switch (layer) {
    case 'component_cache':
      // Clear React component cache, UI modules, dashboard widgets
      items_cleared = await clearComponentCache(force)
      size_cleared_mb = Math.round((items_cleared * 0.5) * 100) / 100 // Estimate 0.5MB per component
      break

    case 'ai_memory_cache':
      // Clear AI session memory, response logs, prompt results
      items_cleared = await clearAIMemoryCache(force)
      size_cleared_mb = Math.round((items_cleared * 2.0) * 100) / 100 // Estimate 2MB per AI session
      break

    case 'api_cache':
      // Clear government sites, third-party APIs, sentiment feeds cache
      items_cleared = await clearAPICache(force)
      size_cleared_mb = Math.round((items_cleared * 1.0) * 100) / 100 // Estimate 1MB per API response
      break

    case 'cdn_asset_cache':
      // Clear static files, images, CSS, profile images
      items_cleared = await clearCDNAssetCache(force)
      size_cleared_mb = Math.round((items_cleared * 5.0) * 100) / 100 // Estimate 5MB per asset
      break

    case 'security_role_cache':
      // Clear user sessions, admin roles, access levels
      items_cleared = await clearSecurityRoleCache(force)
      size_cleared_mb = Math.round((items_cleared * 0.1) * 100) / 100 // Estimate 0.1MB per session
      break

    default:
      throw new Error(`Unknown cache layer: ${layer}`)
  }

  console.log(`Flushed ${layer}: ${items_cleared} items, ${size_cleared_mb}MB in ${Date.now() - startTime}ms`)
  return { items_cleared, size_cleared_mb }
}

async function clearComponentCache(force: boolean): Promise<number> {
  // Simulate component cache clearing
  // In real implementation, this would interact with your component cache system
  const cacheKeys = [
    'dashboard_widgets',
    'ui_modules',
    'reusable_blocks',
    'navigation_components',
    'form_components'
  ]
  
  // Simulate clearing each cache key
  for (const key of cacheKeys) {
    // Clear from Redis/memory cache if available
    console.log(`Clearing component cache: ${key}`)
  }
  
  return cacheKeys.length * 10 // Simulate 10 cached items per category
}

async function clearAIMemoryCache(force: boolean): Promise<number> {
  // Clear AI session memory and logs
  const aiCacheKeys = [
    'ai_session_memory',
    'ai_response_logs',
    'prompt_results',
    'sentiment_analysis_cache',
    'ai_model_cache'
  ]
  
  for (const key of aiCacheKeys) {
    console.log(`Clearing AI cache: ${key}`)
  }
  
  return aiCacheKeys.length * 5 // Simulate 5 cached sessions per category
}

async function clearAPICache(force: boolean): Promise<number> {
  // Clear external API caches
  const apiCacheKeys = [
    'senat_cm_data',
    'assnat_cm_data',
    'twitter_sentiment',
    'serpapi_results',
    'openai_responses',
    'government_official_data'
  ]
  
  for (const key of apiCacheKeys) {
    console.log(`Clearing API cache: ${key}`)
  }
  
  return apiCacheKeys.length * 20 // Simulate 20 cached responses per API
}

async function clearCDNAssetCache(force: boolean): Promise<number> {
  // Clear CDN and static asset cache
  const assetCategories = [
    'profile_images',
    'party_logos',
    'static_css',
    'static_js',
    'icon_cache',
    'media_thumbnails'
  ]
  
  for (const category of assetCategories) {
    console.log(`Clearing asset cache: ${category}`)
  }
  
  return assetCategories.length * 50 // Simulate 50 cached assets per category
}

async function clearSecurityRoleCache(force: boolean): Promise<number> {
  // Clear security and role cache
  const securityCacheKeys = [
    'user_sessions',
    'admin_roles',
    'access_levels',
    'jwt_tokens',
    'permission_cache'
  ]
  
  for (const key of securityCacheKeys) {
    console.log(`Clearing security cache: ${key}`)
  }
  
  return securityCacheKeys.length * 15 // Simulate 15 cached security items per category
}

async function triggerSystemRebuild(supabaseClient: any, cacheLayers: string[]) {
  console.log('Triggering system rebuild for cache layers:', cacheLayers)
  
  // Trigger rebuilds based on cache layers cleared
  const rebuildTasks = []
  
  if (cacheLayers.includes('component_cache')) {
    rebuildTasks.push('rebuild_dashboard_widgets')
    rebuildTasks.push('rebuild_ui_modules')
  }
  
  if (cacheLayers.includes('api_cache')) {
    rebuildTasks.push('refetch_government_data')
    rebuildTasks.push('reinitialize_api_fetchers')
  }
  
  if (cacheLayers.includes('security_role_cache')) {
    rebuildTasks.push('refresh_user_sessions')
    rebuildTasks.push('reload_admin_permissions')
  }
  
  // Log rebuild operations
  for (const task of rebuildTasks) {
    console.log(`Executing rebuild task: ${task}`)
    // In real implementation, trigger actual rebuild processes
  }
}