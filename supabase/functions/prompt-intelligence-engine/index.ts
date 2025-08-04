import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  action: 'analyze_problem' | 'generate_solution' | 'get_archive' | 'update_implementation';
  problem_description?: string;
  problem_title?: string;
  problem_category?: string;
  priority_level?: number;
  target_audience?: string[];
  problem_id?: string;
  solution_id?: string;
  implementation_data?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, ...params }: AnalysisRequest = await req.json();

    let result;
    switch (action) {
      case 'analyze_problem':
        result = await analyzeProblem(supabaseClient, params);
        break;
      case 'generate_solution':
        result = await generateSolution(supabaseClient, params);
        break;
      case 'get_archive':
        result = await getArchive(supabaseClient);
        break;
      case 'update_implementation':
        result = await updateImplementation(supabaseClient, params);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in prompt-intelligence-engine:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeProblem(supabaseClient: any, params: any) {
  console.log('Analyzing civic problem:', params.problem_title);

  // Create problem record
  const { data: problem, error: problemError } = await supabaseClient
    .from('strategy_problems')
    .insert({
      problem_title: params.problem_title || 'Untitled Problem',
      problem_description: params.problem_description,
      problem_category: params.problem_category || 'governance',
      target_audience: params.target_audience || ['citizens'],
      priority_level: params.priority_level || 3,
      submitted_by: '3e4b42b8-1c36-42b7-a7ff-d11d95f82ab0', // Default admin user
      status: 'analyzing'
    })
    .select()
    .single();

  if (problemError) {
    throw new Error(`Failed to create problem: ${problemError.message}`);
  }

  // Use database function to analyze the problem
  const { data: analysisResult, error: analysisError } = await supabaseClient
    .rpc('analyze_strategy_problem', {
      p_problem_id: problem.id,
      p_problem_description: params.problem_description,
      p_category: params.problem_category || 'governance'
    });

  if (analysisError) {
    console.error('Analysis error:', analysisError);
  }

  return {
    problem_id: problem.id,
    analysis: analysisResult || {},
    status: 'analyzed',
    timestamp: new Date().toISOString()
  };
}

async function generateSolution(supabaseClient: any, params: any) {
  console.log('Generating solution for problem:', params.problem_id);

  if (!params.problem_id) {
    throw new Error('Problem ID is required for solution generation');
  }

  // Get problem details
  const { data: problem, error: problemError } = await supabaseClient
    .from('strategy_problems')
    .select('*')
    .eq('id', params.problem_id)
    .single();

  if (problemError) {
    throw new Error(`Failed to fetch problem: ${problemError.message}`);
  }

  // Generate comprehensive solution based on problem type and complexity
  const solution = await generateComprehensiveSolution(problem);

  // Store solution
  const { data: solutionRecord, error: solutionError } = await supabaseClient
    .from('strategy_solutions')
    .insert({
      problem_id: params.problem_id,
      solution_title: solution.title,
      solution_overview: solution.overview,
      recommended_features: solution.features,
      data_requirements: solution.dataRequirements,
      user_flows: solution.userFlows,
      dashboard_specs: solution.dashboards,
      integration_suggestions: solution.integrations,
      engagement_strategy: solution.engagement,
      timeline_estimate: solution.timeline,
      complexity_score: solution.complexity,
      confidence_score: solution.confidence,
      build_ready_prompt: solution.buildPrompt,
      export_formats: ['pdf', 'json', 'prompt_bundle']
    })
    .select()
    .single();

  if (solutionError) {
    throw new Error(`Failed to store solution: ${solutionError.message}`);
  }

  // Update problem status
  await supabaseClient
    .from('strategy_problems')
    .update({ status: 'solution_generated' })
    .eq('id', params.problem_id);

  return {
    solution_id: solutionRecord.id,
    solution: solutionRecord,
    generated_at: new Date().toISOString()
  };
}

async function generateComprehensiveSolution(problem: any) {
  const category = problem.problem_category;
  const description = problem.problem_description.toLowerCase();

  // Analyze problem keywords for solution generation
  const isElectionRelated = description.includes('election') || description.includes('voting') || description.includes('candidate');
  const isCorruptionRelated = description.includes('corruption') || description.includes('fraud') || description.includes('accountability');
  const isYouthRelated = description.includes('youth') || description.includes('young') || description.includes('engagement');
  const isTransparencyRelated = description.includes('transparency') || description.includes('budget') || description.includes('spending');

  let solution = {
    title: `Civic Solution: ${problem.problem_title}`,
    overview: '',
    features: [],
    dataRequirements: {},
    userFlows: [],
    dashboards: {},
    integrations: [],
    engagement: {},
    timeline: '6-12 weeks',
    complexity: 5,
    confidence: 0.85,
    buildPrompt: ''
  };

  if (isElectionRelated) {
    solution = {
      ...solution,
      title: 'Electoral Transparency & Monitoring Platform',
      overview: 'A comprehensive platform to monitor elections, track candidates, and ensure transparent democratic processes.',
      features: [
        'Real-time candidate tracking dashboard',
        'Promise monitoring system',
        'Voter registration integration',
        'Election results verification',
        'Candidate comparison tools',
        'Public engagement portal'
      ],
      dataRequirements: {
        internal: ['candidate_profiles', 'election_data', 'voter_registration'],
        external: ['elecam_api', 'social_media_feeds', 'news_apis'],
        realtime: ['election_results', 'voter_turnout', 'incident_reports']
      },
      userFlows: [
        'Citizens search and compare candidates',
        'Officials update election information',
        'Monitors track irregularities',
        'Media access verified data'
      ],
      dashboards: {
        public: 'Candidate profiles, election timeline, results tracker',
        admin: 'Data management, verification tools, alert system',
        mobile: 'Voter guide, polling location finder, results'
      },
      integrations: ['ELECAM API', 'WhatsApp Bot', 'Social Media APIs', 'News Aggregators'],
      engagement: {
        strategy: 'Multi-channel voter education and participation',
        channels: ['Mobile App', 'WhatsApp', 'Social Media', 'Community Centers'],
        target_groups: ['First-time voters', 'Youth', 'Rural communities']
      },
      complexity: 8,
      timeline: '12-16 weeks'
    };
  } else if (isCorruptionRelated) {
    solution = {
      ...solution,
      title: 'Anti-Corruption Monitoring & Reporting System',
      overview: 'A secure platform for detecting, reporting, and tracking corruption cases with whistleblower protection.',
      features: [
        'Anonymous reporting portal',
        'Corruption case tracking',
        'Budget monitoring dashboard',
        'Contract transparency tools',
        'Investigation workflow',
        'Public disclosure system'
      ],
      dataRequirements: {
        internal: ['budget_data', 'contract_records', 'complaint_logs'],
        external: ['procurement_apis', 'financial_databases', 'legal_frameworks'],
        sensitive: ['whistleblower_reports', 'investigation_files']
      },
      integrations: ['Financial APIs', 'Legal Databases', 'Secure Communication'],
      complexity: 9,
      timeline: '16-20 weeks'
    };
  } else if (isYouthRelated) {
    solution = {
      ...solution,
      title: 'Youth Civic Engagement Platform',
      overview: 'An interactive platform designed to educate and engage young citizens in democratic processes.',
      features: [
        'Gamified civic education',
        'Youth voting guide',
        'Peer discussion forums',
        'Local issue reporting',
        'Representative connect',
        'Civic achievement system'
      ],
      dataRequirements: {
        internal: ['youth_profiles', 'engagement_metrics', 'education_content'],
        external: ['social_platforms', 'educational_apis', 'event_systems']
      },
      engagement: {
        strategy: 'Gamification and peer-to-peer learning',
        channels: ['Mobile App', 'Social Media', 'Campus Programs'],
        incentives: ['Civic badges', 'Leadership opportunities', 'Recognition programs']
      },
      complexity: 6,
      timeline: '8-12 weeks'
    };
  }

  // Generate build-ready prompt
  solution.buildPrompt = `Create a ${solution.title} with the following specifications:

CORE FEATURES:
${solution.features.map(f => `- ${f}`).join('\n')}

DATA REQUIREMENTS:
${Object.entries(solution.dataRequirements).map(([key, values]) => 
  `${key.toUpperCase()}: ${Array.isArray(values) ? values.join(', ') : values}`
).join('\n')}

USER INTERFACES:
${solution.userFlows.map(f => `- ${f}`).join('\n')}

DASHBOARD REQUIREMENTS:
${Object.entries(solution.dashboards).map(([key, desc]) => 
  `${key.toUpperCase()}: ${desc}`
).join('\n')}

INTEGRATIONS:
${solution.integrations.map(i => `- ${i}`).join('\n')}

ENGAGEMENT STRATEGY:
${solution.engagement.strategy || 'Standard civic engagement approach'}

Build this as a modern React application with Supabase backend, implementing proper authentication, role-based access control, and real-time updates where appropriate.`;

  return solution;
}

async function getArchive(supabaseClient: any) {
  console.log('Fetching strategy archive');

  const { data: problems, error: problemsError } = await supabaseClient
    .from('strategy_problems')
    .select(`
      *,
      strategy_solutions (
        id,
        solution_title,
        complexity_score,
        confidence_score,
        created_at
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (problemsError) {
    throw new Error(`Failed to fetch archive: ${problemsError.message}`);
  }

  return {
    problems: problems || [],
    total_count: problems?.length || 0,
    fetched_at: new Date().toISOString()
  };
}

async function updateImplementation(supabaseClient: any, params: any) {
  console.log('Updating implementation status:', params.solution_id);

  if (!params.solution_id) {
    throw new Error('Solution ID is required');
  }

  const { data: implementation, error } = await supabaseClient
    .from('strategy_implementations')
    .upsert({
      solution_id: params.solution_id,
      implementation_status: params.implementation_data?.status || 'planned',
      progress_percentage: params.implementation_data?.progress || 0,
      implemented_features: params.implementation_data?.features || [],
      public_feedback: params.implementation_data?.feedback || {},
      success_metrics: params.implementation_data?.metrics || {}
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update implementation: ${error.message}`);
  }

  return {
    implementation_id: implementation.id,
    updated_at: new Date().toISOString()
  };
}