import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PluginAnalysisRequest {
  action: 'scan' | 'analyze' | 'stress_test' | 'conflict_check' | 'risk_assess';
  plugin_id?: string;
  options?: any;
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

    const { action, plugin_id, options }: PluginAnalysisRequest = await req.json();

    let result;
    switch (action) {
      case 'scan':
        result = await scanPlugins(supabaseClient, options);
        break;
      case 'analyze':
        result = await analyzePlugin(supabaseClient, plugin_id, options);
        break;
      case 'stress_test':
        result = await runStressTests(supabaseClient, plugin_id, options);
        break;
      case 'conflict_check':
        result = await detectConflicts(supabaseClient, options);
        break;
      case 'risk_assess':
        result = await assessRisk(supabaseClient, plugin_id, options);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Plugin Stress Watchdog Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function scanPlugins(supabaseClient: any, options?: any) {
  console.log('Scanning for plugins...');
  
  // Simulate plugin detection
  const detectedPlugins = [
    {
      name: 'CamerPulse Intelligence Core',
      author: 'Ashen System',
      version: '2.1.0',
      type: 'module',
      file_paths: [
        'src/pages/CamerPulseIntelligence.tsx',
        'src/components/AI/CivicFusionCore.tsx',
        'src/components/AI/LocalSentimentMapper.tsx'
      ],
      routes_introduced: ['/camerpulse-intelligence', '/sentiment-analytics'],
      dependencies_used: { react: '^18.3.1', recharts: '^3.1.0' },
      api_endpoints: ['/functions/v1/camerpulse-processor'],
      database_migrations: ['camerpulse_intelligence_*'],
      global_variables: ['CAMERPULSE_CONFIG'],
      component_overrides: [],
      css_overrides: ['sentiment-heatmap.css']
    },
    {
      name: 'Civic Officials Directory',
      author: 'Government Module',
      version: '1.5.2',
      type: 'component',
      file_paths: [
        'src/components/Politicians/PoliticianCard.tsx',
        'src/components/Politicians/PoliticianDetailModal.tsx'
      ],
      routes_introduced: ['/politicians', '/officials'],
      dependencies_used: { lucide: '^0.462.0' },
      api_endpoints: ['/functions/v1/assembly-scraper'],
      database_migrations: ['politicians_*'],
      global_variables: ['POLITICIAN_CONFIG'],
      component_overrides: ['PoliticianCard'],
      css_overrides: []
    },
    {
      name: 'Marketplace System',
      author: 'Commerce Module',
      version: '1.0.8',
      type: 'module',
      file_paths: [
        'src/pages/Marketplace.tsx',
        'src/components/Marketplace/ProductCard.tsx',
        'src/components/Marketplace/VendorRegistration.tsx'
      ],
      routes_introduced: ['/marketplace', '/vendor-register'],
      dependencies_used: { stripe: '^8.0.0' },
      api_endpoints: ['/functions/v1/create-payment', '/functions/v1/verify-payment'],
      database_migrations: ['marketplace_*', 'orders_*'],
      global_variables: ['STRIPE_CONFIG'],
      component_overrides: [],
      css_overrides: ['marketplace.css']
    }
  ];

  // Register plugins in database
  for (const plugin of detectedPlugins) {
    const { data: existingPlugin } = await supabaseClient
      .from('plugin_registry')
      .select('id')
      .eq('plugin_name', plugin.name)
      .single();

    if (!existingPlugin) {
      const { error } = await supabaseClient
        .from('plugin_registry')
        .insert({
          plugin_name: plugin.name,
          plugin_author: plugin.author,
          plugin_version: plugin.version,
          plugin_type: plugin.type,
          file_paths: plugin.file_paths,
          routes_introduced: plugin.routes_introduced,
          dependencies_used: plugin.dependencies_used,
          api_endpoints: plugin.api_endpoints,
          database_migrations: plugin.database_migrations,
          global_variables: plugin.global_variables,
          component_overrides: plugin.component_overrides,
          css_overrides: plugin.css_overrides,
          plugin_status: 'active',
          plugin_risk_score: 25 // Initial safe score
        });

      if (error) {
        console.error('Error registering plugin:', plugin.name, error);
      } else {
        console.log('Registered plugin:', plugin.name);
      }
    }
  }

  return {
    success: true,
    plugins_scanned: detectedPlugins.length,
    plugins_registered: detectedPlugins.length
  };
}

async function analyzePlugin(supabaseClient: any, pluginId?: string, options?: any) {
  if (!pluginId) {
    throw new Error('Plugin ID is required for analysis');
  }

  console.log('Analyzing plugin:', pluginId);

  // Get plugin details
  const { data: plugin, error: pluginError } = await supabaseClient
    .from('plugin_registry')
    .select('*')
    .eq('id', pluginId)
    .single();

  if (pluginError || !plugin) {
    throw new Error('Plugin not found');
  }

  // Simulate analysis
  const analysisResults = {
    security_analysis: {
      score: Math.floor(Math.random() * 30) + 70, // 70-100
      issues: [],
      recommendations: ['Regular security updates', 'Input validation review']
    },
    performance_analysis: {
      score: Math.floor(Math.random() * 40) + 60, // 60-100
      memory_usage: Math.floor(Math.random() * 100) + 50,
      load_time: Math.floor(Math.random() * 500) + 200,
      recommendations: ['Optimize image loading', 'Implement lazy loading']
    },
    compatibility_analysis: {
      score: Math.floor(Math.random() * 20) + 80, // 80-100
      conflicts: [],
      dependencies_check: 'passed'
    }
  };

  // Create risk assessment
  const overall_risk_score = Math.floor(
    (analysisResults.security_analysis.score + 
     analysisResults.performance_analysis.score + 
     analysisResults.compatibility_analysis.score) / 3
  );

  await supabaseClient
    .from('plugin_risk_assessments')
    .insert({
      plugin_id: pluginId,
      security_score: analysisResults.security_analysis.score,
      stability_score: analysisResults.performance_analysis.score,
      performance_score: analysisResults.performance_analysis.score,
      compatibility_score: analysisResults.compatibility_analysis.score,
      overall_risk_score: 100 - overall_risk_score, // Invert for risk
      risk_factors: [],
      recommendations: [
        ...analysisResults.security_analysis.recommendations,
        ...analysisResults.performance_analysis.recommendations
      ]
    });

  return {
    success: true,
    plugin_id: pluginId,
    analysis_results: analysisResults,
    overall_risk_score: 100 - overall_risk_score
  };
}

async function runStressTests(supabaseClient: any, pluginId?: string, options?: any) {
  if (!pluginId) {
    throw new Error('Plugin ID is required for stress testing');
  }

  console.log('Running stress tests for plugin:', pluginId);

  const testTypes = ['load_test', 'ui_test', 'mobile_test', 'network_test'];
  const deviceTypes = ['desktop', 'mobile', 'tablet'];
  const networkConditions = ['3g', '4g', '5g', 'wifi'];
  
  const testResults = [];

  for (const testType of testTypes) {
    for (const deviceType of deviceTypes) {
      for (const networkCondition of networkConditions) {
        // Simulate test execution
        const testResult = {
          plugin_id: pluginId,
          test_type: testType,
          test_scenario: `${testType} on ${deviceType} with ${networkCondition}`,
          device_type: deviceType,
          network_condition: networkCondition,
          screen_resolution: deviceType === 'mobile' ? '375x667' : '1920x1080',
          test_duration_ms: Math.floor(Math.random() * 5000) + 1000,
          memory_usage_mb: Math.floor(Math.random() * 200) + 50,
          cpu_usage_percent: Math.floor(Math.random() * 60) + 20,
          render_time_ms: Math.floor(Math.random() * 1000) + 100,
          error_count: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
          crash_detected: Math.random() > 0.95,
          memory_leak_detected: Math.random() > 0.9,
          test_result: Math.random() > 0.85 ? 'passed' : (Math.random() > 0.7 ? 'warning' : 'failed'),
          performance_score: Math.floor(Math.random() * 40) + 60,
          test_details: {
            load_time: Math.floor(Math.random() * 2000) + 500,
            interactions_tested: Math.floor(Math.random() * 10) + 5,
            api_calls_made: Math.floor(Math.random() * 20) + 1
          },
          error_logs: Math.random() > 0.8 ? ['Minor rendering issue', 'Delayed API response'] : []
        };

        testResults.push(testResult);

        // Insert into database
        await supabaseClient
          .from('plugin_stress_tests')
          .insert(testResult);
      }
    }
  }

  return {
    success: true,
    plugin_id: pluginId,
    tests_run: testResults.length,
    passed: testResults.filter(t => t.test_result === 'passed').length,
    warnings: testResults.filter(t => t.test_result === 'warning').length,
    failed: testResults.filter(t => t.test_result === 'failed').length
  };
}

async function detectConflicts(supabaseClient: any, options?: any) {
  console.log('Detecting plugin conflicts...');

  // Get all active plugins
  const { data: plugins, error } = await supabaseClient
    .from('plugin_registry')
    .select('*')
    .eq('plugin_status', 'active');

  if (error || !plugins) {
    throw new Error('Failed to get plugins for conflict detection');
  }

  const conflicts = [];

  // Check for route conflicts
  const routeMap = new Map();
  plugins.forEach(plugin => {
    plugin.routes_introduced?.forEach((route: string) => {
      if (routeMap.has(route)) {
        conflicts.push({
          plugin_a_id: routeMap.get(route),
          plugin_b_id: plugin.id,
          conflict_type: 'route_collision',
          conflict_severity: 'high',
          conflict_description: `Both plugins use route: ${route}`,
          affected_resources: [route],
          resolution_suggestion: 'Use different route paths or implement route namespacing'
        });
      } else {
        routeMap.set(route, plugin.id);
      }
    });
  });

  // Check for component override conflicts
  const componentMap = new Map();
  plugins.forEach(plugin => {
    plugin.component_overrides?.forEach((component: string) => {
      if (componentMap.has(component)) {
        conflicts.push({
          plugin_a_id: componentMap.get(component),
          plugin_b_id: plugin.id,
          conflict_type: 'component_override',
          conflict_severity: 'medium',
          conflict_description: `Both plugins override component: ${component}`,
          affected_resources: [component],
          resolution_suggestion: 'Use different component names or implement proper component composition'
        });
      } else {
        componentMap.set(component, plugin.id);
      }
    });
  });

  // Insert conflicts into database
  for (const conflict of conflicts) {
    await supabaseClient
      .from('plugin_conflicts')
      .insert(conflict);
  }

  return {
    success: true,
    conflicts_detected: conflicts.length,
    route_conflicts: conflicts.filter(c => c.conflict_type === 'route_collision').length,
    component_conflicts: conflicts.filter(c => c.conflict_type === 'component_override').length
  };
}

async function assessRisk(supabaseClient: any, pluginId?: string, options?: any) {
  if (!pluginId) {
    throw new Error('Plugin ID is required for risk assessment');
  }

  console.log('Assessing risk for plugin:', pluginId);

  // Calculate risk score using the database function
  const { data: riskData, error } = await supabaseClient
    .rpc('calculate_plugin_risk_score', { p_plugin_id: pluginId });

  if (error) {
    console.error('Error calculating risk score:', error);
    throw new Error('Failed to calculate risk score');
  }

  const riskScore = riskData || 50;

  // Determine risk level
  let riskLevel = 'medium';
  if (riskScore <= 30) riskLevel = 'low';
  else if (riskScore >= 70) riskLevel = 'high';

  // Check if installation should be blocked
  const { data: config } = await supabaseClient
    .from('ashen_monitoring_config')
    .select('config_value')
    .eq('config_key', 'plugin_risk_threshold')
    .single();

  const riskThreshold = config ? parseInt(config.config_value) : 70;
  const shouldBlock = riskScore >= riskThreshold;

  if (shouldBlock) {
    // Update installation guard
    await supabaseClient
      .from('plugin_installation_guards')
      .upsert({
        plugin_id: pluginId,
        installation_blocked: true,
        block_reason: `Risk score ${riskScore} exceeds threshold ${riskThreshold}`,
        admin_override_required: true
      });
  }

  return {
    success: true,
    plugin_id: pluginId,
    risk_score: riskScore,
    risk_level: riskLevel,
    installation_blocked: shouldBlock,
    threshold: riskThreshold,
    recommendations: [
      riskScore > 50 ? 'Consider additional testing before deployment' : 'Plugin appears stable',
      'Monitor performance metrics regularly',
      'Keep dependencies updated'
    ]
  };
}