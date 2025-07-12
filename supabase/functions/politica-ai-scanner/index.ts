import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

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

  // Simulate verification checks (in production, this would make real web requests)
  const verificationPromises = [
    verifyPoliticianName(politician.name, sourcesChecked),
    verifyPoliticianPosition(politician.role_title, politician.name, sourcesChecked),
    verifyPoliticianParty(politician.party, politician.name, sourcesChecked),
    verifyPoliticianBio(politician.bio, politician.name, sourcesChecked),
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

// Verification functions (simulated - in production these would make real HTTP requests)
async function verifyPoliticianName(name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  // Simulate checking government sources
  await simulateDelay(500);
  sourcesChecked.push('assemblee-nationale.cm');
  
  return {
    field: 'name',
    current_value: name,
    found_value: name, // In real implementation, this would be scraped data
    source_url: 'https://assemblee-nationale.cm/deputes',
    confidence: 0.95,
    needs_update: false
  };
}

async function verifyPoliticianPosition(position: string, name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  await simulateDelay(600);
  sourcesChecked.push('gov.cm');
  
  return {
    field: 'position',
    current_value: position || '',
    found_value: position || '',
    source_url: 'https://gov.cm/gouvernement',
    confidence: 0.88,
    needs_update: false
  };
}

async function verifyPoliticianParty(party: string, name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  await simulateDelay(400);
  sourcesChecked.push('elecam.cm');
  
  return {
    field: 'party',
    current_value: party || '',
    found_value: party || '',
    source_url: 'https://elecam.cm/partis-politiques',
    confidence: 0.92,
    needs_update: false
  };
}

async function verifyPoliticianBio(bio: string, name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  await simulateDelay(700);
  sourcesChecked.push('cameroon-tribune.cm');
  
  return {
    field: 'bio',
    current_value: bio || '',
    found_value: bio || '',
    source_url: 'https://cameroon-tribune.cm',
    confidence: 0.75,
    needs_update: false
  };
}

async function verifyPartyName(name: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  await simulateDelay(500);
  sourcesChecked.push('elecam.cm');
  
  return {
    field: 'name',
    current_value: name,
    found_value: name,
    source_url: 'https://elecam.cm/partis-politiques',
    confidence: 0.98,
    needs_update: false
  };
}

async function verifyPartyPresident(president: string, partyName: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  await simulateDelay(600);
  sourcesChecked.push('minat.gov.cm');
  
  return {
    field: 'party_president',
    current_value: president || '',
    found_value: president || '',
    source_url: 'https://minat.gov.cm/associations',
    confidence: 0.85,
    needs_update: false
  };
}

async function verifyPartyFoundingDate(foundingDate: string, partyName: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  await simulateDelay(500);
  sourcesChecked.push('elecam.cm');
  
  return {
    field: 'founding_date',
    current_value: foundingDate || '',
    found_value: foundingDate || '',
    source_url: 'https://elecam.cm/registre-partis',
    confidence: 0.90,
    needs_update: false
  };
}

async function verifyPartyHeadquarters(headquarters: string, partyName: string, sourcesChecked: string[]): Promise<VerificationResult | null> {
  await simulateDelay(400);
  sourcesChecked.push('minat.gov.cm');
  
  return {
    field: 'headquarters_address',
    current_value: headquarters || '',
    found_value: headquarters || '',
    source_url: 'https://minat.gov.cm/associations',
    confidence: 0.80,
    needs_update: false
  };
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
  const updatesNeeded = scanResults.verifications.filter(v => v.needs_update);
  
  if (updatesNeeded.length > 0) {
    console.log(`Applying ${updatesNeeded.length} updates for ${scanResults.target_type}: ${scanResults.target_id}`);
    
    // In a production system, you would apply the updates here
    // For now, we'll just log them
    updatesNeeded.forEach(update => {
      console.log(`Would update ${update.field} from "${update.current_value}" to "${update.found_value}"`);
    });
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

function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}