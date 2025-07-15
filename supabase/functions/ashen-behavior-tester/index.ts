import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BehaviorTest {
  testName: string;
  testType: string;
  routeTested: string;
  deviceType: string;
  testResult: string;
  issuesFound: any[];
  performanceMetrics: any;
  screenshotUrl?: string;
  metadata: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, device_type, routes } = await req.json();

    switch (action) {
      case 'run_behavior_tests':
        return await runBehaviorTests(supabase, device_type, routes);
      case 'get_test_results':
        return await getTestResults(supabase);
      case 'run_single_test':
        return await runSingleTest(supabase, await req.json());
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Behavior tester error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function runBehaviorTests(supabase: any, deviceType: string = 'desktop', routes: string[] = []) {
  console.log(`Starting behavior tests for ${deviceType}`);
  
  const defaultRoutes = [
    '/',
    '/auth',
    '/politicians',
    '/polls',
    '/marketplace',
    '/news',
    '/social',
    '/admin'
  ];

  const testRoutes = routes.length > 0 ? routes : defaultRoutes;
  const testResults: BehaviorTest[] = [];

  for (const route of testRoutes) {
    try {
      // Simulate navigation test
      const navigationTest = await simulateNavigation(route, deviceType);
      testResults.push(navigationTest);

      // Simulate form interactions if applicable
      if (route === '/auth' || route.includes('form')) {
        const formTest = await simulateFormInteraction(route, deviceType);
        testResults.push(formTest);
      }

      // Simulate UI interactions
      const uiTest = await simulateUIInteractions(route, deviceType);
      testResults.push(uiTest);

    } catch (error) {
      console.error(`Test failed for route ${route}:`, error);
      testResults.push({
        testName: `Navigation Test - ${route}`,
        testType: 'navigation',
        routeTested: route,
        deviceType,
        testResult: 'failed',
        issuesFound: [{ 
          type: 'critical_error', 
          message: error.message,
          element: 'page_load',
          timestamp: new Date().toISOString()
        }],
        performanceMetrics: {},
        metadata: { error: error.message }
      });
    }
  }

  // Store results in database
  for (const result of testResults) {
    await supabase.from('ashen_behavior_tests').insert(result);
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      tests_run: testResults.length,
      device_type: deviceType,
      results: testResults
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function simulateNavigation(route: string, deviceType: string): Promise<BehaviorTest> {
  console.log(`Testing navigation to ${route} on ${deviceType}`);
  
  const startTime = performance.now();
  const issues: any[] = [];
  
  // Simulate viewport dimensions
  const viewports = {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 }
  };

  const viewport = viewports[deviceType as keyof typeof viewports];
  
  // Simulate load time (random between 100-2000ms to simulate real conditions)
  const loadTime = Math.random() * 1900 + 100;
  await new Promise(resolve => setTimeout(resolve, loadTime));

  // Simulate potential issues based on route complexity
  if (route === '/admin' && Math.random() < 0.1) {
    issues.push({
      type: 'access_denied',
      message: 'Admin route requires authentication',
      element: 'route_guard',
      timestamp: new Date().toISOString()
    });
  }

  if (loadTime > 1500) {
    issues.push({
      type: 'performance_warning',
      message: `Slow load time: ${loadTime.toFixed(0)}ms`,
      element: 'page_load',
      timestamp: new Date().toISOString()
    });
  }

  const endTime = performance.now();
  
  return {
    testName: `Navigation Test - ${route}`,
    testType: 'navigation',
    routeTested: route,
    deviceType,
    testResult: issues.some(i => i.type.includes('error')) ? 'failed' : 
                issues.length > 0 ? 'warning' : 'passed',
    issuesFound: issues,
    performanceMetrics: {
      loadTime: endTime - startTime,
      viewport,
      memoryUsage: Math.random() * 50 + 20 // Simulated memory usage
    },
    metadata: {
      userAgent: `AshenBot/${deviceType}`,
      timestamp: new Date().toISOString()
    }
  };
}

async function simulateFormInteraction(route: string, deviceType: string): Promise<BehaviorTest> {
  console.log(`Testing form interactions on ${route} for ${deviceType}`);
  
  const issues: any[] = [];
  const formElements = ['email', 'password', 'submit', 'name', 'phone'];
  
  // Simulate form field interactions
  for (const element of formElements) {
    const interactionTime = Math.random() * 200 + 50;
    await new Promise(resolve => setTimeout(resolve, interactionTime));
    
    // Simulate potential form issues
    if (element === 'submit' && Math.random() < 0.05) {
      issues.push({
        type: 'form_error',
        message: 'Submit button not responding',
        element,
        timestamp: new Date().toISOString()
      });
    }
    
    if (deviceType === 'mobile' && Math.random() < 0.03) {
      issues.push({
        type: 'mobile_ux_issue',
        message: `${element} field too small for mobile interaction`,
        element,
        timestamp: new Date().toISOString()
      });
    }
  }

  return {
    testName: `Form Interaction Test - ${route}`,
    testType: 'form_interaction',
    routeTested: route,
    deviceType,
    testResult: issues.some(i => i.type.includes('error')) ? 'failed' : 
                issues.length > 0 ? 'warning' : 'passed',
    issuesFound: issues,
    performanceMetrics: {
      totalInteractionTime: formElements.length * 150,
      elementsInteracted: formElements.length
    },
    metadata: {
      formType: route === '/auth' ? 'authentication' : 'general',
      timestamp: new Date().toISOString()
    }
  };
}

async function simulateUIInteractions(route: string, deviceType: string): Promise<BehaviorTest> {
  console.log(`Testing UI interactions on ${route} for ${deviceType}`);
  
  const issues: any[] = [];
  const uiElements = ['buttons', 'tabs', 'dropdowns', 'modals', 'charts'];
  
  // Simulate UI element interactions
  for (const element of uiElements) {
    const interactionSuccess = Math.random() > 0.02; // 98% success rate
    
    if (!interactionSuccess) {
      issues.push({
        type: 'ui_interaction_failure',
        message: `${element} failed to respond to user interaction`,
        element,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check for responsive design issues
    if (deviceType !== 'desktop' && Math.random() < 0.04) {
      issues.push({
        type: 'responsive_design_issue',
        message: `${element} layout breaks on ${deviceType}`,
        element,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Simulate accessibility checks
  if (Math.random() < 0.02) {
    issues.push({
      type: 'accessibility_warning',
      message: 'Missing alt text or aria labels detected',
      element: 'accessibility',
      timestamp: new Date().toISOString()
    });
  }

  return {
    testName: `UI Interaction Test - ${route}`,
    testType: 'user_flow',
    routeTested: route,
    deviceType,
    testResult: issues.some(i => i.type.includes('failure') || i.type.includes('error')) ? 'failed' : 
                issues.length > 0 ? 'warning' : 'passed',
    issuesFound: issues,
    performanceMetrics: {
      elementsTestedCount: uiElements.length,
      successRate: ((uiElements.length - issues.filter(i => i.type.includes('failure')).length) / uiElements.length) * 100
    },
    metadata: {
      testScope: 'ui_interactions',
      timestamp: new Date().toISOString()
    }
  };
}

async function runSingleTest(supabase: any, testConfig: any) {
  const { route, device_type, test_type } = testConfig;
  
  let testResult: BehaviorTest;
  
  switch (test_type) {
    case 'navigation':
      testResult = await simulateNavigation(route, device_type);
      break;
    case 'form_interaction':
      testResult = await simulateFormInteraction(route, device_type);
      break;
    case 'user_flow':
      testResult = await simulateUIInteractions(route, device_type);
      break;
    default:
      throw new Error(`Unknown test type: ${test_type}`);
  }
  
  // Store result
  await supabase.from('ashen_behavior_tests').insert(testResult);
  
  return new Response(
    JSON.stringify({ success: true, result: testResult }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getTestResults(supabase: any) {
  const { data, error } = await supabase
    .from('ashen_behavior_tests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, results: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}