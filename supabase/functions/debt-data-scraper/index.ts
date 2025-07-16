import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, source_id, source_url, force_scrape } = await req.json();

    console.log(`Debt Data Scraper Action: ${action}`);

    if (action === 'scrape_all_sources') {
      return await scrapeAllSources(supabase);
    } else if (action === 'scrape_single_source') {
      return await scrapeSingleSource(supabase, source_id, source_url);
    } else if (action === 'get_scraping_status') {
      return await getScrapingStatus(supabase);
    } else if (action === 'manual_scrape') {
      return await manualScrape(supabase, source_url, force_scrape);
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Debt scraper error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function scrapeAllSources(supabase: any) {
  console.log('Starting automated scraping of all active debt data sources...');

  // Get all active sources
  const { data: sources, error: sourcesError } = await supabase
    .from('debt_data_sources')
    .select('*')
    .eq('is_active', true);

  if (sourcesError) throw sourcesError;

  const results = [];

  for (const source of sources) {
    try {
      console.log(`Scraping source: ${source.source_name}`);
      const result = await scrapeDebtData(supabase, source);
      results.push(result);

      // Update last scraped timestamp
      await supabase
        .from('debt_data_sources')
        .update({ last_scraped_at: new Date().toISOString() })
        .eq('id', source.id);

    } catch (error) {
      console.error(`Failed to scrape ${source.source_name}:`, error);
      results.push({
        source_id: source.id,
        source_name: source.source_name,
        status: 'failed',
        error_message: error.message
      });
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      scraped_sources: results.length,
      results: results
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function scrapeSingleSource(supabase: any, sourceId: string, sourceUrl?: string) {
  let source;
  
  if (sourceId) {
    const { data, error } = await supabase
      .from('debt_data_sources')
      .select('*')
      .eq('id', sourceId)
      .single();
    
    if (error) throw error;
    source = data;
  } else if (sourceUrl) {
    source = {
      id: 'temp-' + Date.now(),
      source_name: 'Manual URL',
      source_url: sourceUrl,
      source_type: 'manual',
      metadata: {}
    };
  } else {
    throw new Error('Either source_id or source_url must be provided');
  }

  const result = await scrapeDebtData(supabase, source);

  return new Response(
    JSON.stringify({ success: true, result }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function scrapeDebtData(supabase: any, source: any) {
  const startTime = new Date();
  let scrapingResult = {
    source_id: source.id,
    scraping_date: startTime.toISOString(),
    status: 'pending',
    raw_data: {},
    parsed_data: {},
    total_debt_detected: null,
    creditors_found: [],
    borrowing_purposes: [],
    data_quality_score: 0.0,
    error_message: null,
    metadata: {
      scraping_method: 'automated',
      user_agent: 'CamerPulse-DebtScraper/1.0'
    }
  };

  try {
    console.log(`Scraping: ${source.source_url}`);

    // Fetch the webpage with proper headers
    const response = await fetch(source.source_url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CamerPulse-DebtScraper/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 30000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    let rawData;

    if (contentType.includes('application/json')) {
      rawData = await response.json();
    } else {
      rawData = await response.text();
    }

    scrapingResult.raw_data = { content: rawData, content_type: contentType };

    // Parse the data based on source type and content
    const parsedData = await parseDebtData(rawData, source, contentType);
    scrapingResult.parsed_data = parsedData;
    scrapingResult.total_debt_detected = parsedData.total_debt;
    scrapingResult.creditors_found = parsedData.creditors || [];
    scrapingResult.borrowing_purposes = parsedData.purposes || [];
    scrapingResult.data_quality_score = calculateQualityScore(parsedData);
    scrapingResult.status = 'success';

    console.log(`Successfully scraped ${source.source_name}. Debt detected: ${parsedData.total_debt}`);

  } catch (error) {
    console.error(`Scraping failed for ${source.source_name}:`, error);
    scrapingResult.status = 'failed';
    scrapingResult.error_message = error.message;
  }

  // Store the scraping result
  if (source.id.startsWith('temp-')) {
    // For manual scrapes, don't store in database
    return scrapingResult;
  }

  const { data: storedResult, error: storeError } = await supabase
    .from('debt_scraping_results')
    .insert([scrapingResult])
    .select()
    .single();

  if (storeError) {
    console.error('Failed to store scraping result:', storeError);
    throw storeError;
  }

  // Compare with previous results if successful
  if (scrapingResult.status === 'success') {
    try {
      const comparison = await supabase.rpc('compare_debt_data_changes', {
        p_source_id: source.id,
        p_current_result_id: storedResult.id
      });

      console.log('Data comparison result:', comparison.data);

      // Check if significant changes detected and trigger alerts
      if (comparison.data && Object.keys(comparison.data).length > 0) {
        await triggerDebtAlerts(supabase, source, comparison.data, storedResult);
      }
    } catch (comparisonError) {
      console.error('Failed to compare data:', comparisonError);
    }
  }

  return storedResult;
}

async function parseDebtData(rawData: any, source: any, contentType: string) {
  const parsedData = {
    total_debt: null,
    creditors: [],
    purposes: [],
    currency: 'FCFA',
    extraction_method: 'text_parsing',
    confidence_score: 0.0
  };

  try {
    if (source.source_type === 'international' && contentType.includes('json')) {
      // Handle JSON APIs from international organizations
      return parseInternationalAPI(rawData, source);
    } else {
      // Handle HTML content with text parsing
      return parseHTMLContent(rawData, source);
    }
  } catch (error) {
    console.error('Data parsing failed:', error);
    parsedData.extraction_method = 'failed';
    return parsedData;
  }
}

function parseInternationalAPI(data: any, source: any) {
  const parsed = {
    total_debt: null,
    creditors: [],
    purposes: [],
    currency: 'USD',
    extraction_method: 'api_json',
    confidence_score: 0.8
  };

  // Parse IMF or World Bank API responses
  if (source.source_url.includes('imf.org')) {
    // IMF API parsing logic
    if (data.values && Array.isArray(data.values)) {
      const latestData = data.values[data.values.length - 1];
      if (latestData && latestData.value) {
        parsed.total_debt = parseFloat(latestData.value) * 1000000; // Convert to full amount
        parsed.confidence_score = 0.9;
      }
    }
  } else if (source.source_url.includes('worldbank.org')) {
    // World Bank API parsing logic
    if (Array.isArray(data) && data.length > 1) {
      const countryData = data[1];
      if (countryData && countryData.length > 0) {
        const latestEntry = countryData[0];
        if (latestEntry && latestEntry.value) {
          parsed.total_debt = parseFloat(latestEntry.value);
          parsed.confidence_score = 0.9;
        }
      }
    }
  }

  return parsed;
}

function parseHTMLContent(htmlContent: string, source: any) {
  const parsed = {
    total_debt: null,
    creditors: [],
    purposes: [],
    currency: 'FCFA',
    extraction_method: 'html_parsing',
    confidence_score: 0.3
  };

  // Simple text-based extraction patterns
  const debtPatterns = [
    /(?:dette|debt).*?(\d{1,3}(?:[,.\s]\d{3})*(?:[,.\s]\d{2})?)\s*(?:milliards?|billions?|millions?)/gi,
    /(\d{1,3}(?:[,.\s]\d{3})*(?:[,.\s]\d{2})?)\s*(?:milliards?|billions?)\s*(?:FCFA|CFA|USD|dollars?)/gi,
    /total.*?dette.*?(\d{1,3}(?:[,.\s]\d{3})*(?:[,.\s]\d{2})?)/gi
  ];

  const creditorPatterns = [
    /(?:créancier|creditor|prêteur|lender).*?:?\s*([A-Z][A-Za-z\s&]{2,30})/gi,
    /(?:Banque|Bank|Fonds|Fund|FMI|IMF|Monde|World)[\s\w]{5,50}/gi
  ];

  const purposePatterns = [
    /(?:financement|financing|projet|project|développement|development)[\s\w]{5,50}/gi,
    /(?:infrastructure|santé|health|éducation|education|route|road)[\s\w]{3,30}/gi
  ];

  // Extract debt amounts
  for (const pattern of debtPatterns) {
    const matches = htmlContent.match(pattern);
    if (matches && matches.length > 0) {
      // Try to extract numeric value
      const numericMatch = matches[0].match(/(\d{1,3}(?:[,.\s]\d{3})*(?:[,.\s]\d{2})?)/);
      if (numericMatch) {
        const cleanNumber = numericMatch[1].replace(/[,.\s]/g, '');
        const amount = parseFloat(cleanNumber);
        if (amount > 0) {
          // Convert to appropriate scale (assume billions if under 1000)
          parsed.total_debt = amount < 1000 ? amount * 1000000000 : amount;
          parsed.confidence_score = 0.6;
          break;
        }
      }
    }
  }

  // Extract creditors
  for (const pattern of creditorPatterns) {
    const matches = [...htmlContent.matchAll(pattern)];
    for (const match of matches) {
      if (match[1] && match[1].trim().length > 2) {
        const creditor = match[1].trim();
        if (!parsed.creditors.includes(creditor)) {
          parsed.creditors.push(creditor);
        }
      }
    }
  }

  // Extract purposes
  for (const pattern of purposePatterns) {
    const matches = [...htmlContent.matchAll(pattern)];
    for (const match of matches) {
      if (match[0] && match[0].trim().length > 3) {
        const purpose = match[0].trim();
        if (!parsed.purposes.includes(purpose)) {
          parsed.purposes.push(purpose);
        }
      }
    }
  }

  return parsed;
}

function calculateQualityScore(parsedData: any): number {
  let score = 0;

  // Base score for successful parsing
  if (parsedData.total_debt !== null && parsedData.total_debt > 0) {
    score += 40;
  }

  // Additional points for data richness
  if (parsedData.creditors && parsedData.creditors.length > 0) {
    score += Math.min(20, parsedData.creditors.length * 5);
  }

  if (parsedData.purposes && parsedData.purposes.length > 0) {
    score += Math.min(20, parsedData.purposes.length * 5);
  }

  // Confidence score contribution
  if (parsedData.confidence_score) {
    score += parsedData.confidence_score * 20;
  }

  return Math.min(100, score);
}

async function triggerDebtAlerts(supabase: any, source: any, changesData: any, scrapingResult: any) {
  console.log('Significant debt changes detected, triggering alerts...');

  try {
    // Create debt alert record
    const alertData = {
      alert_type: 'debt_data_change',
      alert_severity: 'medium',
      alert_title: `Debt Data Change Detected - ${source.source_name}`,
      alert_description: `Significant changes in debt data detected from ${source.source_name}`,
      current_value: scrapingResult.total_debt_detected,
      metadata: {
        source_name: source.source_name,
        changes: changesData,
        scraping_result_id: scrapingResult.id,
        detected_at: new Date().toISOString()
      }
    };

    // If debt change is > 10%, mark as high severity
    if (changesData.debt_change && Math.abs(changesData.debt_change.percentage_change) > 10) {
      alertData.alert_severity = 'high';
      alertData.alert_title = `🚨 Major Debt Change Alert - ${source.source_name}`;
    }

    const { error: alertError } = await supabase
      .from('debt_alerts')
      .insert([alertData]);

    if (alertError) {
      console.error('Failed to create debt alert:', alertError);
      return;
    }

    // Push to Civic Alert System if significant
    if (changesData.debt_change && Math.abs(changesData.debt_change.percentage_change) > 5) {
      await supabase.functions.invoke('civic-alert-bot', {
        body: {
          alert_type: 'debt_monitoring',
          severity: alertData.alert_severity,
          title: alertData.alert_title,
          description: `Debt data from ${source.source_name} changed by ${changesData.debt_change.percentage_change.toFixed(1)}%. Previous: ${changesData.debt_change.previous}, Current: ${changesData.debt_change.current}`,
          source: 'Debt Data Scraper',
          affected_regions: ['National'],
          metadata: {
            source_url: source.source_url,
            change_percentage: changesData.debt_change.percentage_change,
            new_creditors: changesData.new_creditors || []
          }
        }
      });
    }

    console.log('Debt alerts triggered successfully');

  } catch (error) {
    console.error('Failed to trigger debt alerts:', error);
  }
}

async function getScrapingStatus(supabase: any) {
  const { data: recentResults, error } = await supabase
    .from('debt_scraping_results')
    .select(`
      *,
      debt_data_sources(source_name, source_url, source_type)
    `)
    .order('scraping_date', { ascending: false })
    .limit(20);

  if (error) throw error;

  const { data: sources } = await supabase
    .from('debt_data_sources')
    .select('*')
    .eq('is_active', true);

  return new Response(
    JSON.stringify({
      success: true,
      recent_results: recentResults,
      active_sources: sources,
      last_update: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function manualScrape(supabase: any, sourceUrl: string, forceRun: boolean = false) {
  if (!sourceUrl) {
    throw new Error('source_url is required for manual scraping');
  }

  console.log(`Manual scrape requested for: ${sourceUrl}`);

  const tempSource = {
    id: 'manual-' + Date.now(),
    source_name: 'Manual Scrape',
    source_url: sourceUrl,
    source_type: 'manual',
    metadata: { manual_scrape: true }
  };

  const result = await scrapeDebtData(supabase, tempSource);

  return new Response(
    JSON.stringify({ 
      success: true, 
      result,
      message: 'Manual scrape completed'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}