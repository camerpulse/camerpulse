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

interface LocationInfo {
  city_town: string;
  region: string;
  division: string;
  subdivision: string;
  latitude: number;
  longitude: number;
  alternative_names: string[];
}

// Comprehensive location detection for Cameroon
function detectDetailedLocation(content: string): {
  region: string;
  city: string;
  division?: string;
  subdivision?: string;
  confidence: number;
} {
  const contentLower = content.toLowerCase();
  
  // Comprehensive location mapping with all major cities, towns, and alternative names
  const locationDatabase: Record<string, LocationInfo> = {
    // Centre Region
    'yaoundé': { city_town: 'Yaoundé', region: 'Centre', division: 'Mfoundi', subdivision: 'Yaoundé I', latitude: 3.848, longitude: 11.502, alternative_names: ['yaounde', 'yde', 'political capital'] },
    'yaounde': { city_town: 'Yaoundé', region: 'Centre', division: 'Mfoundi', subdivision: 'Yaoundé I', latitude: 3.848, longitude: 11.502, alternative_names: [] },
    'yde': { city_town: 'Yaoundé', region: 'Centre', division: 'Mfoundi', subdivision: 'Yaoundé I', latitude: 3.848, longitude: 11.502, alternative_names: [] },
    'bafia': { city_town: 'Bafia', region: 'Centre', division: 'Mbam-et-Inoubou', subdivision: 'Bafia', latitude: 4.75, longitude: 11.23, alternative_names: [] },
    'nanga-eboko': { city_town: 'Nanga-Eboko', region: 'Centre', division: 'Haute-Sanaga', subdivision: 'Nanga-Eboko', latitude: 4.69, longitude: 12.37, alternative_names: ['nanga eboko'] },

    // Littoral Region
    'douala': { city_town: 'Douala', region: 'Littoral', division: 'Wouri', subdivision: 'Douala I', latitude: 4.048, longitude: 9.754, alternative_names: ['dla', 'economic capital'] },
    'dla': { city_town: 'Douala', region: 'Littoral', division: 'Wouri', subdivision: 'Douala I', latitude: 4.048, longitude: 9.754, alternative_names: [] },
    'edéa': { city_town: 'Edéa', region: 'Littoral', division: 'Sanaga-Maritime', subdivision: 'Edéa', latitude: 3.8, longitude: 10.13, alternative_names: ['edea'] },
    'edea': { city_town: 'Edéa', region: 'Littoral', division: 'Sanaga-Maritime', subdivision: 'Edéa', latitude: 3.8, longitude: 10.13, alternative_names: [] },
    'nkongsamba': { city_town: 'Nkongsamba', region: 'Littoral', division: 'Mungo', subdivision: 'Nkongsamba', latitude: 4.95, longitude: 9.94, alternative_names: [] },

    // Northwest Region
    'bamenda': { city_town: 'Bamenda', region: 'Northwest', division: 'Mezam', subdivision: 'Bamenda I', latitude: 5.96, longitude: 10.15, alternative_names: ['abakwa', 'mankon'] },
    'abakwa': { city_town: 'Bamenda', region: 'Northwest', division: 'Mezam', subdivision: 'Bamenda I', latitude: 5.96, longitude: 10.15, alternative_names: [] },
    'mankon': { city_town: 'Bamenda', region: 'Northwest', division: 'Mezam', subdivision: 'Bamenda I', latitude: 5.96, longitude: 10.15, alternative_names: [] },
    'kumbo': { city_town: 'Kumbo', region: 'Northwest', division: 'Bui', subdivision: 'Kumbo', latitude: 6.2, longitude: 10.67, alternative_names: [] },
    'nkambe': { city_town: 'Nkambe', region: 'Northwest', division: 'Donga-Mantung', subdivision: 'Nkambe', latitude: 6.58, longitude: 10.77, alternative_names: [] },
    'mbengwi': { city_town: 'Mbengwi', region: 'Northwest', division: 'Momo', subdivision: 'Mbengwi', latitude: 6.17, longitude: 9.68, alternative_names: [] },
    'wum': { city_town: 'Wum', region: 'Northwest', division: 'Menchum', subdivision: 'Wum', latitude: 6.38, longitude: 10.07, alternative_names: [] },
    'fundong': { city_town: 'Fundong', region: 'Northwest', division: 'Boyo', subdivision: 'Fundong', latitude: 6.22, longitude: 10.3, alternative_names: [] },

    // Southwest Region
    'buea': { city_town: 'Buea', region: 'Southwest', division: 'Fako', subdivision: 'Buea', latitude: 4.15, longitude: 9.24, alternative_names: ['buea town'] },
    'limbe': { city_town: 'Limbe', region: 'Southwest', division: 'Fako', subdivision: 'Limbe I', latitude: 4.02, longitude: 9.2, alternative_names: ['victoria'] },
    'victoria': { city_town: 'Limbe', region: 'Southwest', division: 'Fako', subdivision: 'Limbe I', latitude: 4.02, longitude: 9.2, alternative_names: [] },
    'kumba': { city_town: 'Kumba', region: 'Southwest', division: 'Meme', subdivision: 'Kumba I', latitude: 4.63, longitude: 9.45, alternative_names: [] },
    'mamfe': { city_town: 'Mamfe', region: 'Southwest', division: 'Manyu', subdivision: 'Mamfe Central', latitude: 5.75, longitude: 9.3, alternative_names: [] },
    'mundemba': { city_town: 'Mundemba', region: 'Southwest', division: 'Ndian', subdivision: 'Mundemba', latitude: 4.57, longitude: 8.87, alternative_names: [] },
    'tiko': { city_town: 'Tiko', region: 'Southwest', division: 'Fako', subdivision: 'Tiko', latitude: 4.08, longitude: 9.36, alternative_names: [] },

    // Far North Region
    'maroua': { city_town: 'Maroua', region: 'Far North', division: 'Diamaré', subdivision: 'Maroua I', latitude: 10.6, longitude: 14.32, alternative_names: [] },
    'garoua': { city_town: 'Garoua', region: 'Far North', division: 'Bénoué', subdivision: 'Garoua I', latitude: 9.3, longitude: 13.4, alternative_names: [] },
    'yagoua': { city_town: 'Yagoua', region: 'Far North', division: 'Mayo-Danay', subdivision: 'Yagoua', latitude: 10.33, longitude: 15.23, alternative_names: [] },
    'kousséri': { city_town: 'Kousséri', region: 'Far North', division: 'Logone-et-Chari', subdivision: 'Kousséri', latitude: 12.08, longitude: 15.03, alternative_names: ['kousseri'] },
    'kousseri': { city_town: 'Kousséri', region: 'Far North', division: 'Logone-et-Chari', subdivision: 'Kousséri', latitude: 12.08, longitude: 15.03, alternative_names: [] },
    'mora': { city_town: 'Mora', region: 'Far North', division: 'Mayo-Sava', subdivision: 'Mora', latitude: 11.05, longitude: 14.13, alternative_names: [] },

    // North Region
    'poli': { city_town: 'Poli', region: 'North', division: 'Faro', subdivision: 'Poli', latitude: 8.42, longitude: 13.25, alternative_names: [] },
    'tcholliré': { city_town: 'Tcholliré', region: 'North', division: 'Mayo-Rey', subdivision: 'Tcholliré', latitude: 8.38, longitude: 14.17, alternative_names: ['tchollire'] },
    'tchollire': { city_town: 'Tcholliré', region: 'North', division: 'Mayo-Rey', subdivision: 'Tcholliré', latitude: 8.38, longitude: 14.17, alternative_names: [] },

    // Adamawa Region
    'ngaoundéré': { city_town: 'Ngaoundéré', region: 'Adamawa', division: 'Vina', subdivision: 'Ngaoundéré I', latitude: 7.32, longitude: 13.58, alternative_names: ['ngaoundere'] },
    'ngaoundere': { city_town: 'Ngaoundéré', region: 'Adamawa', division: 'Vina', subdivision: 'Ngaoundéré I', latitude: 7.32, longitude: 13.58, alternative_names: [] },
    'meiganga': { city_town: 'Meiganga', region: 'Adamawa', division: 'Mbéré', subdivision: 'Meiganga', latitude: 6.52, longitude: 14.3, alternative_names: [] },
    'tibati': { city_town: 'Tibati', region: 'Adamawa', division: 'Djérem', subdivision: 'Tibati', latitude: 6.47, longitude: 12.63, alternative_names: [] },

    // East Region
    'bertoua': { city_town: 'Bertoua', region: 'East', division: 'Haut-Nyong', subdivision: 'Bertoua I', latitude: 4.58, longitude: 13.68, alternative_names: [] },
    'batouri': { city_town: 'Batouri', region: 'East', division: 'Kadey', subdivision: 'Batouri', latitude: 4.43, longitude: 14.37, alternative_names: [] },
    'bélabo': { city_town: 'Bélabo', region: 'East', division: 'Lom-et-Djérem', subdivision: 'Bélabo', latitude: 4.93, longitude: 13.3, alternative_names: ['belabo'] },
    'belabo': { city_town: 'Bélabo', region: 'East', division: 'Lom-et-Djérem', subdivision: 'Bélabo', latitude: 4.93, longitude: 13.3, alternative_names: [] },

    // South Region
    'ebolowa': { city_town: 'Ebolowa', region: 'South', division: 'Mvila', subdivision: 'Ebolowa I', latitude: 2.92, longitude: 11.15, alternative_names: [] },
    'sangmélima': { city_town: 'Sangmélima', region: 'South', division: 'Dja-et-Lobo', subdivision: 'Sangmélima', latitude: 2.93, longitude: 11.98, alternative_names: ['sangmelima'] },
    'sangmelima': { city_town: 'Sangmélima', region: 'South', division: 'Dja-et-Lobo', subdivision: 'Sangmélima', latitude: 2.93, longitude: 11.98, alternative_names: [] },
    'kribi': { city_town: 'Kribi', region: 'South', division: 'Océan', subdivision: 'Kribi', latitude: 2.95, longitude: 9.91, alternative_names: [] },

    // West Region
    'bafoussam': { city_town: 'Bafoussam', region: 'West', division: 'Mifi', subdivision: 'Bafoussam I', latitude: 5.48, longitude: 10.42, alternative_names: [] },
    'mbouda': { city_town: 'Mbouda', region: 'West', division: 'Bamboutos', subdivision: 'Mbouda', latitude: 5.62, longitude: 10.25, alternative_names: [] },
    'bafang': { city_town: 'Bafang', region: 'West', division: 'Haut-Nkam', subdivision: 'Bafang', latitude: 5.15, longitude: 10.18, alternative_names: [] },
    'foumban': { city_town: 'Foumban', region: 'West', division: 'Noun', subdivision: 'Foumban', latitude: 5.72, longitude: 10.9, alternative_names: [] },
    'dschang': { city_town: 'Dschang', region: 'West', division: 'Menoua', subdivision: 'Dschang', latitude: 5.45, longitude: 10.05, alternative_names: [] },
  };

  // Find exact matches first
  for (const [keyword, location] of Object.entries(locationDatabase)) {
    if (contentLower.includes(keyword)) {
      return {
        region: location.region,
        city: location.city_town,
        division: location.division,
        subdivision: location.subdivision,
        confidence: 0.9
      };
    }
  }

  // Check alternative names
  for (const [keyword, location] of Object.entries(locationDatabase)) {
    for (const altName of location.alternative_names) {
      if (contentLower.includes(altName.toLowerCase())) {
        return {
          region: location.region,
          city: location.city_town,
          division: location.division,
          subdivision: location.subdivision,
          confidence: 0.8
        };
      }
    }
  }

  // Fallback to region-only detection
  const regionPatterns = {
    'Centre': ['centre', 'central', 'yaoundé', 'yaounde'],
    'Littoral': ['littoral', 'coastal', 'douala'],
    'Northwest': ['northwest', 'nw', 'nord-ouest', 'bamenda'],
    'Southwest': ['southwest', 'sw', 'sud-ouest', 'buea', 'limbe'],
    'Far North': ['far north', 'extreme-nord', 'maroua', 'garoua'],
    'North': ['north', 'nord', 'garoua'],
    'Adamawa': ['adamawa', 'adamaoua', 'ngaoundéré'],
    'East': ['east', 'est', 'bertoua'],
    'South': ['south', 'sud', 'ebolowa'],
    'West': ['west', 'ouest', 'bafoussam']
  };

  for (const [region, keywords] of Object.entries(regionPatterns)) {
    if (keywords.some(keyword => contentLower.includes(keyword))) {
      return {
        region,
        city: 'Unknown',
        confidence: 0.6
      };
    }
  }

  return {
    region: 'Unknown',
    city: 'Unknown',
    confidence: 0.1
  };
}

// Enhanced location detection for incoming content
async function enhanceLocationDetection(contentData: any) {
  try {
    const locationInfo = detectDetailedLocation(contentData.content || '');
    
    // Update the sentiment log with detailed location
    const enhancedData = {
      ...contentData,
      region_detected: locationInfo.region,
      city_detected: locationInfo.city !== 'Unknown' ? locationInfo.city : null,
      subdivision_detected: locationInfo.subdivision || null,
      coordinates: locationInfo.region !== 'Unknown' ? {
        detection_confidence: locationInfo.confidence,
        method: 'content_analysis'
      } : null
    };

    return enhancedData;
  } catch (error) {
    console.error('Error enhancing location detection:', error);
    return contentData;
  }
}

// Generate local sentiment aggregations
async function generateLocalSentimentData() {
  try {
    console.log('Generating local sentiment aggregations...');

    // Get sentiment logs with city information from the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: sentimentLogs } = await supabase
      .from('camerpulse_intelligence_sentiment_logs')
      .select('*')
      .not('city_detected', 'is', null)
      .gte('created_at', sevenDaysAgo);

    if (!sentimentLogs || sentimentLogs.length === 0) {
      console.log('No sentiment logs with city data found');
      return { success: true, message: 'No data to aggregate' };
    }

    // Group by city and calculate aggregated metrics
    const cityAggregations = new Map<string, any>();

    sentimentLogs.forEach(log => {
      const key = `${log.city_detected}_${log.region_detected}`;
      
      if (!cityAggregations.has(key)) {
        cityAggregations.set(key, {
          region: log.region_detected,
          city_town: log.city_detected,
          subdivision: log.subdivision_detected,
          sentiments: [],
          emotions: [],
          concerns: [],
          hashtags: [],
          volume: 0,
          threat_indicators: []
        });
      }

      const cityData = cityAggregations.get(key);
      cityData.sentiments.push(log.sentiment_score || 0);
      if (log.emotional_tone) cityData.emotions.push(...log.emotional_tone);
      if (log.keywords_detected) cityData.concerns.push(...log.keywords_detected);
      if (log.hashtags) cityData.hashtags.push(...log.hashtags);
      if (log.threat_level && log.threat_level !== 'none') {
        cityData.threat_indicators.push(log.threat_level);
      }
      cityData.volume++;
    });

    // Process aggregations and insert into local sentiment table
    const localSentimentEntries = [];

    for (const [key, data] of cityAggregations) {
      const avgSentiment = data.sentiments.reduce((a: number, b: number) => a + b, 0) / data.sentiments.length;
      
      // Get most common emotions (top 5)
      const emotionCounts = new Map<string, number>();
      data.emotions.forEach((emotion: string) => {
        emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);
      });
      const dominantEmotions = Array.from(emotionCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([emotion]) => emotion);

      // Get top concerns
      const concernCounts = new Map<string, number>();
      data.concerns.forEach((concern: string) => {
        concernCounts.set(concern, (concernCounts.get(concern) || 0) + 1);
      });
      const topConcerns = Array.from(concernCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([concern]) => concern);

      // Get trending hashtags
      const hashtagCounts = new Map<string, number>();
      data.hashtags.forEach((hashtag: string) => {
        hashtagCounts.set(hashtag, (hashtagCounts.get(hashtag) || 0) + 1);
      });
      const trendingHashtags = Array.from(hashtagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([hashtag]) => hashtag);

      // Determine threat level
      const threatLevel = data.threat_indicators.length > data.volume * 0.3 ? 'high' :
                         data.threat_indicators.length > data.volume * 0.15 ? 'medium' : 'low';

      // Get location details from database
      const { data: locationInfo } = await supabase
        .from('cameroon_locations')
        .select('*')
        .eq('city_town', data.city_town)
        .eq('region', data.region)
        .single();

      const entry = {
        region: data.region,
        division: locationInfo?.division || null,
        subdivision: data.subdivision || locationInfo?.subdivision,
        city_town: data.city_town,
        overall_sentiment: avgSentiment,
        sentiment_breakdown: {
          positive: data.sentiments.filter((s: number) => s > 0.1).length,
          negative: data.sentiments.filter((s: number) => s < -0.1).length,
          neutral: data.sentiments.filter((s: number) => s >= -0.1 && s <= 0.1).length,
          avg_score: avgSentiment
        },
        dominant_emotions: dominantEmotions,
        top_concerns: topConcerns,
        trending_hashtags: trendingHashtags,
        content_volume: data.volume,
        threat_level: threatLevel,
        population_estimate: locationInfo?.population || null,
        is_major_city: locationInfo?.is_major_city || false,
        urban_rural: locationInfo?.urban_rural || 'urban',
        latitude: locationInfo?.latitude || null,
        longitude: locationInfo?.longitude || null,
        date_recorded: new Date().toISOString().split('T')[0]
      };

      localSentimentEntries.push(entry);
    }

    // Insert or update local sentiment data
    if (localSentimentEntries.length > 0) {
      const { error } = await supabase
        .from('camerpulse_intelligence_local_sentiment')
        .upsert(localSentimentEntries, {
          onConflict: 'city_town,region,date_recorded'
        });

      if (error) {
        console.error('Error inserting local sentiment data:', error);
        return { success: false, error: error.message };
      }

      console.log(`Generated local sentiment data for ${localSentimentEntries.length} cities`);
    }

    return {
      success: true,
      message: `Generated local sentiment data for ${localSentimentEntries.length} cities`,
      cities_processed: localSentimentEntries.length,
      total_logs_analyzed: sentimentLogs.length
    };

  } catch (error) {
    console.error('Error generating local sentiment data:', error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();

    switch (action) {
      case 'enhance_location_detection': {
        const { content_data } = params;
        const enhancedData = await enhanceLocationDetection(content_data);
        
        return new Response(JSON.stringify({
          success: true,
          data: enhancedData
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'generate_local_sentiment': {
        const result = await generateLocalSentimentData();
        
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'detect_location': {
        const { content } = params;
        const locationInfo = detectDetailedLocation(content);
        
        return new Response(JSON.stringify({
          success: true,
          location: locationInfo
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ 
          error: 'Unknown action. Available: enhance_location_detection, generate_local_sentiment, detect_location' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Error in local-sentiment-mapper:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});