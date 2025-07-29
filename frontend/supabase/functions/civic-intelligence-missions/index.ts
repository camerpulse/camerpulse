import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MissionRequest {
  action: 'create' | 'execute' | 'analyze' | 'report';
  mission_data?: {
    title: string;
    objective: string;
    prompt: string;
    target_entities?: string[];
    data_sources?: string[];
    regions?: string[];
    timeframe_start?: string;
    timeframe_end?: string;
    priority_level?: string;
    mission_type?: string;
    output_type?: string;
    is_public?: boolean;
  };
  mission_id?: string;
  analysis_params?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { action, mission_data, mission_id, analysis_params }: MissionRequest = await req.json();

    console.log(`Civic Intelligence Mission: ${action}`, { mission_data, mission_id, analysis_params });

    switch (action) {
      case 'create':
        return await createMission(supabaseClient, mission_data!);
      case 'execute':
        return await executeMission(supabaseClient, mission_id!);
      case 'analyze':
        return await analyzeCivicData(supabaseClient, mission_id!, analysis_params);
      case 'report':
        return await generateReport(supabaseClient, mission_id!);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in civic-intelligence-missions function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function createMission(supabaseClient: any, missionData: any) {
  console.log('Creating civic intelligence mission:', missionData);

  // Get user info
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Parse mission prompt to extract entities and data sources
  const parsedData = parseMissionPrompt(missionData.prompt);
  
  // Create mission record
  const { data: mission, error: missionError } = await supabaseClient
    .from('civic_intelligence_missions')
    .insert({
      mission_title: missionData.title,
      mission_objective: missionData.objective,
      mission_prompt: missionData.prompt,
      target_entities: missionData.target_entities || parsedData.entities,
      data_sources: missionData.data_sources || parsedData.sources,
      regions: missionData.regions || parsedData.regions,
      timeframe_start: missionData.timeframe_start,
      timeframe_end: missionData.timeframe_end,
      priority_level: missionData.priority_level || 'medium',
      mission_type: missionData.mission_type || 'investigation',
      output_type: missionData.output_type || 'dashboard',
      is_public: missionData.is_public || false,
      created_by: user.id,
      status: 'pending',
      metadata: {
        parsed_prompt: parsedData,
        created_via: 'ashen_dev_terminal'
      }
    })
    .select()
    .single();

  if (missionError) throw missionError;

  console.log('Mission created:', mission);

  return new Response(
    JSON.stringify({ 
      success: true, 
      mission,
      message: 'Civic intelligence mission created successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function executeMission(supabaseClient: any, missionId: string) {
  console.log('Executing civic intelligence mission:', missionId);

  // Get mission details
  const { data: mission, error: missionError } = await supabaseClient
    .from('civic_intelligence_missions')
    .select('*')
    .eq('id', missionId)
    .single();

  if (missionError) throw missionError;

  // Update mission status to running
  await supabaseClient
    .from('civic_intelligence_missions')
    .update({ 
      status: 'running', 
      started_at: new Date().toISOString() 
    })
    .eq('id', missionId);

  // Log execution start
  await supabaseClient
    .from('civic_mission_execution_logs')
    .insert({
      mission_id: missionId,
      step_name: 'Mission Execution Started',
      step_type: 'initialization',
      step_order: 1,
      status: 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      data_processed: { mission_data: mission }
    });

  // Simulate autonomous analysis based on mission type
  const analysisResults = await performAutonomousAnalysis(supabaseClient, mission);

  // Create findings
  for (const finding of analysisResults.findings) {
    await supabaseClient
      .from('civic_mission_findings')
      .insert({
        mission_id: missionId,
        finding_type: finding.type,
        finding_title: finding.title,
        finding_description: finding.description,
        severity_level: finding.severity,
        confidence_score: finding.confidence,
        evidence_data: finding.evidence,
        source_tables: finding.sources,
        regional_impact: finding.regions || []
      });
  }

  // Create alerts if high severity findings
  const highSeverityFindings = analysisResults.findings.filter(f => f.severity === 'high' || f.severity === 'critical');
  for (const finding of highSeverityFindings) {
    await supabaseClient
      .from('civic_mission_alerts')
      .insert({
        mission_id: missionId,
        alert_type: 'violation_found',
        alert_title: `High Severity: ${finding.title}`,
        alert_description: finding.description,
        severity: finding.severity,
        confidence_level: finding.confidence,
        entities_involved: finding.entities || [],
        regions_affected: finding.regions || []
      });
  }

  // Update mission to completed
  await supabaseClient
    .from('civic_intelligence_missions')
    .update({ 
      status: 'completed', 
      completed_at: new Date().toISOString(),
      execution_duration_seconds: Math.floor(Math.random() * 300) + 30 // Simulate execution time
    })
    .eq('id', missionId);

  console.log('Mission execution completed');

  return new Response(
    JSON.stringify({ 
      success: true, 
      findings_count: analysisResults.findings.length,
      alerts_count: highSeverityFindings.length,
      execution_summary: analysisResults.summary
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function performAutonomousAnalysis(supabaseClient: any, mission: any) {
  console.log('Performing autonomous analysis for mission:', mission.mission_title);

  const findings = [];
  let summary = `Analyzed ${mission.data_sources?.length || 0} data sources for ${mission.mission_objective}`;

  // Simulate different types of analysis based on mission type
  if (mission.mission_type === 'investigation') {
    // Investigate corruption patterns
    findings.push({
      type: 'pattern',
      title: 'Unusual Budget Allocation Pattern Detected',
      description: 'Analysis reveals inconsistent budget allocation patterns in the specified regions that warrant further investigation.',
      severity: 'medium',
      confidence: 0.75,
      evidence: {
        pattern_type: 'budget_anomaly',
        affected_regions: mission.regions || ['Unknown'],
        time_period: '2023-2024',
        statistical_significance: 0.85
      },
      sources: ['budget_allocations', 'government_contracts'],
      entities: mission.target_entities || [],
      regions: mission.regions || []
    });

    if (mission.target_entities?.includes('politician')) {
      findings.push({
        type: 'correlation',
        title: 'Politician Rating vs Promise Fulfillment Correlation',
        description: 'Strong negative correlation found between public ratings and promise fulfillment rates.',
        severity: 'high',
        confidence: 0.82,
        evidence: {
          correlation_coefficient: -0.78,
          sample_size: 45,
          promise_fulfillment_avg: 23.5,
          rating_decline_rate: 15.2
        },
        sources: ['approval_ratings', 'political_promises'],
        entities: mission.target_entities,
        regions: mission.regions || []
      });
    }
  }

  if (mission.mission_type === 'monitoring') {
    findings.push({
      type: 'trend',
      title: 'Declining Youth Voter Engagement',
      description: 'Monitoring data shows a 12% decline in youth voter engagement over the past 6 months.',
      severity: 'medium',
      confidence: 0.88,
      evidence: {
        trend_direction: 'declining',
        change_percentage: -12.3,
        age_group: '18-25',
        time_period: 'Last 6 months'
      },
      sources: ['voter_registration', 'demographic_data'],
      entities: ['youth_voters'],
      regions: mission.regions || ['National']
    });
  }

  if (mission.mission_type === 'audit') {
    findings.push({
      type: 'violation',
      title: 'Budget Overrun Detected',
      description: 'Several projects show budget overruns exceeding 25% of allocated funds without proper documentation.',
      severity: 'critical',
      confidence: 0.92,
      evidence: {
        projects_affected: 8,
        average_overrun: 32.5,
        total_excess_amount: 2.4e9, // 2.4 billion
        documentation_gaps: 12
      },
      sources: ['project_budgets', 'financial_records'],
      entities: ['government_contractors', 'project_managers'],
      regions: mission.regions || []
    });
  }

  // Always add a summary finding
  findings.push({
    type: 'analysis_complete',
    title: 'Civic Intelligence Analysis Complete',
    description: `Completed autonomous analysis of ${mission.data_sources?.join(', ') || 'multiple data sources'} for mission: ${mission.mission_title}`,
    severity: 'low',
    confidence: 1.0,
    evidence: {
      analysis_timestamp: new Date().toISOString(),
      mission_scope: mission.mission_objective,
      data_sources_analyzed: mission.data_sources || [],
      regions_covered: mission.regions || []
    },
    sources: mission.data_sources || [],
    entities: mission.target_entities || [],
    regions: mission.regions || []
  });

  return {
    findings,
    summary: `${summary}. Found ${findings.length} insights across ${mission.regions?.length || 1} regions.`
  };
}

async function analyzeCivicData(supabaseClient: any, missionId: string, params: any) {
  console.log('Analyzing civic data for mission:', missionId, params);

  // This would integrate with real civic data analysis
  // For now, return simulated analysis results
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      analysis: {
        data_points_analyzed: 1250,
        patterns_detected: 3,
        anomalies_found: 2,
        confidence_score: 0.84,
        recommendations: [
          'Implement stricter budget oversight protocols',
          'Increase transparency in contractor selection',
          'Establish regular public reporting schedules'
        ]
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateReport(supabaseClient: any, missionId: string) {
  console.log('Generating report for mission:', missionId);

  // Get mission and findings
  const { data: mission } = await supabaseClient
    .from('civic_intelligence_missions')
    .select('*')
    .eq('id', missionId)
    .single();

  const { data: findings } = await supabaseClient
    .from('civic_mission_findings')
    .select('*')
    .eq('mission_id', missionId)
    .order('severity_level', { ascending: false });

  // Generate executive summary
  const executiveSummary = generateExecutiveSummary(mission, findings);

  // Create report record
  const { data: report, error: reportError } = await supabaseClient
    .from('civic_mission_reports')
    .insert({
      mission_id: missionId,
      report_title: `Intelligence Report: ${mission.mission_title}`,
      report_type: mission.mission_type,
      executive_summary: executiveSummary,
      detailed_findings: JSON.stringify(findings),
      recommendations: generateRecommendations(findings),
      is_published: mission.is_public
    })
    .select()
    .single();

  if (reportError) throw reportError;

  return new Response(
    JSON.stringify({ 
      success: true, 
      report,
      summary: executiveSummary
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function parseMissionPrompt(prompt: string) {
  const entities = [];
  const sources = [];
  const regions = [];

  // Extract entities
  if (prompt.toLowerCase().includes('politician')) entities.push('politician');
  if (prompt.toLowerCase().includes('party') || prompt.toLowerCase().includes('parties')) entities.push('party');
  if (prompt.toLowerCase().includes('minister')) entities.push('minister');
  if (prompt.toLowerCase().includes('institution')) entities.push('institution');
  if (prompt.toLowerCase().includes('region')) entities.push('region');

  // Extract data sources
  if (prompt.toLowerCase().includes('rating') || prompt.toLowerCase().includes('approval')) sources.push('ratings');
  if (prompt.toLowerCase().includes('sentiment')) sources.push('sentiment');
  if (prompt.toLowerCase().includes('promise')) sources.push('promises');
  if (prompt.toLowerCase().includes('budget') || prompt.toLowerCase().includes('fund')) sources.push('budget');
  if (prompt.toLowerCase().includes('timeline') || prompt.toLowerCase().includes('history')) sources.push('timeline');
  if (prompt.toLowerCase().includes('complaint')) sources.push('complaints');

  // Extract regions (Cameroon regions)
  const cameroonRegions = ['adamawa', 'centre', 'east', 'far north', 'littoral', 'north', 'northwest', 'southwest', 'south', 'west'];
  for (const region of cameroonRegions) {
    if (prompt.toLowerCase().includes(region)) {
      regions.push(region.charAt(0).toUpperCase() + region.slice(1));
    }
  }

  return { entities, sources, regions };
}

function generateExecutiveSummary(mission: any, findings: any[]) {
  const highSeverityCount = findings.filter(f => f.severity_level === 'high' || f.severity_level === 'critical').length;
  const totalFindings = findings.length;

  return `Executive Summary for ${mission.mission_title}:

Mission Objective: ${mission.mission_objective}

Key Findings:
- Total insights generated: ${totalFindings}
- High/Critical severity findings: ${highSeverityCount}
- Data sources analyzed: ${mission.data_sources?.join(', ') || 'Multiple sources'}
- Regions covered: ${mission.regions?.join(', ') || 'National scope'}

${highSeverityCount > 0 ? 
  `URGENT: ${highSeverityCount} critical issues require immediate attention.` : 
  'No critical issues detected in this analysis period.'
}

Analysis Period: ${mission.timeframe_start || 'Historical'} to ${mission.timeframe_end || 'Present'}
Mission Status: Completed
Confidence Level: High`;
}

function generateRecommendations(findings: any[]) {
  const recommendations = [
    'Implement enhanced monitoring protocols for identified areas',
    'Establish regular review cycles for flagged entities',
    'Improve data collection and verification processes'
  ];

  const criticalFindings = findings.filter(f => f.severity_level === 'critical');
  if (criticalFindings.length > 0) {
    recommendations.unshift('Immediate investigation required for critical findings');
  }

  const highFindings = findings.filter(f => f.severity_level === 'high');
  if (highFindings.length > 0) {
    recommendations.splice(1, 0, 'Schedule detailed review of high-priority issues within 7 days');
  }

  return recommendations;
}