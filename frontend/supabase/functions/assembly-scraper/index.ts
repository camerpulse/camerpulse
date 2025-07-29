import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MPData {
  name: string;
  image_url?: string;
  party_name?: string;
  region?: string;
  position?: string;
  biography?: string;
  legislative_session: string;
  gender?: string;
  entry_date?: string;
  committees?: string[];
  page_number: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, source_url, legislative_session } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Starting action: ${action} for session: ${legislative_session}`);

    if (action === 'import_mps') {
      return await importMPs(supabase, source_url, legislative_session);
    } else if (action === 'verify_mps') {
      return await verifyExistingMPs(supabase, legislative_session);
    } else if (action === 'update_affiliations') {
      return await updatePartyAffiliations(supabase, legislative_session);
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action specified' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error) {
    console.error('Assembly scraper error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function importMPs(supabase: any, baseUrl: string, legislativeSession: string) {
  console.log(`Starting MP import for ${legislativeSession}`);
  
  const allMPs: MPData[] = [];
  let totalPages = 10; // Expected pages
  let processedPages = 0;

  try {
    // Scrape multiple pages
    for (let page = 0; page < totalPages; page++) {
      const startParam = page * 15; // 15 MPs per page typically
      const pageUrl = page === 0 ? baseUrl : `${baseUrl}?start=${startParam}`;
      
      console.log(`Scraping page ${page + 1}: ${pageUrl}`);
      
      try {
        const response = await fetch(pageUrl);
        if (!response.ok) {
          console.warn(`Failed to fetch page ${page + 1}: ${response.status}`);
          continue;
        }

        const html = await response.text();
        const mps = extractMPsFromHTML(html, page + 1, legislativeSession);
        
        if (mps.length === 0 && page > 0) {
          console.log(`No MPs found on page ${page + 1}, stopping pagination`);
          break;
        }

        allMPs.push(...mps);
        processedPages++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (pageError) {
        console.error(`Error processing page ${page + 1}:`, pageError);
      }
    }

    console.log(`Extracted ${allMPs.length} MPs from ${processedPages} pages`);

    // Get existing parties for matching
    const { data: existingParties } = await supabase
      .from('political_parties')
      .select('id, name, acronym');

    let importedCount = 0;
    let updatedCount = 0;
    let partyMatches = 0;

    for (const mp of allMPs) {
      try {
        // Check if MP already exists
        const { data: existingMP } = await supabase
          .from('politicians')
          .select('*')
          .eq('name', mp.name)
          .eq('position', 'MP')
          .single();

        // Match party
        let partyId = null;
        if (mp.party_name && existingParties) {
          const matchedParty = existingParties.find((party: any) => 
            party.name?.toLowerCase().includes(mp.party_name?.toLowerCase()) ||
            party.acronym?.toLowerCase().includes(mp.party_name?.toLowerCase()) ||
            mp.party_name?.toLowerCase().includes(party.name?.toLowerCase())
          );

          if (matchedParty) {
            partyId = matchedParty.id;
            partyMatches++;
          } else {
            // Create new party if not found
            const { data: newParty } = await supabase
              .from('political_parties')
              .insert({
                name: mp.party_name,
                acronym: mp.party_name,
                description: `Auto-created from National Assembly data`,
                region: mp.region,
                founded_year: new Date().getFullYear(),
                ideology: 'Unknown',
                logo_url: null
              })
              .select()
              .single();

            if (newParty) {
              partyId = newParty.id;
              console.log(`Created new party: ${mp.party_name}`);
            }
          }
        }

        const mpData = {
          name: mp.name,
          position: 'MP',
          region: mp.region || 'Unknown',
          image_url: mp.image_url,
          bio: mp.biography,
          party_id: partyId,
          legislative_session: mp.legislative_session,
          gender: mp.gender,
          entry_date: mp.entry_date,
          committees: mp.committees,
          approval_rating: 0,
          transparency_rating: 0,
          development_rating: 0,
          trust_rating: 0,
          total_ratings: 0,
          page_scraped: mp.page_number,
          data_source: 'National Assembly Official',
          affiliation_status: partyId ? 'verified' : 'uncertain',
          image_verified: false
        };

        if (existingMP) {
          // Update existing MP
          await supabase
            .from('politicians')
            .update(mpData)
            .eq('id', existingMP.id);
          updatedCount++;
        } else {
          // Insert new MP
          await supabase
            .from('politicians')
            .insert(mpData);
          importedCount++;
        }

      } catch (mpError) {
        console.error(`Error processing MP ${mp.name}:`, mpError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Assembly import completed`,
        stats: {
          total_scraped: allMPs.length,
          pages_processed: processedPages,
          imported: importedCount,
          updated: updatedCount,
          party_matches: partyMatches,
          legislative_session: legislativeSession
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({
        error: 'Import failed',
        details: error.message,
        partial_data: {
          scraped_count: allMPs.length,
          processed_pages: processedPages
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function verifyExistingMPs(supabase: any, legislativeSession: string) {
  console.log(`Verifying existing MPs for ${legislativeSession}`);
  
  const { data: existingMPs } = await supabase
    .from('politicians')
    .select('*')
    .eq('position', 'MP')
    .eq('legislative_session', legislativeSession);

  if (!existingMPs || existingMPs.length === 0) {
    return new Response(
      JSON.stringify({
        success: true,
        message: 'No existing MPs found to verify',
        verified_count: 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let verifiedCount = 0;
  let issuesFound = 0;

  for (const mp of existingMPs) {
    try {
      // Verify party affiliation
      if (mp.party_id) {
        const { data: party } = await supabase
          .from('political_parties')
          .select('name')
          .eq('id', mp.party_id)
          .single();

        if (party) {
          verifiedCount++;
        } else {
          issuesFound++;
          console.warn(`MP ${mp.name} has invalid party_id: ${mp.party_id}`);
        }
      }

      // Check for missing essential data
      if (!mp.region || !mp.name) {
        issuesFound++;
        console.warn(`MP ${mp.name} missing essential data`);
      }

    } catch (error) {
      issuesFound++;
      console.error(`Verification error for MP ${mp.name}:`, error);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: `Verification completed for ${existingMPs.length} MPs`,
      stats: {
        total_mps: existingMPs.length,
        verified_count: verifiedCount,
        issues_found: issuesFound,
        legislative_session: legislativeSession
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updatePartyAffiliations(supabase: any, legislativeSession: string) {
  console.log(`Updating party affiliations for ${legislativeSession}`);
  
  const { data: mpsWithoutParty } = await supabase
    .from('politicians')
    .select('*')
    .eq('position', 'MP')
    .eq('legislative_session', legislativeSession)
    .is('party_id', null);

  const { data: allParties } = await supabase
    .from('political_parties')
    .select('*');

  if (!mpsWithoutParty || mpsWithoutParty.length === 0) {
    return new Response(
      JSON.stringify({
        success: true,
        message: 'All MPs already have party affiliations',
        updated_count: 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let updatedCount = 0;

  for (const mp of mpsWithoutParty) {
    try {
      // Try to match based on name patterns, region, or other data
      // This is a simplified matching - in reality you'd implement more sophisticated matching
      
      // For now, mark as uncertain affiliation
      await supabase
        .from('politicians')
        .update({ 
          affiliation_status: 'uncertain',
          updated_at: new Date().toISOString()
        })
        .eq('id', mp.id);

      updatedCount++;
    } catch (error) {
      console.error(`Error updating MP ${mp.name}:`, error);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: `Updated affiliations for ${updatedCount} MPs`,
      stats: {
        updated_count: updatedCount,
        total_without_party: mpsWithoutParty.length,
        legislative_session: legislativeSession
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function extractMPsFromHTML(html: string, pageNumber: number, legislativeSession: string): MPData[] {
  const mps: MPData[] = [];
  
  try {
    // Parse the HTML structure of assnat.cm
    // This is a simplified parser - you'd need to adapt based on actual HTML structure
    
    // Look for MP containers - typically in div or article elements
    const mpMatches = html.match(/<div[^>]*class="[^"]*member[^"]*"[^>]*>[\s\S]*?<\/div>/gi) || 
                     html.match(/<article[^>]*>[\s\S]*?<\/article>/gi) ||
                     html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi);

    if (mpMatches) {
      for (const mpHtml of mpMatches) {
        try {
          const mp = parseIndividualMP(mpHtml, pageNumber, legislativeSession);
          if (mp) {
            mps.push(mp);
          }
        } catch (error) {
          console.error('Error parsing individual MP:', error);
        }
      }
    }

    // Fallback: try to extract names from simpler patterns
    if (mps.length === 0) {
      const nameMatches = html.match(/([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/g);
      if (nameMatches) {
        const uniqueNames = [...new Set(nameMatches)];
        for (const name of uniqueNames.slice(0, 15)) { // Limit to reasonable number
          if (name.length > 5 && name.length < 50) {
            mps.push({
              name: name.trim(),
              legislative_session: legislativeSession,
              page_number: pageNumber,
              position: 'MP'
            });
          }
        }
      }
    }

  } catch (error) {
    console.error('HTML parsing error:', error);
  }

  return mps;
}

function parseIndividualMP(html: string, pageNumber: number, legislativeSession: string): MPData | null {
  try {
    const mp: Partial<MPData> = {
      legislative_session: legislativeSession,
      page_number: pageNumber,
      position: 'MP'
    };

    // Extract name
    const nameMatch = html.match(/<h\d[^>]*>([^<]+)<\/h\d>/) || 
                     html.match(/class="[^"]*name[^"]*"[^>]*>([^<]+)</) ||
                     html.match(/>([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)*)</);
    
    if (nameMatch) {
      mp.name = nameMatch[1].trim();
    }

    // Extract image
    const imgMatch = html.match(/<img[^>]+src="([^"]+)"/) ||
                    html.match(/background-image:\s*url\(['"]([^'"]+)['"]\)/);
    
    if (imgMatch) {
      let imageUrl = imgMatch[1];
      if (imageUrl.startsWith('/')) {
        imageUrl = 'https://www.assnat.cm' + imageUrl;
      }
      mp.image_url = imageUrl;
    }

    // Extract party
    const partyMatch = html.match(/party[^>]*>([^<]+)</) ||
                      html.match(/parti[^>]*>([^<]+)</) ||
                      html.match(/(RDPC|SDF|UDC|FSNC|MDR|UC|MANIDEM|PCRN)/i);
    
    if (partyMatch) {
      mp.party_name = partyMatch[1].trim();
    }

    // Extract region
    const regionMatch = html.match(/region[^>]*>([^<]+)</) ||
                       html.match(/(Centre|Littoral|West|North West|South West|North|Adamawa|East|South|Far North)/i);
    
    if (regionMatch) {
      mp.region = regionMatch[1].trim();
    }

    // Extract biography
    const bioMatch = html.match(/<p[^>]*>([^<]{20,})<\/p>/);
    if (bioMatch) {
      mp.biography = bioMatch[1].trim().substring(0, 500);
    }

    return mp.name ? mp as MPData : null;

  } catch (error) {
    console.error('Individual MP parsing error:', error);
    return null;
  }
}