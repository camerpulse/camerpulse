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

interface SignalItem {
  id: string;
  content_text: string;
  platform: string;
  author_handle?: string;
  created_at: string;
  sentiment_score: number;
  confidence_score: number;
  threat_level: string;
  region_detected?: string;
  emotional_tone?: string[];
  keywords_detected?: string[];
  author_influence_score?: number;
  engagement_metrics?: any;
  priority_score?: number;
  urgency_level?: string;
  change_from_baseline?: number;
  topic_relevance?: number;
  spike_indicator?: boolean;
}

interface PatternShift {
  id: string;
  pattern_type: 'sentiment_spike' | 'emotion_surge' | 'topic_emergence' | 'regional_anomaly';
  region?: string;
  emotion?: string;
  topic?: string;
  baseline_value: number;
  current_value: number;
  change_magnitude: number;
  confidence: number;
  detected_at: string;
}

interface IntelligenceMetrics {
  total_signals_processed: number;
  high_priority_signals: number;
  pattern_shifts_detected: number;
  baseline_sentiment: number;
  current_sentiment_drift: number;
  urgency_threshold: number;
  relevance_threshold: number;
}

// Calculate moving average baseline for sentiment
async function calculateSentimentBaseline(timeframe: number = 7): Promise<number> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);

  const { data, error } = await supabase
    .from('camerpulse_intelligence_sentiment_logs')
    .select('sentiment_score')
    .gte('created_at', startDate.toISOString())
    .not('sentiment_score', 'is', null);

  if (error || !data || data.length === 0) {
    return 0;
  }

  const average = data.reduce((sum, item) => sum + (item.sentiment_score || 0), 0) / data.length;
  return average;
}

// Calculate priority score using multi-factor algorithm
function calculatePriorityScore(signal: SignalItem, baseline: number): {
  priority_score: number;
  urgency_level: string;
  change_from_baseline: number;
  topic_relevance: number;
} {
  // Calculate change from baseline (sentiment drift)
  const change_from_baseline = Math.abs((signal.sentiment_score || 0) - baseline);
  
  // Calculate urgency based on threat level, confidence, and sentiment magnitude
  let urgency_weight = 0;
  switch (signal.threat_level) {
    case 'critical': urgency_weight = 1.0; break;
    case 'high': urgency_weight = 0.8; break;
    case 'medium': urgency_weight = 0.6; break;
    case 'low': urgency_weight = 0.4; break;
    default: urgency_weight = 0.2; break;
  }

  // Boost urgency for high sentiment magnitude
  if (Math.abs(signal.sentiment_score || 0) > 0.7) {
    urgency_weight = Math.min(1.0, urgency_weight + 0.2);
  }

  // Calculate topic relevance based on keywords and categories
  let topic_relevance = 0.5; // Base relevance
  const politicalKeywords = ['election', 'government', 'president', 'minister', 'politics', 'biya', 'corruption'];
  const securityKeywords = ['boko haram', 'separatist', 'military', 'conflict', 'violence', 'anglophone'];
  const economicKeywords = ['unemployment', 'inflation', 'economy', 'poverty', 'salary'];
  
  if (signal.keywords_detected) {
    const hasHighPriorityKeywords = signal.keywords_detected.some(keyword => 
      politicalKeywords.includes(keyword.toLowerCase()) ||
      securityKeywords.includes(keyword.toLowerCase()) ||
      economicKeywords.includes(keyword.toLowerCase())
    );
    
    if (hasHighPriorityKeywords) {
      topic_relevance = Math.min(1.0, topic_relevance + 0.4);
    }
  }

  // Boost relevance for high-influence authors
  if (signal.author_influence_score && signal.author_influence_score > 0.7) {
    topic_relevance = Math.min(1.0, topic_relevance + 0.2);
  }

  // Calculate emotion intensity factor
  let emotion_intensity = 0.5;
  if (signal.emotional_tone && signal.emotional_tone.length > 0) {
    const highIntensityEmotions = ['anger', 'fear', 'rage', 'panic'];
    const hasHighIntensity = signal.emotional_tone.some(emotion => 
      highIntensityEmotions.includes(emotion.toLowerCase())
    );
    
    if (hasHighIntensity) {
      emotion_intensity = 0.8;
    } else if (signal.emotional_tone.length > 2) {
      emotion_intensity = 0.7; // Multiple emotions indicate complexity
    }
  }

  // Weighted priority score calculation
  const priority_score = (
    urgency_weight * 0.4 +           // 40% weight for urgency
    change_from_baseline * 0.3 +     // 30% weight for change magnitude
    topic_relevance * 0.2 +          // 20% weight for topic relevance
    emotion_intensity * 0.1          // 10% weight for emotion intensity
  );

  // Determine urgency level based on priority score
  let urgency_level = 'low';
  if (priority_score >= 0.8) urgency_level = 'critical';
  else if (priority_score >= 0.6) urgency_level = 'high';
  else if (priority_score >= 0.4) urgency_level = 'medium';

  return {
    priority_score,
    urgency_level,
    change_from_baseline,
    topic_relevance
  };
}

// Detect pattern shifts and spikes
async function detectPatternShifts(): Promise<PatternShift[]> {
  const shifts: PatternShift[] = [];
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  try {
    // Detect sentiment spikes by region
    const { data: recentRegionalData } = await supabase
      .from('camerpulse_intelligence_sentiment_logs')
      .select('region_detected, sentiment_score')
      .gte('created_at', oneHourAgo.toISOString())
      .not('region_detected', 'is', null)
      .not('sentiment_score', 'is', null);

    const { data: baselineRegionalData } = await supabase
      .from('camerpulse_intelligence_sentiment_logs')
      .select('region_detected, sentiment_score')
      .gte('created_at', oneDayAgo.toISOString())
      .lt('created_at', oneHourAgo.toISOString())
      .not('region_detected', 'is', null)
      .not('sentiment_score', 'is', null);

    if (recentRegionalData && baselineRegionalData) {
      const recentByRegion = groupByRegion(recentRegionalData);
      const baselineByRegion = groupByRegion(baselineRegionalData);

      Object.keys(recentByRegion).forEach(region => {
        if (baselineByRegion[region] && recentByRegion[region].length >= 3) {
          const recentAvg = recentByRegion[region].reduce((sum, item) => sum + item.sentiment_score, 0) / recentByRegion[region].length;
          const baselineAvg = baselineByRegion[region].reduce((sum, item) => sum + item.sentiment_score, 0) / baselineByRegion[region].length;
          
          const changeMagnitude = Math.abs(recentAvg - baselineAvg);
          
          if (changeMagnitude > 0.3) { // Significant sentiment shift
            shifts.push({
              id: `sentiment_spike_${region}_${Date.now()}`,
              pattern_type: 'sentiment_spike',
              region,
              baseline_value: baselineAvg,
              current_value: recentAvg,
              change_magnitude: recentAvg - baselineAvg,
              confidence: Math.min(0.95, changeMagnitude * 2),
              detected_at: now.toISOString()
            });
          }
        }
      });
    }

    // Detect emotion surges
    const { data: recentEmotionData } = await supabase
      .from('camerpulse_intelligence_sentiment_logs')
      .select('emotional_tone')
      .gte('created_at', oneHourAgo.toISOString())
      .not('emotional_tone', 'is', null);

    if (recentEmotionData) {
      const emotionCounts = countEmotions(recentEmotionData);
      const totalRecent = recentEmotionData.length;

      // Get baseline emotion counts
      const { data: baselineEmotionData } = await supabase
        .from('camerpulse_intelligence_sentiment_logs')
        .select('emotional_tone')
        .gte('created_at', oneDayAgo.toISOString())
        .lt('created_at', oneHourAgo.toISOString())
        .not('emotional_tone', 'is', null);

      if (baselineEmotionData && baselineEmotionData.length > 0) {
        const baselineEmotionCounts = countEmotions(baselineEmotionData);
        const totalBaseline = baselineEmotionData.length;

        Object.keys(emotionCounts).forEach(emotion => {
          const recentFreq = emotionCounts[emotion] / totalRecent;
          const baselineFreq = (baselineEmotionCounts[emotion] || 0) / totalBaseline;
          
          if (recentFreq > 0.1 && recentFreq > baselineFreq * 2) { // 2x increase and significant presence
            shifts.push({
              id: `emotion_surge_${emotion}_${Date.now()}`,
              pattern_type: 'emotion_surge',
              emotion,
              baseline_value: baselineFreq,
              current_value: recentFreq,
              change_magnitude: recentFreq / Math.max(baselineFreq, 0.01),
              confidence: Math.min(0.9, recentFreq * 3),
              detected_at: now.toISOString()
            });
          }
        });
      }
    }

    // Detect topic emergence
    const { data: trendingTopics } = await supabase
      .from('camerpulse_intelligence_trending_topics')
      .select('topic_text, volume_score, first_detected_at')
      .gte('first_detected_at', oneHourAgo.toISOString())
      .order('volume_score', { ascending: false })
      .limit(5);

    if (trendingTopics) {
      trendingTopics.forEach(topic => {
        if (topic.volume_score > 10) { // Minimum threshold for emergence
          shifts.push({
            id: `topic_emergence_${topic.topic_text}_${Date.now()}`,
            pattern_type: 'topic_emergence',
            topic: topic.topic_text,
            baseline_value: 0,
            current_value: topic.volume_score,
            change_magnitude: topic.volume_score,
            confidence: Math.min(0.85, topic.volume_score / 50),
            detected_at: topic.first_detected_at
          });
        }
      });
    }

  } catch (error) {
    console.error('Error detecting pattern shifts:', error);
  }

  return shifts;
}

// Helper functions
function groupByRegion(data: any[]): Record<string, any[]> {
  return data.reduce((acc, item) => {
    if (!acc[item.region_detected]) {
      acc[item.region_detected] = [];
    }
    acc[item.region_detected].push(item);
    return acc;
  }, {} as Record<string, any[]>);
}

function countEmotions(data: any[]): Record<string, number> {
  const counts: Record<string, number> = {};
  
  data.forEach(item => {
    if (Array.isArray(item.emotional_tone)) {
      item.emotional_tone.forEach((emotion: string) => {
        counts[emotion] = (counts[emotion] || 0) + 1;
      });
    }
  });
  
  return counts;
}

// Update intelligence thresholds based on sentiment drift
async function updateIntelligenceThresholds(currentDrift: number) {
  try {
    const { data: existingConfig } = await supabase
      .from('camerpulse_intelligence_config')
      .select('config_value')
      .eq('config_key', 'intelligence_thresholds')
      .single();

    let baseThresholds = {
      urgency_threshold: 0.7,
      relevance_threshold: 0.6,
      pattern_sensitivity: 0.3
    };

    if (existingConfig?.config_value) {
      baseThresholds = { ...baseThresholds, ...existingConfig.config_value };
    }

    // Adjust thresholds based on sentiment drift
    const driftMagnitude = Math.abs(currentDrift);
    let adjustmentFactor = 1.0;

    if (driftMagnitude > 0.5) {
      adjustmentFactor = 0.8; // Lower thresholds during high volatility
    } else if (driftMagnitude > 0.3) {
      adjustmentFactor = 0.9; // Slightly lower thresholds
    } else if (driftMagnitude < 0.1) {
      adjustmentFactor = 1.1; // Higher thresholds during stability
    }

    const updatedThresholds = {
      urgency_threshold: Math.max(0.5, Math.min(0.9, baseThresholds.urgency_threshold * adjustmentFactor)),
      relevance_threshold: Math.max(0.4, Math.min(0.8, baseThresholds.relevance_threshold * adjustmentFactor)),
      pattern_sensitivity: Math.max(0.2, Math.min(0.5, baseThresholds.pattern_sensitivity * adjustmentFactor)),
      last_updated: new Date().toISOString(),
      drift_factor: currentDrift
    };

    await supabase
      .from('camerpulse_intelligence_config')
      .upsert({
        config_key: 'intelligence_thresholds',
        config_type: 'system',
        config_value: updatedThresholds,
        description: 'Auto-adjusting intelligence processing thresholds'
      });

    return updatedThresholds;
  } catch (error) {
    console.error('Error updating intelligence thresholds:', error);
    throw error;
  }
}

// Push high-priority signals to alerts
async function pushSignalToAlerts(signal: SignalItem) {
  try {
    await supabase
      .from('camerpulse_intelligence_alerts')
      .insert({
        alert_type: 'high_priority_signal',
        severity: signal.urgency_level,
        title: `${signal.urgency_level.toUpperCase()} Priority Signal Detected`,
        description: signal.content_text.substring(0, 200) + '...',
        affected_regions: signal.region_detected ? [signal.region_detected] : [],
        sentiment_data: {
          priority_score: signal.priority_score,
          sentiment_score: signal.sentiment_score,
          emotional_tone: signal.emotional_tone,
          platform: signal.platform
        },
        related_content_ids: [signal.id]
      });

    console.log(`Pushed signal ${signal.id} to alerts system`);
  } catch (error) {
    console.error('Error pushing signal to alerts:', error);
    throw error;
  }
}

// Main intelligence analysis function
async function analyzeSignals(): Promise<{
  top_signals: SignalItem[];
  pattern_shifts: PatternShift[];
  intelligence_metrics: IntelligenceMetrics;
}> {
  console.log('Starting signal intelligence analysis...');

  // Get recent signals (last 2 hours)
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  
  const { data: recentSignals, error } = await supabase
    .from('camerpulse_intelligence_sentiment_logs')
    .select('*')
    .gte('created_at', twoHoursAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Failed to fetch signals: ${error.message}`);
  }

  // Calculate baseline sentiment
  const baseline = await calculateSentimentBaseline();
  
  // Calculate current sentiment drift
  const currentSentiment = recentSignals && recentSignals.length > 0
    ? recentSignals.reduce((sum, s) => sum + (s.sentiment_score || 0), 0) / recentSignals.length
    : 0;
  
  const currentDrift = currentSentiment - baseline;

  // Process and rank signals
  const processedSignals: SignalItem[] = (recentSignals || []).map(signal => {
    const scoring = calculatePriorityScore(signal, baseline);
    
    return {
      ...signal,
      ...scoring,
      spike_indicator: scoring.change_from_baseline > 0.5
    };
  });

  // Sort by priority score and take top 10
  const topSignals = processedSignals
    .sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))
    .slice(0, 10);

  // Detect pattern shifts
  const patternShifts = await detectPatternShifts();

  // Calculate metrics
  const metrics: IntelligenceMetrics = {
    total_signals_processed: processedSignals.length,
    high_priority_signals: processedSignals.filter(s => (s.priority_score || 0) >= 0.6).length,
    pattern_shifts_detected: patternShifts.length,
    baseline_sentiment: baseline,
    current_sentiment_drift: currentDrift,
    urgency_threshold: 0.7,
    relevance_threshold: 0.6
  };

  // Store analysis results
  await supabase
    .from('camerpulse_intelligence_config')
    .upsert({
      config_key: 'latest_intelligence_analysis',
      config_type: 'cache',
      config_value: {
        top_signals: topSignals,
        pattern_shifts: patternShifts,
        metrics,
        analyzed_at: new Date().toISOString()
      },
      description: 'Latest signal intelligence analysis results'
    });

  console.log(`Analysis complete: ${topSignals.length} top signals, ${patternShifts.length} pattern shifts`);

  return {
    top_signals: topSignals,
    pattern_shifts: patternShifts,
    intelligence_metrics: metrics
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, signal, current_drift } = await req.json();

    switch (action) {
      case 'analyze_signals':
        const analysisResults = await analyzeSignals();
        
        return new Response(JSON.stringify({ 
          success: true,
          ...analysisResults
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'push_to_alerts':
        if (!signal) {
          throw new Error('Signal data required for alert push');
        }
        
        await pushSignalToAlerts(signal);
        
        return new Response(JSON.stringify({ 
          success: true,
          message: 'Signal pushed to alerts successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'update_thresholds':
        if (typeof current_drift !== 'number') {
          throw new Error('Current drift value required for threshold update');
        }
        
        const updatedThresholds = await updateIntelligenceThresholds(current_drift);
        
        return new Response(JSON.stringify({ 
          success: true,
          thresholds: updatedThresholds
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ 
          error: 'Unknown action' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Error in signal-intelligence-core:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});