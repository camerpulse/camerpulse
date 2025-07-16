import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrendingTopic {
  topic: string;
  sentiment_score: number;
  urgency_level: string;
  category: string;
}

interface PollSuggestion {
  title: string;
  description: string;
  question: string;
  options: string[];
  trending_topics: string[];
  confidence_score: number;
  priority_level: string;
  source_event: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Starting poll suggestion generation...');

    // Get trending topics from CamerPulse Intelligence
    const { data: trendingTopics, error: topicsError } = await supabase
      .from('camerpulse_intelligence_trending_topics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (topicsError) {
      console.error('Error fetching trending topics:', topicsError);
      throw new Error('Failed to fetch trending topics');
    }

    console.log(`Found ${trendingTopics?.length || 0} trending topics`);

    if (!trendingTopics || trendingTopics.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No trending topics found',
        suggestions_generated: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get recent sentiment alerts for context
    const { data: alerts } = await supabase
      .from('camerpulse_intelligence_alerts')
      .select('*')
      .eq('alert_category', 'political')
      .order('created_at', { ascending: false })
      .limit(5);

    const suggestions: PollSuggestion[] = [];

    // Process trending topics and generate poll suggestions
    for (const topic of trendingTopics.slice(0, 3)) { // Limit to top 3 topics
      try {
        const pollSuggestion = await generatePollFromTopic(topic, alerts || []);
        if (pollSuggestion) {
          suggestions.push(pollSuggestion);
        }
      } catch (error) {
        console.error(`Error generating poll for topic ${topic.topic}:`, error);
      }
    }

    // Save suggestions to database
    let savedCount = 0;
    for (const suggestion of suggestions) {
      try {
        const { error: insertError } = await supabase
          .from('poll_suggestions')
          .insert({
            title: suggestion.title,
            description: suggestion.description,
            question: suggestion.question,
            options: suggestion.options,
            trending_topics: suggestion.trending_topics,
            confidence_score: suggestion.confidence_score,
            priority_level: suggestion.priority_level,
            source_event: suggestion.source_event,
            suggested_by: 'camerpulse_ai'
          });

        if (!insertError) {
          savedCount++;
        } else {
          console.error('Error saving suggestion:', insertError);
        }
      } catch (error) {
        console.error('Error saving suggestion:', error);
      }
    }

    console.log(`Generated ${suggestions.length} suggestions, saved ${savedCount}`);

    return new Response(JSON.stringify({ 
      message: `Generated ${suggestions.length} poll suggestions`,
      suggestions_generated: suggestions.length,
      suggestions_saved: savedCount,
      suggestions: suggestions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-poll-suggestions function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      suggestions_generated: 0 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generatePollFromTopic(topic: any, alerts: any[]): Promise<PollSuggestion | null> {
  if (!openAIApiKey) {
    console.log('OpenAI API key not found, generating basic poll suggestion');
    return generateBasicPollSuggestion(topic);
  }

  try {
    const contextInfo = alerts.map(alert => 
      `Alert: ${alert.alert_type} - ${alert.description}`
    ).join('\n');

    const prompt = `Based on this trending topic in Cameroon politics/economics, generate a poll suggestion:

Topic: ${topic.topic}
Sentiment Score: ${topic.sentiment_score}
Category: ${topic.category}
Keywords: ${topic.keywords?.join(', ') || 'N/A'}

Recent Context:
${contextInfo}

Generate a poll with:
1. An engaging title (max 80 chars)
2. A brief description (max 200 chars) 
3. A clear question
4. 3-4 balanced poll options
5. Priority level (low/medium/high/urgent)

Focus on current political or economic issues relevant to Cameroonians. Make options balanced and non-biased.

Return JSON format:
{
  "title": "Poll title",
  "description": "Brief description", 
  "question": "Poll question",
  "options": ["Option 1", "Option 2", "Option 3"],
  "priority_level": "medium",
  "confidence_score": 0.85
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are an expert in Cameroonian politics and economics. Generate engaging, balanced poll suggestions based on trending topics. Always return valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    // Parse JSON response
    const pollData = JSON.parse(generatedContent);
    
    return {
      title: pollData.title,
      description: pollData.description,
      question: pollData.question,
      options: pollData.options,
      trending_topics: [topic.topic, ...(topic.keywords || [])],
      confidence_score: pollData.confidence_score || 0.8,
      priority_level: pollData.priority_level || 'medium',
      source_event: `Trending topic: ${topic.topic}`
    };

  } catch (error) {
    console.error('Error with OpenAI generation:', error);
    return generateBasicPollSuggestion(topic);
  }
}

function generateBasicPollSuggestion(topic: any): PollSuggestion {
  const templates = [
    {
      title: `Public Opinion: ${topic.topic}`,
      question: `What is your stance on ${topic.topic}?`,
      options: ['Strongly Support', 'Support', 'Neutral', 'Oppose', 'Strongly Oppose']
    },
    {
      title: `Future of ${topic.topic} in Cameroon`,
      question: `How should Cameroon address ${topic.topic}?`,
      options: ['Immediate action needed', 'Gradual approach', 'Maintain status quo', 'Need more information']
    },
    {
      title: `Impact Assessment: ${topic.topic}`,
      question: `How will ${topic.topic} affect ordinary Cameroonians?`,
      options: ['Very positive impact', 'Positive impact', 'No significant impact', 'Negative impact', 'Very negative impact']
    }
  ];

  const template = templates[Math.floor(Math.random() * templates.length)];
  
  return {
    title: template.title.slice(0, 80),
    description: `Generated poll based on trending topic: ${topic.topic}`,
    question: template.question,
    options: template.options,
    trending_topics: [topic.topic],
    confidence_score: 0.6,
    priority_level: topic.urgency_level || 'medium',
    source_event: `Trending topic: ${topic.topic}`
  };
}