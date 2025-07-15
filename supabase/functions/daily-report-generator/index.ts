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

interface DailyReportData {
  date: string;
  totalAnalyzed: number;
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  emotionalTones: Array<{ emotion: string; count: number; percentage: number }>;
  dangerIndex: number;
  threatLevel: string;
  topTrends: Array<{ topic: string; volume: number; sentiment: number }>;
  politicalMentions: Array<{ figure: string; mentions: number; sentiment: number }>;
  regionalActivity: Array<{ region: string; activity: number; alertLevel: string }>;
  platformBreakdown: Array<{ platform: string; count: number; percentage: number }>;
  keyEvents: Array<{ event: string; impact: string; time: string }>;
}

// Generate comprehensive daily report
async function generateDailyReport(date: string): Promise<DailyReportData> {
  console.log(`Generating daily report for ${date}`);
  
  const startDate = new Date(date);
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 1);

  try {
    // Get total analyzed posts
    const { count: totalAnalyzed } = await supabase
      .from('camerpulse_intelligence_sentiment_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString());

    // Get sentiment breakdown
    const { data: sentimentData } = await supabase
      .from('camerpulse_intelligence_sentiment_logs')
      .select('sentiment_polarity')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString());

    const sentimentCounts = sentimentData?.reduce((acc, item) => {
      acc[item.sentiment_polarity] = (acc[item.sentiment_polarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const total = totalAnalyzed || 0;
    const sentimentBreakdown = {
      positive: total > 0 ? Math.round(((sentimentCounts.positive || 0) / total) * 100) : 0,
      negative: total > 0 ? Math.round(((sentimentCounts.negative || 0) / total) * 100) : 0,
      neutral: total > 0 ? Math.round(((sentimentCounts.neutral || 0) / total) * 100) : 0,
    };

    // Get emotional tones
    const { data: emotionsData } = await supabase
      .from('camerpulse_intelligence_sentiment_logs')
      .select('emotional_tone')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString())
      .not('emotional_tone', 'is', null);

    const emotionCounts: Record<string, number> = {};
    emotionsData?.forEach(item => {
      if (Array.isArray(item.emotional_tone)) {
        item.emotional_tone.forEach((emotion: string) => {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });
      }
    });

    const emotionalTones = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([emotion, count]) => ({
        emotion,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }));

    // Calculate danger index based on threat levels and negative sentiment
    const { data: threatsData } = await supabase
      .from('camerpulse_intelligence_sentiment_logs')
      .select('threat_level')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString())
      .not('threat_level', 'eq', 'none');

    const threatCounts = threatsData?.reduce((acc, item) => {
      acc[item.threat_level] = (acc[item.threat_level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const criticalThreats = threatCounts.critical || 0;
    const highThreats = threatCounts.high || 0;
    const mediumThreats = threatCounts.medium || 0;
    
    const dangerIndex = Math.min(100, Math.round(
      (criticalThreats * 20 + highThreats * 10 + mediumThreats * 5 + sentimentBreakdown.negative * 0.5)
    ));

    let threatLevel = 'low';
    if (dangerIndex >= 70) threatLevel = 'critical';
    else if (dangerIndex >= 50) threatLevel = 'high';
    else if (dangerIndex >= 30) threatLevel = 'medium';

    // Get trending topics
    const { data: trendsData } = await supabase
      .from('camerpulse_intelligence_trending_topics')
      .select('topic_text, volume_score, sentiment_score')
      .gte('last_updated_at', startDate.toISOString())
      .order('volume_score', { ascending: false })
      .limit(10);

    const topTrends = trendsData?.map(trend => ({
      topic: trend.topic_text,
      volume: trend.volume_score || 0,
      sentiment: trend.sentiment_score || 0
    })) || [];

    // Get political mentions
    const { data: politicalData } = await supabase
      .from('camerpulse_intelligence_sentiment_logs')
      .select('mentions, sentiment_score')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString())
      .not('mentions', 'is', null);

    const politicalCounts: Record<string, { count: number; totalSentiment: number }> = {};
    
    politicalData?.forEach(item => {
      if (Array.isArray(item.mentions)) {
        item.mentions.forEach((mention: string) => {
          if (!politicalCounts[mention]) {
            politicalCounts[mention] = { count: 0, totalSentiment: 0 };
          }
          politicalCounts[mention].count++;
          politicalCounts[mention].totalSentiment += item.sentiment_score || 0;
        });
      }
    });

    const politicalMentions = Object.entries(politicalCounts)
      .map(([figure, data]) => ({
        figure,
        mentions: data.count,
        sentiment: data.count > 0 ? data.totalSentiment / data.count : 0
      }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 10);

    // Get regional activity
    const { data: regionalData } = await supabase
      .from('camerpulse_intelligence_sentiment_logs')
      .select('region_detected, threat_level')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString())
      .not('region_detected', 'is', null);

    const regionCounts: Record<string, { activity: number; threats: string[] }> = {};
    
    regionalData?.forEach(item => {
      if (!regionCounts[item.region_detected]) {
        regionCounts[item.region_detected] = { activity: 0, threats: [] };
      }
      regionCounts[item.region_detected].activity++;
      if (item.threat_level && item.threat_level !== 'none') {
        regionCounts[item.region_detected].threats.push(item.threat_level);
      }
    });

    const regionalActivity = Object.entries(regionCounts)
      .map(([region, data]) => {
        const criticalCount = data.threats.filter(t => t === 'critical').length;
        const highCount = data.threats.filter(t => t === 'high').length;
        
        let alertLevel = 'low';
        if (criticalCount > 0) alertLevel = 'critical';
        else if (highCount > 2) alertLevel = 'high';
        else if (data.threats.length > 5) alertLevel = 'medium';

        return {
          region,
          activity: data.activity,
          alertLevel
        };
      })
      .sort((a, b) => b.activity - a.activity)
      .slice(0, 10);

    // Get platform breakdown
    const { data: platformData } = await supabase
      .from('camerpulse_intelligence_sentiment_logs')
      .select('platform')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString());

    const platformCounts = platformData?.reduce((acc, item) => {
      acc[item.platform] = (acc[item.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const platformBreakdown = Object.entries(platformCounts)
      .map(([platform, count]) => ({
        platform,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Get key events (high-impact or critical threat posts)
    const { data: eventsData } = await supabase
      .from('camerpulse_intelligence_sentiment_logs')
      .select('content_text, threat_level, created_at, engagement_metrics')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString())
      .in('threat_level', ['critical', 'high'])
      .order('created_at', { ascending: false })
      .limit(5);

    const keyEvents = eventsData?.map(event => ({
      event: event.content_text.substring(0, 100) + '...',
      impact: `${event.threat_level.toUpperCase()} threat detected`,
      time: new Date(event.created_at).toLocaleTimeString()
    })) || [];

    return {
      date,
      totalAnalyzed: totalAnalyzed || 0,
      sentimentBreakdown,
      emotionalTones,
      dangerIndex,
      threatLevel,
      topTrends,
      politicalMentions,
      regionalActivity,
      platformBreakdown,
      keyEvents
    };

  } catch (error) {
    console.error('Error generating daily report:', error);
    throw error;
  }
}

// Generate PDF report
async function generatePDFReport(reportData: DailyReportData, settings: any): Promise<string> {
  const htmlContent = generateHTMLReport(reportData, settings);
  
  // For PDF generation, we would typically use a library like Puppeteer
  // For now, returning the HTML content as a placeholder
  return htmlContent;
}

// Generate HTML report
function generateHTMLReport(reportData: DailyReportData, settings: any): string {
  const { includeCharts, headerText, customLogo } = settings;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${headerText}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
        .logo { max-height: 60px; margin-bottom: 15px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
        .metric-label { color: #666; margin-top: 5px; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 1.5em; font-weight: bold; margin-bottom: 15px; color: #333; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .data-table th, .data-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .data-table th { background: #f8f9fa; font-weight: bold; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
        .badge-success { background: #d4edda; color: #155724; }
        .badge-danger { background: #f8d7da; color: #721c24; }
        .badge-warning { background: #fff3cd; color: #856404; }
        .danger-index { font-size: 3em; font-weight: bold; text-align: center; margin: 20px 0; }
        .danger-critical { color: #dc3545; }
        .danger-high { color: #fd7e14; }
        .danger-medium { color: #ffc107; }
        .danger-low { color: #28a745; }
        .progress-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: #007bff; transition: width 0.3s ease; }
        .timestamp { text-align: center; color: #666; margin-top: 30px; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            ${customLogo ? `<img src="${customLogo}" alt="Logo" class="logo">` : ''}
            <h1>${headerText}</h1>
            <p>Report Date: ${reportData.date}</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${reportData.totalAnalyzed.toLocaleString()}</div>
                <div class="metric-label">Total Posts Analyzed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value danger-${reportData.threatLevel}">${reportData.dangerIndex}/100</div>
                <div class="metric-label">Danger Index</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${reportData.sentimentBreakdown.positive}%</div>
                <div class="metric-label">Positive Sentiment</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${reportData.topTrends.length}</div>
                <div class="metric-label">Trending Topics</div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Sentiment Analysis</h2>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                <div style="text-align: center;">
                    <div style="font-size: 2em; color: #28a745;">${reportData.sentimentBreakdown.positive}%</div>
                    <div>Positive</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2em; color: #dc3545;">${reportData.sentimentBreakdown.negative}%</div>
                    <div>Negative</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2em; color: #6c757d;">${reportData.sentimentBreakdown.neutral}%</div>
                    <div>Neutral</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Top Emotional Tones</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Emotion</th>
                        <th>Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.emotionalTones.map(emotion => `
                        <tr>
                            <td>${emotion.emotion}</td>
                            <td>${emotion.count}</td>
                            <td>${emotion.percentage}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2 class="section-title">Political Mentions</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Figure</th>
                        <th>Mentions</th>
                        <th>Avg Sentiment</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.politicalMentions.map(mention => `
                        <tr>
                            <td>${mention.figure}</td>
                            <td>${mention.mentions}</td>
                            <td>
                                <span class="badge ${mention.sentiment > 0 ? 'badge-success' : 'badge-danger'}">
                                    ${mention.sentiment.toFixed(2)}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2 class="section-title">Regional Activity</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Region</th>
                        <th>Activity</th>
                        <th>Alert Level</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.regionalActivity.map(region => `
                        <tr>
                            <td>${region.region}</td>
                            <td>${region.activity}</td>
                            <td>
                                <span class="badge ${
                                  region.alertLevel === 'critical' ? 'badge-danger' :
                                  region.alertLevel === 'high' ? 'badge-warning' : 'badge-success'
                                }">
                                    ${region.alertLevel.toUpperCase()}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        ${reportData.keyEvents.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Key Events</h2>
            <div>
                ${reportData.keyEvents.map(event => `
                    <div style="border-left: 3px solid #dc3545; padding: 15px; margin-bottom: 15px; background: #f8f9fa;">
                        <strong>${event.impact}</strong><br>
                        <div style="margin: 10px 0;">${event.event}</div>
                        <small style="color: #666;">Time: ${event.time}</small>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <div class="timestamp">
            Generated on ${new Date().toLocaleString()} by CamerPulse Intelligence
        </div>
    </div>
</body>
</html>`;
}

// Save/load schedule settings
async function saveScheduleSettings(settings: any) {
  const { error } = await supabase
    .from('camerpulse_intelligence_config')
    .upsert({
      config_key: 'daily_report_schedule',
      config_type: 'system',
      config_value: settings,
      description: 'Automated daily report generation schedule'
    });

  if (error) throw error;
  return { success: true };
}

async function getScheduleSettings() {
  const { data, error } = await supabase
    .from('camerpulse_intelligence_config')
    .select('config_value')
    .eq('config_key', 'daily_report_schedule')
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data?.config_value || null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, date, reportData, settings } = await req.json();

    switch (action) {
      case 'generate_daily_report':
        const report = await generateDailyReport(date);
        return new Response(JSON.stringify({ 
          success: true, 
          report 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'export_report':
        let content: string;
        if (settings.format === 'pdf') {
          content = await generatePDFReport(reportData, settings);
        } else {
          content = generateHTMLReport(reportData, settings);
        }

        return new Response(JSON.stringify({ 
          success: true, 
          content 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'save_schedule':
        await saveScheduleSettings(settings);
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Schedule settings saved successfully' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_schedule':
        const schedule = await getScheduleSettings();
        return new Response(JSON.stringify({ 
          success: true, 
          schedule 
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
    console.error('Error in daily-report-generator:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});