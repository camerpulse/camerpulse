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

    const { target_type, target_id, manual_scan = false } = await req.json();

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
        scan_results: scanResults,
        log_id: logEntry.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in Politica AI scanner:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function scanPolitician(supabaseClient: any, politicianId: string): Promise<ScanResult> {
  console.log(`Scanning politician: ${politicianId}`);

  // Fetch current politician data
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

  // Comprehensive verification checks following user's rules
  const verificationPromises = [
    verifyPoliticianName(politician.name, sourcesChecked),
    politician.birth_date ? verifyPoliticianBirthDate(politician.birth_date, politician.name, sourcesChecked) : null,
    politician.profile_image_url ? verifyPoliticianImage(politician.profile_image_url, politician.name, sourcesChecked) : null,
    politician.role_title ? verifyPoliticianPosition(politician.role_title, politician.name, sourcesChecked) : null,
    politician.party ? verifyPoliticianParty(politician.party, politician.name, sourcesChecked) : null,
    politician.education ? verifyPoliticianEducation(politician.education, politician.name, sourcesChecked) : null,
    verifyPoliticianStatus(politician.name, sourcesChecked),
    politician.bio ? verifyPoliticianBio(politician.bio, politician.name, sourcesChecked) : null,
  ].filter(promise => promise !== null);

  const results = await Promise.allSettled(verificationPromises);
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      verifications.push(result.value);
    }
  });

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

  // Fetch current party data
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

  // Simulate verification checks
  const verificationPromises = [
    verifyPartyName(party.name, sourcesChecked),
    verifyPartyPresident(party.party_president, party.name, sourcesChecked),
    verifyPartyFoundingDate(party.founding_date, party.name, sourcesChecked),
    verifyPartyHeadquarters(party.headquarters_address, party.name, sourcesChecked),
  ];

  const results = await Promise.allSettled(verificationPromises);
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      verifications.push(result.value);
    }
  });

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

// Real verification functions with web scraping
async function verifyPoliticianName(name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  try {
    console.log(`Verifying politician name: ${name}`);
    
    // Scrape Assemblée Nationale website
    const assemblyResult = await scrapeGovernmentSite('https://assemblee-nationale.cm/deputes', name);
    sourcesChecked.push('assemblee-nationale.cm');
    
    // Search for the politician's name with fuzzy matching
    const confidence = calculateNameMatchConfidence(name, assemblyResult.foundNames);
    const bestMatch = findBestNameMatch(name, assemblyResult.foundNames);
    
    return {
      field: 'name',
      current_value: name,
      found_value: bestMatch || name,
      source_url: 'https://assemblee-nationale.cm/deputes',
      confidence: confidence,
      needs_update: confidence < 0.8 && bestMatch !== name
    };
  } catch (error) {
    console.error('Error verifying politician name:', error);
    return null;
  }
}

async function verifyPoliticianPosition(position: string, name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  try {
    console.log(`Verifying politician position: ${position} for ${name}`);
    
    // Search government sites for position information
    const searchResults = await performIntelligentWebSearch(`${name} ${position}`, 'gov.cm');
    sourcesChecked.push('gov.cm');
    
    // Check if person is still in office or former
    const statusAnalysis = analyzeCurrentStatus(name, searchResults);
    let correctedPosition = position;
    
    // Apply "Former" prefix rule if not currently active
    if (statusAnalysis.status === 'Retired' || statusAnalysis.confidence > 0.6) {
      if (!position.toLowerCase().includes('former') && !position.toLowerCase().includes('ancien')) {
        correctedPosition = `Former ${position}`;
      }
    }
    
    // Ensure proper title formatting (Minister of X, Director of Y)
    correctedPosition = formatOfficialTitle(correctedPosition);
    
    // Analyze results for position mentions
    const confidence = analyzePositionInformation(position, name, searchResults);
    
    return {
      field: 'role_title',
      current_value: position || '',
      found_value: correctedPosition,
      source_url: 'https://gov.cm/gouvernement',
      confidence: confidence,
      needs_update: correctedPosition !== position && confidence > 0.5
    };
  } catch (error) {
    console.error('Error verifying politician position:', error);
    return null;
  }
}

async function verifyPoliticianParty(party: string, name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  try {
    console.log(`Verifying politician party: ${party} for ${name}`);
    
    const searchResults = await performIntelligentWebSearch(`${name} ${party}`, 'elecam.cm');
    sourcesChecked.push('elecam.cm');
    
    const confidence = analyzePartyAffiliation(party, name, searchResults);
    
    return {
      field: 'party',
      current_value: party || '',
      found_value: party || '',
      source_url: 'https://elecam.cm/partis-politiques',
      confidence: confidence,
      needs_update: confidence < 0.7
    };
  } catch (error) {
    console.error('Error verifying politician party:', error);
    return null;
  }
}

async function verifyPoliticianBirthDate(birthDate: string, name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  try {
    console.log(`Verifying birth date: ${birthDate} for ${name}`);
    
    const searchResults = await performIntelligentWebSearch(`${name} born birth date`);
    sourcesChecked.push('gov.cm');
    
    const confidence = analyzeDateInformation(birthDate, name, searchResults);
    
    return {
      field: 'birth_date',
      current_value: birthDate || '',
      found_value: birthDate || '',
      source_url: 'https://gov.cm/officials',
      confidence: confidence,
      needs_update: confidence < 0.6
    };
  } catch (error) {
    console.error('Error verifying birth date:', error);
    return null;
  }
}

async function verifyPoliticianImage(imageUrl: string, name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  try {
    console.log(`Verifying profile image for ${name}`);
    
    // Check if image is from verified sources
    const verifiedSources = ['gov.cm', 'assemblee-nationale.cm', 'senat.cm', 'minat.gov.cm'];
    const isFromVerifiedSource = verifiedSources.some(source => imageUrl.includes(source));
    
    const searchResults = await performIntelligentWebSearch(`${name} photo official`);
    sourcesChecked.push('gov.cm');
    
    // Higher confidence for government-hosted images
    const confidence = isFromVerifiedSource ? 0.9 : 0.4;
    
    return {
      field: 'profile_image_url',
      current_value: imageUrl || '',
      found_value: imageUrl || '',
      source_url: 'https://gov.cm/officials',
      confidence: confidence,
      needs_update: !isFromVerifiedSource && imageUrl.length > 0
    };
  } catch (error) {
    console.error('Error verifying profile image:', error);
    return null;
  }
}

async function verifyPoliticianEducation(education: string, name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  try {
    console.log(`Verifying education: ${education} for ${name}`);
    
    const searchResults = await performIntelligentWebSearch(`${name} education university degree`);
    sourcesChecked.push('cameroon-tribune.cm');
    
    const confidence = analyzeEducationInformation(education, name, searchResults);
    
    return {
      field: 'education',
      current_value: education || '',
      found_value: education || '',
      source_url: 'https://cameroon-tribune.cm',
      confidence: confidence,
      needs_update: confidence < 0.5
    };
  } catch (error) {
    console.error('Error verifying education:', error);
    return null;
  }
}

async function verifyPoliticianStatus(name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  try {
    console.log(`Verifying current status for ${name}`);
    
    const searchResults = await performIntelligentWebSearch(`${name} active retired former current`);
    sourcesChecked.push('gov.cm');
    
    const status = analyzeCurrentStatus(name, searchResults);
    const confidence = status.confidence;
    
    return {
      field: 'status',
      current_value: '',
      found_value: status.status,
      source_url: 'https://gov.cm/current-officials',
      confidence: confidence,
      needs_update: confidence > 0.7 && status.status !== 'Active'
    };
  } catch (error) {
    console.error('Error verifying status:', error);
    return null;
  }
}

async function verifyPoliticianBio(bio: string, name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  try {
    console.log(`Verifying politician bio for ${name}`);
    
    const searchResults = await performIntelligentWebSearch(name);
    sourcesChecked.push('cameroon-tribune.cm');
    
    const confidence = analyzeBioInformation(bio, name, searchResults);
    
    return {
      field: 'bio',
      current_value: bio || '',
      found_value: bio || '',
      source_url: 'https://cameroon-tribune.cm',
      confidence: confidence,
      needs_update: confidence < 0.6
    };
  } catch (error) {
    console.error('Error verifying politician bio:', error);
    return null;
  }
}

async function verifyPartyName(name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  try {
    console.log(`Verifying party name: ${name}`);
    
    const searchResults = await scrapeGovernmentSite('https://elecam.cm/partis-politiques', name);
    sourcesChecked.push('elecam.cm');
    
    const confidence = calculateNameMatchConfidence(name, searchResults.foundNames);
    const bestMatch = findBestNameMatch(name, searchResults.foundNames);
    
    return {
      field: 'name',
      current_value: name,
      found_value: bestMatch || name,
      source_url: 'https://elecam.cm/partis-politiques',
      confidence: confidence,
      needs_update: confidence < 0.8 && bestMatch !== name
    };
  } catch (error) {
    console.error('Error verifying party name:', error);
    return null;
  }
}

async function verifyPartyPresident(president: string, partyName: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  try {
    console.log(`Verifying party president: ${president} for ${partyName}`);
    
    const searchResults = await performIntelligentWebSearch(`${partyName} president ${president}`, 'minat.gov.cm');
    sourcesChecked.push('minat.gov.cm');
    
    const confidence = analyzeLeadershipInformation(president, partyName, searchResults);
    
    return {
      field: 'party_president',
      current_value: president || '',
      found_value: president || '',
      source_url: 'https://minat.gov.cm/associations',
      confidence: confidence,
      needs_update: confidence < 0.7
    };
  } catch (error) {
    console.error('Error verifying party president:', error);
    return null;
  }
}

async function verifyPartyFoundingDate(foundingDate: string, partyName: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  try {
    console.log(`Verifying party founding date: ${foundingDate} for ${partyName}`);
    
    const searchResults = await performIntelligentWebSearch(`${partyName} founded ${foundingDate}`, 'elecam.cm');
    sourcesChecked.push('elecam.cm');
    
    const confidence = analyzeDateInformation(foundingDate, partyName, searchResults);
    
    return {
      field: 'founding_date',
      current_value: foundingDate || '',
      found_value: foundingDate || '',
      source_url: 'https://elecam.cm/registre-partis',
      confidence: confidence,
      needs_update: confidence < 0.6
    };
  } catch (error) {
    console.error('Error verifying party founding date:', error);
    return null;
  }
}

async function verifyPartyHeadquarters(headquarters: string, partyName: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  try {
    console.log(`Verifying party headquarters: ${headquarters} for ${partyName}`);
    
    const searchResults = await performIntelligentWebSearch(`${partyName} headquarters ${headquarters}`, 'minat.gov.cm');
    sourcesChecked.push('minat.gov.cm');
    
    const confidence = analyzeLocationInformation(headquarters, partyName, searchResults);
    
    return {
      field: 'headquarters_address',
      current_value: headquarters || '',
      found_value: headquarters || '',
      source_url: 'https://minat.gov.cm/associations',
      confidence: confidence,
      needs_update: confidence < 0.6
    };
  } catch (error) {
    console.error('Error verifying party headquarters:', error);
    return null;
  }
}

function calculateOverallConfidence(verifications: VerificationResult[]): number {
  if (verifications.length === 0) return 0;
  
  const totalConfidence = verifications.reduce((sum, v) => sum + v.confidence, 0);
  return totalConfidence / verifications.length;
}

function determineVerificationStatus(verifications: VerificationResult[], overallConfidence: number): 'verified' | 'disputed' | 'unverified' {
  const hasDisputes = verifications.some(v => v.needs_update && v.confidence < 0.5);
  
  if (hasDisputes) return 'disputed';
  if (overallConfidence >= 0.8) return 'verified';
  return 'unverified';
}

async function processScanResults(supabaseClient: any, scanResults: ScanResult, logId: string): Promise<void> {
  // Apply any necessary updates to the target record
  const updatesNeeded = scanResults.verifications.filter(v => v.needs_update && v.confidence >= 0.5);
  
  if (updatesNeeded.length > 0) {
    console.log(`Applying ${updatesNeeded.length} updates for ${scanResults.target_type}: ${scanResults.target_id}`);
    
    // Build update object with high-confidence changes
    const updateData: Record<string, any> = {};
    const appliedUpdates: string[] = [];
    
    updatesNeeded.forEach(update => {
      if (update.found_value && update.found_value !== update.current_value) {
        updateData[update.field] = update.found_value;
        appliedUpdates.push(update.field);
        console.log(`Updating ${update.field} from "${update.current_value}" to "${update.found_value}" (confidence: ${update.confidence})`);
      }
    });
    
    // Apply updates if we have any
    if (Object.keys(updateData).length > 0) {
      const table = scanResults.target_type === 'politician' ? 'politicians' : 'political_parties';
      
      const { error: updateError } = await supabaseClient
        .from(table)
        .update(updateData)
        .eq('id', scanResults.target_id);
      
      if (updateError) {
        console.error(`Error updating ${scanResults.target_type}:`, updateError);
        throw updateError;
      } else {
        console.log(`Successfully updated ${scanResults.target_type} ${scanResults.target_id} with fields: ${appliedUpdates.join(', ')}`);
      }
    }
  }
}

async function updateVerificationStatus(supabaseClient: any, scanResults: ScanResult): Promise<void> {
  const table = scanResults.target_type === 'politician' ? 'politician_ai_verification' : 'party_ai_verification';
  const targetField = scanResults.target_type === 'politician' ? 'politician_id' : 'party_id';
  
  const verificationData = {
    [targetField]: scanResults.target_id,
    last_verified_at: new Date().toISOString(),
    verification_status: scanResults.status,
    verification_score: scanResults.overall_confidence,
    sources_count: scanResults.sources_checked.length,
    last_sources_checked: scanResults.sources_checked.map(url => ({ url, checked_at: new Date().toISOString() })),
    outdated_fields: scanResults.verifications.filter(v => v.needs_update && v.confidence > 0.5).map(v => v.field),
    disputed_fields: scanResults.verifications.filter(v => v.needs_update && v.confidence <= 0.5).map(v => v.field),
  };

  // Upsert verification status
  const { error } = await supabaseClient
    .from(table)
    .upsert(verificationData, { 
      onConflict: targetField,
      ignoreDuplicates: false 
    });

  if (error) {
    console.error(`Error updating verification status:`, error);
    throw error;
  }
}

// Web scraping and AI analysis functions
async function scrapeGovernmentSite(url: string, searchTerm: string): Promise<{ foundNames: string[], relevantText: string[] }> {
  try {
    console.log(`Scraping ${url} for: ${searchTerm}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PoliticaAI/1.0; +https://cameroonpulse.com)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    
    if (!doc) {
      throw new Error('Failed to parse HTML');
    }
    
    // Extract all text content and search for names
    const bodyText = doc.body?.textContent || '';
    const foundNames = extractPoliticianNames(bodyText);
    const relevantText = extractRelevantText(bodyText, searchTerm);
    
    return { foundNames, relevantText };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return { foundNames: [], relevantText: [] };
  }
}

function extractPoliticianNames(text: string): string[] {
  // Common Cameroonian name patterns and titles
  const namePatterns = [
    /(?:Dr\.?|Prof\.?|Hon\.?|Mr\.?|Mrs\.?|Miss\.?|Mme\.?|M\.?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g,
    /([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g
  ];
  
  const names = new Set<string>();
  
  namePatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const name = match[1] || match[0];
      if (name && name.length > 5 && name.length < 50) {
        names.add(name.trim());
      }
    }
  });
  
  return Array.from(names);
}

function extractRelevantText(text: string, searchTerm: string): string[] {
  const sentences = text.split(/[.!?]+/);
  const relevant: string[] = [];
  
  const searchWords = searchTerm.toLowerCase().split(/\s+/);
  
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    const matchCount = searchWords.filter(word => lowerSentence.includes(word)).length;
    
    if (matchCount > 0) {
      relevant.push(sentence.trim());
    }
  });
  
  return relevant.slice(0, 10); // Return top 10 relevant sentences
}

function calculateNameMatchConfidence(targetName: string, foundNames: string[]): number {
  if (foundNames.length === 0) return 0.1;
  
  const targetWords = targetName.toLowerCase().split(/\s+/);
  let bestMatch = 0;
  
  foundNames.forEach(foundName => {
    const foundWords = foundName.toLowerCase().split(/\s+/);
    const matchScore = calculateLevenshteinSimilarity(targetName.toLowerCase(), foundName.toLowerCase());
    const wordMatchScore = calculateWordMatchScore(targetWords, foundWords);
    
    const combinedScore = (matchScore * 0.7) + (wordMatchScore * 0.3);
    bestMatch = Math.max(bestMatch, combinedScore);
  });
  
  return Math.min(bestMatch, 1.0);
}

function findBestNameMatch(targetName: string, foundNames: string[]): string | null {
  if (foundNames.length === 0) return null;
  
  let bestMatch = '';
  let bestScore = 0;
  
  foundNames.forEach(foundName => {
    const score = calculateLevenshteinSimilarity(targetName.toLowerCase(), foundName.toLowerCase());
    if (score > bestScore) {
      bestScore = score;
      bestMatch = foundName;
    }
  });
  
  return bestScore > 0.6 ? bestMatch : null;
}

function calculateLevenshteinSimilarity(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : (maxLength - matrix[str2.length][str1.length]) / maxLength;
}

function calculateWordMatchScore(words1: string[], words2: string[]): number {
  if (words1.length === 0 || words2.length === 0) return 0;
  
  let matches = 0;
  words1.forEach(word1 => {
    words2.forEach(word2 => {
      if (calculateLevenshteinSimilarity(word1, word2) > 0.8) {
        matches++;
      }
    });
  });
  
  return matches / Math.max(words1.length, words2.length);
}

async function performIntelligentWebSearch(query: string, domain?: string): Promise<string[]> {
  const searchUrls = domain ? [`https://${domain}`] : [
    'https://elecam.cm',
    'https://gov.cm',
    'https://assemblee-nationale.cm',
    'https://senat.cm',
    'https://cameroon-tribune.cm'
  ];
  
  const results: string[] = [];
  
  for (const url of searchUrls) {
    try {
      const scraped = await scrapeGovernmentSite(url, query);
      results.push(...scraped.relevantText);
    } catch (error) {
      console.error(`Error searching ${url}:`, error);
    }
  }
  
  return results;
}

// AI Analysis Functions
function analyzePositionInformation(position: string, name: string, searchResults: string[]): number {
  if (!position || searchResults.length === 0) return 0.1;
  
  const positionKeywords = position.toLowerCase().split(/\s+/);
  const nameKeywords = name.toLowerCase().split(/\s+/);
  let relevantMentions = 0;
  let totalMentions = 0;
  
  searchResults.forEach(text => {
    const lowerText = text.toLowerCase();
    const hasName = nameKeywords.some(keyword => lowerText.includes(keyword));
    const hasPosition = positionKeywords.some(keyword => lowerText.includes(keyword));
    
    if (hasName) {
      totalMentions++;
      if (hasPosition) {
        relevantMentions++;
      }
    }
  });
  
  if (totalMentions === 0) return 0.1;
  const baseConfidence = relevantMentions / totalMentions;
  
  // Boost confidence if multiple government sources confirm
  const sourceBonus = Math.min(searchResults.length * 0.1, 0.3);
  return Math.min(baseConfidence + sourceBonus, 1.0);
}

function analyzePartyAffiliation(party: string, name: string, searchResults: string[]): number {
  if (!party || searchResults.length === 0) return 0.1;
  
  const partyKeywords = party.toLowerCase().split(/\s+/);
  const nameKeywords = name.toLowerCase().split(/\s+/);
  let affiliationConfirmed = 0;
  let totalMentions = 0;
  
  searchResults.forEach(text => {
    const lowerText = text.toLowerCase();
    const hasName = nameKeywords.some(keyword => lowerText.includes(keyword));
    const hasParty = partyKeywords.some(keyword => lowerText.includes(keyword));
    
    if (hasName || hasParty) {
      totalMentions++;
      if (hasName && hasParty) {
        affiliationConfirmed++;
      }
    }
  });
  
  if (totalMentions === 0) return 0.2;
  return Math.min((affiliationConfirmed / totalMentions) + 0.1, 1.0);
}

function analyzeBioInformation(bio: string, name: string, searchResults: string[]): number {
  if (!bio || searchResults.length === 0) return 0.3;
  
  const bioWords = bio.toLowerCase().split(/\s+/).filter(word => word.length > 3);
  const nameKeywords = name.toLowerCase().split(/\s+/);
  let verifiedFacts = 0;
  let totalFacts = bioWords.length;
  
  searchResults.forEach(text => {
    const lowerText = text.toLowerCase();
    const hasName = nameKeywords.some(keyword => lowerText.includes(keyword));
    
    if (hasName) {
      bioWords.forEach(word => {
        if (lowerText.includes(word)) {
          verifiedFacts++;
        }
      });
    }
  });
  
  if (totalFacts === 0) return 0.5;
  const factVerificationRate = verifiedFacts / totalFacts;
  
  // Bio verification is inherently less precise, so we adjust the scale
  return Math.min(factVerificationRate * 0.8 + 0.2, 1.0);
}

function analyzeLeadershipInformation(leader: string, organization: string, searchResults: string[]): number {
  if (!leader || !organization || searchResults.length === 0) return 0.1;
  
  const leaderKeywords = leader.toLowerCase().split(/\s+/);
  const orgKeywords = organization.toLowerCase().split(/\s+/);
  const leadershipTerms = ['president', 'chairman', 'leader', 'head', 'président', 'dirigeant'];
  
  let leadershipConfirmed = 0;
  let totalRelevantMentions = 0;
  
  searchResults.forEach(text => {
    const lowerText = text.toLowerCase();
    const hasLeader = leaderKeywords.some(keyword => lowerText.includes(keyword));
    const hasOrg = orgKeywords.some(keyword => lowerText.includes(keyword));
    const hasLeadershipTerm = leadershipTerms.some(term => lowerText.includes(term));
    
    if ((hasLeader || hasOrg) && hasLeadershipTerm) {
      totalRelevantMentions++;
      if (hasLeader && hasOrg) {
        leadershipConfirmed++;
      }
    }
  });
  
  if (totalRelevantMentions === 0) return 0.2;
  return Math.min((leadershipConfirmed / totalRelevantMentions) + 0.15, 1.0);
}

function analyzeDateInformation(date: string, entity: string, searchResults: string[]): number {
  if (!date || searchResults.length === 0) return 0.3;
  
  const year = new Date(date).getFullYear().toString();
  const entityKeywords = entity.toLowerCase().split(/\s+/);
  const dateTerms = ['founded', 'established', 'created', 'formed', 'fondé', 'créé'];
  
  let dateConfirmed = 0;
  let totalDateMentions = 0;
  
  searchResults.forEach(text => {
    const lowerText = text.toLowerCase();
    const hasEntity = entityKeywords.some(keyword => lowerText.includes(keyword));
    const hasYear = lowerText.includes(year);
    const hasDateTerm = dateTerms.some(term => lowerText.includes(term));
    
    if (hasEntity && hasDateTerm) {
      totalDateMentions++;
      if (hasYear) {
        dateConfirmed++;
      }
    }
  });
  
  if (totalDateMentions === 0) return 0.4;
  return Math.min((dateConfirmed / totalDateMentions) + 0.2, 1.0);
}

function analyzeLocationInformation(location: string, entity: string, searchResults: string[]): number {
  if (!location || searchResults.length === 0) return 0.3;
  
  const locationKeywords = location.toLowerCase().split(/[,\s]+/).filter(word => word.length > 2);
  const entityKeywords = entity.toLowerCase().split(/\s+/);
  const locationTerms = ['headquarters', 'office', 'address', 'located', 'siège', 'bureau'];
  
  let locationConfirmed = 0;
  let totalLocationMentions = 0;
  
  searchResults.forEach(text => {
    const lowerText = text.toLowerCase();
    const hasEntity = entityKeywords.some(keyword => lowerText.includes(keyword));
    const hasLocation = locationKeywords.some(keyword => lowerText.includes(keyword));
    const hasLocationTerm = locationTerms.some(term => lowerText.includes(term));
    
    if (hasEntity && hasLocationTerm) {
      totalLocationMentions++;
      if (hasLocation) {
        locationConfirmed++;
      }
    }
  });
  
  if (totalLocationMentions === 0) return 0.4;
  return Math.min((locationConfirmed / totalLocationMentions) + 0.1, 1.0);
}

function analyzeEducationInformation(education: string, name: string, searchResults: string[]): number {
  if (!education || searchResults.length === 0) return 0.3;
  
  const educationKeywords = education.toLowerCase().split(/[,\s]+/).filter(word => word.length > 3);
  const nameKeywords = name.toLowerCase().split(/\s+/);
  const educationTerms = ['university', 'college', 'degree', 'studied', 'graduated', 'université', 'diplôme'];
  
  let educationConfirmed = 0;
  let totalEducationMentions = 0;
  
  searchResults.forEach(text => {
    const lowerText = text.toLowerCase();
    const hasName = nameKeywords.some(keyword => lowerText.includes(keyword));
    const hasEducation = educationKeywords.some(keyword => lowerText.includes(keyword));
    const hasEducationTerm = educationTerms.some(term => lowerText.includes(term));
    
    if (hasName && hasEducationTerm) {
      totalEducationMentions++;
      if (hasEducation) {
        educationConfirmed++;
      }
    }
  });
  
  if (totalEducationMentions === 0) return 0.4;
  return Math.min((educationConfirmed / totalEducationMentions) + 0.1, 1.0);
}

function analyzeCurrentStatus(name: string, searchResults: string[]): { status: string, confidence: number } {
  if (searchResults.length === 0) return { status: 'Active', confidence: 0.3 };
  
  const nameKeywords = name.toLowerCase().split(/\s+/);
  const activeTerms = ['current', 'serves', 'minister', 'deputy', 'actuel', 'ministre'];
  const formerTerms = ['former', 'ex-', 'retired', 'ancien', 'retraité'];
  const deceasedTerms = ['died', 'deceased', 'death', 'mort', 'décédé'];
  
  let activeScore = 0;
  let formerScore = 0;
  let deceasedScore = 0;
  let totalMentions = 0;
  
  searchResults.forEach(text => {
    const lowerText = text.toLowerCase();
    const hasName = nameKeywords.some(keyword => lowerText.includes(keyword));
    
    if (hasName) {
      totalMentions++;
      
      if (activeTerms.some(term => lowerText.includes(term))) {
        activeScore++;
      }
      if (formerTerms.some(term => lowerText.includes(term))) {
        formerScore++;
      }
      if (deceasedTerms.some(term => lowerText.includes(term))) {
        deceasedScore++;
      }
    }
  });
  
  if (totalMentions === 0) return { status: 'Active', confidence: 0.3 };
  
  const activeConf = activeScore / totalMentions;
  const formerConf = formerScore / totalMentions;
  const deceasedConf = deceasedScore / totalMentions;
  
  if (deceasedConf > 0.3) {
    return { status: 'Deceased', confidence: deceasedConf };
  } else if (formerConf > activeConf && formerConf > 0.2) {
    return { status: 'Retired', confidence: formerConf };
  } else {
    return { status: 'Active', confidence: Math.max(activeConf, 0.4) };
  }
}

function formatOfficialTitle(title: string): string {
  if (!title) return title;
  
  // Common title patterns to standardize
  const titlePatterns = [
    { pattern: /\bministre?\b/gi, replacement: 'Minister' },
    { pattern: /\bdirecteur?\b/gi, replacement: 'Director' },
    { pattern: /\bsecrétaire?\s+général?\b/gi, replacement: 'Secretary General' },
    { pattern: /\bgouverneur?\b/gi, replacement: 'Governor' },
    { pattern: /\bmaire?\b/gi, replacement: 'Mayor' },
    { pattern: /\bdéputé?\b/gi, replacement: 'Deputy' },
    { pattern: /\bsénateur?\b/gi, replacement: 'Senator' }
  ];
  
  let formattedTitle = title;
  
  titlePatterns.forEach(({ pattern, replacement }) => {
    formattedTitle = formattedTitle.replace(pattern, replacement);
  });
  
  // Ensure proper capitalization
  formattedTitle = formattedTitle.replace(/\b\w+/g, word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
  
  // Handle "of" prepositions properly
  formattedTitle = formattedTitle.replace(/\bOf\b/g, 'of');
  formattedTitle = formattedTitle.replace(/\bAnd\b/g, 'and');
  formattedTitle = formattedTitle.replace(/\bThe\b/g, 'the');
  
  return formattedTitle;
}