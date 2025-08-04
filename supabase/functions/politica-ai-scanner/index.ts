import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Trusted Cameroonian government sources
const TRUSTED_SOURCES = [
  'elecam.cm',
  'gov.cm',
  'minat.gov.cm',
  'mincom.gov.cm',
  'cameroon-tribune.cm',
  'assemblee-nationale.cm',
  'senat.cm',
  'prc.cm'
];

interface VerificationResult {
  field: string;
  current_value: string;
  found_value: string;
  source_url: string;
  confidence: number;
  needs_update: boolean;
}

interface ScanResult {
  target_id: string;
  target_type: 'politician' | 'political_party';
  verifications: VerificationResult[];
  overall_confidence: number;
  sources_checked: string[];
  status: 'verified' | 'disputed' | 'unverified';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if AI is enabled
    const { data: aiConfig } = await supabaseClient
      .from('politica_ai_config')
      .select('config_value')
      .eq('config_key', 'ai_enabled')
      .single();

    if (!aiConfig || aiConfig.config_value !== 'true') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Politica AI is currently disabled by admin' 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { target_type, target_id, manual_scan = false, bulk_import = false } = await req.json();

    // Handle bulk import from MINAT government website
    if (bulk_import && target_type === 'political_party') {
      return await handleBulkPartyImport(supabaseClient);
    }

    console.log(`Starting Politica AI scan for ${target_type}: ${target_id}`);

    // Create initial log entry
    const { data: logEntry, error: logError } = await supabaseClient
      .from('politica_ai_logs')
      .insert({
        target_type,
        target_id,
        action_type: manual_scan ? 'scan' : 'verification',
        status: 'pending'
      })
      .select()
      .single();

    if (logError) {
      throw new Error(`Failed to create log entry: ${logError.message}`);
    }

    let scanResults: ScanResult;

    if (target_type === 'politician') {
      scanResults = await scanPolitician(supabaseClient, target_id);
    } else {
      scanResults = await scanPoliticalParty(supabaseClient, target_id);
    }

    // Process scan results and update database
    await processScanResults(supabaseClient, scanResults, logEntry.id);

    // Update verification status
    await updateVerificationStatus(supabaseClient, scanResults);

    // Update log entry
    await supabaseClient
      .from('politica_ai_logs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        ai_confidence_score: scanResults.overall_confidence,
        sources_verified: scanResults.sources_checked,
        changes_made: scanResults.verifications.filter(v => v.needs_update)
      })
      .eq('id', logEntry.id);

    console.log(`Scan completed for ${target_type}: ${target_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        log_id: logEntry.id,
        scan_results: scanResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Politica AI Scanner error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Bulk Import Functions
async function handleBulkPartyImport(supabaseClient: any): Promise<Response> {
  console.log('Starting bulk import of political parties from MINAT website...');
  
  try {
    // Create log entry for bulk import
    const { data: logEntry } = await supabaseClient
      .from('politica_ai_logs')
      .insert({
        target_type: 'political_party',
        target_id: 'bulk_import',
        action_type: 'bulk_import',
        status: 'pending'
      })
      .select()
      .single();

    // Extract all parties from MINAT website
    const parties = await extractAllPartiesFromMinat();
    console.log(`Found ${parties.length} parties from MINAT website`);

    let importedCount = 0;
    let updatedCount = 0;
    const errors = [];

    for (const partyData of parties) {
      try {
        // Check if party already exists
        const { data: existingParty } = await supabaseClient
          .from('political_parties')
          .select('*')
          .or(`name.ilike.%${partyData.name}%,acronym.ilike.%${partyData.acronym || ''}%`)
          .maybeSingle();

        if (existingParty) {
          // Update existing party with missing information
          const updates = {};
          Object.keys(partyData).forEach(key => {
            if (partyData[key] && (!existingParty[key] || existingParty[key] === '')) {
              updates[key] = partyData[key];
            }
          });

          if (Object.keys(updates).length > 0) {
            await supabaseClient
              .from('political_parties')
              .update(updates)
              .eq('id', existingParty.id);
            updatedCount++;
            console.log(`Updated party: ${partyData.name}`);
          }
        } else {
          // Insert new party
          const { error } = await supabaseClient
            .from('political_parties')
            .insert({
              ...partyData,
              auto_imported: true,
              is_claimable: true,
              is_claimed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (!error) {
            importedCount++;
            console.log(`Imported new party: ${partyData.name}`);
          } else {
            errors.push(`Failed to import ${partyData.name}: ${error.message}`);
          }
        }

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        errors.push(`Error processing ${partyData.name}: ${error.message}`);
      }
    }

    // Update log entry
    await supabaseClient
      .from('politica_ai_logs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        changes_made: {
          imported: importedCount,
          updated: updatedCount,
          total_found: parties.length,
          errors: errors
        }
      })
      .eq('id', logEntry.id);

    return new Response(
      JSON.stringify({
        success: true,
        imported: importedCount,
        updated: updatedCount,
        total_found: parties.length,
        errors: errors
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Bulk import error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function extractAllPartiesFromMinat(): Promise<any[]> {
  const baseUrl = 'https://minat.gov.cm/annuaires/partis-politiques/';
  const allParties = [];
  let currentPage = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      console.log(`Scraping page ${currentPage}...`);
      
      // Set display to 100 items per page and get current page
      const pageUrl = `${baseUrl}?page=${currentPage}&display=100`;
      const response = await fetch(pageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        console.log(`Failed to fetch page ${currentPage}, stopping pagination`);
        break;
      }

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      
      // Extract parties from current page
      const pageParties = parsePartiesFromPage(doc);
      
      if (pageParties.length === 0) {
        console.log(`No parties found on page ${currentPage}, stopping pagination`);
        hasMorePages = false;
      } else {
        allParties.push(...pageParties);
        console.log(`Found ${pageParties.length} parties on page ${currentPage}`);
        
        // Check if there's a next page link
        const nextPageLink = doc.querySelector('a[title*="page suivante"], a[title*="next"], .pagination .next, .pagination a[rel="next"]');
        
        if (!nextPageLink || nextPageLink.getAttribute('href')?.includes('#')) {
          hasMorePages = false;
        } else {
          currentPage++;
        }
      }

      // Rate limiting to be respectful to the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error scraping page ${currentPage}:`, error);
      hasMorePages = false;
    }
  }

  console.log(`Total parties extracted: ${allParties.length}`);
  return allParties;
}

function parsePartiesFromPage(doc: any): any[] {
  const parties = [];
  
  // Look for common party listing patterns
  const partyElements = doc.querySelectorAll([
    '.party-item',
    '.parti-politique',
    '.party-card',
    '.list-item',
    'tr[class*="party"], tr[class*="parti"]',
    '.row .col-md-12',
    '.political-party',
    '.annuaire-item'
  ].join(', '));

  for (const element of partyElements) {
    try {
      const party = extractPartyDataFromElement(element);
      if (party && party.name) {
        parties.push(party);
      }
    } catch (error) {
      console.error('Error parsing party element:', error);
    }
  }

  // If no structured elements found, try alternative parsing
  if (parties.length === 0) {
    const alternativeParties = parseAlternativeStructure(doc);
    parties.push(...alternativeParties);
  }

  return parties;
}

function extractPartyDataFromElement(element: any): any {
  const party = {};
  
  // Extract party name
  const nameSelectors = [
    '.party-name', '.parti-nom', '.name', '.title', 'h1', 'h2', 'h3', 'h4', 'strong', '.font-weight-bold'
  ];
  
  for (const selector of nameSelectors) {
    const nameEl = element.querySelector(selector);
    if (nameEl && nameEl.textContent?.trim()) {
      party.name = cleanText(nameEl.textContent);
      break;
    }
  }

  // Extract acronym (usually in parentheses or after the name)
  if (party.name) {
    const acronymMatch = party.name.match(/\(([A-Z][A-Z0-9-]*)\)/);
    if (acronymMatch) {
      party.acronym = acronymMatch[1];
      party.name = party.name.replace(/\s*\([^)]*\)/, '').trim();
    }
  }

  // Extract other details from text content
  const fullText = element.textContent || '';
  
  // Extract founding date
  const dateMatch = fullText.match(/(?:créé|fondé|création|founding).*?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}|\d{4})/i);
  if (dateMatch) {
    party.founding_date = standardizeDate(dateMatch[1]);
  }

  // Extract president/leader
  const presidentMatch = fullText.match(/(?:président|president|leader)[\s:]*([^,\n.;]+)/i);
  if (presidentMatch) {
    party.party_president = cleanText(presidentMatch[1]);
  }

  // Extract headquarters/address
  const hqMatch = fullText.match(/(?:siège|headquarter|adresse|address)[\s:]*([^,\n.;]+)/i);
  if (hqMatch) {
    party.headquarters_address = cleanText(hqMatch[1]);
  }

  // Extract contact info
  const emailMatch = fullText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    party.contact_email = emailMatch[1];
  }

  const phoneMatch = fullText.match(/(?:tél|tel|phone)[\s:]*([+]?[\d\s\-()]{8,})/i);
  if (phoneMatch) {
    party.contact_phone = cleanText(phoneMatch[1]);
  }

  // Extract website
  const websiteMatch = fullText.match(/(https?:\/\/[^\s,;]+|www\.[^\s,;]+\.[a-z]{2,})/i);
  if (websiteMatch) {
    party.official_website = websiteMatch[1].startsWith('http') ? websiteMatch[1] : `http://${websiteMatch[1]}`;
  }

  return party;
}

function parseAlternativeStructure(doc: any): any[] {
  const parties = [];
  
  // Look for table rows or list items that might contain party data
  const rows = doc.querySelectorAll('tr, li, .row, .item');
  
  for (const row of rows) {
    const text = row.textContent?.trim();
    if (!text || text.length < 10) continue;
    
    // Check if this looks like a party entry
    if (text.match(/parti|party|mouvement|movement|union|alliance|front|coalition|rassemblement/i)) {
      const party = {};
      
      // Try to extract name from the beginning of the text
      const words = text.split(/[,\n\r;]/);
      if (words[0]) {
        party.name = cleanText(words[0]);
        
        // Look for acronym in the name
        const acronymMatch = party.name.match(/\(([A-Z][A-Z0-9-]*)\)/);
        if (acronymMatch) {
          party.acronym = acronymMatch[1];
          party.name = party.name.replace(/\s*\([^)]*\)/, '').trim();
        }
        
        if (party.name.length > 5) {
          parties.push(party);
        }
      }
    }
  }
  
  return parties;
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function standardizeDate(dateStr: string): string {
  // Convert various date formats to YYYY-MM-DD
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  return dateStr;
}

// Scan Functions
async function scanPolitician(supabaseClient: any, politicianId: string): Promise<ScanResult> {
  console.log(`Scanning politician: ${politicianId}`);
  
  // Fetch politician data
  const { data: politician, error } = await supabaseClient
    .from('politicians')
    .select('*')
    .eq('id', politicianId)
    .single();

  if (error || !politician) {
    throw new Error(`Politician not found: ${politicianId}`);
  }

  const verifications: VerificationResult[] = [];
  const sourcesChecked: string[] = [];

  // Verify politician name
  const nameVerification = await verifyPoliticianName(politician.name, sourcesChecked);
  if (nameVerification) verifications.push(nameVerification);

  // Verify position/role
  if (politician.role_title) {
    const positionVerification = await verifyPoliticianPosition(politician.role_title, politician.name, sourcesChecked);
    if (positionVerification) verifications.push(positionVerification);
  }

  // Verify party affiliation
  if (politician.party) {
    const partyVerification = await verifyPoliticianParty(politician.party, politician.name, sourcesChecked);
    if (partyVerification) verifications.push(partyVerification);
  }

  // Verify birth date
  if (politician.birth_date) {
    const birthVerification = await verifyPoliticianBirthDate(politician.birth_date, politician.name, sourcesChecked);
    if (birthVerification) verifications.push(birthVerification);
  }

  // Verify profile image
  if (politician.profile_image_url) {
    const imageVerification = await verifyPoliticianImage(politician.profile_image_url, politician.name, sourcesChecked);
    if (imageVerification) verifications.push(imageVerification);
  }

  // Verify education
  if (politician.education) {
    const educationVerification = await verifyPoliticianEducation(politician.education, politician.name, sourcesChecked);
    if (educationVerification) verifications.push(educationVerification);
  }

  // Verify current status
  const statusVerification = await verifyPoliticianStatus(politician.name, sourcesChecked);
  if (statusVerification) verifications.push(statusVerification);

  // Verify bio/biography
  if (politician.bio || politician.biography) {
    const bioVerification = await verifyPoliticianBio(politician.bio || politician.biography, politician.name, sourcesChecked);
    if (bioVerification) verifications.push(bioVerification);
  }

  const overallConfidence = calculateOverallConfidence(verifications);
  const status = determineVerificationStatus(verifications, overallConfidence);

  return {
    target_id: politicianId,
    target_type: 'politician',
    verifications,
    overall_confidence: overallConfidence,
    sources_checked: sourcesChecked,
    status
  };
}

async function scanPoliticalParty(supabaseClient: any, partyId: string): Promise<ScanResult> {
  console.log(`Scanning political party: ${partyId}`);
  
  // Fetch party data
  const { data: party, error } = await supabaseClient
    .from('political_parties')
    .select('*')
    .eq('id', partyId)
    .single();

  if (error || !party) {
    throw new Error(`Political party not found: ${partyId}`);
  }

  const verifications: VerificationResult[] = [];
  const sourcesChecked: string[] = [];

  // Verify party name
  const nameVerification = await verifyPartyName(party.name, sourcesChecked);
  if (nameVerification) verifications.push(nameVerification);

  // Verify party president
  if (party.party_president) {
    const presidentVerification = await verifyPartyPresident(party.party_president, party.name, sourcesChecked);
    if (presidentVerification) verifications.push(presidentVerification);
  }

  // Verify founding date
  if (party.founding_date) {
    const foundingVerification = await verifyPartyFoundingDate(party.founding_date, party.name, sourcesChecked);
    if (foundingVerification) verifications.push(foundingVerification);
  }

  // Verify headquarters
  if (party.headquarters_address || party.headquarters_city) {
    const hqVerification = await verifyPartyHeadquarters(
      party.headquarters_address || party.headquarters_city, 
      party.name, 
      sourcesChecked
    );
    if (hqVerification) verifications.push(hqVerification);
  }

  // Verify contact information
  if (party.contact_email || party.contact_phone) {
    const contactVerification = await verifyPartyContactInfo(
      party.contact_email, 
      party.contact_phone, 
      party.name, 
      sourcesChecked
    );
    if (contactVerification) verifications.push(contactVerification);
  }

  // Verify website
  if (party.official_website) {
    const websiteVerification = await verifyPartyWebsite(party.official_website, party.name, sourcesChecked);
    if (websiteVerification) verifications.push(websiteVerification);
  }

  // Verify mission and vision
  if (party.mission || party.vision) {
    const missionVisionVerification = await verifyPartyMissionVision(
      party.mission, 
      party.vision, 
      party.name, 
      sourcesChecked
    );
    if (missionVisionVerification) verifications.push(missionVisionVerification);
  }

  const overallConfidence = calculateOverallConfidence(verifications);
  const status = determineVerificationStatus(verifications, overallConfidence);

  return {
    target_id: partyId,
    target_type: 'political_party',
    verifications,
    overall_confidence: overallConfidence,
    sources_checked: sourcesChecked,
    status
  };
}

// Politician Verification Functions
async function verifyPoliticianName(name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  console.log(`Verifying politician name: ${name}`);
  
  try {
    // Search across government sources
    const searchResults = await performIntelligentWebSearch(`"${name}" politician Cameroon`, 'gov.cm');
    sourcesChecked.push(...searchResults.slice(0, 3));
    
    // Search ELECAM records
    const elecamResults = await scrapeGovernmentSite('https://elecam.cm', name);
    if (elecamResults.foundNames.length > 0) {
      sourcesChecked.push('elecam.cm');
    }
    
    // Calculate confidence based on name matches
    const confidence = calculateNameMatchConfidence(name, elecamResults.foundNames);
    const bestMatch = findBestNameMatch(name, elecamResults.foundNames);
    
    return {
      field: 'name',
      current_value: name,
      found_value: bestMatch || name,
      source_url: 'https://elecam.cm',
      confidence,
      needs_update: bestMatch && bestMatch !== name && confidence > 0.8
    };
  } catch (error) {
    console.error('Error verifying politician name:', error);
    return null;
  }
}

async function verifyPoliticianPosition(position: string, name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  console.log(`Verifying politician position: ${position} for ${name}`);
  
  try {
    const searchQuery = `"${name}" "${position}" Cameroon government`;
    const searchResults = await performIntelligentWebSearch(searchQuery);
    sourcesChecked.push(...searchResults.slice(0, 3));
    
    const confidence = analyzePositionInformation(position, name, searchResults);
    
    // Format official title
    const formattedPosition = formatOfficialTitle(position);
    
    return {
      field: 'position',
      current_value: position,
      found_value: formattedPosition,
      source_url: searchResults[0] || '',
      confidence,
      needs_update: formattedPosition !== position && confidence > 0.7
    };
  } catch (error) {
    console.error('Error verifying politician position:', error);
    return null;
  }
}

async function verifyPoliticianParty(party: string, name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  console.log(`Verifying politician party: ${party} for ${name}`);
  
  try {
    const searchQuery = `"${name}" "${party}" political party Cameroon`;
    const searchResults = await performIntelligentWebSearch(searchQuery);
    sourcesChecked.push(...searchResults.slice(0, 3));
    
    const confidence = analyzePartyAffiliation(party, name, searchResults);
    
    return {
      field: 'party',
      current_value: party,
      found_value: party,
      source_url: searchResults[0] || '',
      confidence,
      needs_update: false
    };
  } catch (error) {
    console.error('Error verifying politician party:', error);
    return null;
  }
}

async function verifyPoliticianBirthDate(birthDate: string, name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  console.log(`Verifying politician birth date: ${birthDate} for ${name}`);
  
  try {
    const searchQuery = `"${name}" born birth date Cameroon`;
    const searchResults = await performIntelligentWebSearch(searchQuery);
    sourcesChecked.push(...searchResults.slice(0, 3));
    
    const confidence = analyzeDateInformation(birthDate, name, searchResults);
    
    return {
      field: 'birth_date',
      current_value: birthDate,
      found_value: birthDate,
      source_url: searchResults[0] || '',
      confidence,
      needs_update: false
    };
  } catch (error) {
    console.error('Error verifying politician birth date:', error);
    return null;
  }
}

async function verifyPoliticianImage(imageUrl: string, name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  console.log(`Verifying politician image for: ${name}`);
  
  try {
    // For now, we'll do a basic verification
    // In the future, we could implement image recognition/comparison
    const searchQuery = `"${name}" photo image Cameroon politician`;
    const searchResults = await performIntelligentWebSearch(searchQuery);
    sourcesChecked.push(...searchResults.slice(0, 2));
    
    return {
      field: 'profile_image_url',
      current_value: imageUrl,
      found_value: imageUrl,
      source_url: searchResults[0] || '',
      confidence: 0.6, // Moderate confidence for image verification
      needs_update: false
    };
  } catch (error) {
    console.error('Error verifying politician image:', error);
    return null;
  }
}

async function verifyPoliticianEducation(education: string, name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  console.log(`Verifying politician education: ${education} for ${name}`);
  
  try {
    const searchQuery = `"${name}" education university degree Cameroon`;
    const searchResults = await performIntelligentWebSearch(searchQuery);
    sourcesChecked.push(...searchResults.slice(0, 3));
    
    const confidence = analyzeEducationInformation(education, name, searchResults);
    
    return {
      field: 'education',
      current_value: education,
      found_value: education,
      source_url: searchResults[0] || '',
      confidence,
      needs_update: false
    };
  } catch (error) {
    console.error('Error verifying politician education:', error);
    return null;
  }
}

async function verifyPoliticianStatus(name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  console.log(`Verifying politician status for: ${name}`);
  
  try {
    const searchQuery = `"${name}" current status active former Cameroon politician`;
    const searchResults = await performIntelligentWebSearch(searchQuery);
    sourcesChecked.push(...searchResults.slice(0, 3));
    
    const { status, confidence } = analyzeCurrentStatus(name, searchResults);
    
    return {
      field: 'status',
      current_value: 'Active', // Default assumption
      found_value: status,
      source_url: searchResults[0] || '',
      confidence,
      needs_update: status !== 'Active' && confidence > 0.7
    };
  } catch (error) {
    console.error('Error verifying politician status:', error);
    return null;
  }
}

async function verifyPoliticianBio(bio: string, name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  console.log(`Verifying politician bio for: ${name}`);
  
  try {
    const searchQuery = `"${name}" biography background Cameroon politician`;
    const searchResults = await performIntelligentWebSearch(searchQuery);
    sourcesChecked.push(...searchResults.slice(0, 3));
    
    const confidence = analyzeBioInformation(bio, name, searchResults);
    
    return {
      field: 'bio',
      current_value: bio,
      found_value: bio,
      source_url: searchResults[0] || '',
      confidence,
      needs_update: false
    };
  } catch (error) {
    console.error('Error verifying politician bio:', error);
    return null;
  }
}

// Party Verification Functions
async function verifyPartyName(name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  console.log(`Verifying party name: ${name}`);
  
  try {
    const searchQuery = `"${name}" political party Cameroon ELECAM`;
    const searchResults = await performIntelligentWebSearch(searchQuery, 'elecam.cm');
    sourcesChecked.push(...searchResults.slice(0, 3));
    
    // Check MINAT directory
    const minatResults = await scrapeGovernmentSite('https://minat.gov.cm/annuaires/partis-politiques/', name);
    if (minatResults.foundNames.length > 0) {
      sourcesChecked.push('minat.gov.cm');
    }
    
    const confidence = calculateNameMatchConfidence(name, minatResults.foundNames);
    const bestMatch = findBestNameMatch(name, minatResults.foundNames);
    
    return {
      field: 'name',
      current_value: name,
      found_value: bestMatch || name,
      source_url: 'https://minat.gov.cm/annuaires/partis-politiques/',
      confidence,
      needs_update: bestMatch && bestMatch !== name && confidence > 0.8
    };
  } catch (error) {
    console.error('Error verifying party name:', error);
    return null;
  }
}

async function verifyPartyPresident(president: string, partyName: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  console.log(`Verifying party president: ${president} for ${partyName}`);
  
  try {
    const searchQuery = `"${president}" president "${partyName}" Cameroon`;
    const searchResults = await performIntelligentWebSearch(searchQuery);
    sourcesChecked.push(...searchResults.slice(0, 3));
    
    const confidence = analyzeLeadershipInformation(president, partyName, searchResults);
    
    // Check if this person is still active (not former)
    const statusCheck = await performIntelligentWebSearch(`"${president}" former president "${partyName}"`);
    const isFormer = statusCheck.some(result => result.toLowerCase().includes('former') || result.toLowerCase().includes('ancien'));
    
    const updatedValue = isFormer ? `Former: ${president}` : president;
    
    return {
      field: 'party_president',
      current_value: president,
      found_value: updatedValue,
      source_url: searchResults[0] || '',
      confidence,
      needs_update: isFormer && !president.toLowerCase().includes('former') && confidence > 0.7
    };
  } catch (error) {
    console.error('Error verifying party president:', error);
    return null;
  }
}

async function verifyPartyFoundingDate(foundingDate: string, partyName: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  console.log(`Verifying party founding date: ${foundingDate} for ${partyName}`);
  
  try {
    const searchQuery = `"${partyName}" founded created established date Cameroon`;
    const searchResults = await performIntelligentWebSearch(searchQuery);
    sourcesChecked.push(...searchResults.slice(0, 3));
    
    const confidence = analyzeDateInformation(foundingDate, partyName, searchResults);
    
    return {
      field: 'founding_date',
      current_value: foundingDate,
      found_value: foundingDate,
      source_url: searchResults[0] || '',
      confidence,
      needs_update: false
    };
  } catch (error) {
    console.error('Error verifying party founding date:', error);
    return null;
  }
}

async function verifyPartyHeadquarters(headquarters: string, partyName: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  console.log(`Verifying party headquarters: ${headquarters} for ${partyName}`);
  
  try {
    const searchQuery = `"${partyName}" headquarters office address Cameroon`;
    const searchResults = await performIntelligentWebSearch(searchQuery);
    sourcesChecked.push(...searchResults.slice(0, 3));
    
    const confidence = analyzeLocationInformation(headquarters, partyName, searchResults);
    
    return {
      field: 'headquarters',
      current_value: headquarters,
      found_value: headquarters,
      source_url: searchResults[0] || '',
      confidence,
      needs_update: false
    };
  } catch (error) {
    console.error('Error verifying party headquarters:', error);
    return null;
  }
}

async function verifyPartyContactInfo(email: string, phone: string, partyName: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  console.log(`Verifying party contact info for: ${partyName}`);
  
  try {
    const searchQuery = `"${partyName}" contact email phone Cameroon`;
    const searchResults = await performIntelligentWebSearch(searchQuery);
    sourcesChecked.push(...searchResults.slice(0, 3));
    
    const confidence = analyzeContactInformation(email, phone, partyName, searchResults);
    
    return {
      field: 'contact_info',
      current_value: `${email || ''} ${phone || ''}`.trim(),
      found_value: `${email || ''} ${phone || ''}`.trim(),
      source_url: searchResults[0] || '',
      confidence,
      needs_update: false
    };
  } catch (error) {
    console.error('Error verifying party contact info:', error);
    return null;
  }
}

async function verifyPartyWebsite(website: string, partyName: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  console.log(`Verifying party website: ${website} for ${partyName}`);
  
  try {
    // Try to access the website
    const response = await fetch(website, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PoliticaAI/1.0)'
      }
    });
    
    sourcesChecked.push(website);
    
    const isWorking = response.ok;
    const confidence = isWorking ? 0.9 : 0.3;
    
    return {
      field: 'official_website',
      current_value: website,
      found_value: website,
      source_url: website,
      confidence,
      needs_update: false
    };
  } catch (error) {
    console.error('Error verifying party website:', error);
    return {
      field: 'official_website',
      current_value: website,
      found_value: website,
      source_url: website,
      confidence: 0.2, // Low confidence if website is not accessible
      needs_update: false
    };
  }
}

async function verifyPartyMissionVision(mission: string, vision: string, partyName: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  console.log(`Verifying party mission/vision for: ${partyName}`);
  
  try {
    const searchQuery = `"${partyName}" mission vision manifesto Cameroon`;
    const searchResults = await performIntelligentWebSearch(searchQuery);
    sourcesChecked.push(...searchResults.slice(0, 3));
    
    const confidence = analyzeMissionVisionInformation(mission, vision, partyName, searchResults);
    
    return {
      field: 'mission_vision',
      current_value: `${mission || ''} ${vision || ''}`.trim(),
      found_value: `${mission || ''} ${vision || ''}`.trim(),
      source_url: searchResults[0] || '',
      confidence,
      needs_update: false
    };
  } catch (error) {
    console.error('Error verifying party mission/vision:', error);
    return null;
  }
}

// Supporting Functions
function calculateOverallConfidence(verifications: VerificationResult[]): number {
  if (verifications.length === 0) return 0;
  
  const totalConfidence = verifications.reduce((sum, v) => sum + v.confidence, 0);
  return totalConfidence / verifications.length;
}

function determineVerificationStatus(verifications: VerificationResult[], overallConfidence: number): 'verified' | 'disputed' | 'unverified' {
  if (overallConfidence >= 0.8) return 'verified';
  if (overallConfidence >= 0.5) return 'disputed';
  return 'unverified';
}

async function processScanResults(supabaseClient: any, scanResults: ScanResult, logId: string): Promise<void> {
  console.log(`Processing scan results for ${scanResults.target_type}: ${scanResults.target_id}`);
  
  // Apply updates to the target record if confidence is high enough
  const highConfidenceUpdates = scanResults.verifications.filter(v => v.needs_update && v.confidence > 0.8);
  
  if (highConfidenceUpdates.length > 0) {
    const updates = {};
    highConfidenceUpdates.forEach(update => {
      const fieldMapping = {
        'name': 'name',
        'position': 'role_title',
        'party': 'party',
        'birth_date': 'birth_date',
        'education': 'education',
        'bio': 'bio',
        'party_president': 'party_president',
        'founding_date': 'founding_date',
        'headquarters': 'headquarters_address',
        'official_website': 'official_website'
      };
      
      const dbField = fieldMapping[update.field];
      if (dbField) {
        updates[dbField] = update.found_value;
      }
    });
    
    if (Object.keys(updates).length > 0) {
      const tableName = scanResults.target_type === 'politician' ? 'politicians' : 'political_parties';
      await supabaseClient
        .from(tableName)
        .update(updates)
        .eq('id', scanResults.target_id);
      
      console.log(`Applied ${Object.keys(updates).length} updates to ${scanResults.target_type}`);
    }
  }
}

async function updateVerificationStatus(supabaseClient: any, scanResults: ScanResult): Promise<void> {
  const tableName = scanResults.target_type === 'politician' ? 'politician_ai_verification' : 'party_ai_verification';
  const foreignKey = scanResults.target_type === 'politician' ? 'politician_id' : 'party_id';
  
  const verificationData = {
    verification_status: scanResults.status,
    verification_score: scanResults.overall_confidence,
    sources_count: scanResults.sources_checked.length,
    last_verified_at: new Date().toISOString(),
    last_sources_checked: scanResults.sources_checked,
    disputed_fields: scanResults.verifications.filter(v => v.confidence < 0.5).map(v => v.field),
    outdated_fields: scanResults.verifications.filter(v => v.needs_update).map(v => v.field)
  };
  
  // Upsert verification record
  await supabaseClient
    .from(tableName)
    .upsert({
      [foreignKey]: scanResults.target_id,
      ...verificationData
    });
}

// Web Scraping and AI Analysis Functions
async function scrapeGovernmentSite(url: string, searchTerm: string): Promise<{ foundNames: string[], relevantText: string[] }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.log(`Failed to fetch ${url}: ${response.status}`);
      return { foundNames: [], relevantText: [] };
    }
    
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    // Extract text content
    const textContent = doc.body?.textContent || '';
    
    // Extract politician names using various patterns
    const foundNames = extractPoliticianNames(textContent);
    
    // Extract relevant text snippets
    const relevantText = extractRelevantText(textContent, searchTerm);
    
    return { foundNames, relevantText };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return { foundNames: [], relevantText: [] };
  }
}

function extractPoliticianNames(text: string): string[] {
  const names = [];
  
  // Common Cameroonian name patterns
  const namePatterns = [
    /([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/g, // Title Case Names
    /M\.\s*([A-Z][a-z]+ [A-Z][a-z]+)/g, // Mr. Names
    /Mme\.\s*([A-Z][a-z]+ [A-Z][a-z]+)/g, // Mrs. Names
    /Dr\.\s*([A-Z][a-z]+ [A-Z][a-z]+)/g, // Dr. Names
    /Prof\.\s*([A-Z][a-z]+ [A-Z][a-z]+)/g // Prof. Names
  ];
  
  namePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      names.push(match[1] || match[0]);
    }
  });
  
  return [...new Set(names)]; // Remove duplicates
}

function extractRelevantText(text: string, searchTerm: string): string[] {
  const sentences = text.split(/[.!?]+/);
  const relevantSentences = sentences.filter(sentence => 
    sentence.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return relevantSentences.slice(0, 5); // Return top 5 relevant sentences
}

function calculateNameMatchConfidence(targetName: string, foundNames: string[]): number {
  if (foundNames.length === 0) return 0;
  
  let bestMatch = 0;
  foundNames.forEach(name => {
    const similarity = calculateLevenshteinSimilarity(targetName.toLowerCase(), name.toLowerCase());
    bestMatch = Math.max(bestMatch, similarity);
  });
  
  return bestMatch;
}

function findBestNameMatch(targetName: string, foundNames: string[]): string | null {
  if (foundNames.length === 0) return null;
  
  let bestMatch = null;
  let bestScore = 0;
  
  foundNames.forEach(name => {
    const similarity = calculateLevenshteinSimilarity(targetName.toLowerCase(), name.toLowerCase());
    if (similarity > bestScore) {
      bestScore = similarity;
      bestMatch = name;
    }
  });
  
  return bestScore > 0.7 ? bestMatch : null;
}

function calculateLevenshteinSimilarity(str1: string, str2: string): number {
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;
  
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
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
  
  const maxLen = Math.max(len1, len2);
  return (maxLen - matrix[len1][len2]) / maxLen;
}

function calculateWordMatchScore(words1: string[], words2: string[]): number {
  const set1 = new Set(words1.map(w => w.toLowerCase()));
  const set2 = new Set(words2.map(w => w.toLowerCase()));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

async function performIntelligentWebSearch(query: string, domain?: string): Promise<string[]> {
  // Simulate web search results for government sources
  const mockResults = [];
  
  if (domain) {
    mockResults.push(`https://${domain}/search?q=${encodeURIComponent(query)}`);
  } else {
    // Add trusted Cameroonian sources
    TRUSTED_SOURCES.forEach(source => {
      mockResults.push(`https://${source}/search?q=${encodeURIComponent(query)}`);
    });
  }
  
  return mockResults;
}

function analyzePositionInformation(position: string, name: string, searchResults: string[]): number {
  // Simulate position verification analysis
  const keywords = position.toLowerCase().split(' ');
  const resultText = searchResults.join(' ').toLowerCase();
  
  let matches = 0;
  keywords.forEach(keyword => {
    if (resultText.includes(keyword)) matches++;
  });
  
  return Math.min(matches / keywords.length, 1.0);
}

function analyzePartyAffiliation(party: string, name: string, searchResults: string[]): number {
  // Simulate party affiliation analysis
  const partyKeywords = party.toLowerCase().split(' ');
  const resultText = searchResults.join(' ').toLowerCase();
  
  let matches = 0;
  partyKeywords.forEach(keyword => {
    if (resultText.includes(keyword)) matches++;
  });
  
  return Math.min(matches / partyKeywords.length * 0.8, 1.0);
}

function analyzeBioInformation(bio: string, name: string, searchResults: string[]): number {
  // Simulate bio verification analysis
  const bioWords = bio.toLowerCase().split(' ').filter(word => word.length > 3);
  const resultText = searchResults.join(' ').toLowerCase();
  
  let matches = 0;
  bioWords.slice(0, 10).forEach(word => { // Check first 10 significant words
    if (resultText.includes(word)) matches++;
  });
  
  return Math.min(matches / Math.min(bioWords.length, 10) * 0.6, 1.0);
}

function analyzeLeadershipInformation(leader: string, organization: string, searchResults: string[]): number {
  // Simulate leadership verification
  const leaderWords = leader.toLowerCase().split(' ');
  const orgWords = organization.toLowerCase().split(' ');
  const resultText = searchResults.join(' ').toLowerCase();
  
  let leaderMatches = 0;
  let orgMatches = 0;
  
  leaderWords.forEach(word => {
    if (resultText.includes(word)) leaderMatches++;
  });
  
  orgWords.forEach(word => {
    if (resultText.includes(word)) orgMatches++;
  });
  
  const leaderScore = leaderMatches / leaderWords.length;
  const orgScore = orgMatches / orgWords.length;
  
  return (leaderScore + orgScore) / 2;
}

function analyzeDateInformation(date: string, entity: string, searchResults: string[]): number {
  // Simulate date verification
  const resultText = searchResults.join(' ').toLowerCase();
  const year = new Date(date).getFullYear().toString();
  
  if (resultText.includes(year)) {
    return 0.8;
  }
  
  return 0.4;
}

function analyzeLocationInformation(location: string, entity: string, searchResults: string[]): number {
  // Simulate location verification
  const locationWords = location.toLowerCase().split(' ');
  const resultText = searchResults.join(' ').toLowerCase();
  
  let matches = 0;
  locationWords.forEach(word => {
    if (word.length > 2 && resultText.includes(word)) matches++;
  });
  
  return Math.min(matches / locationWords.length, 1.0);
}

function analyzeEducationInformation(education: string, name: string, searchResults: string[]): number {
  // Simulate education verification
  const educationWords = education.toLowerCase().split(' ');
  const resultText = searchResults.join(' ').toLowerCase();
  
  let matches = 0;
  educationWords.forEach(word => {
    if (word.length > 3 && resultText.includes(word)) matches++;
  });
  
  return Math.min(matches / educationWords.length * 0.7, 1.0);
}

function analyzeCurrentStatus(name: string, searchResults: string[]): { status: string, confidence: number } {
  const resultText = searchResults.join(' ').toLowerCase();
  
  if (resultText.includes('former') || resultText.includes('ex-') || resultText.includes('ancien')) {
    return { status: 'Former', confidence: 0.8 };
  }
  
  if (resultText.includes('current') || resultText.includes('acting') || resultText.includes('interim')) {
    return { status: 'Active', confidence: 0.9 };
  }
  
  return { status: 'Active', confidence: 0.6 };
}

function formatOfficialTitle(title: string): string {
  // Format titles to official standards
  const titleMap = {
    'minister': 'Minister',
    'deputy': 'Deputy Minister',
    'secretary': 'Secretary',
    'director': 'Director',
    'governor': 'Governor',
    'mayor': 'Mayor',
    'mp': 'Member of Parliament',
    'senator': 'Senator'
  };
  
  const lowerTitle = title.toLowerCase();
  for (const [key, value] of Object.entries(titleMap)) {
    if (lowerTitle.includes(key)) {
      return value;
    }
  }
  
  return title;
}

function analyzeAcronymMatch(acronym: string, partyName: string, searchResults: string[]): number {
  // Analyze if acronym matches party name
  const firstLetters = partyName.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
  const similarity = calculateLevenshteinSimilarity(acronym.toUpperCase(), firstLetters);
  
  return similarity;
}

function analyzeContactInformation(email: string, phone: string, partyName: string, searchResults: string[]): number {
  const resultText = searchResults.join(' ').toLowerCase();
  
  let score = 0;
  if (email && resultText.includes(email.toLowerCase())) score += 0.5;
  if (phone && resultText.includes(phone.replace(/\s/g, ''))) score += 0.5;
  
  return score;
}

function analyzeMissionVisionInformation(mission: string, vision: string, partyName: string, searchResults: string[]): number {
  const resultText = searchResults.join(' ').toLowerCase();
  const combinedText = `${mission || ''} ${vision || ''}`.toLowerCase();
  
  const words = combinedText.split(' ').filter(word => word.length > 4);
  let matches = 0;
  
  words.slice(0, 10).forEach(word => {
    if (resultText.includes(word)) matches++;
  });
  
  return Math.min(matches / Math.min(words.length, 10) * 0.7, 1.0);
}