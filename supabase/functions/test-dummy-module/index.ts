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

    console.log('🧪 Creating dummy test module: Civic Survey Tracker')

    // Create the dummy module data
    const dummyModule = {
      feature_name: 'civic_survey_tracker',
      feature_type: 'admin_module',
      status: 'active',
      description: 'Test module for tracking civic surveys and community feedback',
      metadata: {
        auto_detected: false,
        test_module: true,
        created_by: 'test_engine',
        capabilities: ['create', 'read', 'update', 'delete', 'analytics'],
        module_type: 'civic_engagement',
        priority: 'medium'
      }
    }

    // Register the dummy module
    const { data: moduleData, error: moduleError } = await supabase
      .from('ashen_feature_registry')
      .insert(dummyModule)
      .select()

    if (moduleError) {
      throw new Error(`Failed to create dummy module: ${moduleError.message}`)
    }

    console.log('✅ Dummy module created successfully')

    // Trigger auto-sync detection
    const autoSyncResponse = await supabase.functions.invoke('ashen-auto-sync-engine', {
      body: {
        action: 'detect_new_modules'
      }
    })

    console.log('🔄 Auto-sync engine triggered')

    // Log the test activity
    await supabase
      .from('camerpulse_activity_timeline')
      .insert({
        module: 'test_engine',
        activity_type: 'dummy_module_creation',
        activity_summary: 'Created dummy Civic Survey Tracker for auto-sync testing',
        status: 'completed',
        details: {
          module_name: 'civic_survey_tracker',
          test_purpose: 'auto_sync_validation',
          auto_sync_triggered: true,
          timestamp: new Date().toISOString()
        }
      })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Dummy module created and auto-sync triggered',
        dummy_module: moduleData[0],
        auto_sync_response: autoSyncResponse.data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Test dummy module error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})