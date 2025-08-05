import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, moduleData } = await req.json()
    console.log(`Auto-sync engine triggered with action: ${action}`)

    switch (action) {
      case 'detect_new_modules':
        return await detectNewModules(supabase)
      
      case 'register_module':
        return await registerModule(supabase, moduleData)
      
      case 'generate_admin_interface':
        return await generateAdminInterface(supabase, moduleData)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    console.error('Auto-sync engine error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function detectNewModules(supabase: any) {
  console.log('🔍 Scanning for new modules...')
  
  // Get all registered modules
  const { data: registeredModules, error: registeredError } = await supabase
    .from('ashen_feature_registry')
    .select('*')
    .eq('feature_type', 'admin_module')

  if (registeredError) {
    throw new Error(`Failed to fetch registered modules: ${registeredError.message}`)
  }

  // Simulate detection of new modules (in real implementation, this would scan the codebase)
  const systemModules = [
    'polls', 'billionaires', 'companies', 'debt_monitor', 'civic_officials',
    'messenger', 'sentiment', 'analytics', 'political_parties', 'news_system',
    'marketplace', 'elections', 'legal_documents', 'donations', 'promises', 'regional_analytics'
  ]

  const registeredModuleNames = registeredModules?.map(m => m.feature_name) || []
  const newModules = systemModules.filter(module => !registeredModuleNames.includes(module))

  console.log(`Found ${newModules.length} new modules: ${newModules.join(', ')}`)

  // Auto-register new modules
  const registrationResults = []
  for (const moduleName of newModules) {
    const result = await registerModule(supabase, {
      name: moduleName,
      type: 'admin_module',
      auto_detected: true
    })
    registrationResults.push(result)
  }

  return new Response(
    JSON.stringify({
      success: true,
      detected_modules: newModules,
      registration_results: registrationResults,
      total_registered: registeredModules?.length + newModules.length
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function registerModule(supabase: any, moduleData: any) {
  console.log(`📝 Registering module: ${moduleData.name}`)

  const { data, error } = await supabase
    .from('ashen_feature_registry')
    .insert({
      feature_name: moduleData.name,
      feature_type: 'admin_module',
      status: 'active',
      description: `Auto-generated admin module for ${moduleData.name}`,
      metadata: {
        auto_detected: moduleData.auto_detected || false,
        created_by: 'auto_sync_engine',
        capabilities: ['create', 'read', 'update', 'delete'],
        sync_timestamp: new Date().toISOString()
      }
    })
    .select()

  if (error) {
    console.error(`Failed to register module ${moduleData.name}:`, error)
    return { success: false, module: moduleData.name, error: error.message }
  }

  // Log the sync activity
  await supabase
    .from('camerpulse_activity_timeline')
    .insert({
      module: 'auto_sync_engine',
      activity_type: 'module_registration',
      activity_summary: `Auto-registered admin module: ${moduleData.name}`,
      status: 'completed',
      details: {
        module_name: moduleData.name,
        registration_method: 'automatic',
        timestamp: new Date().toISOString()
      }
    })

  return { success: true, module: moduleData.name, data: data[0] }
}

async function generateAdminInterface(supabase: any, moduleData: any) {
  console.log(`🎨 Generating admin interface for: ${moduleData.name}`)

  // In a real implementation, this would generate the actual admin component code
  // For now, we'll create a configuration that describes the admin interface
  const adminConfig = {
    module_name: moduleData.name,
    display_name: moduleData.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    icon: getModuleIcon(moduleData.name),
    permissions: ['view', 'create', 'edit', 'delete'],
    features: {
      search: true,
      filters: true,
      export: true,
      bulk_actions: true
    },
    generated_at: new Date().toISOString()
  }

  // Store the admin interface configuration
  const { data, error } = await supabase
    .from('ashen_generated_artifacts')
    .insert({
      artifact_name: `${moduleData.name}_admin_interface`,
      artifact_type: 'admin_module',
      metadata: adminConfig,
      is_applied: true
    })
    .select()

  if (error) {
    throw new Error(`Failed to generate admin interface: ${error.message}`)
  }

  // Update the feature registry to mark interface as generated
  await supabase
    .from('ashen_feature_registry')
    .update({
      metadata: {
        ...moduleData.metadata,
        admin_interface_generated: true,
        admin_config: adminConfig
      }
    })
    .eq('feature_name', moduleData.name)

  return new Response(
    JSON.stringify({
      success: true,
      module: moduleData.name,
      admin_config: adminConfig,
      artifact_id: data[0].id
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function getModuleIcon(moduleName: string): string {
  const iconMap: Record<string, string> = {
    polls: 'BarChart3',
    billionaires: 'CreditCard',
    companies: 'Building2',
    debt_monitor: 'TrendingUp',
    civic_officials: 'UserCheck',
    messenger: 'MessageSquare',
    sentiment: 'Brain',
    analytics: 'Database',
    political_parties: 'Users',
    news_system: 'Newspaper',
    marketplace: 'ShoppingBag',
    elections: 'Vote',
    legal_documents: 'FileText',
    donations: 'Heart',
    promises: 'Target',
    regional_analytics: 'Map'
  }
  
  return iconMap[moduleName] || 'Settings'
}