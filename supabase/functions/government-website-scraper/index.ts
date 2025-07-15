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

// Firecrawl API Key
const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

interface OfficialData {
  name: string;
  position: string;
  party?: string;
  region?: string;
  isActive: boolean;
  contactInfo?: {
    email?: string;
    phone?: string;
  };
  biography?: string;
}

// Scrape website using Firecrawl
async function scrapeWithFirecrawl(url: string): Promise<any> {
  if (!firecrawlApiKey) {
    throw new Error('Firecrawl API key not configured');
  }

  try {
    console.log(`Starting Firecrawl scrape for: ${url}`);
    
    const response = await fetch('https://api.firecrawl.dev/v1/crawl', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        limit: 50,
        scrapeOptions: {
          formats: ['markdown', 'html'],
          onlyMainContent: true,
          includeTags: ['h1', 'h2', 'h3', 'p', 'div', 'table', 'tr', 'td', 'th'],
          excludeTags: ['script', 'style', 'nav', 'footer', 'header', 'aside']
        },
        crawlerOptions: {
          includes: ['**/*'],
          excludes: [
            '**/wp-admin/**',
            '**/wp-content/uploads/**',
            '**/*.pdf',
            '**/*.jpg',
            '**/*.png',
            '**/*.gif'
          ],
          maxDepth: 3
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Firecrawl API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Firecrawl crawl initiated:', data);

    if (!data.id) {
      throw new Error('No crawl ID returned from Firecrawl');
    }

    // Wait for crawl to complete
    return await waitForCrawlCompletion(data.id);

  } catch (error) {
    console.error('Firecrawl scraping error:', error);
    throw error;
  }
}

// Wait for Firecrawl crawl completion
async function waitForCrawlCompletion(crawlId: string): Promise<any> {
  const maxAttempts = 60; // 5 minutes max
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`https://api.firecrawl.dev/v1/crawl/${crawlId}`, {
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const status = await response.json();
      console.log(`Crawl status check ${attempts + 1}:`, status.status);

      if (status.status === 'completed') {
        console.log('Crawl completed successfully');
        return status.data || [];
      } else if (status.status === 'failed') {
        throw new Error('Crawl failed');
      }

      // Wait 5 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;

    } catch (error) {
      console.error('Error checking crawl status:', error);
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  throw new Error('Crawl timeout - took longer than 5 minutes');
}

// Parse scraped content for officials based on source type
function parseScrapedContent(content: any[], sourceType: string): OfficialData[] {
  const officials: OfficialData[] = [];

  console.log(`Parsing content for ${sourceType}, found ${content.length} pages`);

  for (const page of content) {
    const markdown = page.markdown || '';
    const url = page.metadata?.sourceURL || '';
    
    console.log(`Processing page: ${url}`);

    try {
      if (sourceType === 'senate') {
        officials.push(...parseSenateData(markdown, url));
      } else if (sourceType === 'assembly') {
        officials.push(...parseAssemblyData(markdown, url));
      } else if (sourceType === 'ministers') {
        officials.push(...parseMinisterData(markdown, url));
      }
    } catch (error) {
      console.error(`Error parsing ${sourceType} data from ${url}:`, error);
    }
  }

  console.log(`Extracted ${officials.length} officials from ${sourceType}`);
  return officials;
}

// Parse Senate data
function parseSenateData(markdown: string, url: string): OfficialData[] {
  const officials: OfficialData[] = [];
  
  // Look for senator patterns in French and English
  const senatorPatterns = [
    /(?:S[eé]nateur|Senator|Hon\.)\s+([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)+)/gi,
    /([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)+)(?:\s*[-,]\s*S[eé]nateur|Senator)/gi
  ];

  // Extract table data if present
  const tableRows = markdown.match(/\|[^|\n]+\|[^|\n]+\|/g) || [];
  
  for (const row of tableRows) {
    const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
    if (cells.length >= 2) {
      const nameCell = cells.find(cell => /[A-ZÀ-Ÿ][a-zà-ÿ]+\s+[A-ZÀ-Ÿ]/.test(cell));
      if (nameCell && !nameCell.toLowerCase().includes('nom') && !nameCell.toLowerCase().includes('name')) {
        officials.push({
          name: nameCell.replace(/Hon\.|M\.|Mme\.|Dr\./gi, '').trim(),
          position: 'Senator',
          isActive: true,
        });
      }
    }
  }

  // Fallback to pattern matching
  for (const pattern of senatorPatterns) {
    const matches = markdown.matchAll(pattern);
    for (const match of matches) {
      const name = match[1]?.trim();
      if (name && name.length > 3 && !officials.some(o => o.name.includes(name))) {
        officials.push({
          name: name.replace(/Hon\.|M\.|Mme\.|Dr\./gi, '').trim(),
          position: 'Senator',
          isActive: true,
        });
      }
    }
  }

  return officials;
}

// Parse National Assembly data
function parseAssemblyData(markdown: string, url: string): OfficialData[] {
  const officials: OfficialData[] = [];
  
  // Look for deputy/MP patterns
  const deputyPatterns = [
    /(?:D[eé]put[eé]|Deputy|Hon\.)\s+([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)+)/gi,
    /([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)+)(?:\s*[-,]\s*D[eé]put[eé]|Deputy)/gi
  ];

  // Look for constituency information
  const constituencyPattern = /(?:Circonscription|Constituency)\s*[:\-]\s*([A-ZÀ-Ÿ][a-zà-ÿ\s]+)/gi;

  // Extract table data
  const tableRows = markdown.match(/\|[^|\n]+\|[^|\n]+\|/g) || [];
  
  for (const row of tableRows) {
    const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
    if (cells.length >= 2) {
      const nameCell = cells.find(cell => /[A-ZÀ-Ÿ][a-zà-ÿ]+\s+[A-ZÀ-Ÿ]/.test(cell));
      const regionCell = cells.find(cell => 
        cell.toLowerCase().includes('region') || 
        cell.toLowerCase().includes('circonscription') ||
        /^(Centre|Littoral|Southwest|Northwest|West|East|Adamawa|North|Far North|South)$/i.test(cell)
      );
      
      if (nameCell && !nameCell.toLowerCase().includes('nom') && !nameCell.toLowerCase().includes('name')) {
        officials.push({
          name: nameCell.replace(/Hon\.|M\.|Mme\.|Dr\./gi, '').trim(),
          position: 'Member of Parliament',
          region: regionCell?.trim(),
          isActive: true,
        });
      }
    }
  }

  // Pattern matching fallback
  for (const pattern of deputyPatterns) {
    const matches = markdown.matchAll(pattern);
    for (const match of matches) {
      const name = match[1]?.trim();
      if (name && name.length > 3 && !officials.some(o => o.name.includes(name))) {
        officials.push({
          name: name.replace(/Hon\.|M\.|Mme\.|Dr\./gi, '').trim(),
          position: 'Member of Parliament',
          isActive: true,
        });
      }
    }
  }

  return officials;
}

// Parse Minister data
function parseMinisterData(markdown: string, url: string): OfficialData[] {
  const officials: OfficialData[] = [];
  
  // Look for minister patterns
  const ministerPatterns = [
    /(?:Ministre|Minister)\s+([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)+)/gi,
    /([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)+)(?:\s*[-,]\s*Ministre|Minister)/gi,
    /(?:Premier\s+Ministre|Prime\s+Minister)[:\s]+([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)+)/gi
  ];

  // Ministry patterns
  const ministryPattern = /Ministère\s+(?:de\s+|du\s+|des\s+)?([A-ZÀ-Ÿ][a-zà-ÿ\s,]+)/gi;

  // Extract table data
  const tableRows = markdown.match(/\|[^|\n]+\|[^|\n]+\|/g) || [];
  
  for (const row of tableRows) {
    const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
    if (cells.length >= 2) {
      const nameCell = cells.find(cell => /[A-ZÀ-Ÿ][a-zà-ÿ]+\s+[A-ZÀ-Ÿ]/.test(cell));
      const ministryCell = cells.find(cell => 
        cell.toLowerCase().includes('ministère') || 
        cell.toLowerCase().includes('ministry') ||
        cell.toLowerCase().includes('département')
      );
      
      if (nameCell && !nameCell.toLowerCase().includes('nom') && !nameCell.toLowerCase().includes('name')) {
        const position = ministryCell ? `Minister of ${ministryCell.replace(/Ministère\s+(?:de\s+|du\s+|des\s+)?/gi, '').trim()}` : 'Minister';
        
        officials.push({
          name: nameCell.replace(/Hon\.|M\.|Mme\.|Dr\./gi, '').trim(),
          position: position,
          isActive: true,
        });
      }
    }
  }

  // Pattern matching fallback
  for (const pattern of ministerPatterns) {
    const matches = markdown.matchAll(pattern);
    for (const match of matches) {
      const name = match[1]?.trim();
      if (name && name.length > 3 && !officials.some(o => o.name.includes(name))) {
        // Determine if this is Prime Minister
        const isPM = match[0].toLowerCase().includes('premier') || match[0].toLowerCase().includes('prime');
        
        officials.push({
          name: name.replace(/Hon\.|M\.|Mme\.|Dr\./gi, '').trim(),
          position: isPM ? 'Prime Minister' : 'Minister',
          isActive: true,
        });
      }
    }
  }

  return officials;
}

// Store scraped officials in database
async function storeScrapedOfficials(officials: OfficialData[], sourceType: string) {
  console.log(`Storing ${officials.length} officials from ${sourceType}`);
  
  const results = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0
  };

  for (const official of officials) {
    try {
      // Check if official already exists
      const { data: existing } = await supabase
        .from('politicians')
        .select('id, name, term_status')
        .ilike('name', `%${official.name}%`)
        .limit(1);

      if (existing && existing.length > 0) {
        // Update existing official
        const { error } = await supabase
          .from('politicians')
          .update({
            position: official.position,
            party: official.party || existing[0].party || 'Unknown',
            region: official.region,
            term_status: 'active',
            is_currently_in_office: true,
            last_verified: new Date().toISOString(),
            source_verification: `${sourceType}_scraper`,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing[0].id);

        if (error) {
          console.error('Error updating official:', error);
          results.errors++;
        } else {
          results.updated++;
        }
      } else {
        // Insert new official
        const { error } = await supabase
          .from('politicians')
          .insert({
            name: official.name,
            position: official.position,
            party: official.party || 'Unknown',
            region: official.region,
            term_status: 'active',
            is_currently_in_office: true,
            source_type: sourceType,
            source_verification: `${sourceType}_scraper`,
            last_verified: new Date().toISOString(),
            biography: official.biography,
            contact_info: official.contactInfo ? JSON.stringify(official.contactInfo) : null
          });

        if (error) {
          console.error('Error inserting official:', error);
          results.errors++;
        } else {
          results.inserted++;
        }
      }
    } catch (error) {
      console.error('Error processing official:', official.name, error);
      results.errors++;
    }
  }

  // Log scraping activity
  await supabase
    .from('civic_service_events')
    .insert({
      event_type: 'government_scraping',
      event_category: 'data_import',
      event_title: `Government Website Scraping: ${sourceType}`,
      event_description: `Scraped ${officials.length} officials. ${results.inserted} new, ${results.updated} updated, ${results.errors} errors.`,
      data_source: `${sourceType}_scraper`,
      metadata: {
        source_type: sourceType,
        officials_found: officials.length,
        results: results
      }
    });

  return results;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, source, url, sourceType } = await req.json();

    if (action === 'scrape_website') {
      console.log(`Starting government website scraping for ${sourceType}: ${url}`);

      if (!firecrawlApiKey) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Firecrawl API key not configured. Please add FIRECRAWL_API_KEY to Edge Function secrets.'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }

      // Scrape the website
      const scrapedContent = await scrapeWithFirecrawl(url);
      
      // Parse the content for officials
      const officials = parseScrapedContent(scrapedContent, source);
      
      if (officials.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          error: `No officials found in scraped content from ${url}. The website structure may have changed.`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }

      // Store in database
      const storeResults = await storeScrapedOfficials(officials, source);

      return new Response(JSON.stringify({
        success: true,
        message: `Successfully scraped ${officials.length} officials from ${sourceType}`,
        officialsFound: officials.length,
        officials: officials,
        storeResults: storeResults
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      error: 'Unknown action. Use: scrape_website'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in government-website-scraper:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});