import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, ...data } = await req.json();

    switch (action) {
      case 'analyze_content':
        return await analyzeContent(supabaseClient, data);
      case 'scrape_source':
        return await scrapeSource(supabaseClient, data);
      case 'create_alert':
        return await createAlert(supabaseClient, data);
      case 'get_analysis_stats':
        return await getAnalysisStats(supabaseClient);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in civic-media-watch function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function analyzeContent(supabase: any, data: any) {
  const { content_text, content_url, title, source_id } = data;
  
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('Analyzing content with OpenAI...');
  
  // Create initial analysis record
  const { data: analysisResult, error: analysisError } = await supabase
    .rpc('analyze_media_content', {
      p_source_id: source_id,
      p_content_url: content_url,
      p_title: title,
      p_content_text: content_text
    });

  if (analysisError) {
    throw new Error(`Failed to create analysis record: ${analysisError.message}`);
  }

  const analysisId = analysisResult.analysis_id;

  // Analyze with OpenAI
  const analysisPrompt = `
Analyze this Cameroonian political media content for:

1. BIAS LEVEL (0-100): Rate political bias
2. TRUST SCORE (0-100): Rate source credibility 
3. THREAT LEVEL (low/medium/high/critical): Assess civic threat risk
4. TONE: positive/negative/neutral/inflammatory
5. AGENDA: pro-government/anti-government/neutral/partisan
6. DISINFORMATION: List any false claims or misleading information
7. PROPAGANDA: List propaganda techniques used
8. POLITICIANS: Extract mentioned politicians/ministers
9. PARTIES: Extract mentioned political parties
10. REGIONS: Extract mentioned Cameroon regions/cities

Content Title: ${title || 'N/A'}
Content URL: ${content_url || 'N/A'}
Content Text: ${content_text || 'N/A'}

Respond in JSON format:
{
  "bias_score": number,
  "trust_score": number, 
  "threat_level": "low|medium|high|critical",
  "tone": "positive|negative|neutral|inflammatory",
  "agenda_detected": "pro-government|anti-government|neutral|partisan",
  "disinformation_indicators": ["claim1", "claim2"],
  "propaganda_markers": ["technique1", "technique2"],
  "politicians_mentioned": ["name1", "name2"],
  "parties_mentioned": ["party1", "party2"],
  "regions_mentioned": ["region1", "region2"],
  "content_summary": "Brief analysis summary",
  "ai_confidence": 0.95
}`;

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in Cameroonian politics and media analysis. Analyze content for bias, disinformation, and civic threats.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.1
    }),
  });

  if (!openaiResponse.ok) {
    throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
  }

  const openaiResult = await openaiResponse.json();
  const analysisData = JSON.parse(openaiResult.choices[0].message.content);

  // Convert bias_level enum
  let biasLevel = 'none';
  if (analysisData.bias_score >= 80) biasLevel = 'high';
  else if (analysisData.bias_score >= 60) biasLevel = 'moderate';
  else if (analysisData.bias_score >= 30) biasLevel = 'mild';

  // Update analysis record with AI results
  const { error: updateError } = await supabase
    .from('media_content_analysis')
    .update({
      bias_score: analysisData.bias_score,
      bias_level: biasLevel,
      trust_score: analysisData.trust_score,
      threat_level: analysisData.threat_level,
      tone: analysisData.tone,
      agenda_detected: analysisData.agenda_detected,
      disinformation_indicators: analysisData.disinformation_indicators || [],
      propaganda_markers: analysisData.propaganda_markers || [],
      politicians_mentioned: analysisData.politicians_mentioned || [],
      parties_mentioned: analysisData.parties_mentioned || [],
      regions_mentioned: analysisData.regions_mentioned || [],
      ministers_mentioned: [],
      content_summary: analysisData.content_summary,
      ai_confidence: analysisData.ai_confidence || 0.8,
      ai_model_used: 'gpt-4o-mini',
      processing_time_ms: 5000
    })
    .eq('id', analysisId);

  if (updateError) {
    console.error('Failed to update analysis:', updateError);
  }

  // Check if alerts need to be created
  const { data: sourceData } = await supabase
    .from('media_sources')
    .select('bias_threshold, trust_threshold, threat_threshold')
    .eq('id', source_id)
    .single();

  const alerts = [];

  if (sourceData) {
    // Check bias threshold
    if (analysisData.bias_score > sourceData.bias_threshold) {
      const alertResult = await supabase.rpc('create_media_alert', {
        p_analysis_id: analysisId,
        p_alert_type: 'bias_threshold',
        p_alert_title: `High Bias Detected: ${title || 'Content'}`,
        p_alert_description: `Bias score of ${analysisData.bias_score}% exceeds threshold of ${sourceData.bias_threshold}%`,
        p_severity: analysisData.bias_score > 90 ? 'critical' : 'high'
      });
      alerts.push(alertResult);
    }

    // Check trust threshold
    if (analysisData.trust_score < sourceData.trust_threshold) {
      const alertResult = await supabase.rpc('create_media_alert', {
        p_analysis_id: analysisId,
        p_alert_type: 'trust_threshold',
        p_alert_title: `Low Trust Score: ${title || 'Content'}`,
        p_alert_description: `Trust score of ${analysisData.trust_score}% below threshold of ${sourceData.trust_threshold}%`,
        p_severity: analysisData.trust_score < 30 ? 'critical' : 'medium'
      });
      alerts.push(alertResult);
    }

    // Check threat level
    const threatLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const currentThreat = threatLevels[analysisData.threat_level] || 1;
    const thresholdThreat = threatLevels[sourceData.threat_threshold] || 2;
    
    if (currentThreat >= thresholdThreat) {
      const alertResult = await supabase.rpc('create_media_alert', {
        p_analysis_id: analysisId,
        p_alert_type: 'threat_detected',
        p_alert_title: `Civic Threat Detected: ${title || 'Content'}`,
        p_alert_description: `Threat level: ${analysisData.threat_level}`,
        p_severity: analysisData.threat_level
      });
      alerts.push(alertResult);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      analysis_id: analysisId,
      analysis: analysisData,
      alerts_created: alerts.length,
      message: 'Content analyzed successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function scrapeSource(supabase: any, data: any) {
  const { source_id, url } = data;

  console.log(`Scraping content from: ${url}`);

  try {
    // Simple content scraping (in production, use more sophisticated scraping)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CivicMediaWatch/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Basic HTML parsing to extract text content
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000); // Limit content length

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled';

    // Trigger analysis
    const analysisResult = await analyzeContent(supabase, {
      source_id,
      content_url: url,
      title,
      content_text: textContent
    });

    return new Response(
      JSON.stringify({
        success: true,
        title,
        content_length: textContent.length,
        analysis_triggered: true,
        message: 'Content scraped and analyzed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error(`Failed to scrape content: ${error.message}`);
  }
}

async function createAlert(supabase: any, data: any) {
  const { analysis_id, alert_type, title, description, severity } = data;

  const alertId = await supabase.rpc('create_media_alert', {
    p_analysis_id: analysis_id,
    p_alert_type: alert_type,
    p_alert_title: title,
    p_alert_description: description,
    p_severity: severity || 'medium'
  });

  return new Response(
    JSON.stringify({
      success: true,
      alert_id: alertId,
      message: 'Alert created successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getAnalysisStats(supabase: any) {
  // Get recent analysis stats
  const { data: recentAnalysis } = await supabase
    .from('media_content_analysis')
    .select('bias_score, trust_score, threat_level')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });

  const { data: alertCount } = await supabase
    .from('media_alerts')
    .select('id')
    .eq('status', 'active');

  const { data: sourceCount } = await supabase
    .from('media_sources')
    .select('id')
    .eq('is_active', true);

  const stats = {
    total_analysis: recentAnalysis?.length || 0,
    avg_bias_score: recentAnalysis?.length ? 
      Math.round(recentAnalysis.reduce((sum, item) => sum + (item.bias_score || 0), 0) / recentAnalysis.length) : 0,
    avg_trust_score: recentAnalysis?.length ?
      Math.round(recentAnalysis.reduce((sum, item) => sum + (item.trust_score || 0), 0) / recentAnalysis.length) : 0,
    high_threat_count: recentAnalysis?.filter(item => 
      item.threat_level === 'high' || item.threat_level === 'critical').length || 0,
    active_alerts: alertCount?.length || 0,
    active_sources: sourceCount?.length || 0
  };

  return new Response(
    JSON.stringify({ success: true, stats }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}