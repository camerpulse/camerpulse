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

// OpenAI API key for narrative generation
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface GenerationSettings {
  tone: 'journalistic' | 'analyst' | 'diplomatic';
  length: 'brief' | 'standard' | 'detailed';
  focus: 'balanced' | 'security' | 'political' | 'social';
  includeQuotes: boolean;
  includePredictions: boolean;
  language: 'english' | 'french';
}

interface NarrativeReport {
  id: string;
  date: string;
  type: 'daily' | 'weekly';
  title: string;
  summary: string;
  narrative: string;
  keyInsights: string[];
  quotableQuotes: string[];
  tone: string;
  metadata: {
    emotionalShifts: Array<{ region: string; shift: string; analysis: string }>;
    dangerSpikes: Array<{ location: string; level: string; context: string }>;
    partyMomentum: Array<{ party: string; trend: string; analysis: string }>;
    trendingIssues: Array<{ issue: string; volume: number; sentiment: string; analysis: string }>;
  };
  generatedAt: string;
}

// Generate narrative report using AI
async function generateNarrativeReport(
  date: string, 
  type: 'daily' | 'weekly', 
  settings: GenerationSettings
): Promise<NarrativeReport> {
  console.log(`Generating ${type} narrative report for ${date} with settings:`, settings);
  
  // Get raw data from the intelligence system
  const rawData = await gatherIntelligenceData(date, type);
  
  // Generate AI narrative
  const aiResponse = await generateAINarrative(rawData, settings);
  
  // Parse and structure the response
  const narrativeReport: NarrativeReport = {
    id: crypto.randomUUID(),
    date,
    type,
    title: aiResponse.title || `Civic Intelligence Report - ${date}`,
    summary: aiResponse.summary || '',
    narrative: aiResponse.narrative || '',
    keyInsights: aiResponse.keyInsights || [],
    quotableQuotes: aiResponse.quotableQuotes || [],
    tone: settings.tone,
    metadata: {
      emotionalShifts: aiResponse.emotionalShifts || [],
      dangerSpikes: aiResponse.dangerSpikes || [],
      partyMomentum: aiResponse.partyMomentum || [],
      trendingIssues: aiResponse.trendingIssues || []
    },
    generatedAt: new Date().toISOString()
  };

  // Store the narrative report
  await storeNarrativeReport(narrativeReport);
  
  return narrativeReport;
}

// Gather intelligence data for analysis
async function gatherIntelligenceData(date: string, type: 'daily' | 'weekly') {
  const startDate = new Date(date);
  const endDate = new Date(date);
  
  if (type === 'weekly') {
    startDate.setDate(startDate.getDate() - 7);
  } else {
    endDate.setDate(endDate.getDate() + 1);
  }

  try {
    // Get sentiment data
    const { data: sentimentData } = await supabase
      .from('camerpulse_intelligence_sentiment_logs')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(1000);

    // Get trending topics
    const { data: trendsData } = await supabase
      .from('camerpulse_intelligence_trending_topics')
      .select('*')
      .gte('last_updated_at', startDate.toISOString())
      .order('volume_score', { ascending: false })
      .limit(20);

    // Get regional sentiment
    const { data: regionalData } = await supabase
      .from('camerpulse_intelligence_regional_sentiment')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    // Get alerts
    const { data: alertsData } = await supabase
      .from('camerpulse_intelligence_alerts')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(20);

    return {
      sentimentLogs: sentimentData || [],
      trendingTopics: trendsData || [],
      regionalSentiment: regionalData || [],
      alerts: alertsData || [],
      timeframe: { start: startDate.toISOString(), end: endDate.toISOString() },
      type
    };
  } catch (error) {
    console.error('Error gathering intelligence data:', error);
    throw error;
  }
}

// Generate AI narrative using OpenAI
async function generateAINarrative(data: any, settings: GenerationSettings) {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = generateSystemPrompt(settings);
  const dataPrompt = generateDataPrompt(data, settings);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: dataPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating AI narrative:', error);
    throw error;
  }
}

// Generate system prompt based on settings
function generateSystemPrompt(settings: GenerationSettings): string {
  const { tone, length, focus, includeQuotes, includePredictions, language } = settings;
  
  let prompt = `You are a professional civic intelligence analyst specializing in Cameroon. Your task is to generate comprehensive narrative reports about civic sentiment, political developments, and social trends.

WRITING STYLE: ${tone === 'journalistic' ? 'Write in a clear, engaging journalistic style suitable for news publications.' : 
                tone === 'analyst' ? 'Write in a analytical, data-driven style suitable for intelligence briefings.' :
                'Write in a diplomatic, measured tone suitable for government communications.'}

REPORT LENGTH: ${length === 'brief' ? 'Keep analysis concise and focused on key points.' :
                 length === 'standard' ? 'Provide balanced coverage with adequate detail.' :
                 'Provide comprehensive analysis with extensive detail.'}

FOCUS AREA: ${focus === 'security' ? 'Emphasize security implications and threat assessments.' :
              focus === 'political' ? 'Focus on political developments and party dynamics.' :
              focus === 'social' ? 'Highlight social movements and public sentiment.' :
              'Provide balanced coverage across all areas.'}

LANGUAGE: Generate the report in ${language === 'french' ? 'French' : 'English'}.

REQUIREMENTS:
- Generate a JSON response with the following structure
- Provide specific, actionable insights
- Include regional analysis for Cameroon's 10 regions
- Reference actual data points and trends
- ${includeQuotes ? 'Include impactful quotable statements' : 'Focus on analysis without quotes'}
- ${includePredictions ? 'Include forward-looking predictions' : 'Focus on current trends only'}

JSON RESPONSE FORMAT:
{
  "title": "Report title",
  "summary": "Executive summary (2-3 sentences)",
  "narrative": "Main analysis (3-5 paragraphs)",
  "keyInsights": ["insight1", "insight2", "insight3"],
  "quotableQuotes": ["quote1", "quote2"],
  "emotionalShifts": [{"region": "Region", "shift": "direction", "analysis": "explanation"}],
  "dangerSpikes": [{"location": "Location", "level": "high/medium/low", "context": "explanation"}],
  "partyMomentum": [{"party": "Party Name", "trend": "rising/falling/stable", "analysis": "explanation"}],
  "trendingIssues": [{"issue": "Issue", "volume": number, "sentiment": "positive/negative/neutral", "analysis": "explanation"}]
}`;

  return prompt;
}

// Generate data prompt
function generateDataPrompt(data: any, settings: GenerationSettings): string {
  const { sentimentLogs, trendingTopics, regionalSentiment, alerts, timeframe, type } = data;
  
  return `Generate a ${type} civic intelligence narrative report for Cameroon based on the following data:

TIMEFRAME: ${timeframe.start} to ${timeframe.end}

SENTIMENT DATA (${sentimentLogs.length} posts analyzed):
${sentimentLogs.slice(0, 10).map((log: any) => 
  `- ${log.platform}: "${log.content_text.substring(0, 100)}..." | Sentiment: ${log.sentiment_polarity} (${log.sentiment_score}) | Region: ${log.region_detected || 'Unknown'} | Threat: ${log.threat_level || 'none'}`
).join('\n')}

TRENDING TOPICS (${trendingTopics.length} topics):
${trendingTopics.slice(0, 10).map((topic: any) => 
  `- "${topic.topic_text}" | Volume: ${topic.volume_score} | Sentiment: ${topic.sentiment_score} | Growth: ${topic.growth_rate || 0}%`
).join('\n')}

REGIONAL SENTIMENT (${regionalSentiment.length} regions):
${regionalSentiment.map((region: any) => 
  `- ${region.region}: Overall sentiment ${region.overall_sentiment} | Threat level: ${region.threat_level} | Volume: ${region.content_volume} | Emotions: ${(region.dominant_emotions || []).join(', ')}`
).join('\n')}

ALERTS & INCIDENTS (${alerts.length} alerts):
${alerts.map((alert: any) => 
  `- ${alert.alert_type}: "${alert.title}" | Severity: ${alert.severity} | Regions: ${(alert.affected_regions || []).join(', ')}`
).join('\n')}

Based on this data, analyze:
1. Overall civic sentiment and emotional shifts across regions
2. Political momentum and party-related developments  
3. Security threats and danger level changes
4. Emerging social issues and public concerns
5. Cross-regional patterns and implications

Generate insights that would be valuable for government officials, security agencies, and civil society organizations monitoring Cameroon's civic landscape.`;
}

// Store narrative report in database
async function storeNarrativeReport(report: NarrativeReport) {
  try {
    // For now, we'll store in the camerpulse_intelligence_config table as narrative reports
    const { error } = await supabase
      .from('camerpulse_intelligence_config')
      .insert({
        config_key: `narrative_report_${report.id}`,
        config_type: 'narrative_report',
        config_value: report,
        description: `${report.type} narrative report for ${report.date}`
      });

    if (error) {
      console.error('Error storing narrative report:', error);
      throw error;
    }

    console.log('Narrative report stored successfully:', report.id);
  } catch (error) {
    console.error('Failed to store narrative report:', error);
    throw error;
  }
}

// List stored narrative reports
async function listNarrativeReports(limit = 10): Promise<NarrativeReport[]> {
  try {
    const { data, error } = await supabase
      .from('camerpulse_intelligence_config')
      .select('config_value')
      .eq('config_type', 'narrative_report')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data?.map(item => item.config_value as NarrativeReport) || [];
  } catch (error) {
    console.error('Error listing narrative reports:', error);
    return [];
  }
}

// Export narrative report
async function exportNarrativeReport(reportId: string, format: 'pdf' | 'html' | 'txt'): Promise<string> {
  // Get the report
  const { data, error } = await supabase
    .from('camerpulse_intelligence_config')
    .select('config_value')
    .eq('config_key', `narrative_report_${reportId}`)
    .single();

  if (error || !data) {
    throw new Error('Report not found');
  }

  const report = data.config_value as NarrativeReport;

  switch (format) {
    case 'html':
      return generateHTMLReport(report);
    case 'txt':
      return generateTextReport(report);
    case 'pdf':
      // For PDF, return HTML for now (can be converted to PDF on frontend)
      return generateHTMLReport(report);
    default:
      throw new Error('Unsupported format');
  }
}

// Generate HTML report
function generateHTMLReport(report: NarrativeReport): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 2.2em; margin-bottom: 10px; color: #333; }
        .meta { color: #666; font-style: italic; }
        .summary { background: #f5f5f5; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0; }
        .narrative { margin: 30px 0; }
        .narrative p { margin-bottom: 20px; text-align: justify; }
        .insights { margin: 30px 0; }
        .insights ul { padding-left: 0; }
        .insights li { list-style: none; padding: 10px 0; border-bottom: 1px solid #eee; }
        .quotes { margin: 30px 0; }
        .quote { background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 3px solid #333; font-style: italic; }
        .metadata { margin-top: 40px; }
        .section { margin: 20px 0; }
        .section h3 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">${report.title}</h1>
        <div class="meta">
            ${report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report • ${report.date} • ${report.tone.charAt(0).toUpperCase() + report.tone.slice(1)} Analysis
        </div>
    </div>

    <div class="summary">
        <h2>Executive Summary</h2>
        <p>${report.summary}</p>
    </div>

    <div class="narrative">
        <h2>Analysis</h2>
        ${report.narrative.split('\n\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
    </div>

    ${report.keyInsights.length > 0 ? `
    <div class="insights">
        <h2>Key Insights</h2>
        <ul>
            ${report.keyInsights.map(insight => `<li>• ${insight}</li>`).join('')}
        </ul>
    </div>
    ` : ''}

    ${report.quotableQuotes.length > 0 ? `
    <div class="quotes">
        <h2>Notable Statements</h2>
        ${report.quotableQuotes.map(quote => `<div class="quote">"${quote}"</div>`).join('')}
    </div>
    ` : ''}

    <div class="metadata">
        <div class="section">
            <h3>Regional Emotional Shifts</h3>
            ${report.metadata.emotionalShifts.map(shift => 
              `<p><strong>${shift.region}:</strong> ${shift.shift} - ${shift.analysis}</p>`
            ).join('')}
        </div>

        <div class="section">
            <h3>Civic Danger Assessment</h3>
            ${report.metadata.dangerSpikes.map(spike => 
              `<p><strong>${spike.location}:</strong> ${spike.level.toUpperCase()} level - ${spike.context}</p>`
            ).join('')}
        </div>

        <div class="section">
            <h3>Political Momentum</h3>
            ${report.metadata.partyMomentum.map(momentum => 
              `<p><strong>${momentum.party}:</strong> ${momentum.trend} - ${momentum.analysis}</p>`
            ).join('')}
        </div>

        <div class="section">
            <h3>Trending Issues</h3>
            ${report.metadata.trendingIssues.map(issue => 
              `<p><strong>${issue.issue}:</strong> ${issue.sentiment} sentiment (${issue.volume} mentions) - ${issue.analysis}</p>`
            ).join('')}
        </div>
    </div>

    <div class="footer">
        <p>Generated by CamerPulse Civic Intelligence System<br>
        Report ID: ${report.id} • Generated: ${new Date(report.generatedAt).toLocaleString()}</p>
    </div>
</body>
</html>`;
}

// Generate text report
function generateTextReport(report: NarrativeReport): string {
  return `
${report.title}
${'='.repeat(report.title.length)}

${report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report • ${report.date} • ${report.tone.charAt(0).toUpperCase() + report.tone.slice(1)} Analysis

EXECUTIVE SUMMARY
-----------------
${report.summary}

ANALYSIS
--------
${report.narrative}

${report.keyInsights.length > 0 ? `
KEY INSIGHTS
------------
${report.keyInsights.map(insight => `• ${insight}`).join('\n')}
` : ''}

${report.quotableQuotes.length > 0 ? `
NOTABLE STATEMENTS
------------------
${report.quotableQuotes.map(quote => `"${quote}"`).join('\n\n')}
` : ''}

REGIONAL EMOTIONAL SHIFTS
-------------------------
${report.metadata.emotionalShifts.map(shift => 
  `${shift.region}: ${shift.shift} - ${shift.analysis}`
).join('\n')}

CIVIC DANGER ASSESSMENT
-----------------------
${report.metadata.dangerSpikes.map(spike => 
  `${spike.location}: ${spike.level.toUpperCase()} level - ${spike.context}`
).join('\n')}

POLITICAL MOMENTUM
------------------
${report.metadata.partyMomentum.map(momentum => 
  `${momentum.party}: ${momentum.trend} - ${momentum.analysis}`
).join('\n')}

TRENDING ISSUES
---------------
${report.metadata.trendingIssues.map(issue => 
  `${issue.issue}: ${issue.sentiment} sentiment (${issue.volume} mentions) - ${issue.analysis}`
).join('\n')}

---
Generated by CamerPulse Civic Intelligence System
Report ID: ${report.id} • Generated: ${new Date(report.generatedAt).toLocaleString()}
`;
}

// Main server handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();

    switch (action) {
      case 'generate_narrative':
        const { date, type, settings } = params;
        const report = await generateNarrativeReport(date, type, settings);
        return new Response(JSON.stringify({ report }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'list_reports':
        const { limit } = params;
        const reports = await listNarrativeReports(limit);
        return new Response(JSON.stringify({ reports }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'export_narrative':
        const { reportId, format } = params;
        const content = await exportNarrativeReport(reportId, format);
        return new Response(JSON.stringify({ content }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'send_narrative':
        // Placeholder for email/telegram sending
        return new Response(JSON.stringify({ success: true, message: 'Sending functionality not yet implemented' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error: any) {
    console.error('Error in civic-narrative-generator function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});