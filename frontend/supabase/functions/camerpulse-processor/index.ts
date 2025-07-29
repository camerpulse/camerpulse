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

// Dynamic local context - loaded from database
let localContext: any = null;
let lastContextUpdate = 0;
const CONTEXT_CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

// Load local context from database
async function loadLocalContext() {
  const now = Date.now();
  if (localContext && (now - lastContextUpdate) < CONTEXT_CACHE_DURATION) {
    return localContext;
  }

  try {
    const { data, error } = await supabase
      .from('camerpulse_intelligence_config')
      .select('config_key, config_value')
      .eq('config_type', 'local_context');

    if (error) {
      console.error('Error loading local context:', error);
      return getDefaultContext();
    }

    const context: any = {};
    data?.forEach(item => {
      context[item.config_key] = item.config_value;
    });

    localContext = context;
    lastContextUpdate = now;
    return context;
  } catch (error) {
    console.error('Failed to load local context:', error);
    return getDefaultContext();
  }
}

// Fallback default context
function getDefaultContext() {
  return {
    cameroon_slang_patterns: {
      pidgin: {
        greetings: ['how far', 'how body', 'wetin dey happen', 'na so'],
        agreement: ['na so', 'true talk', 'i agree sotay', 'na correct'],
        disagreement: ['no be so', 'wey lie', 'dat na wash', 'fake news']
      },
      french: {
        slang: ['wesh', 'genre', 'franchement', 'carrément'],
        politics: ['les politiciens', 'le gouvernement', 'les élections']
      }
    },
    political_figures_dynamic: {
      current_officials: {
        president: ['paul biya', 'biya', 'le président'],
        prime_minister: ['joseph dion ngute', 'pm']
      },
      nicknames: {
        paul_biya: ['le lion', 'pdb', 'boss'],
        maurice_kamto: ['président élu', 'le professeur']
      }
    }
  };
}

const cameroonRegions = [
  'Centre', 'Littoral', 'Southwest', 'Northwest', 'West', 
  'East', 'Adamawa', 'North', 'Far North', 'South'
];

const cameroonCities = [
  'Yaoundé', 'Douala', 'Bamenda', 'Bafoussam', 'Garoua', 
  'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Kribi',
  'Limbe', 'Buea', 'Kumba', 'Foumban', 'Dschang'
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
            content: `You are CamerPulse Intelligence, an AI system analyzing public sentiment in Cameroon. Analyze the following text and respond with a JSON object containing:
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

// Enhanced sentiment analysis with local context
async function basicSentimentAnalysis(text: string): Promise<Partial<SentimentResult>> {
  const lowerText = text.toLowerCase();
  const context = await loadLocalContext();
  
  // Enhanced language detection with local patterns
  let language = 'en';
  const slangPatterns = context.cameroon_slang_patterns || {};
  
  if (slangPatterns.pidgin?.greetings?.some((pattern: string) => lowerText.includes(pattern.toLowerCase())) ||
      slangPatterns.pidgin?.agreement?.some((pattern: string) => lowerText.includes(pattern.toLowerCase()))) {
    language = 'pidgin';
  } else if (/\b(le|la|les|un|une|des|et|ou|mais|donc|car|ni|ce|cette|ces|mon|ma|mes)\b/.test(lowerText) ||
             slangPatterns.french?.slang?.some((pattern: string) => lowerText.includes(pattern.toLowerCase()))) {
    language = 'fr';
  }

  // Enhanced sentiment scoring with local context
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'happy', 'proud'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'angry', 'sad', 'frustrated', 'disappointed'];
  
  // Add local positive/negative expressions
  const localEmotions = slangPatterns[language]?.emotions || {};
  if (localEmotions.joy) positiveWords.push(...localEmotions.joy);
  if (localEmotions.anger) negativeWords.push(...localEmotions.anger);
  
  let score = 0;
  positiveWords.forEach(word => {
    const count = (lowerText.match(new RegExp(word.toLowerCase(), 'g')) || []).length;
    score += count * 0.5;
  });
  negativeWords.forEach(word => {
    const count = (lowerText.match(new RegExp(word.toLowerCase(), 'g')) || []).length;
    score -= count * 0.5;
  });

  // Check for sarcasm and invert if detected
  const sentimentRules = context.sentiment_enhancement_rules || {};
  const sarcasmPatterns = sentimentRules.sarcasm_detection?.patterns || [];
  const hasSarcasm = sarcasmPatterns.some((pattern: string) => lowerText.includes(pattern.toLowerCase()));
  if (hasSarcasm && sentimentRules.sarcasm_detection?.invert_sentiment) {
    score = -score;
  }

  // Normalize score
  score = Math.max(-1, Math.min(1, score / 3));
  
  const polarity = score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral';

  // Enhanced emotion detection with local context
  const emotions: string[] = [];
  const allEmotions = { ...localEmotions };
  
  // Add default emotions if not in local context
  if (!allEmotions.anger) allEmotions.anger = ['angry', 'furious', 'mad', 'vex'];
  if (!allEmotions.joy) allEmotions.joy = ['happy', 'glad', 'excited'];
  if (!allEmotions.fear) allEmotions.fear = ['afraid', 'scared', 'worried'];
  if (!allEmotions.hope) allEmotions.hope = ['hope', 'optimistic', 'faith'];
  
  Object.entries(allEmotions).forEach(([emotion, patterns]) => {
    if (Array.isArray(patterns) && patterns.some(pattern => lowerText.includes(pattern.toLowerCase()))) {
      emotions.push(emotion);
    }
  });

  // Enhanced category detection with political figures
  const categories: string[] = [];
  const politicalFigures = context.political_figures_dynamic || {};
  const regionalContext = context.regional_context || {};
  
  // Check for political figures and parties
  if (politicalFigures.current_officials) {
    Object.values(politicalFigures.current_officials).flat().forEach((figure: any) => {
      if (lowerText.includes(figure.toLowerCase())) {
        categories.push('governance');
      }
    });
  }
  
  if (politicalFigures.political_parties) {
    politicalFigures.political_parties.forEach((party: string) => {
      if (lowerText.includes(party.toLowerCase())) {
        categories.push('election');
      }
    });
  }

  // Regional crisis detection
  if (regionalContext.regions) {
    Object.entries(regionalContext.regions).forEach(([region, data]: [string, any]) => {
      if (data.keywords?.some((keyword: string) => lowerText.includes(keyword.toLowerCase()))) {
        categories.push('security');
        if (data.emotions) emotions.push(...data.emotions);
      }
    });
  }

  // Enhanced threat detection with multipliers
  let threatLevel: SentimentResult['threatLevel'] = 'none';
  let threatScore = 0;
  const threatMultipliers = sentimentRules.threat_escalation?.keywords_multiplier || {};
  
  Object.entries(threatMultipliers).forEach(([keyword, multiplier]) => {
    if (lowerText.includes(keyword.toLowerCase())) {
      threatScore += (multiplier as number);
    }
  });
  
  if (threatScore >= 6) threatLevel = 'critical';
  else if (threatScore >= 4) threatLevel = 'high';
  else if (threatScore >= 2) threatLevel = 'medium';
  else if (threatScore > 0) threatLevel = 'low';

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

  // Extract keywords from categories and detected terms
  const keywords = [...new Set([...categories, ...emotions])];

  return {
    polarity,
    score,
    emotions: [...new Set(emotions)],
    confidence: 0.85, // Higher confidence with enhanced local context
    language,
    categories: [...new Set(categories)],
    keywords,
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
      .from('camerpulse_intelligence_sentiment_logs')
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
      .from('camerpulse_intelligence_alerts')
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

// Enhanced self-learning function with local context updates
async function updateLearningLogs(
  inputData: any,
  patternIdentified: string,
  confidenceImprovement: number
) {
  try {
    await supabase
      .from('camerpulse_intelligence_learning_logs')
      .insert({
        learning_type: 'local_context_learning',
        input_data: inputData,
        pattern_identified: patternIdentified,
        confidence_improvement: confidenceImprovement,
        validation_score: 0.9
      });

    // Auto-update political figures if new ones are detected
    if (patternIdentified.includes('new_political_figure')) {
      await updatePoliticalFigures(inputData);
    }

    // Learn new slang patterns
    if (patternIdentified.includes('new_slang_pattern')) {
      await updateSlangPatterns(inputData);
    }
  } catch (error) {
    console.error('Error updating learning logs:', error);
  }
}

// Update political figures dynamically
async function updatePoliticalFigures(data: any) {
  try {
    const { data: currentConfig } = await supabase
      .from('camerpulse_intelligence_config')
      .select('config_value')
      .eq('config_key', 'political_figures_dynamic')
      .single();

    if (currentConfig && data.newFigure) {
      const updatedConfig = { ...currentConfig.config_value };
      if (!updatedConfig.detected_figures) updatedConfig.detected_figures = [];
      updatedConfig.detected_figures.push({
        name: data.newFigure,
        first_detected: new Date().toISOString(),
        confidence: data.confidence || 0.8
      });

      await supabase
        .from('camerpulse_intelligence_config')
        .update({ 
          config_value: updatedConfig,
          last_evolution_update: new Date().toISOString()
        })
        .eq('config_key', 'political_figures_dynamic');
    }
  } catch (error) {
    console.error('Error updating political figures:', error);
  }
}

// Update slang patterns dynamically
async function updateSlangPatterns(data: any) {
  try {
    const { data: currentConfig } = await supabase
      .from('camerpulse_intelligence_config')
      .select('config_value')
      .eq('config_key', 'cameroon_slang_patterns')
      .single();

    if (currentConfig && data.newPattern) {
      const updatedConfig = { ...currentConfig.config_value };
      const language = data.language || 'en';
      
      if (!updatedConfig[language]) updatedConfig[language] = {};
      if (!updatedConfig[language].learned_patterns) updatedConfig[language].learned_patterns = [];
      
      updatedConfig[language].learned_patterns.push({
        pattern: data.newPattern,
        sentiment: data.sentiment,
        confidence: data.confidence || 0.7,
        learned_at: new Date().toISOString()
      });

      await supabase
        .from('camerpulse_intelligence_config')
        .update({ 
          config_value: updatedConfig,
          last_evolution_update: new Date().toISOString()
        })
        .eq('config_key', 'cameroon_slang_patterns');
    }
  } catch (error) {
    console.error('Error updating slang patterns:', error);
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
          .from('camerpulse_intelligence_sentiment_logs')
          .select('*', { count: 'exact', head: true });

        const { data: alertCount } = await supabase
          .from('camerpulse_intelligence_alerts')
          .select('*', { count: 'exact', head: true });

        const { data: trendingCount } = await supabase
          .from('camerpulse_intelligence_trending_topics')
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
    console.error('Error in camerpulse-processor:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});