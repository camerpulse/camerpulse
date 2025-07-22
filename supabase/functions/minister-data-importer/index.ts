import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import FirecrawlApp from 'https://esm.sh/@mendable/firecrawl-js@1.29.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const firecrawl = new FirecrawlApp({ apiKey: firecrawlApiKey });

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MinisterData {
  full_name: string;
  position_title: string;
  ministry: string;
  political_party?: string;
  region?: string;
  profile_picture_url?: string;
  official_profile_url?: string;
  term_start_date?: string;
  term_end_date?: string;
}

// Known ministers data for initial setup
const knownMinisters: MinisterData[] = [
  {
    full_name: "Joseph Dion Ngute",
    position_title: "Prime Minister, Head of Government",
    ministry: "Prime Ministry",
    political_party: "CPDM",
    region: "Southwest",
    official_profile_url: "https://www.spm.gov.cm",
    term_start_date: "2019-01-04"
  },
  {
    full_name: "Laurent Esso",
    position_title: "Minister of Justice, Keeper of the Seals",
    ministry: "Ministry of Justice",
    political_party: "CPDM",
    region: "South",
    official_profile_url: "https://www.minjustice.gov.cm",
    term_start_date: "2018-03-02"
  },
  {
    full_name: "Joseph Beti Assomo",
    position_title: "Minister of Defence",
    ministry: "Ministry of Defence",
    political_party: "CPDM",
    region: "Centre",
    official_profile_url: "https://www.mindef.cm",
    term_start_date: "2015-12-09"
  },
  {
    full_name: "Atanga Nji Paul",
    position_title: "Minister of Territorial Administration",
    ministry: "Ministry of Territorial Administration",
    political_party: "CPDM",
    region: "Northwest",
    official_profile_url: "https://www.minat.gov.cm",
    term_start_date: "2018-03-02"
  },
  {
    full_name: "Lejeune Mbella Mbella",
    position_title: "Minister of External Relations",
    ministry: "Ministry of External Relations",
    political_party: "CPDM",
    region: "Southwest",
    official_profile_url: "https://www.diplomatie.gov.cm",
    term_start_date: "2018-03-02"
  },
  {
    full_name: "Louis Paul Motaze",
    position_title: "Minister of Finance",
    ministry: "Ministry of Finance",
    political_party: "CPDM",
    region: "Centre",
    official_profile_url: "https://www.minfi.gov.cm",
    term_start_date: "2018-03-02"
  },
  {
    full_name: "Manaouda Malachie",
    position_title: "Minister of Public Health",
    ministry: "Ministry of Public Health",
    political_party: "CPDM",
    region: "North",
    official_profile_url: "https://www.minsante.cm",
    term_start_date: "2018-03-02"
  },
  {
    full_name: "Jacques Fame Ndongo",
    position_title: "Minister of Higher Education",
    ministry: "Ministry of Higher Education",
    political_party: "CPDM",
    region: "Centre",
    official_profile_url: "https://www.minesup.gov.cm",
    term_start_date: "2018-03-02"
  },
  {
    full_name: "Laurent Serge Etoundi Ngoa",
    position_title: "Minister of Basic Education",
    ministry: "Ministry of Basic Education",
    political_party: "CPDM",
    region: "Centre",
    official_profile_url: "https://www.minedub.cm",
    term_start_date: "2018-03-02"
  },
  {
    full_name: "Gabriel Dodo Ndoke",
    position_title: "Minister of Economy, Planning and Regional Development",
    ministry: "Ministry of Economy, Planning and Regional Development",
    political_party: "CPDM",
    region: "East",
    official_profile_url: "https://www.minepat.gov.cm",
    term_start_date: "2018-03-02"
  },
  {
    full_name: "Alamine Ousmane Mey",
    position_title: "Minister of Water and Energy",
    ministry: "Ministry of Water and Energy",
    political_party: "CPDM",
    region: "North",
    official_profile_url: "https://www.minee.cm",
    term_start_date: "2018-03-02"
  },
  {
    full_name: "Pauline Nalova Lyonga",
    position_title: "Minister of Secondary Education",
    ministry: "Ministry of Secondary Education",
    political_party: "CPDM",
    region: "Southwest",
    official_profile_url: "https://www.minesec.gov.cm",
    term_start_date: "2018-03-02"
  },
  {
    full_name: "Narcisse Mouelle Kombi",
    position_title: "Minister of Arts and Culture",
    ministry: "Ministry of Arts and Culture",
    political_party: "CPDM",
    region: "Littoral",
    official_profile_url: "https://www.minac.gov.cm",
    term_start_date: "2018-03-02"
  },
  {
    full_name: "Bidoung Mkpatt",
    position_title: "Minister of Youth and Civic Education",
    ministry: "Ministry of Youth and Civic Education",
    political_party: "CPDM",
    region: "Centre",
    official_profile_url: "https://www.minjec.gov.cm",
    term_start_date: "2018-03-02"
  },
  {
    full_name: "Marie Therese Abena Ondoa",
    position_title: "Minister of Women's Empowerment and the Family",
    ministry: "Ministry of Women's Empowerment and the Family",
    political_party: "CPDM",
    region: "Centre",
    official_profile_url: "https://www.minproff.cm",
    term_start_date: "2018-03-02"
  }
];

function extractMinisterData(content: string): MinisterData[] {
  console.log('Extracting Minister data from content...');
  const ministers: MinisterData[] = [];
  
  try {
    // Parse content to extract minister information
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.includes('Minister') && trimmedLine.length > 10) {
        // Try to extract minister info from the line
        const parts = trimmedLine.split(/[,\-:]/);
        
        if (parts.length >= 2) {
          const name = parts[0].replace(/^(Hon\.|Dr\.|Prof\.)/i, '').trim();
          const position = parts[1].trim();
          
          if (name.length > 3 && position.includes('Minister')) {
            ministers.push({
              full_name: name,
              position_title: position,
              ministry: position.replace(/Minister of /i, 'Ministry of '),
              political_party: "CPDM", // Default assumption
              official_profile_url: "https://www.gov.cm"
            });
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error extracting Minister data:', error);
  }
  
  console.log(`Extracted ${ministers.length} Ministers from content`);
  return ministers;
}

async function scrapeGovernmentWebsites(): Promise<MinisterData[]> {
  const scrapedMinisters: MinisterData[] = [];
  const urls = [
    'https://www.prc.cm/en/government',
    'https://www.spm.gov.cm',
    'https://www.cameroon-info.net/government'
  ];
  
  for (const url of urls) {
    try {
      console.log(`Scraping ${url}...`);
      const crawlResult = await firecrawl.scrapeUrl(url, {
        formats: ['markdown', 'html'],
        includeTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'table', 'tr', 'td', 'th'],
        onlyMainContent: true
      });
      
      if (crawlResult.success) {
        const content = crawlResult.data?.html || crawlResult.data?.markdown || '';
        const extractedMinisters = extractMinisterData(content);
        scrapedMinisters.push(...extractedMinisters);
        console.log(`Found ${extractedMinisters.length} ministers from ${url}`);
      } else {
        console.log(`Failed to scrape ${url}: ${crawlResult.error}`);
      }
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
    }
  }
  
  return scrapedMinisters;
}

async function importMinisters(): Promise<{ success: boolean; imported: number; errors: string[] }> {
  console.log('Starting Minister import process...');
  const errors: string[] = [];
  let imported = 0;
  
  try {
    // First try to scrape from government websites
    const scrapedMinisters = await scrapeGovernmentWebsites();
    
    // Combine scraped data with known ministers data
    const allMinisters = [...knownMinisters];
    
    // Add scraped ministers if they don't already exist
    for (const scraped of scrapedMinisters) {
      const exists = allMinisters.some(known => 
        known.full_name.toLowerCase() === scraped.full_name.toLowerCase()
      );
      if (!exists) {
        allMinisters.push(scraped);
      }
    }
    
    console.log(`Total ministers to import: ${allMinisters.length}`);
    
    // Import Ministers to database
    for (const minister of allMinisters) {
      try {
        // Check if Minister already exists
        const { data: existing } = await supabase
          .from('ministers')
          .select('id')
          .eq('full_name', minister.full_name)
          .maybeSingle();
        
        if (!existing) {
          const { error } = await supabase
            .from('ministers')
            .insert({
              ...minister,
              average_rating: 0,
              total_ratings: 0,
              transparency_score: 0,
              civic_engagement_score: 0,
              crisis_response_score: 0,
              promise_delivery_score: 0,
              performance_score: 0,
              view_count: 0,
              follower_count: 0,
              career_timeline: [],
              can_receive_messages: true,
              is_claimed: false,
              is_verified: false
            });
          
          if (error) {
            console.error(`Error inserting Minister ${minister.full_name}:`, error);
            errors.push(`Failed to insert ${minister.full_name}: ${error.message}`);
          } else {
            console.log(`Successfully imported Minister: ${minister.full_name}`);
            imported++;
          }
        } else {
          console.log(`Minister ${minister.full_name} already exists, skipping`);
        }
      } catch (error) {
        console.error(`Error processing Minister ${minister.full_name}:`, error);
        errors.push(`Error processing ${minister.full_name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
  } catch (error) {
    console.error('Error in Minister import process:', error);
    errors.push(`Import process error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  console.log(`Minister import completed. Imported: ${imported}, Errors: ${errors.length}`);
  return { success: imported > 0, imported, errors };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log('Minister Data Importer function called');
    
    const result = await importMinisters();
    
    return new Response(JSON.stringify({
      success: result.success,
      message: `Import completed. ${result.imported} Ministers imported.`,
      imported: result.imported,
      errors: result.errors
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: result.success ? 200 : 500
    });
    
  } catch (error) {
    console.error('Error in Minister data importer:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});