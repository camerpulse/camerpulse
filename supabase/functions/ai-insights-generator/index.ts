import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sources = ['civic_complaints', 'sentiment_trends', 'polls'] } = await req.json();

    console.log('Generating AI insights from sources:', sources);

    // Fetch recent data from different sources
    const dataPromises = [];

    if (sources.includes('sentiment_trends')) {
      dataPromises.push(
        supabase
          .from('sentiment_trends')
          .select('*')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(50)
      );
    }

    if (sources.includes('civic_complaints')) {
      dataPromises.push(
        supabase
          .from('civic_complaints')
          .select('*')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(50)
      );
    }

    if (sources.includes('polls')) {
      dataPromises.push(
        supabase
          .from('polls')
          .select('*')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(30)
      );
    }

    const results = await Promise.allSettled(dataPromises);
    
    // Combine all data
    let combinedData = '';
    let dataStats = { 
      sentiment_trends: 0, 
      civic_complaints: 0, 
      polls: 0 
    };

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.data) {
        const sourceType = sources[index];
        const data = result.value.data;
        dataStats[sourceType as keyof typeof dataStats] = data.length;
        
        combinedData += `\n\n=== ${sourceType.toUpperCase()} DATA ===\n`;
        combinedData += JSON.stringify(data.slice(0, 10), null, 2); // Limit to prevent token overflow
      }
    });

    if (!combinedData.trim()) {
      throw new Error('No data available to generate insights');
    }

    console.log('Data collected:', dataStats);

    // Generate insights using OpenAI
    const insightResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a civic intelligence analyst for Cameroon. Analyze the provided data and generate actionable insights about political, social, and economic trends. Focus on patterns, anomalies, and potential issues that require attention.

            Respond with ONLY a JSON array of insights in this exact format:
            [
              {
                "title": "Declining Healthcare Satisfaction in Douala",
                "insight_type": "trend_analysis",
                "description": "Detailed analysis of the trend...",
                "confidence_score": 0.85,
                "priority_level": "high",
                "affected_entities": {"regions": ["Douala"], "sectors": ["healthcare"]},
                "supporting_data": {"trend_direction": "declining", "magnitude": 0.3},
                "actionable_recommendations": ["Investigate healthcare facilities", "Increase public communication"]
              }
            ]

            insight_type options: "trend_analysis", "anomaly_detection", "sentiment_shift", "predictive_alert", "pattern_recognition"
            priority_level options: "low", "medium", "high", "critical"
            confidence_score: 0 to 1`
          },
          {
            role: 'user',
            content: `Analyze this Cameroonian civic data and generate insights:\n${combinedData}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!insightResponse.ok) {
      throw new Error(`OpenAI API error: ${insightResponse.statusText}`);
    }

    const insightData = await insightResponse.json();
    const insights = JSON.parse(insightData.choices[0].message.content);

    console.log(`Generated ${insights.length} insights`);

    // Store insights in database
    const storedInsights = [];
    
    for (const insight of insights) {
      const { data: storedInsight, error } = await supabase
        .from('ai_insights')
        .insert({
          title: insight.title,
          insight_type: insight.insight_type,
          description: insight.description,
          confidence_score: insight.confidence_score,
          priority_level: insight.priority_level,
          affected_entities: insight.affected_entities,
          supporting_data: insight.supporting_data,
          data_sources: sources,
          actionable_recommendations: insight.actionable_recommendations,
          insight_metadata: {
            data_stats: dataStats,
            generated_at: new Date().toISOString(),
            model_used: 'gpt-4o-mini'
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error storing insight:', error);
      } else {
        storedInsights.push(storedInsight);
      }
    }

    // Create intelligence alerts for high/critical priority insights
    for (const insight of insights) {
      if (['high', 'critical'].includes(insight.priority_level)) {
        await supabase
          .from('intelligence_alerts')
          .insert({
            alert_type: 'social', // Default type, could be determined from insight
            severity: insight.priority_level,
            title: insight.title,
            message: insight.description,
            region: insight.affected_entities?.regions?.[0],
            affected_entities: insight.affected_entities,
            source_data: insight.supporting_data,
            confidence_score: insight.confidence_score,
            status: 'active'
          });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      insights_generated: insights.length,
      data_analyzed: dataStats,
      insights: storedInsights
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-insights-generator:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});