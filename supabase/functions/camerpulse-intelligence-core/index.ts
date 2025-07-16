import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CamerPulse AI: Generate polls from trending topics
function generatePollFromTopic(selectedTopic: any, topicCategory: string) {
  const templates = {
    fuel_scarcity: {
      question: `How has the fuel shortage in ${selectedTopic.region || 'your area'} affected you?`,
      options: ['Severely affected my daily activities', 'Made some adjustments but managing', 'Not much impact on me', 'I use alternative transport'],
      reasoning: 'Understanding fuel scarcity impact helps track infrastructure challenges'
    },
    power_outage: {
      question: `How frequent are power outages in ${selectedTopic.region || 'your region'} lately?`,
      options: ['Daily outages', 'Several times per week', 'Once or twice a week', 'Rarely experience outages'],
      reasoning: 'Tracking power reliability for infrastructure planning'
    },
    water_shortage: {
      question: `What is your main source of water during shortages?`,
      options: ['Buy from vendors', 'Well/borehole', 'Collect rainwater', 'Travel to distant source'],
      reasoning: 'Understanding water access helps improve distribution networks'
    },
    governance_default: {
      question: `What should be the priority for ${selectedTopic.region || 'national'} development?`,
      options: ['Healthcare improvement', 'Education system', 'Infrastructure (roads, bridges)', 'Economic opportunities'],
      reasoning: 'Identifying development priorities for effective governance'
    },
    humor_default: {
      question: `What best describes your reaction to recent ${selectedTopic.title?.toLowerCase() || 'events'}?`,
      options: ['Found it amusing', 'Made me think differently', 'Just another day in Cameroon', 'Prefer to stay positive'],
      reasoning: 'Light engagement while maintaining constructive civic dialogue'
    }
  };

  // Select appropriate template
  let template = templates.governance_default;
  
  if (selectedTopic.type) {
    template = templates[selectedTopic.type as keyof typeof templates] || templates.governance_default;
  } else if (topicCategory === 'humor') {
    template = templates.humor_default;
  }

  return {
    question: template.question,
    options: template.options,
    reasoning: template.reasoning
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧠 CamerPulse Intelligence Core - Starting sentiment analysis and poll generation');

    // Using prebuilt CamerPulse AI capabilities

    // Get system configuration
    const { data: configData } = await supabase
      .from('autonomous_poll_config')
      .select('*')
      .eq('is_enabled', true);

    const config = configData?.reduce((acc, item) => {
      acc[item.config_key] = item.config_value;
      return acc;
    }, {} as Record<string, any>) || {};

    if (!config.system_enabled?.enabled) {
      console.log('🚫 Autonomous poll generation is disabled');
      return new Response(
        JSON.stringify({ message: 'Autonomous poll generation is disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze trending topics from multiple sources
    console.log('📊 Analyzing sentiment trends...');
    
    // Get recent civic complaints with high trending scores
    const { data: trendingComplaints } = await supabase
      .from('civic_complaints')
      .select('*')
      .eq('verified_status', 'verified')
      .gte('trending_score', 0.6)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('trending_score', { ascending: false })
      .limit(5);

    // Get recent sentiment trends
    const { data: sentimentTrends } = await supabase
      .from('sentiment_trends')
      .select('*')
      .gte('trend_strength', config.sentiment_thresholds?.trending || 0.6)
      .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('trend_strength', { ascending: false })
      .limit(10);

    console.log(`📈 Found ${trendingComplaints?.length || 0} trending complaints and ${sentimentTrends?.length || 0} sentiment trends`);

    // Check if we should generate a poll this week
    const { data: recentPolls } = await supabase
      .from('autonomous_polls')
      .select('id, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const maxPerWeek = config.generation_schedule?.max_per_week || 2;
    if ((recentPolls?.length || 0) >= maxPerWeek) {
      console.log(`📊 Weekly limit reached: ${recentPolls?.length}/${maxPerWeek} polls generated this week`);
      return new Response(
        JSON.stringify({ message: `Weekly limit reached: ${recentPolls?.length}/${maxPerWeek} polls generated` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Select the most promising topic for poll generation
    let selectedTopic = null;
    let triggerSentimentId = null;
    let topicCategory = 'public_interest';
    let generationMethod = 'ai_trending';

    if (trendingComplaints && trendingComplaints.length > 0) {
      const topComplaint = trendingComplaints[0];
      selectedTopic = {
        title: topComplaint.title,
        description: topComplaint.description,
        type: topComplaint.complaint_type,
        region: topComplaint.region,
        severity: topComplaint.severity_level,
        trendingScore: topComplaint.trending_score
      };
      generationMethod = 'civic_complaint';
      
      // Determine category based on complaint type and severity
      if (topComplaint.severity_level === 'critical') {
        topicCategory = 'emergency';
      } else if (['fuel_scarcity', 'power_outage', 'water_shortage'].includes(topComplaint.complaint_type)) {
        topicCategory = 'public_interest';
      } else {
        topicCategory = 'governance';
      }
    } else if (sentimentTrends && sentimentTrends.length > 0) {
      const topTrend = sentimentTrends[0];
      selectedTopic = {
        title: topTrend.topic,
        keywords: topTrend.keywords,
        platform: topTrend.platform,
        region: topTrend.region,
        sentimentScore: topTrend.sentiment_score,
        trendStrength: topTrend.trend_strength
      };
      triggerSentimentId = topTrend.id;
      
      // Determine category based on sentiment and keywords
      const keywords = topTrend.keywords.join(' ').toLowerCase();
      if (keywords.includes('humor') || keywords.includes('funny') || keywords.includes('meme')) {
        topicCategory = 'humor';
      } else if (keywords.includes('government') || keywords.includes('political') || keywords.includes('election')) {
        topicCategory = 'governance';
      } else {
        topicCategory = 'public_interest';
      }
    }

    if (!selectedTopic) {
      console.log('🔍 No trending topics found for poll generation');
      return new Response(
        JSON.stringify({ message: 'No trending topics found for poll generation' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🎯 Selected topic: ${selectedTopic.title || selectedTopic.title} (Category: ${topicCategory})`);

    // Generate poll using CamerPulse AI capabilities
    console.log('🤖 Generating poll with CamerPulse AI...');
    
    // Use prebuilt poll templates based on topic analysis
    const pollData = generatePollFromTopic(selectedTopic, topicCategory);
    
    console.log('📝 CamerPulse AI generated content:', pollData);

    // Determine poll style based on category
    const styleMapping = config.style_mapping || {
      humor: 'card',
      governance: 'ballot', 
      public_interest: 'chart',
      emergency: 'card'
    };
    
    const pollStyle = styleMapping[topicCategory] || 'card';
    
    // Calculate confidence score
    const confidenceScore = Math.min(0.9, 
      0.5 + 
      (selectedTopic.trendingScore || selectedTopic.trendStrength || 0.5) * 0.3 +
      (pollData.options.length >= 4 ? 0.1 : 0) +
      (pollData.reasoning ? 0.1 : 0)
    );

    // Create the poll in database
    console.log('💾 Creating poll in database...');
    
    const { data: newPoll, error: pollError } = await supabase
      .from('polls')
      .insert({
        title: pollData.question,
        description: `AI-generated poll based on trending topic: ${selectedTopic.title}`,
        options: pollData.options,
        creator_id: null, // System-generated
        privacy_mode: 'public',
        poll_type: 'civic',
        style: pollStyle,
        tags: ['ai-generated', topicCategory, 'trending'],
        is_active: !config.auto_publish?.require_admin_approval,
        ends_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
        show_results_after_expiry: true,
        allow_comments: true,
        moderation_enabled: true,
        custom_settings: {
          autonomous: true,
          category: topicCategory,
          regional_boost: config.regional_boost?.enabled && selectedTopic.region ? {
            enabled: true,
            target_region: selectedTopic.region,
            boost_factor: config.regional_boost.boost_factor
          } : null
        }
      })
      .select()
      .single();

    if (pollError) {
      console.error('Error creating poll:', pollError);
      throw pollError;
    }

    // Log the autonomous poll generation
    const { error: logError } = await supabase
      .from('autonomous_polls')
      .insert({
        poll_id: newPoll.id,
        trigger_sentiment_id: triggerSentimentId,
        generation_method: generationMethod,
        topic_category: topicCategory,
        confidence_score: confidenceScore,
        auto_published: !config.auto_publish?.require_admin_approval,
        admin_approved: config.auto_publish?.require_admin_approval ? null : true,
        generation_prompt: `CamerPulse AI template for ${topicCategory}: ${selectedTopic.title}`,
        ai_reasoning: {
          reasoning: pollData.reasoning,
          selectedTopic: selectedTopic,
          confidenceFactors: {
            topicRelevance: selectedTopic.trendingScore || selectedTopic.trendStrength,
            optionQuality: pollData.options.length,
            hasReasoning: !!pollData.reasoning
          }
        }
      });

    if (logError) {
      console.error('Error logging autonomous poll:', logError);
    }

    console.log(`✅ Successfully generated autonomous poll: "${pollData.question}"`);
    console.log(`📊 Style: ${pollStyle}, Category: ${topicCategory}, Confidence: ${(confidenceScore * 100).toFixed(1)}%`);

    return new Response(
      JSON.stringify({
        success: true,
        poll: newPoll,
        metadata: {
          category: topicCategory,
          style: pollStyle,
          confidence_score: confidenceScore,
          auto_published: !config.auto_publish?.require_admin_approval,
          ai_reasoning: pollData.reasoning,
          trigger_topic: selectedTopic
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in CamerPulse Intelligence Core:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate autonomous poll',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});