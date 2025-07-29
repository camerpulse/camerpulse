import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, ...data } = await req.json();

    switch (action) {
      case 'run_simulation':
        return await runSimulation(supabase, data);
      case 'get_simulation_results':
        return await getSimulationResults(supabase, data);
      case 'get_replay_log':
        return await getReplayLog(supabase, data);
      case 'create_test_path':
        return await createTestPath(supabase, data);
      case 'get_device_configs':
        return await getDeviceConfigs(supabase);
      case 'get_test_paths':
        return await getTestPaths(supabase);
      case 'analyze_ux_flow':
        return await analyzeUXFlow(supabase, data);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (error) {
    console.error('Error in human-simulation-engine:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function runSimulation(supabase: any, data: any) {
  const { 
    testId, 
    deviceType = 'desktop',
    deviceModel,
    testPaths = [],
    simulationConfig = {}
  } = data;

  // Start simulation
  const { data: resultId, error: startError } = await supabase.rpc('run_ashen_simulation', {
    p_test_id: testId,
    p_device_type: deviceType,
    p_device_model: deviceModel
  });

  if (startError) {
    throw new Error(`Failed to start simulation: ${startError.message}`);
  }

  // Simulate human-like behavior
  const simulationSteps = await simulateHumanBehavior(supabase, resultId, testPaths, simulationConfig);
  
  // Calculate UX score
  const uxScore = calculateUXScore(simulationSteps);
  
  // Update simulation result
  const { error: updateError } = await supabase
    .from('ashen_simulation_results')
    .update({
      status: 'completed',
      ux_score: uxScore,
      test_duration_ms: simulationSteps.reduce((total: number, step: any) => total + step.duration, 0),
      errors_found: simulationSteps.filter((step: any) => step.error).length,
      warnings_found: simulationSteps.filter((step: any) => step.warning).length,
      results_summary: {
        steps_completed: simulationSteps.length,
        success_rate: (simulationSteps.filter((step: any) => !step.error).length / simulationSteps.length) * 100,
        performance_metrics: calculatePerformanceMetrics(simulationSteps)
      }
    })
    .eq('id', resultId);

  if (updateError) {
    console.error('Failed to update simulation result:', updateError);
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      resultId,
      uxScore,
      stepsCompleted: simulationSteps.length,
      message: `Simulation completed with UX score: ${uxScore}/100`
    }),
    { headers: corsHeaders }
  );
}

async function simulateHumanBehavior(supabase: any, resultId: string, testPaths: any[], config: any) {
  const steps = [];
  let stepNumber = 0;

  for (const path of testPaths) {
    for (const step of path.steps || []) {
      stepNumber++;
      
      const stepResult = await executeSimulationStep(step, stepNumber, config);
      
      // Log the step
      await supabase
        .from('ashen_simulation_replay_logs')
        .insert({
          result_id: resultId,
          step_number: stepNumber,
          action_type: step.action,
          target_element: step.target,
          coordinates: stepResult.coordinates,
          timestamp_ms: stepResult.timestamp,
          error_message: stepResult.error,
          action_data: {
            description: step.description,
            expected: step.expected,
            actual: stepResult.actual,
            text: step.text
          }
        });

      steps.push(stepResult);

      // Human-like delays
      await randomDelay(config.humanLikeDelay || { min: 100, max: 800 });
    }
  }

  return steps;
}

async function executeSimulationStep(step: any, stepNumber: number, config: any) {
  const startTime = Date.now();
  
  try {
    switch (step.action) {
      case 'navigate':
        return await simulateNavigation(step, startTime);
      case 'click':
        return await simulateClick(step, startTime);
      case 'type':
        return await simulateTyping(step, startTime);
      case 'scroll':
        return await simulateScroll(step, startTime);
      case 'wait':
        return await simulateWait(step, startTime);
      default:
        throw new Error(`Unknown action type: ${step.action}`);
    }
  } catch (error) {
    return {
      stepNumber,
      action: step.action,
      target: step.target,
      timestamp: Date.now() - startTime,
      duration: Date.now() - startTime,
      error: error.message,
      success: false
    };
  }
}

async function simulateNavigation(step: any, startTime: number) {
  // Simulate navigation with realistic timing
  await randomDelay({ min: 200, max: 1000 });
  
  return {
    action: 'navigate',
    target: step.target,
    timestamp: Date.now() - startTime,
    duration: Date.now() - startTime,
    success: true,
    actual: `Navigated to ${step.target}`
  };
}

async function simulateClick(step: any, startTime: number) {
  // Simulate human-like mouse movement and click
  const coordinates = {
    x: Math.floor(Math.random() * 1000) + 100,
    y: Math.floor(Math.random() * 600) + 100
  };
  
  await randomDelay({ min: 50, max: 300 });
  
  return {
    action: 'click',
    target: step.target,
    coordinates,
    timestamp: Date.now() - startTime,
    duration: Date.now() - startTime,
    success: true,
    actual: `Clicked ${step.target}`
  };
}

async function simulateTyping(step: any, startTime: number) {
  // Simulate human typing speed
  const text = step.text || '';
  const typingSpeed = Math.random() * 100 + 50; // 50-150ms per character
  
  await new Promise(resolve => setTimeout(resolve, text.length * typingSpeed));
  
  return {
    action: 'type',
    target: step.target,
    timestamp: Date.now() - startTime,
    duration: Date.now() - startTime,
    success: true,
    actual: `Typed "${text}" into ${step.target}`
  };
}

async function simulateScroll(step: any, startTime: number) {
  // Simulate scroll with momentum
  await randomDelay({ min: 200, max: 800 });
  
  return {
    action: 'scroll',
    target: step.target || 'page',
    timestamp: Date.now() - startTime,
    duration: Date.now() - startTime,
    success: true,
    actual: `Scrolled ${step.direction || 'down'}`
  };
}

async function simulateWait(step: any, startTime: number) {
  const waitTime = step.duration || 1000;
  await new Promise(resolve => setTimeout(resolve, waitTime));
  
  return {
    action: 'wait',
    target: 'page',
    timestamp: Date.now() - startTime,
    duration: waitTime,
    success: true,
    actual: `Waited ${waitTime}ms`
  };
}

function calculateUXScore(steps: any[]) {
  let score = 100;
  
  // Deduct points for errors
  const errorSteps = steps.filter(step => step.error);
  score -= errorSteps.length * 15;
  
  // Deduct points for slow performance
  const slowSteps = steps.filter(step => step.duration > 5000);
  score -= slowSteps.length * 5;
  
  // Bonus for successful completion
  const successRate = (steps.filter(step => step.success).length / steps.length) * 100;
  if (successRate > 95) score += 10;
  
  return Math.max(0, Math.min(100, score));
}

function calculatePerformanceMetrics(steps: any[]) {
  const durations = steps.map(step => step.duration);
  
  return {
    avgStepDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
    maxStepDuration: Math.max(...durations),
    minStepDuration: Math.min(...durations),
    totalDuration: durations.reduce((a, b) => a + b, 0)
  };
}

async function randomDelay(range: { min: number, max: number }) {
  const delay = Math.random() * (range.max - range.min) + range.min;
  await new Promise(resolve => setTimeout(resolve, delay));
}

async function getSimulationResults(supabase: any, data: any) {
  const { limit = 10, offset = 0 } = data;
  
  const { data: results, error } = await supabase
    .from('ashen_simulation_results')
    .select(`
      *,
      ashen_simulation_tests (
        test_name,
        device_type,
        device_model
      )
    `)
    .order('execution_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to get simulation results: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ success: true, results }),
    { headers: corsHeaders }
  );
}

async function getReplayLog(supabase: any, data: any) {
  const { resultId } = data;
  
  const { data: logs, error } = await supabase
    .from('ashen_simulation_replay_logs')
    .select('*')
    .eq('result_id', resultId)
    .order('step_number', { ascending: true });

  if (error) {
    throw new Error(`Failed to get replay log: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ success: true, logs }),
    { headers: corsHeaders }
  );
}

async function createTestPath(supabase: any, data: any) {
  const { pathName, pathDescription, steps, expectedOutcomes, isCritical = false } = data;
  
  const { data: testPath, error } = await supabase
    .from('ashen_simulation_test_paths')
    .insert({
      path_name: pathName,
      path_description: pathDescription,
      steps,
      expected_outcomes: expectedOutcomes,
      is_critical: isCritical
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test path: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ success: true, testPath }),
    { headers: corsHeaders }
  );
}

async function getDeviceConfigs(supabase: any) {
  const { data: devices, error } = await supabase
    .from('ashen_simulation_device_configs')
    .select('*')
    .eq('is_active', true)
    .order('device_type', { ascending: true });

  if (error) {
    throw new Error(`Failed to get device configs: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ success: true, devices }),
    { headers: corsHeaders }
  );
}

async function getTestPaths(supabase: any) {
  const { data: paths, error } = await supabase
    .from('ashen_simulation_test_paths')
    .select('*')
    .eq('is_active', true)
    .order('is_critical', { ascending: false });

  if (error) {
    throw new Error(`Failed to get test paths: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ success: true, paths }),
    { headers: corsHeaders }
  );
}

async function analyzeUXFlow(supabase: any, data: any) {
  const { resultId } = data;
  
  // Get simulation result and logs
  const { data: result, error: resultError } = await supabase
    .from('ashen_simulation_results')
    .select('*')
    .eq('id', resultId)
    .single();

  if (resultError) {
    throw new Error(`Failed to get simulation result: ${resultError.message}`);
  }

  const { data: logs, error: logsError } = await supabase
    .from('ashen_simulation_replay_logs')
    .select('*')
    .eq('result_id', resultId)
    .order('step_number', { ascending: true });

  if (logsError) {
    throw new Error(`Failed to get logs: ${logsError.message}`);
  }

  // Analyze UX patterns
  const analysis = {
    flowBreakdowns: logs.filter((log: any) => log.error_message),
    slowSteps: logs.filter((log: any) => log.timestamp_ms > 3000),
    userFriction: calculateUserFriction(logs),
    recommendations: generateUXRecommendations(logs, result),
    criticalIssues: identifyCriticalIssues(logs)
  };

  return new Response(
    JSON.stringify({ success: true, analysis }),
    { headers: corsHeaders }
  );
}

function calculateUserFriction(logs: any[]) {
  let frictionScore = 0;
  
  // High friction indicators
  logs.forEach((log: any) => {
    if (log.error_message) frictionScore += 20;
    if (log.timestamp_ms > 5000) frictionScore += 10;
    if (log.action_type === 'click' && log.timestamp_ms > 1000) frictionScore += 5;
  });
  
  return Math.min(100, frictionScore);
}

function generateUXRecommendations(logs: any[], result: any) {
  const recommendations = [];
  
  if (result.ux_score < 70) {
    recommendations.push({
      priority: 'high',
      category: 'performance',
      issue: 'Low UX score detected',
      recommendation: 'Review failed steps and optimize user flows'
    });
  }
  
  const errorLogs = logs.filter((log: any) => log.error_message);
  if (errorLogs.length > 0) {
    recommendations.push({
      priority: 'critical',
      category: 'functionality',
      issue: `${errorLogs.length} errors found during simulation`,
      recommendation: 'Fix broken functionality before deployment'
    });
  }
  
  const slowLogs = logs.filter((log: any) => log.timestamp_ms > 3000);
  if (slowLogs.length > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'performance',
      issue: `${slowLogs.length} slow interactions detected`,
      recommendation: 'Optimize loading times and responsiveness'
    });
  }
  
  return recommendations;
}

function identifyCriticalIssues(logs: any[]) {
  const criticalIssues = [];
  
  // Find broken navigation
  const navErrors = logs.filter((log: any) => 
    log.action_type === 'navigate' && log.error_message
  );
  
  if (navErrors.length > 0) {
    criticalIssues.push({
      type: 'broken_navigation',
      count: navErrors.length,
      description: 'Navigation failures detected'
    });
  }
  
  // Find form submission issues
  const formErrors = logs.filter((log: any) => 
    log.action_type === 'click' && 
    log.target_element?.includes('submit') && 
    log.error_message
  );
  
  if (formErrors.length > 0) {
    criticalIssues.push({
      type: 'form_submission_failure',
      count: formErrors.length,
      description: 'Form submission failures detected'
    });
  }
  
  return criticalIssues;
}