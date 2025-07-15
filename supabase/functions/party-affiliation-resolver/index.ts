import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Politician {
  id: string;
  name: string;
  position: string;
  region?: string;
  political_party_id?: string;
  affiliation_status?: string;
}

interface Party {
  id: string;
  name: string;
  acronym?: string;
  president?: string;
  region?: string;
}

interface MatchResult {
  politician_id: string;
  politician_name: string;
  position: string;
  old_party?: string;
  new_party: string;
  confidence_score: number;
  match_type: 'exact' | 'fuzzy' | 'manual';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, confidence_threshold = 85, auto_link = true } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Starting party affiliation resolver: ${action}`);

    if (action === 'resolve_all_affiliations') {
      return await resolveAllAffiliations(supabase, confidence_threshold, auto_link);
    } else if (action === 'scan_broken_links') {
      return await scanBrokenLinks(supabase);
    } else if (action === 'fix_uncertain_affiliations') {
      return await fixUncertainAffiliations(supabase, confidence_threshold);
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action specified' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error) {
    console.error('Party affiliation resolver error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function resolveAllAffiliations(supabase: any, confidenceThreshold: number, autoLink: boolean) {
  console.log('Starting comprehensive affiliation resolution');

  try {
    // Get all politicians without party affiliations or with uncertain status
    const { data: unlinkedPoliticians, error: politiciansError } = await supabase
      .from('politicians')
      .select('*')
      .in('position', ['Minister', 'Senator', 'MP'])
      .or('political_party_id.is.null,affiliation_status.eq.uncertain');

    if (politiciansError) throw politiciansError;

    // Get all available parties
    const { data: allParties, error: partiesError } = await supabase
      .from('political_parties')
      .select('*');

    if (partiesError) throw partiesError;

    console.log(`Processing ${unlinkedPoliticians?.length || 0} politicians against ${allParties?.length || 0} parties`);

    const matches: MatchResult[] = [];
    let successfulLinks = 0;
    let totalProcessed = 0;

    for (const politician of unlinkedPoliticians || []) {
      totalProcessed++;
      
      try {
        const match = findBestPartyMatch(politician, allParties || [], confidenceThreshold);
        
        if (match && autoLink) {
          // Update politician with party link
          const { error: updateError } = await supabase
            .from('politicians')
            .update({
              political_party_id: match.party_id,
              affiliation_status: 'verified',
              updated_at: new Date().toISOString()
            })
            .eq('id', politician.id);

          if (!updateError) {
            successfulLinks++;
            matches.push({
              politician_id: politician.id,
              politician_name: politician.name,
              position: politician.position,
              old_party: politician.political_party_id ? 'Previous Party' : 'None',
              new_party: match.party_name,
              confidence_score: match.confidence,
              match_type: match.match_type
            });

            // Log the affiliation change
            await logAffiliationChange(supabase, {
              politician_id: politician.id,
              party_id: match.party_id,
              confidence_score: match.confidence,
              match_type: match.match_type,
              changed_by: 'system'
            });

            // Update party member count
            await updatePartyMemberCount(supabase, match.party_id);
          }
        } else if (!match) {
          // Mark as unknown affiliation
          await supabase
            .from('politicians')
            .update({
              affiliation_status: 'unknown',
              updated_at: new Date().toISOString()
            })
            .eq('id', politician.id);
        }

      } catch (error) {
        console.error(`Error processing politician ${politician.name}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Affiliation resolution completed',
        stats: {
          total_processed: totalProcessed,
          successful_links: successfulLinks,
          matches: matches.slice(0, 20), // Return first 20 for display
          confidence_threshold: confidenceThreshold
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Resolution error:', error);
    return new Response(
      JSON.stringify({
        error: 'Resolution failed',
        details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function scanBrokenLinks(supabase: any) {
  console.log('Scanning for broken party links');

  try {
    // Find politicians with party IDs that don't exist
    const { data: politiciansWithParties, error: politiciansError } = await supabase
      .from('politicians')
      .select('id, name, political_party_id')
      .not('political_party_id', 'is', null);

    if (politiciansError) throw politiciansError;

    const { data: existingParties, error: partiesError } = await supabase
      .from('political_parties')
      .select('id');

    if (partiesError) throw partiesError;

    const existingPartyIds = new Set(existingParties?.map(p => p.id) || []);
    
    let brokenLinks = 0;
    let missingAffiliations = 0;

    // Check for broken links
    for (const politician of politiciansWithParties || []) {
      if (!existingPartyIds.has(politician.political_party_id)) {
        brokenLinks++;
        
        // Clear broken link
        await supabase
          .from('politicians')
          .update({
            political_party_id: null,
            affiliation_status: 'uncertain'
          })
          .eq('id', politician.id);
      }
    }

    // Count missing affiliations
    const { data: unlinkedCount, error: countError } = await supabase
      .from('politicians')
      .select('id')
      .in('position', ['Minister', 'Senator', 'MP'])
      .is('political_party_id', null);

    if (!countError) {
      missingAffiliations = unlinkedCount?.length || 0;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Broken links scan completed',
        stats: {
          broken_links: brokenLinks,
          missing_affiliations: missingAffiliations,
          total_scanned: politiciansWithParties?.length || 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Scan error:', error);
    return new Response(
      JSON.stringify({
        error: 'Scan failed',
        details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function fixUncertainAffiliations(supabase: any, confidenceThreshold: number) {
  console.log('Fixing uncertain affiliations');

  try {
    const { data: uncertainPoliticians, error: politiciansError } = await supabase
      .from('politicians')
      .select('*')
      .eq('affiliation_status', 'uncertain');

    if (politiciansError) throw politiciansError;

    const { data: allParties, error: partiesError } = await supabase
      .from('political_parties')
      .select('*');

    if (partiesError) throw partiesError;

    let fixedCount = 0;

    for (const politician of uncertainPoliticians || []) {
      const match = findBestPartyMatch(politician, allParties || [], confidenceThreshold);
      
      if (match) {
        await supabase
          .from('politicians')
          .update({
            political_party_id: match.party_id,
            affiliation_status: 'verified'
          })
          .eq('id', politician.id);

        fixedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Uncertain affiliations fixed',
        stats: {
          fixed_count: fixedCount,
          total_uncertain: uncertainPoliticians?.length || 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Fix error:', error);
    return new Response(
      JSON.stringify({
        error: 'Fix failed',
        details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

function findBestPartyMatch(politician: Politician, parties: Party[], confidenceThreshold: number) {
  let bestMatch = null;
  let highestConfidence = 0;

  for (const party of parties) {
    let confidence = 0;
    let matchType: 'exact' | 'fuzzy' | 'manual' = 'fuzzy';

    // Check exact name matches
    if (party.name.toLowerCase() === politician.name.toLowerCase() ||
        party.acronym?.toLowerCase() === politician.name.toLowerCase()) {
      confidence = 100;
      matchType = 'exact';
    }
    // Check if politician name contains party name or acronym
    else if (politician.name.toLowerCase().includes(party.name.toLowerCase()) ||
             (party.acronym && politician.name.toLowerCase().includes(party.acronym.toLowerCase()))) {
      confidence = 90;
      matchType = 'exact';
    }
    // Check president name match
    else if (party.president && 
             stringSimilarity(politician.name, party.president) > 0.8) {
      confidence = 95;
      matchType = 'exact';
    }
    // Fuzzy matching for party names
    else {
      const nameScore = stringSimilarity(politician.name, party.name);
      const acronymScore = party.acronym ? stringSimilarity(politician.name, party.acronym) : 0;
      confidence = Math.max(nameScore, acronymScore) * 100;
    }

    // Regional bonus
    if (politician.region && party.region && 
        politician.region.toLowerCase() === party.region.toLowerCase()) {
      confidence += 5;
    }

    if (confidence > highestConfidence && confidence >= confidenceThreshold) {
      highestConfidence = confidence;
      bestMatch = {
        party_id: party.id,
        party_name: party.name,
        confidence: Math.round(confidence),
        match_type: matchType
      };
    }
  }

  return bestMatch;
}

function stringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

async function logAffiliationChange(supabase: any, data: any) {
  try {
    await supabase
      .from('party_affiliation_log')
      .insert({
        politician_id: data.politician_id,
        party_id: data.party_id,
        confidence_score: data.confidence_score,
        match_type: data.match_type,
        changed_by: data.changed_by,
        changed_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error logging affiliation change:', error);
  }
}

async function updatePartyMemberCount(supabase: any, partyId: string) {
  try {
    const { data: memberCount, error } = await supabase
      .from('politicians')
      .select('id')
      .eq('political_party_id', partyId);

    if (!error && memberCount) {
      await supabase
        .from('political_parties')
        .update({
          total_members: memberCount.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', partyId);
    }
  } catch (error) {
    console.error('Error updating party member count:', error);
  }
}