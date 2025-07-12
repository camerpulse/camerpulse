import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// API Keys
const openAIKey = Deno.env.get('OPENAI_API_KEY');
const twitterBearerToken = Deno.env.get('TWITTER_BEARER_TOKEN');
const facebookAccessToken = Deno.env.get('FACEBOOK_ACCESS_TOKEN');
const serpApiKey = Deno.env.get('SERP_API_KEY');

interface SentimentAnalysisRequest {
  content: string;
  platform: string;
  contentId?: string;
  authorHandle?: string;
  engagementMetrics?: any;
}

interface SentimentResult {
  polarity: 'positive' | 'negative' | 'neutral';
  score: number;
  emotions: string[];
  confidence: number;
  language: string;
  categories: string[];
  keywords: string[];
  hashtags: string[];
  mentions: string[];
  region?: string;
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

// Cameroon-specific patterns and keywords
const cameroonRegions = [
  'Centre', 'Littoral', 'Southwest', 'Northwest', 'West', 
  'East', 'Adamawa', 'North', 'Far North', 'South'
];

const cameroonCities = [
  'Yaoundé', 'Douala', 'Bamenda', 'Bafoussam', 'Garoua', 
  'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Kribi',
  'Limbe', 'Buea', 'Kumba', 'Foumban', 'Dschang'
];

const pidginPatterns = [
  'wuna', 'na so', 'no be', 'we di', 'i bi', 'kam kam', 
  'mek we', 'na wa', 'how far', 'no wahala', 'chai'
];

const politicalKeywords = {
  election: ['election', 'vote', 'ballot', 'inec', 'elecam', 'candidate', 'campaign'],
  governance: ['government', 'minister', 'president', 'biya', 'corruption', 'transparency'],
  security: ['boko haram', 'military', 'separatist', 'anglophone', 'conflict', 'crisis'],
  economy: ['unemployment', 'inflation', 'fuel', 'salary', 'poverty', 'economic'],
  youth: ['young', 'student', 'university', 'job', 'graduate', 'education'],
  infrastructure: ['road', 'transport', 'electricity', 'water', 'infrastructure']
};

const emotionalPatterns = {
  anger: ['angry', 'furious', 'mad', 'rage', 'hate', 'disgusted', 'outraged'],
  joy: ['happy', 'glad', 'excited', 'wonderful', 'amazing', 'blessed', 'celebration'],
  fear: ['afraid', 'scared', 'worried', 'anxious', 'terrified', 'panic', 'danger'],
  sadness: ['sad', 'depressed', 'disappointed', 'hurt', 'crying', 'sorrow'],
  pride: ['proud', 'achievement', 'success', 'victory', 'excellence', 'honor'],
  hope: ['hope', 'optimistic', 'future', 'believe', 'faith', 'positive', 'progress'],
  sarcasm: ['really?', 'sure', 'obviously', 'of course', 'wow', 'great job'],
  frustration: ['frustrated', 'tired', 'fed up', 'enough', 'can\'t take', 'give up']
};

const threatKeywords = [
  'violence', 'kill', 'destroy', 'attack', 'bomb', 'gun', 'fight',
  'riot', 'protest', 'strike', 'boycott', 'demonstration', 'uprising',
  'revolution', 'rebel', 'war', 'conflict', 'militia', 'terrorist'
];

// Advanced sentiment analysis using OpenAI
async function analyzeSentimentWithAI(text: string): Promise<Partial<SentimentResult>> {
  if (!openAIKey) {
    console.log('OpenAI API key not configured, using basic analysis');
    return await basicSentimentAnalysis(text);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are Lux Aeterna, an AI system analyzing public sentiment in Cameroon. Analyze the following text and respond with a JSON object containing:
            {
              "polarity": "positive|negative|neutral",
              "score": number between -1.0 and 1.0,
              "emotions": array of detected emotions,
              "confidence": number between 0.0 and 1.0,
              "language": "en|fr|pidgin",
              "categories": array of relevant categories from [election, governance, security, economy, youth, infrastructure, corruption, education],
              "keywords": array of important keywords,
              "hashtags": array of hashtags found,
              "mentions": array of @mentions found,
              "region": detected Cameroon region if any,
              "threatLevel": "none|low|medium|high|critical"
            }
            
            Consider Cameroon context, French/English/Pidgin languages, political climate, and regional tensions.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const result = JSON.parse(content);
      return result;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      return await basicSentimentAnalysis(text);
    }
  } catch (error) {
    console.error('OpenAI analysis failed:', error);
    return await basicSentimentAnalysis(text);
  }
}

// Fallback basic sentiment analysis
async function basicSentimentAnalysis(text: string): Promise<Partial<SentimentResult>> {
  const lowerText = text.toLowerCase();
  
  // Detect language
  let language = 'en';
  if (pidginPatterns.some(pattern => lowerText.includes(pattern))) {
    language = 'pidgin';
  } else if (/\b(le|la|les|un|une|des|et|ou|mais|donc|car|ni|ce|cette|ces|mon|ma|mes)\b/.test(lowerText)) {
    language = 'fr';
  }

  // Basic sentiment scoring
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'happy', 'proud'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'angry', 'sad', 'frustrated', 'disappointed'];
  
  let score = 0;
  positiveWords.forEach(word => {
    const count = (lowerText.match(new RegExp(word, 'g')) || []).length;
    score += count * 0.5;
  });
  negativeWords.forEach(word => {
    const count = (lowerText.match(new RegExp(word, 'g')) || []).length;
    score -= count * 0.5;
  });

  // Normalize score
  score = Math.max(-1, Math.min(1, score / 3));
  
  const polarity = score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral';

  // Detect emotions
  const emotions: string[] = [];
  Object.entries(emotionalPatterns).forEach(([emotion, patterns]) => {
    if (patterns.some(pattern => lowerText.includes(pattern))) {
      emotions.push(emotion);
    }
  });

  // Detect categories
  const categories: string[] = [];
  Object.entries(politicalKeywords).forEach(([category, keywords]) => {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      categories.push(category);
    }
  });

  // Detect threat level
  let threatLevel: SentimentResult['threatLevel'] = 'none';
  const threatCount = threatKeywords.filter(keyword => lowerText.includes(keyword)).length;
  if (threatCount >= 3) threatLevel = 'critical';
  else if (threatCount >= 2) threatLevel = 'high';
  else if (threatCount >= 1) threatLevel = 'medium';

  // Extract hashtags and mentions
  const hashtags = (text.match(/#\w+/g) || []).map(tag => tag.substring(1));
  const mentions = (text.match(/@\w+/g) || []).map(mention => mention.substring(1));

  // Detect region
  let region: string | undefined;
  for (const regionName of cameroonRegions) {
    if (lowerText.includes(regionName.toLowerCase())) {
      region = regionName;
      break;
    }
  }
  if (!region) {
    for (const cityName of cameroonCities) {
      if (lowerText.includes(cityName.toLowerCase())) {
        // Map cities to regions (simplified)
        if (['yaoundé'].includes(cityName.toLowerCase())) region = 'Centre';
        else if (['douala', 'limbe', 'kribi'].includes(cityName.toLowerCase())) region = 'Littoral';
        else if (['bamenda', 'buea', 'limbe', 'kumba'].includes(cityName.toLowerCase())) region = 'Southwest';
        break;
      }
    }
  }

  return {
    polarity,
    score,
    emotions,
    confidence: 0.7,
    language,
    categories,
    keywords: categories,
    hashtags,
    mentions,
    region,
    threatLevel
  };
}

// Store sentiment analysis result
async function storeSentimentResult(
  request: SentimentAnalysisRequest, 
  result: SentimentResult
) {
  try {
    const { error } = await supabase
      .from('lux_aeterna_sentiment_logs')
      .insert({
        platform: request.platform,
        content_id: request.contentId,
        content_text: request.content,
        language_detected: result.language,
        sentiment_polarity: result.polarity,
        sentiment_score: result.score,
        emotional_tone: result.emotions,
        confidence_score: result.confidence,
        content_category: result.categories,
        keywords_detected: result.keywords,
        hashtags: result.hashtags,
        mentions: result.mentions,
        region_detected: result.region,
        author_handle: request.authorHandle,
        engagement_metrics: request.engagementMetrics,
        threat_level: result.threatLevel
      });

    if (error) {
      console.error('Error storing sentiment result:', error);
    }

    // Check for alerts
    if (result.threatLevel === 'high' || result.threatLevel === 'critical') {
      await createThreatAlert(request, result);
    }

  } catch (error) {
    console.error('Error in storeSentimentResult:', error);
  }
}

// Create threat alert
async function createThreatAlert(
  request: SentimentAnalysisRequest,
  result: SentimentResult
) {
  try {
    await supabase
      .from('lux_aeterna_alerts')
      .insert({
        alert_type: 'threat',
        severity: result.threatLevel,
        title: `${result.threatLevel.toUpperCase()} Threat Detected`,
        description: `Potential threat detected in ${request.platform} content: "${request.content.substring(0, 100)}..."`,
        affected_regions: result.region ? [result.region] : [],
        sentiment_data: {
          sentiment_score: result.score,
          emotions: result.emotions,
          categories: result.categories
        }
      });
  } catch (error) {
    console.error('Error creating threat alert:', error);
  }
}

// Self-learning function
async function updateLearningLogs(
  inputData: any,
  patternIdentified: string,
  confidenceImprovement: number
) {
  try {
    await supabase
      .from('lux_aeterna_learning_logs')
      .insert({
        learning_type: 'pattern_detection',
        input_data: inputData,
        pattern_identified: patternIdentified,
        confidence_improvement: confidenceImprovement,
        validation_score: 0.8
      });
  } catch (error) {
    console.error('Error updating learning logs:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();

    switch (action) {
      case 'analyze_sentiment': {
        const request: SentimentAnalysisRequest = data;
        
        console.log(`Analyzing sentiment for ${request.platform} content:`, request.content.substring(0, 100));

        // Perform sentiment analysis
        const analysisResult = await analyzeSentimentWithAI(request.content);
        
        const result: SentimentResult = {
          polarity: analysisResult.polarity || 'neutral',
          score: analysisResult.score || 0,
          emotions: analysisResult.emotions || [],
          confidence: analysisResult.confidence || 0.5,
          language: analysisResult.language || 'en',
          categories: analysisResult.categories || [],
          keywords: analysisResult.keywords || [],
          hashtags: analysisResult.hashtags || [],
          mentions: analysisResult.mentions || [],
          region: analysisResult.region,
          threatLevel: analysisResult.threatLevel || 'none'
        };

        // Store result in database
        await storeSentimentResult(request, result);

        // Log learning data
        await updateLearningLogs(
          { content: request.content, platform: request.platform },
          `Detected ${result.polarity} sentiment with ${result.emotions.join(', ')} emotions`,
          0.1
        );

        return new Response(JSON.stringify({ 
          success: true, 
          result,
          message: 'Sentiment analysis completed successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'bulk_analyze': {
        const requests: SentimentAnalysisRequest[] = data.requests;
        const results = [];

        for (const request of requests) {
          try {
            const analysisResult = await analyzeSentimentWithAI(request.content);
            const result: SentimentResult = {
              polarity: analysisResult.polarity || 'neutral',
              score: analysisResult.score || 0,
              emotions: analysisResult.emotions || [],
              confidence: analysisResult.confidence || 0.5,
              language: analysisResult.language || 'en',
              categories: analysisResult.categories || [],
              keywords: analysisResult.keywords || [],
              hashtags: analysisResult.hashtags || [],
              mentions: analysisResult.mentions || [],
              region: analysisResult.region,
              threatLevel: analysisResult.threatLevel || 'none'
            };

            await storeSentimentResult(request, result);
            results.push({ request, result, success: true });
          } catch (error) {
            console.error('Error processing request:', error);
            results.push({ request, error: error.message, success: false });
          }
        }

        return new Response(JSON.stringify({ 
          success: true, 
          results,
          processed: results.length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_stats': {
        // Get basic statistics
        const { data: sentimentCount } = await supabase
          .from('lux_aeterna_sentiment_logs')
          .select('*', { count: 'exact', head: true });

        const { data: alertCount } = await supabase
          .from('lux_aeterna_alerts')
          .select('*', { count: 'exact', head: true });

        const { data: trendingCount } = await supabase
          .from('lux_aeterna_trending_topics')
          .select('*', { count: 'exact', head: true });

        return new Response(JSON.stringify({
          success: true,
          stats: {
            totalAnalyzed: sentimentCount || 0,
            activeAlerts: alertCount || 0,
            trendingTopics: trendingCount || 0,
            status: 'operational'
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Error in lux-aeterna-processor:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});