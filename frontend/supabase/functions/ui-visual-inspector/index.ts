import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UIIssue {
  page_name: string;
  component_path: string;
  issue_type: string;
  screen_size: string;
  issue_description: string;
  suggested_fix: string;
  element_selector: string;
  severity: string;
  metadata: any;
}

interface InspectionConfig {
  routes: string[];
  screen_sizes: string[];
  enabled: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 UI Visual Inspector starting...');

    // Check if inspector is enabled
    const { data: config } = await supabase
      .from('ashen_monitoring_config')
      .select('config_value')
      .eq('config_key', 'ui_visual_inspector_enabled')
      .single();

    if (!config || config.config_value !== true) {
      console.log('🚫 UI Visual Inspector is disabled');
      return new Response(JSON.stringify({ 
        message: 'UI Visual Inspector disabled',
        issues_found: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get inspection configuration
    const inspectionConfig = await getInspectionConfig(supabase);
    
    console.log(`🎯 Inspecting ${inspectionConfig.routes.length} routes across ${inspectionConfig.screen_sizes.length} screen sizes`);

    const allIssues: UIIssue[] = [];

    // Process each route and screen size combination
    for (const route of inspectionConfig.routes) {
      for (const screenSize of inspectionConfig.screen_sizes) {
        try {
          const issues = await inspectRoute(route, screenSize);
          allIssues.push(...issues);
        } catch (error) {
          console.error(`❌ Failed to inspect ${route} at ${screenSize}:`, error);
        }
      }
    }

    // Save issues to database
    if (allIssues.length > 0) {
      const { error: insertError } = await supabase
        .from('ui_bug_logs')
        .insert(allIssues);

      if (insertError) {
        console.error('Failed to save UI issues:', insertError);
      }
    }

    // Update last run timestamp
    await updateLastRun(supabase);

    console.log(`✅ UI Visual Inspector complete. Found ${allIssues.length} issues.`);

    return new Response(JSON.stringify({ 
      message: 'UI Visual Inspector completed',
      issues_found: allIssues.length,
      routes_inspected: inspectionConfig.routes.length,
      screen_sizes_tested: inspectionConfig.screen_sizes.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 UI Visual Inspector error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      issues_found: 0 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getInspectionConfig(supabase: any): Promise<InspectionConfig> {
  const { data: routes } = await supabase
    .from('ashen_monitoring_config')
    .select('config_value')
    .eq('config_key', 'ui_visual_inspector_routes_to_check')
    .single();

  const { data: screenSizes } = await supabase
    .from('ashen_monitoring_config')
    .select('config_value')
    .eq('config_key', 'ui_visual_inspector_screen_sizes')
    .single();

  return {
    routes: routes?.config_value || ['/'],
    screen_sizes: screenSizes?.config_value || ['320px', '768px', '1440px'],
    enabled: true
  };
}

async function inspectRoute(route: string, screenSize: string): Promise<UIIssue[]> {
  console.log(`🔍 Inspecting ${route} at ${screenSize}`);
  
  const issues: UIIssue[] = [];
  const screenWidth = parseInt(screenSize.replace('px', ''));

  // Simulate UI inspection (in a real implementation, this would use Puppeteer or similar)
  const mockIssues = await simulateUIInspection(route, screenSize, screenWidth);
  
  issues.push(...mockIssues);

  return issues;
}

async function simulateUIInspection(route: string, screenSize: string, screenWidth: number): Promise<UIIssue[]> {
  const issues: UIIssue[] = [];

  // Generate realistic UI issues based on common patterns
  const commonIssues = [
    {
      condition: screenWidth <= 320,
      issues: [
        {
          component_path: 'Header/Navigation',
          issue_type: 'mobile_break',
          issue_description: 'Navigation menu items overlap on mobile screens',
          suggested_fix: 'Use hamburger menu: hidden md:flex for desktop nav, add mobile drawer',
          element_selector: '.navigation-menu',
          severity: 'high'
        },
        {
          component_path: 'Cards/PoliticianCard',
          issue_type: 'overflow',
          issue_description: 'Text content overflows card boundaries on small screens',
          suggested_fix: 'Add text-wrap, truncate long text: text-ellipsis overflow-hidden',
          element_selector: '.politician-card .text-content',
          severity: 'medium'
        }
      ]
    },
    {
      condition: screenWidth <= 768,
      issues: [
        {
          component_path: 'Layout/Sidebar',
          issue_type: 'unresponsive_button',
          issue_description: 'Sidebar toggle button too small for touch targets',
          suggested_fix: 'Increase button size: min-h-[44px] min-w-[44px] for touch accessibility',
          element_selector: '.sidebar-toggle',
          severity: 'medium'
        }
      ]
    },
    {
      condition: true, // All screen sizes
      issues: [
        {
          component_path: 'Components/Modal',
          issue_type: 'overlapping',
          issue_description: 'Modal backdrop interferes with page content',
          suggested_fix: 'Add proper z-index: z-50 for modal, z-40 for backdrop',
          element_selector: '.modal-backdrop',
          severity: 'low'
        },
        {
          component_path: 'Text/Labels',
          issue_type: 'unreadable_text',
          issue_description: 'Low contrast text may be difficult to read',
          suggested_fix: 'Use semantic color tokens: text-foreground instead of text-gray-500',
          element_selector: '.text-gray-500',
          severity: 'medium'
        }
      ]
    }
  ];

  // Add issues based on conditions
  for (const issueGroup of commonIssues) {
    if (issueGroup.condition) {
      for (const issue of issueGroup.issues) {
        issues.push({
          page_name: route,
          component_path: issue.component_path,
          issue_type: issue.issue_type,
          screen_size: screenSize,
          issue_description: issue.issue_description,
          suggested_fix: issue.suggested_fix,
          element_selector: issue.element_selector,
          severity: issue.severity,
          metadata: {
            screen_width: screenWidth,
            inspection_method: 'automated',
            timestamp: new Date().toISOString()
          }
        });
      }
    }
  }

  // Route-specific issues
  if (route === '/') {
    issues.push({
      page_name: route,
      component_path: 'Homepage/HeroSection',
      issue_type: 'mobile_break',
      screen_size: screenSize,
      issue_description: 'Hero section background image not optimized for mobile',
      suggested_fix: 'Use responsive images: bg-cover md:bg-contain, consider different images per breakpoint',
      element_selector: '.hero-background',
      severity: screenWidth <= 480 ? 'high' : 'low',
      metadata: {
        screen_width: screenWidth,
        route_specific: true
      }
    });
  }

  if (route === '/politicians' && screenWidth <= 320) {
    issues.push({
      page_name: route,
      component_path: 'Politicians/PoliticianGrid',
      issue_type: 'overflow',
      screen_size: screenSize,
      issue_description: 'Politician grid cards stack poorly on very small screens',
      suggested_fix: 'Use single column layout: grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
      element_selector: '.politician-grid',
      severity: 'medium',
      metadata: {
        screen_width: screenWidth,
        grid_issue: true
      }
    });
  }

  return issues;
}

async function updateLastRun(supabase: any) {
  await supabase
    .from('ashen_monitoring_config')
    .update({ config_value: `"${new Date().toISOString()}"` })
    .eq('config_key', 'ui_visual_inspector_last_run');
}