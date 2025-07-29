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
    const { text, source, region, language = 'en' } = await req.json();

    if (!text) {
      throw new Error('Text content is required');
    }

    console.log('Analyzing sentiment for text:', text.substring(0, 100) + '...');

    // Analyze sentiment using OpenAI
    const sentimentResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are a sentiment analysis expert specializing in African political and social contexts. Analyze the sentiment of the given text and respond with ONLY a JSON object in this exact format:
            {
              "sentiment_score": 0.75,
              "sentiment_label": "positive",
              "confidence": 0.89,
              "topics": ["healthcare", "government"],
              "entities": ["Minister", "Cameroon"],
              "emotions": {"anger": 0.1, "joy": 0.7, "fear": 0.2}
            }
            
            sentiment_score: -1 (very negative) to 1 (very positive)
            sentiment_label: "positive", "negative", or "neutral"
            confidence: 0 to 1
            topics: array of key topics mentioned
            entities: array of important entities (people, places, organizations)
            emotions: object with emotion scores (0-1)`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.1,
      }),
    });

    if (!sentimentResponse.ok) {
      throw new Error(`OpenAI API error: ${sentimentResponse.statusText}`);
    }

    const sentimentData = await sentimentResponse.json();
    const analysis = JSON.parse(sentimentData.choices[0].message.content);

    console.log('Sentiment analysis result:', analysis);

    // Detect topic from entities and content
    const topic = analysis.topics[0] || 'general';

    // Store sentiment trend
    const { data: trendData, error: trendError } = await supabase
      .from('sentiment_trends')
      .insert({
        topic: topic,
        sentiment_score: analysis.sentiment_score,
        sentiment_label: analysis.sentiment_label,
        mention_count: 1,
        trend_direction: 'stable',
        confidence_score: analysis.confidence,
        data_sources: [source || 'api'],
        region: region,
        language: language
      })
      .select()
      .single();

    if (trendError) {
      console.error('Error storing sentiment trend:', trendError);
      // Don't throw here, just log and continue
    }

    // Check for sentiment spikes
    const { data: recentTrends } = await supabase
      .from('sentiment_trends')
      .select('sentiment_score')
      .eq('topic', topic)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentTrends && recentTrends.length > 0) {
      const avgScore = recentTrends.reduce((sum, trend) => sum + trend.sentiment_score, 0) / recentTrends.length;
      const spike = Math.abs(analysis.sentiment_score - avgScore);
      
      if (spike > 0.3) { // Significant sentiment change
        await supabase
          .from('sentiment_spikes')
          .insert({
            topic: topic,
            spike_type: analysis.sentiment_score > avgScore ? 'positive' : 'negative',
            magnitude: spike,
            baseline_value: avgScore,
            spike_value: analysis.sentiment_score,
            duration_minutes: 0, // Will be updated by background processes
            region: region,
            metadata: {
              entities: analysis.entities,
              emotions: analysis.emotions,
              source: source
            }
          });
      }
    }

    // Store real-time analytics event
    await supabase
      .from('realtime_analytics_events')
      .insert({
        event_type: 'sentiment_analysis',
        event_source: source || 'api',
        event_data: {
          text: text.substring(0, 500), // Store first 500 chars
          analysis: analysis,
          topic: topic
        },
        region: region,
        processed: true
      });

    return new Response(JSON.stringify({
      success: true,
      analysis: analysis,
      topic: topic,
      trend_id: trendData?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-sentiment-analyzer:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});