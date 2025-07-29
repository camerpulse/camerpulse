import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface RefreshConfig {
  id: string;
  platform: string;
  endpoint: string;
  base_interval_minutes: number;
  current_interval_minutes: number;
  rate_limit_per_hour: number;
  rate_limit_remaining: number;
  rate_limit_reset_time: string;
  is_active: boolean;
  last_success: string;
  last_failure?: string;
  consecutive_failures: number;
  total_requests_today: number;
  adaptive_multiplier: number;
  health_status: 'healthy' | 'degraded' | 'failing' | 'disabled';
}

interface PlatformMetrics {
  platform: string;
  requests_count: number;
  success_count: number;
  failure_count: number;
  avg_response_time_ms: number;
  data_volume_processed: number;
  last_data_fetch: string;
  rate_limit_hits: number;
}

interface RefreshSession {
  id: string;
  started_at: string;
  completed_at?: string;
  platforms_attempted: string[];
  platforms_succeeded: string[];
  platforms_failed: string[];
  total_data_fetched: number;
  errors_encountered: any[];
  performance_metrics: Record<string, any>;
}

// Default platform configurations
const DEFAULT_PLATFORM_CONFIGS: Partial<RefreshConfig>[] = [
  {
    platform: 'twitter',
    endpoint: 'camerpulse-twitter',
    base_interval_minutes: 5,
    rate_limit_per_hour: 300,
    adaptive_multiplier: 1.0
  },
  {
    platform: 'facebook',
    endpoint: 'camerpulse-social-apis',
    base_interval_minutes: 8,
    rate_limit_per_hour: 200,
    adaptive_multiplier: 1.0
  },
  {
    platform: 'tiktok',
    endpoint: 'camerpulse-social-apis',
    base_interval_minutes: 10,
    rate_limit_per_hour: 100,
    adaptive_multiplier: 1.0
  },
  {
    platform: 'google_trends',
    endpoint: 'camerpulse-social-apis',
    base_interval_minutes: 15,
    rate_limit_per_hour: 100,
    adaptive_multiplier: 1.0
  }
];

// Initialize refresh configurations
async function initializePlatformConfigs(): Promise<RefreshConfig[]> {
  console.log('Initializing platform refresh configurations...');
  
  const configs: RefreshConfig[] = [];
  
  for (const defaultConfig of DEFAULT_PLATFORM_CONFIGS) {
    const config: RefreshConfig = {
      id: crypto.randomUUID(),
      platform: defaultConfig.platform!,
      endpoint: defaultConfig.endpoint!,
      base_interval_minutes: defaultConfig.base_interval_minutes!,
      current_interval_minutes: defaultConfig.base_interval_minutes!,
      rate_limit_per_hour: defaultConfig.rate_limit_per_hour!,
      rate_limit_remaining: defaultConfig.rate_limit_per_hour!,
      rate_limit_reset_time: new Date(Date.now() + 3600000).toISOString(),
      is_active: true,
      last_success: new Date().toISOString(),
      consecutive_failures: 0,
      total_requests_today: 0,
      adaptive_multiplier: defaultConfig.adaptive_multiplier!,
      health_status: 'healthy'
    };
    
    configs.push(config);
  }
  
  // Store configurations in database
  await storeRefreshConfigs(configs);
  
  return configs;
}

// Store refresh configurations
async function storeRefreshConfigs(configs: RefreshConfig[]) {
  try {
    for (const config of configs) {
      await supabase
        .from('camerpulse_intelligence_config')
        .upsert({
          config_key: `refresh_engine_${config.platform}`,
          config_type: 'refresh_config',
          config_value: config,
          description: `Autonomous refresh configuration for ${config.platform}`,
          auto_updated: true
        }, {
          onConflict: 'config_key'
        });
    }
    
    console.log('Stored refresh configurations for', configs.length, 'platforms');
  } catch (error) {
    console.error('Error storing refresh configs:', error);
    throw error;
  }
}

// Load refresh configurations
async function loadRefreshConfigs(): Promise<RefreshConfig[]> {
  try {
    const { data, error } = await supabase
      .from('camerpulse_intelligence_config')
      .select('config_value')
      .eq('config_type', 'refresh_config')
      .like('config_key', 'refresh_engine_%');

    if (error) throw error;

    if (!data || data.length === 0) {
      console.log('No refresh configs found, initializing defaults...');
      return await initializePlatformConfigs();
    }

    return data.map(item => item.config_value as RefreshConfig);
  } catch (error) {
    console.error('Error loading refresh configs:', error);
    return await initializePlatformConfigs();
  }
}

// Check rate limits and adjust frequency
function calculateAdaptiveInterval(config: RefreshConfig): number {
  let multiplier = config.adaptive_multiplier;
  
  // Increase interval if failing consecutively
  if (config.consecutive_failures > 3) {
    multiplier *= 2.0; // Double the interval
  } else if (config.consecutive_failures > 1) {
    multiplier *= 1.5; // Increase by 50%
  }
  
  // Decrease interval if performing well
  if (config.consecutive_failures === 0 && config.health_status === 'healthy') {
    multiplier = Math.max(0.8, multiplier * 0.95); // Gradually decrease
  }
  
  // Check rate limit constraints
  const hoursUntilReset = new Date(config.rate_limit_reset_time).getTime() - Date.now();
  const requestsPerHour = 3600000 / (config.current_interval_minutes * 60000);
  
  if (requestsPerHour > config.rate_limit_remaining && hoursUntilReset > 0) {
    // Need to slow down to stay within rate limits
    const maxInterval = (hoursUntilReset / config.rate_limit_remaining) / 60000;
    multiplier = Math.max(multiplier, maxInterval / config.base_interval_minutes);
  }
  
  const newInterval = Math.max(3, Math.min(60, config.base_interval_minutes * multiplier));
  
  return Math.round(newInterval);
}

// Execute refresh for a specific platform
async function refreshPlatformData(config: RefreshConfig): Promise<{
  success: boolean;
  data_count: number;
  response_time_ms: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    console.log(`Refreshing ${config.platform} data...`);
    
    let response;
    let actionParam = '';
    
    switch (config.platform) {
      case 'twitter':
        actionParam = 'monitor_twitter';
        break;
      case 'facebook':
        actionParam = 'search_facebook';
        break;
      case 'tiktok':
        actionParam = 'scrape_tiktok';
        break;
      case 'google_trends':
        actionParam = 'get_google_trends';
        break;
      default:
        actionParam = 'monitor_all_platforms';
    }
    
    // Call the appropriate endpoint
    response = await supabase.functions.invoke(config.endpoint, {
      body: { 
        action: actionParam,
        // Platform-specific parameters
        ...(config.platform === 'facebook' && { query: 'Cameroon', limit: 50 }),
        ...(config.platform === 'tiktok' && { hashtag: 'Cameroon', limit: 30 }),
        ...(config.platform === 'google_trends' && { 
          keywords: ['Cameroon', 'Paul Biya', 'Election'], 
          region: 'CM' 
        })
      }
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    const dataCount = response.data?.count || response.data?.processed || 
                     response.data?.posts?.length || response.data?.tweets?.length || 0;
    
    // Log successful refresh
    await logRefreshActivity(config.platform, 'success', {
      data_count: dataCount,
      response_time_ms: responseTime,
      endpoint: config.endpoint,
      action: actionParam
    });
    
    return {
      success: true,
      data_count: dataCount,
      response_time_ms: responseTime
    };
    
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    console.error(`Error refreshing ${config.platform}:`, error.message);
    
    // Log failed refresh
    await logRefreshActivity(config.platform, 'failure', {
      error: error.message,
      response_time_ms: responseTime,
      endpoint: config.endpoint
    });
    
    return {
      success: false,
      data_count: 0,
      response_time_ms: responseTime,
      error: error.message
    };
  }
}

// Log refresh activity
async function logRefreshActivity(platform: string, status: 'success' | 'failure', metadata: any) {
  try {
    await supabase
      .from('camerpulse_intelligence_learning_logs')
      .insert({
        learning_type: 'autonomous_refresh',
        input_data: {
          platform,
          status,
          timestamp: new Date().toISOString(),
          ...metadata
        },
        confidence_improvement: status === 'success' ? 0.05 : -0.1,
        pattern_identified: `${platform}_${status}`,
        applied_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error logging refresh activity:', error);
  }
}

// Update configuration after refresh attempt
async function updateConfigAfterRefresh(
  config: RefreshConfig, 
  result: { success: boolean; data_count: number; response_time_ms: number; error?: string }
): Promise<RefreshConfig> {
  
  const updatedConfig = { ...config };
  
  if (result.success) {
    updatedConfig.last_success = new Date().toISOString();
    updatedConfig.consecutive_failures = 0;
    updatedConfig.health_status = 'healthy';
    updatedConfig.rate_limit_remaining = Math.max(0, updatedConfig.rate_limit_remaining - 1);
    
    // Adapt based on data volume
    if (result.data_count > 50) {
      updatedConfig.adaptive_multiplier = Math.max(0.8, updatedConfig.adaptive_multiplier * 0.95);
    } else if (result.data_count < 10) {
      updatedConfig.adaptive_multiplier = Math.min(2.0, updatedConfig.adaptive_multiplier * 1.1);
    }
    
  } else {
    updatedConfig.last_failure = new Date().toISOString();
    updatedConfig.consecutive_failures += 1;
    
    // Determine health status
    if (updatedConfig.consecutive_failures >= 5) {
      updatedConfig.health_status = 'failing';
      updatedConfig.is_active = false; // Temporarily disable
    } else if (updatedConfig.consecutive_failures >= 3) {
      updatedConfig.health_status = 'degraded';
    }
    
    // Increase interval on failures
    updatedConfig.adaptive_multiplier = Math.min(3.0, updatedConfig.adaptive_multiplier * 1.5);
  }
  
  // Calculate new interval
  updatedConfig.current_interval_minutes = calculateAdaptiveInterval(updatedConfig);
  
  // Reset rate limits if time has passed
  if (new Date() > new Date(updatedConfig.rate_limit_reset_time)) {
    updatedConfig.rate_limit_remaining = updatedConfig.rate_limit_per_hour;
    updatedConfig.rate_limit_reset_time = new Date(Date.now() + 3600000).toISOString();
  }
  
  updatedConfig.total_requests_today += 1;
  
  // Store updated config
  await supabase
    .from('camerpulse_intelligence_config')
    .update({
      config_value: updatedConfig,
      updated_at: new Date().toISOString()
    })
    .eq('config_key', `refresh_engine_${config.platform}`);
    
  return updatedConfig;
}

// Check platform health and send alerts
async function checkPlatformHealth(configs: RefreshConfig[]) {
  const failingPlatforms = configs.filter(c => c.health_status === 'failing' || c.consecutive_failures >= 3);
  
  if (failingPlatforms.length > 0) {
    const alertData = {
      alert_type: 'platform_failure',
      severity: failingPlatforms.length > 2 ? 'critical' : 'high',
      title: `${failingPlatforms.length} Platform(s) Experiencing Issues`,
      description: `The following platforms are failing: ${failingPlatforms.map(p => p.platform).join(', ')}`,
      affected_regions: ['National'],
      auto_generated: true,
      recommended_actions: [
        'Check API credentials and rate limits',
        'Verify network connectivity',
        'Review platform status pages',
        'Consider temporary manual data collection'
      ],
      sentiment_data: {
        platforms_failing: failingPlatforms.map(p => ({
          platform: p.platform,
          consecutive_failures: p.consecutive_failures,
          last_error: p.last_failure
        }))
      }
    };
    
    await supabase
      .from('camerpulse_intelligence_alerts')
      .insert(alertData);
      
    console.log('Alert created for failing platforms:', failingPlatforms.map(p => p.platform));
  }
}

// Execute full refresh cycle
async function executeRefreshCycle(): Promise<RefreshSession> {
  const session: RefreshSession = {
    id: crypto.randomUUID(),
    started_at: new Date().toISOString(),
    platforms_attempted: [],
    platforms_succeeded: [],
    platforms_failed: [],
    total_data_fetched: 0,
    errors_encountered: [],
    performance_metrics: {}
  };
  
  console.log('Starting autonomous refresh cycle:', session.id);
  
  try {
    // Load current configurations
    const configs = await loadRefreshConfigs();
    const activeConfigs = configs.filter(c => c.is_active);
    
    console.log(`Found ${activeConfigs.length} active platform configs`);
    
    // Check which platforms are due for refresh
    const dueConfigs = activeConfigs.filter(config => {
      const lastSuccess = new Date(config.last_success).getTime();
      const intervalMs = config.current_interval_minutes * 60 * 1000;
      const nextRefreshTime = lastSuccess + intervalMs;
      
      return Date.now() >= nextRefreshTime;
    });
    
    console.log(`${dueConfigs.length} platforms due for refresh`);
    
    // Execute refreshes with staggered timing
    for (const config of dueConfigs) {
      session.platforms_attempted.push(config.platform);
      
      const result = await refreshPlatformData(config);
      const updatedConfig = await updateConfigAfterRefresh(config, result);
      
      if (result.success) {
        session.platforms_succeeded.push(config.platform);
        session.total_data_fetched += result.data_count;
      } else {
        session.platforms_failed.push(config.platform);
        session.errors_encountered.push({
          platform: config.platform,
          error: result.error,
          timestamp: new Date().toISOString()
        });
      }
      
      session.performance_metrics[config.platform] = {
        response_time_ms: result.response_time_ms,
        data_count: result.data_count,
        new_interval_minutes: updatedConfig.current_interval_minutes,
        health_status: updatedConfig.health_status
      };
      
      // Stagger requests to avoid overwhelming APIs
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Check overall health and send alerts if needed
    await checkPlatformHealth(configs);
    
    session.completed_at = new Date().toISOString();
    
    console.log('Refresh cycle completed:', {
      attempted: session.platforms_attempted.length,
      succeeded: session.platforms_succeeded.length,
      failed: session.platforms_failed.length,
      total_data: session.total_data_fetched
    });
    
  } catch (error: any) {
    console.error('Error in refresh cycle:', error);
    session.errors_encountered.push({
      type: 'cycle_error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
  
  // Log session to database
  await logRefreshSession(session);
  
  return session;
}

// Log refresh session
async function logRefreshSession(session: RefreshSession) {
  try {
    await supabase
      .from('camerpulse_intelligence_learning_logs')
      .insert({
        learning_type: 'refresh_session',
        input_data: session,
        confidence_improvement: session.platforms_succeeded.length > session.platforms_failed.length ? 0.1 : -0.05,
        pattern_identified: `session_${session.platforms_succeeded.length}_${session.platforms_failed.length}`,
        applied_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error logging refresh session:', error);
  }
}

// Get refresh engine status
async function getRefreshEngineStatus() {
  try {
    const configs = await loadRefreshConfigs();
    
    // Get recent refresh logs
    const { data: recentLogs } = await supabase
      .from('camerpulse_intelligence_learning_logs')
      .select('*')
      .in('learning_type', ['autonomous_refresh', 'refresh_session'])
      .order('created_at', { ascending: false })
      .limit(50);
    
    const status = {
      engine_status: 'active',
      platforms: configs.map(config => ({
        platform: config.platform,
        health_status: config.health_status,
        is_active: config.is_active,
        current_interval_minutes: config.current_interval_minutes,
        consecutive_failures: config.consecutive_failures,
        last_success: config.last_success,
        rate_limit_remaining: config.rate_limit_remaining,
        adaptive_multiplier: config.adaptive_multiplier
      })),
      recent_activity: recentLogs || [],
      summary: {
        total_platforms: configs.length,
        healthy_platforms: configs.filter(c => c.health_status === 'healthy').length,
        degraded_platforms: configs.filter(c => c.health_status === 'degraded').length,
        failing_platforms: configs.filter(c => c.health_status === 'failing').length,
        average_interval: configs.reduce((acc, c) => acc + c.current_interval_minutes, 0) / configs.length
      }
    };
    
    return status;
  } catch (error) {
    console.error('Error getting refresh engine status:', error);
    throw error;
  }
}

// Reset platform health
async function resetPlatformHealth(platform: string) {
  try {
    const configs = await loadRefreshConfigs();
    const config = configs.find(c => c.platform === platform);
    
    if (!config) {
      throw new Error(`Platform ${platform} not found`);
    }
    
    const resetConfig = {
      ...config,
      health_status: 'healthy' as const,
      is_active: true,
      consecutive_failures: 0,
      adaptive_multiplier: 1.0,
      current_interval_minutes: config.base_interval_minutes
    };
    
    await supabase
      .from('camerpulse_intelligence_config')
      .update({
        config_value: resetConfig,
        updated_at: new Date().toISOString()
      })
      .eq('config_key', `refresh_engine_${platform}`);
    
    console.log(`Reset health status for platform: ${platform}`);
    return resetConfig;
  } catch (error) {
    console.error('Error resetting platform health:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();

    switch (action) {
      case 'execute_refresh_cycle':
        const session = await executeRefreshCycle();
        return new Response(JSON.stringify({
          success: true,
          message: 'Refresh cycle completed',
          session
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_status':
        const status = await getRefreshEngineStatus();
        return new Response(JSON.stringify({
          success: true,
          status
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'reset_platform':
        const { platform } = params;
        const resetConfig = await resetPlatformHealth(platform);
        return new Response(JSON.stringify({
          success: true,
          message: `Platform ${platform} health reset`,
          config: resetConfig
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'initialize_configs':
        const configs = await initializePlatformConfigs();
        return new Response(JSON.stringify({
          success: true,
          message: 'Platform configurations initialized',
          configs
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ 
          error: 'Unknown action. Available: execute_refresh_cycle, get_status, reset_platform, initialize_configs' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error: any) {
    console.error('Error in autonomous-refresh-engine:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});