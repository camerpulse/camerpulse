import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TrendData {
  topic: string;
  mentions: number;
  sentiment: number;
  timeframe: string;
  sources: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { timeframe = '24h', threshold_multiplier = 2.0 } = await req.json();

    console.log(`Detecting trends for timeframe: ${timeframe}`);

    // Calculate time range
    const now = new Date();
    let hoursBack = 24;
    switch (timeframe) {
      case '1h': hoursBack = 1; break;
      case '6h': hoursBack = 6; break;
      case '12h': hoursBack = 12; break;
      case '24h': hoursBack = 24; break;
      case '48h': hoursBack = 48; break;
      case '7d': hoursBack = 24 * 7; break;
    }

    const startTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);

    // Fetch sentiment trends for analysis
    const { data: sentimentData, error: sentimentError } = await supabase
      .from('sentiment_trends')
      .select('topic, sentiment_score, mention_count, created_at, region')
      .gte('created_at', startTime.toISOString())
      .order('created_at', { ascending: false });

    if (sentimentError) {
      throw new Error(`Error fetching sentiment data: ${sentimentError.message}`);
    }

    // Fetch civic complaints for trend analysis
    const { data: complaintsData, error: complaintsError } = await supabase
      .from('civic_complaints')
      .select('subject, priority, region, created_at')
      .gte('created_at', startTime.toISOString());

    if (complaintsError) {
      console.warn('Could not fetch complaints data:', complaintsError.message);
    }

    // Aggregate data by topic
    const topicStats: Record<string, TrendData> = {};

    // Process sentiment trends
    if (sentimentData) {
      sentimentData.forEach(trend => {
        const topic = trend.topic.toLowerCase();
        if (!topicStats[topic]) {
          topicStats[topic] = {
            topic: trend.topic,
            mentions: 0,
            sentiment: 0,
            timeframe,
            sources: []
          };
        }
        topicStats[topic].mentions += trend.mention_count || 1;
        topicStats[topic].sentiment = (topicStats[topic].sentiment + trend.sentiment_score) / 2;
        if (!topicStats[topic].sources.includes('sentiment_analysis')) {
          topicStats[topic].sources.push('sentiment_analysis');
        }
      });
    }

    // Process civic complaints
    if (complaintsData) {
      complaintsData.forEach(complaint => {
        const topic = complaint.subject?.toLowerCase() || 'general';
        if (!topicStats[topic]) {
          topicStats[topic] = {
            topic: complaint.subject || 'General',
            mentions: 0,
            sentiment: 0,
            timeframe,
            sources: []
          };
        }
        topicStats[topic].mentions += 1;
        if (!topicStats[topic].sources.includes('civic_complaints')) {
          topicStats[topic].sources.push('civic_complaints');
        }
      });
    }

    // Calculate baselines and detect trends
    const trends = [];
    const detectedTrends = [];

    for (const [topicKey, stats] of Object.entries(topicStats)) {
      // Get historical baseline for this topic
      const { data: historicalData } = await supabase
        .from('sentiment_trends')
        .select('mention_count')
        .eq('topic', stats.topic)
        .lt('created_at', startTime.toISOString())
        .gte('created_at', new Date(startTime.getTime() - hoursBack * 2 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      let baseline = 0;
      if (historicalData && historicalData.length > 0) {
        baseline = historicalData.reduce((sum, record) => sum + (record.mention_count || 1), 0) / historicalData.length;
      }

      // Detect if current mentions exceed threshold
      const threshold = Math.max(baseline * threshold_multiplier, 5); // Minimum threshold of 5
      const isTrading = stats.mentions >= threshold;
      const velocity = baseline > 0 ? (stats.mentions - baseline) / baseline : 0;

      if (isTrading || velocity > 0.5) {
        const trendScore = Math.min(velocity / 2, 1); // Normalize to 0-1
        
        // Determine trend status
        let status = 'emerging';
        if (velocity > 2) status = 'growing';
        if (velocity > 5) status = 'peaking';

        const trendDetection = {
          trend_name: stats.topic,
          trend_type: 'topic',
          detection_algorithm: 'mention_threshold_v1',
          base_threshold: threshold,
          current_value: stats.mentions,
          peak_value: stats.mentions,
          trend_score: trendScore,
          velocity: velocity,
          acceleration: 0, // Would need more historical data
          geographic_distribution: {}, // Could be enhanced with region data
          demographic_breakdown: {},
          related_trends: [],
          status: status
        };

        // Store trend detection
        const { data: storedTrend, error: trendError } = await supabase
          .from('trend_detection')
          .insert(trendDetection)
          .select()
          .single();

        if (!trendError) {
          detectedTrends.push(storedTrend);
        }

        // Store as trending topic
        const { error: topicError } = await supabase
          .from('trending_topics')
          .insert({
            topic: stats.topic,
            category: 'politics', // Default category
            mention_count: stats.mentions,
            sentiment_score: stats.sentiment,
            trend_direction: velocity > 0 ? 'rising' : velocity < -0.2 ? 'falling' : 'stable',
            velocity_score: Math.abs(velocity),
            regions: [], // Could be enhanced with region data
            languages: ['en', 'fr'], // Default for Cameroon
            related_entities: [],
            keywords: [stats.topic.toLowerCase()],
            peak_mention_time: now.toISOString(),
            trend_duration_hours: hoursBack,
            data_sources: stats.sources,
            metadata: {
              baseline: baseline,
              threshold: threshold,
              velocity: velocity,
              detection_time: now.toISOString()
            }
          });

        if (!topicError) {
          trends.push({
            topic: stats.topic,
            mentions: stats.mentions,
            baseline: baseline,
            velocity: velocity,
            trend_score: trendScore,
            status: status
          });
        }
      }
    }

    console.log(`Detected ${trends.length} trending topics`);

    // Generate intelligence alerts for significant trends
    for (const trend of trends) {
      if (trend.velocity > 3 || trend.mentions > 50) {
        await supabase
          .from('camerpulse_intelligence_alerts')
          .insert({
            alert_category: 'civic_unrest',
            alert_severity: trend.velocity > 5 ? 'critical' : 'warning',
            alert_title: `Trending Topic Alert: ${trend.topic}`,
            alert_description: `Unusual spike in discussions about "${trend.topic}". Current mentions: ${trend.mentions}, Velocity: ${trend.velocity.toFixed(2)}x baseline.`,
            detection_method: 'trend_detection_algorithm',
            source_systems: ['sentiment_analysis', 'civic_complaints'],
            affected_regions: [], // Could be enhanced
            confidence_level: Math.min(trend.trend_score + 0.3, 1),
            raw_data: {
              mentions: trend.mentions,
              baseline: trend.baseline,
              velocity: trend.velocity
            },
            processed_indicators: {
              trend_score: trend.trend_score,
              status: trend.status,
              timeframe: timeframe
            },
            recommended_actions: [
              'Monitor social media for related discussions',
              'Check for underlying issues in affected areas',
              'Prepare public communication if needed'
            ]
          });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      timeframe: timeframe,
      trends_detected: trends.length,
      total_topics_analyzed: Object.keys(topicStats).length,
      trends: trends,
      threshold_multiplier: threshold_multiplier
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in trend-detector:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});