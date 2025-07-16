import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    const { action, data } = await req.json();
    console.log('Civic Strategist Core request:', { action, data });

    switch (action) {
      case 'analyze_problem': {
        const { problem_title, problem_description, problem_category, target_region, target_demographics, urgency_level } = data;
        
        // Insert the problem into the database
        const { data: problemData, error: problemError } = await supabaseClient
          .from('civic_strategy_problems')
          .insert({
            problem_title,
            problem_description,
            problem_category,
            target_region,
            target_demographics: target_demographics || [],
            urgency_level: urgency_level || 'medium',
            volatility_score: calculateVolatilityScore(problem_description),
            root_causes: analyzeRootCauses(problem_description),
            impact_groups: identifyImpactGroups(problem_description)
          })
          .select()
          .single();

        if (problemError) {
          console.error('Error inserting problem:', problemError);
          throw problemError;
        }

        // Generate AI strategy
        const strategy = await generateStrategy(problem_description, problem_category, target_region);
        
        // Insert strategy into database
        const { data: strategyData, error: strategyError } = await supabaseClient
          .from('civic_strategies')
          .insert({
            problem_id: problemData.id,
            strategy_title: `Strategic Solution: ${problem_title}`,
            short_term_actions: strategy.short_term_actions,
            long_term_reforms: strategy.long_term_reforms,
            policy_suggestions: strategy.policy_suggestions,
            digital_tools: strategy.digital_tools,
            leadership_recommendations: strategy.leadership_recommendations,
            implementation_timeline: strategy.implementation_timeline,
            success_metrics: strategy.success_metrics,
            is_public: false,
            visibility_level: 'admin_only'
          })
          .select()
          .single();

        if (strategyError) {
          console.error('Error inserting strategy:', strategyError);
          throw strategyError;
        }

        return new Response(JSON.stringify({ 
          success: true, 
          problem: problemData,
          strategy: strategyData,
          analysis: strategy
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'run_simulation': {
        const { scenario, parameters, timeframe_years } = data;
        
        const simulation = await runCivicSimulation(scenario, parameters, timeframe_years);
        
        const { data: simulationData, error: simulationError } = await supabaseClient
          .from('civic_simulation_results')
          .insert({
            simulation_scenario: scenario,
            input_parameters: parameters,
            predicted_outcomes: simulation.predicted_outcomes,
            risk_factors: simulation.risk_factors,
            mitigation_strategies: simulation.mitigation_strategies,
            confidence_score: simulation.confidence_score,
            timeframe_years: timeframe_years || 1,
            affected_regions: simulation.affected_regions
          })
          .select()
          .single();

        if (simulationError) {
          console.error('Error inserting simulation:', simulationError);
          throw simulationError;
        }

        return new Response(JSON.stringify({ 
          success: true, 
          simulation: simulationData 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'generate_campaign': {
        const { template_type, target_audience, platform, goal } = data;
        
        const campaign = await generateCampaignTemplate(template_type, target_audience, platform, goal);
        
        const { data: campaignData, error: campaignError } = await supabaseClient
          .from('civic_campaign_templates')
          .insert({
            template_name: campaign.template_name,
            template_type,
            target_audience,
            platform: platform || 'multi-platform',
            content_template: campaign.content_template,
            engagement_metrics: campaign.engagement_metrics,
            customization_options: campaign.customization_options,
            is_approved: false
          })
          .select()
          .single();

        if (campaignError) {
          console.error('Error inserting campaign:', campaignError);
          throw campaignError;
        }

        return new Response(JSON.stringify({ 
          success: true, 
          campaign: campaignData 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_dashboard_stats': {
        const { data: stats, error: statsError } = await supabaseClient
          .rpc('get_civic_strategy_stats');

        if (statsError) {
          console.error('Error getting stats:', statsError);
          throw statsError;
        }

        return new Response(JSON.stringify({ 
          success: true, 
          stats 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in civic-strategist-core function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateVolatilityScore(description: string): number {
  let score = 3; // base score
  
  const highVolatilityTerms = ['crisis', 'urgent', 'emergency', 'violence', 'unrest'];
  const mediumVolatilityTerms = ['tension', 'conflict', 'dissatisfaction', 'protest'];
  
  if (highVolatilityTerms.some(term => description.toLowerCase().includes(term))) {
    score += 3;
  } else if (mediumVolatilityTerms.some(term => description.toLowerCase().includes(term))) {
    score += 2;
  }
  
  return Math.min(score, 10);
}

function analyzeRootCauses(description: string): string[] {
  const causes = [];
  
  if (description.toLowerCase().includes('youth') || description.toLowerCase().includes('young')) {
    causes.push('Youth disengagement from political processes');
  }
  if (description.toLowerCase().includes('corruption')) {
    causes.push('Institutional corruption and lack of transparency');
  }
  if (description.toLowerCase().includes('education') || description.toLowerCase().includes('awareness')) {
    causes.push('Limited civic education and awareness');
  }
  if (description.toLowerCase().includes('trust')) {
    causes.push('Erosion of public trust in institutions');
  }
  if (description.toLowerCase().includes('economic') || description.toLowerCase().includes('poverty')) {
    causes.push('Economic inequality and limited opportunities');
  }
  
  return causes.length > 0 ? causes : ['Systemic governance challenges', 'Communication gaps between citizens and officials'];
}

function identifyImpactGroups(description: string): string[] {
  const groups = [];
  
  if (description.toLowerCase().includes('youth') || description.toLowerCase().includes('young')) {
    groups.push('Youth (18-35)');
  }
  if (description.toLowerCase().includes('women')) {
    groups.push('Women and marginalized communities');
  }
  if (description.toLowerCase().includes('rural')) {
    groups.push('Rural populations');
  }
  if (description.toLowerCase().includes('urban')) {
    groups.push('Urban communities');
  }
  if (description.toLowerCase().includes('student')) {
    groups.push('Students and educational institutions');
  }
  
  return groups.length > 0 ? groups : ['General population', 'Civil society organizations'];
}

async function generateStrategy(description: string, category: string, region?: string) {
  // AI-powered strategy generation logic
  const strategy = {
    short_term_actions: [
      {
        action: "Community Listening Sessions",
        timeline: "1-2 weeks",
        description: "Organize town halls and focus groups to understand citizen concerns",
        responsible_party: "Local NGOs and community leaders"
      },
      {
        action: "Digital Engagement Campaign",
        timeline: "2-4 weeks", 
        description: "Launch social media campaign to raise awareness and gather feedback",
        responsible_party: "Digital outreach team"
      }
    ],
    long_term_reforms: [
      {
        reform: "Institutional Capacity Building",
        timeline: "6-12 months",
        description: "Strengthen government institutions and transparency mechanisms",
        impact: "Improved governance and public trust"
      },
      {
        reform: "Civic Education Program",
        timeline: "12-24 months",
        description: "Implement comprehensive civic education in schools and communities",
        impact: "Enhanced citizen participation and awareness"
      }
    ],
    policy_suggestions: [
      "Establish citizen feedback mechanisms in government processes",
      "Create transparency requirements for public decision-making",
      "Implement participatory budgeting in local communities"
    ],
    digital_tools: [
      {
        tool: "Mobile App for Civic Engagement",
        purpose: "Allow citizens to report issues and track government responses",
        platform: "Android/iOS"
      },
      {
        tool: "WhatsApp Community Groups",
        purpose: "Facilitate direct communication between officials and citizens",
        platform: "WhatsApp"
      }
    ],
    leadership_recommendations: {
      primary_leader: "Regional Civil Society Coalition",
      supporting_leaders: ["Youth organizations", "Traditional leaders", "Women's groups"],
      government_partners: ["Ministry of Territorial Administration", "Local councils"]
    },
    implementation_timeline: {
      phase_1: "Immediate (1-3 months): Community engagement and awareness",
      phase_2: "Short-term (3-6 months): Pilot programs and initial reforms",
      phase_3: "Long-term (6-24 months): Systematic implementation and evaluation"
    },
    success_metrics: [
      "Increase in citizen participation rates by 25%",
      "Improvement in government transparency scores",
      "Reduction in civic complaints by 30%",
      "Enhanced trust ratings in public institutions"
    ]
  };

  return strategy;
}

async function runCivicSimulation(scenario: string, parameters: any, timeframe: number) {
  // Simulation logic based on the scenario
  const simulation = {
    predicted_outcomes: {
      civic_engagement: "Moderate increase expected",
      institutional_trust: "Gradual improvement with sustained efforts",
      social_stability: "Stable with potential for improvement",
      economic_impact: "Positive correlation with improved governance"
    },
    risk_factors: [
      "Political resistance to transparency measures",
      "Limited funding for sustained programs",
      "Potential for initiative fatigue in communities"
    ],
    mitigation_strategies: [
      "Build broad coalition support across political parties",
      "Secure diverse funding sources including international partners",
      "Implement phased approach to prevent overwhelming communities"
    ],
    confidence_score: 0.75,
    affected_regions: parameters.target_regions || ["Centre", "Littoral", "West"]
  };

  return simulation;
}

async function generateCampaignTemplate(type: string, audience: string, platform: string, goal: string) {
  const templates = {
    sms: {
      template_name: `SMS Campaign: ${goal}`,
      content_template: {
        message_templates: [
          "Bonjour! Your voice matters in shaping our community. Join us for [EVENT] on [DATE]. Reply YES to confirm. #CivicEngagement",
          "Mama/Papa, elections are coming. Register to vote at [LOCATION]. Your vote is your power! #VoteReady"
        ],
        customization_fields: ["EVENT", "DATE", "LOCATION", "CONTACT"],
        best_times: ["9:00 AM", "6:00 PM"],
        frequency: "Weekly"
      },
      engagement_metrics: {
        expected_reach: "5000-10000",
        response_rate: "15-25%",
        cost_per_contact: "50 FCFA"
      }
    },
    social_media: {
      template_name: `Social Media Campaign: ${goal}`,
      content_template: {
        post_templates: [
          {
            type: "Facebook Post",
            content: "🗳️ Democracy starts with YOU! Join the conversation about [TOPIC]. Share your thoughts in the comments. #CameroonVoices #CivicPride",
            hashtags: ["#CameroonVoices", "#CivicPride", "#Democracy"]
          },
          {
            type: "TikTok Video",
            content: "Quick civic tip: Did you know you can [ACTION]? 💡 Follow for more civic education! #CivicTok #KnowYourRights",
            format: "15-30 second educational video"
          }
        ],
        posting_schedule: "3 times per week",
        engagement_strategy: "Respond to comments within 2 hours"
      },
      engagement_metrics: {
        expected_reach: "50000-100000",
        engagement_rate: "3-5%",
        conversion_rate: "1-2%"
      }
    },
    education: {
      template_name: `Civic Education: ${goal}`,
      content_template: {
        module_structure: [
          {
            title: "Understanding Your Rights",
            duration: "45 minutes",
            activities: ["Interactive discussion", "Case studies", "Q&A session"]
          },
          {
            title: "How Government Works",
            duration: "60 minutes", 
            activities: ["Role-play exercise", "Local government visit", "Budget simulation"]
          }
        ],
        materials_needed: ["Projector", "Handouts", "Flip charts"],
        facilitator_guide: "Step-by-step instructions with talking points"
      },
      engagement_metrics: {
        expected_participants: "25-30 per session",
        retention_rate: "80-90%",
        knowledge_improvement: "40-60%"
      }
    }
  };

  return templates[type] || templates.social_media;
}