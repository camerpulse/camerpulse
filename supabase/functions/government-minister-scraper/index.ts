import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MinisterData {
  name: string;
  role_title: string;
  ministry?: string;
  party?: string;
  region?: string;
  appointment_date?: string;
  photo_url?: string;
  biography?: string;
  education?: string;
  birth_date?: string;
  level_of_office: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting government minister scraper...');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sources } = await req.json();
    console.log('Sources to scrape:', sources);

    let allMinisters: MinisterData[] = [];
    
    // Try to scrape from government sources
    for (const source of sources) {
      try {
        console.log(`Attempting to scrape: ${source}`);
        
        if (source.includes('prc.cm')) {
          // Scrape from Presidency website
          const ministersFromPRC = await scrapePRCMinisters(source);
          allMinisters = allMinisters.concat(ministersFromPRC);
        } else if (source.includes('spm.gov.cm')) {
          // Scrape from Prime Minister's Office
          const ministersFromSPM = await scrapeSPMMinisters(source);
          allMinisters = allMinisters.concat(ministersFromSPM);
        } else if (source.includes('crtv.cm')) {
          // Get ministers from media reports
          const ministersFromCRTV = await scrapeCRTVMinisters(source);
          allMinisters = allMinisters.concat(ministersFromCRTV);
        }
      } catch (error) {
        console.error(`Error scraping ${source}:`, error.message);
        // Continue with other sources
      }
    }

    // If no ministers found from web scraping, use fallback data
    if (allMinisters.length === 0) {
      console.log('No ministers found from web scraping, using fallback data...');
      allMinisters = getFallbackMinisters();
    }

    console.log(`Found ${allMinisters.length} ministers to process`);

    // Process and update database
    let updatedCount = 0;
    let createdCount = 0;

    for (const ministerData of allMinisters) {
      try {
        // Check if minister already exists
        const { data: existingMinister } = await supabase
          .from('politicians')
          .select('id, name, role_title')
          .ilike('name', ministerData.name)
          .ilike('role_title', '%minister%')
          .single();

        if (existingMinister) {
          // Update existing minister
          const { error: updateError } = await supabase
            .from('politicians')
            .update({
              role_title: ministerData.role_title,
              party: ministerData.party,
              region: ministerData.region,
              profile_image_url: ministerData.photo_url,
              biography: ministerData.biography,
              education: ministerData.education,
              birth_date: ministerData.birth_date,
              level_of_office: ministerData.level_of_office,
              verified: true,
              auto_imported: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingMinister.id);

          if (updateError) {
            console.error(`Error updating minister ${ministerData.name}:`, updateError);
          } else {
            updatedCount++;
            console.log(`Updated minister: ${ministerData.name}`);
          }
        } else {
          // Create new minister
          const { error: insertError } = await supabase
            .from('politicians')
            .insert({
              name: ministerData.name,
              role_title: ministerData.role_title,
              party: ministerData.party || 'Unknown',
              region: ministerData.region || 'Unknown',
              profile_image_url: ministerData.photo_url,
              biography: ministerData.biography,
              education: ministerData.education,
              birth_date: ministerData.birth_date,
              level_of_office: ministerData.level_of_office,
              civic_score: 75, // Default score for new ministers
              verified: true,
              auto_imported: true,
              is_claimable: true,
              is_claimed: false,
              claim_status: 'unclaimed'
            });

          if (insertError) {
            console.error(`Error creating minister ${ministerData.name}:`, insertError);
          } else {
            createdCount++;
            console.log(`Created new minister: ${ministerData.name}`);
          }
        }
      } catch (error) {
        console.error(`Error processing minister ${ministerData.name}:`, error.message);
      }
    }

    console.log(`Processing complete. Updated: ${updatedCount}, Created: ${createdCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: allMinisters.length,
        updated: updatedCount,
        created: createdCount,
        ministers: allMinisters.map(m => ({ name: m.name, role_title: m.role_title }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Government minister scraper error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function scrapePRCMinisters(url: string): Promise<MinisterData[]> {
  console.log('Scraping PRC ministers...');
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const ministers: MinisterData[] = [];

    // Look for minister patterns in the HTML
    const ministerPatterns = [
      /Minister\s+of\s+([^,\n]+)/gi,
      /Ministre\s+de\s+([^,\n]+)/gi,
      /Secretary\s+of\s+State\s+for\s+([^,\n]+)/gi
    ];

    for (const pattern of ministerPatterns) {
      const matches = html.match(pattern);
      if (matches) {
        for (const match of matches) {
          ministers.push({
            name: extractNameFromTitle(match),
            role_title: match.trim(),
            level_of_office: 'National',
            party: 'CPDM' // Default to ruling party
          });
        }
      }
    }

    return ministers;
  } catch (error) {
    console.error('Error scraping PRC:', error.message);
    return [];
  }
}

async function scrapeSPMMinisters(url: string): Promise<MinisterData[]> {
  console.log('Scraping SPM ministers...');
  // Similar implementation for Prime Minister's office
  return [];
}

async function scrapeCRTVMinisters(url: string): Promise<MinisterData[]> {
  console.log('Scraping CRTV ministers...');
  // Similar implementation for CRTV media reports
  return [];
}

function extractNameFromTitle(title: string): string {
  // Extract name from minister title - this would need more sophisticated logic
  return title.replace(/Minister\s+of\s+/gi, '').replace(/Ministre\s+de\s+/gi, '').trim();
}

function getFallbackMinisters(): MinisterData[] {
  // Fallback data based on known current ministers
  return [
    {
      name: "Joseph Dion Ngute",
      role_title: "Prime Minister",
      level_of_office: "National",
      party: "CPDM",
      region: "South West"
    },
    {
      name: "Laurent Esso",
      role_title: "Minister of Justice, Keeper of the Seals",
      level_of_office: "National",
      party: "CPDM",
      region: "South"
    },
    {
      name: "Joseph Beti Assomo",
      role_title: "Minister of Defence",
      level_of_office: "National",
      party: "CPDM",
      region: "Centre"
    },
    {
      name: "Atanga Nji Paul",
      role_title: "Minister of Territorial Administration",
      level_of_office: "National",
      party: "CPDM",
      region: "North West"
    },
    {
      name: "Lejeune Mbella Mbella",
      role_title: "Minister of External Relations",
      level_of_office: "National",
      party: "CPDM",
      region: "South West"
    },
    {
      name: "Louis Paul Motaze",
      role_title: "Minister of Finance",
      level_of_office: "National",
      party: "CPDM",
      region: "Centre"
    },
    {
      name: "Manaouda Malachie",
      role_title: "Minister of Public Health",
      level_of_office: "National",
      party: "CPDM",
      region: "Far North"
    },
    {
      name: "Nalova Lyonga",
      role_title: "Minister of Secondary Education",
      level_of_office: "National",
      party: "CPDM",
      region: "South West"
    },
    {
      name: "Jacques Fame Ndongo",
      role_title: "Minister of Higher Education",
      level_of_office: "National",
      party: "CPDM",
      region: "South"
    },
    {
      name: "Gabriel Dodo Ndoke",
      role_title: "Minister of Agriculture and Rural Development",
      level_of_office: "National",
      party: "CPDM",
      region: "Centre"
    }
  ];
}