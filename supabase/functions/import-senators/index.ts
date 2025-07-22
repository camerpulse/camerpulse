import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface SenatorData {
  name: string;
  full_name: string;
  position: string;
  photo_url?: string;
  about?: string;
  political_party?: string;
  region?: string;
  constituency?: string;
  official_senate_url?: string;
  data_verification_status: string;
  source_page_url: string;
  transparency_score: number;
  civic_engagement_score: number;
}

async function scrapeSenators(): Promise<SenatorData[]> {
  try {
    const response = await fetch('https://senat.cm/?page_id=869');
    const html = await response.text();
    
    const senators: SenatorData[] = [];
    
    // Extract senator blocks - each contains image, name, position, and description
    const senatorBlockPattern = /\[\!\[Senateurs\]\((https:\/\/senat\.cm\/wp-content\/uploads\/[^)]+)\)\]\([^)]*\)\s*\n\n## ([^#\n]+)\s*\n\n#### ([^\n]+)\s*(?:\n\n([^#\n\[]*(?:\n(?!##|\[)[^\n]*)*)?)?/g;
    let match;
    
    while ((match = senatorBlockPattern.exec(html)) !== null) {
      const photoUrl = match[1]?.trim();
      const name = match[2]?.trim();
      const position = match[3]?.trim();
      const about = match[4]?.trim() || '';
      
      if (name && position) {
        // Skip if it's just "Senateurs" header
        if (name.toLowerCase() === 'senateurs') continue;
        
        // Extract region from position/about text
        const region = extractRegion(position, about);
        
        // Extract political party from position/about
        const politicalParty = extractPoliticalParty(position, about);
        
        // Calculate initial scores
        const transparencyScore = calculateTransparencyScore(about, position);
        const engagementScore = calculateEngagementScore(position, about);
        
        const senator: SenatorData = {
          name,
          full_name: name,
          position,
          photo_url: photoUrl,
          about: about || '',
          political_party: politicalParty,
          region: region,
          constituency: region,
          official_senate_url: `https://senat.cm/?page_id=869`,
          data_verification_status: 'verified',
          source_page_url: 'https://senat.cm/?page_id=869',
          transparency_score: transparencyScore,
          civic_engagement_score: engagementScore
        };
        
        senators.push(senator);
        console.log(`Scraped senator: ${name} - ${position} - ${region}`);
      }
    }
    
    console.log(`Total scraped senators: ${senators.length}`);
    return senators;
  } catch (error) {
    console.error('Error scraping senators:', error);
    throw new Error('Failed to scrape senators data');
  }
}

function extractRegion(position: string, about: string): string {
  const regionKeywords = {
    'Adamawa': ['adamawa', 'adamaoua'],
    'Centre': ['centre', 'central', 'yaoundé', 'yaounde'],
    'East': ['east', 'est', 'bertoua'],
    'Far North': ['far north', 'extrême-nord', 'extreme-nord', 'maroua'],
    'Littoral': ['littoral', 'douala'],
    'North': ['north', 'nord', 'garoua'],
    'Northwest': ['northwest', 'nord-ouest', 'bamenda'],
    'South': ['south', 'sud', 'ebolowa'],
    'Southwest': ['southwest', 'sud-ouest', 'buea'],
    'West': ['west', 'ouest', 'bafoussam']
  };
  
  const text = (position + ' ' + about).toLowerCase();
  
  for (const [region, keywords] of Object.entries(regionKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return region;
    }
  }
  
  return 'Unknown';
}

function extractPoliticalParty(position: string, about: string): string {
  const text = (position + ' ' + about).toLowerCase();
  
  if (text.includes('rdpc') || text.includes('rassemblement démocratique')) {
    return 'RDPC';
  } else if (text.includes('sdf') || text.includes('social democratic')) {
    return 'SDF';
  } else if (text.includes('undp') || text.includes('union nationale')) {
    return 'UNDP';
  } else if (text.includes('upc') || text.includes('union des populations')) {
    return 'UPC';
  } else if (text.includes('mdr') || text.includes('mouvement démocratique')) {
    return 'MDR';
  }
  
  return 'Independent';
}

function calculateTransparencyScore(about: string, position: string): number {
  let score = 50; // Base score
  
  // Higher score for detailed bio
  if (about && about.length > 100) score += 20;
  
  // Higher score for specific positions/committees
  if (position.includes('commission') || position.includes('président') || position.includes('secrétaire')) {
    score += 15;
  }
  
  // Higher score for leadership positions
  if (position.includes('président') || position.includes('vice-président')) {
    score += 10;
  }
  
  return Math.min(100, score);
}

function calculateEngagementScore(position: string, about: string): number {
  let score = 25; // Base score
  
  // Higher score for multiple committee memberships
  const commissionCount = (position.match(/commission/gi) || []).length;
  score += Math.min(30, commissionCount * 10);
  
  // Higher score for leadership roles
  if (position.includes('président') || position.includes('rapporteur')) {
    score += 20;
  }
  
  // Higher score for active roles mentioned
  if (position.includes('membre') && commissionCount > 1) {
    score += 15;
  }
  
  return Math.min(100, score);
}

async function importSenators(senators: SenatorData[]) {
  try {
    // Check for duplicates and data quality issues
    const duplicateCheck = removeDuplicatesAndValidate(senators);
    
    // Clear existing senators
    await supabase.from('senators').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert new senators with enhanced data
    const { data, error } = await supabase
      .from('senators')
      .insert(duplicateCheck.cleanedSenators)
      .select();
    
    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    
    // Update performance scores for all senators
    if (data) {
      for (const senator of data) {
        await supabase.rpc('calculate_senator_performance_score', { p_senator_id: senator.id });
        await supabase.rpc('update_senator_badges', { p_senator_id: senator.id });
      }
    }
    
    // Log the update in schedule table
    await supabase.from('senator_update_schedule').insert({
      update_status: 'completed',
      senators_updated: data?.length || 0,
      new_senators_found: data?.length || 0,
      duplicates_removed: duplicateCheck.duplicatesRemoved,
      data_issues_found: duplicateCheck.issues,
      update_log: {
        timestamp: new Date().toISOString(),
        source: 'manual_import',
        total_scraped: senators.length,
        total_imported: data?.length || 0
      }
    });
    
    console.log(`Imported ${data?.length} senators successfully`);
    console.log(`Removed ${duplicateCheck.duplicatesRemoved} duplicates`);
    console.log(`Found ${duplicateCheck.issues.length} data issues`);
    
    return {
      imported: data,
      duplicatesRemoved: duplicateCheck.duplicatesRemoved,
      issues: duplicateCheck.issues
    };
  } catch (error) {
    console.error('Error importing senators:', error);
    throw error;
  }
}

function removeDuplicatesAndValidate(senators: SenatorData[]) {
  const seen = new Set<string>();
  const cleanedSenators: SenatorData[] = [];
  const issues: any[] = [];
  let duplicatesRemoved = 0;
  
  for (const senator of senators) {
    const nameKey = senator.name.toLowerCase().trim();
    
    if (seen.has(nameKey)) {
      duplicatesRemoved++;
      issues.push({
        type: 'duplicate',
        name: senator.name,
        message: 'Duplicate senator found and removed'
      });
      continue;
    }
    
    // Validate data quality
    if (!senator.name || senator.name.length < 2) {
      issues.push({
        type: 'invalid_name',
        name: senator.name,
        message: 'Invalid or missing name'
      });
      continue;
    }
    
    if (!senator.position || senator.position.length < 5) {
      issues.push({
        type: 'invalid_position',
        name: senator.name,
        message: 'Invalid or missing position'
      });
    }
    
    if (!senator.photo_url || !senator.photo_url.startsWith('http')) {
      issues.push({
        type: 'missing_photo',
        name: senator.name,
        message: 'Missing or invalid photo URL'
      });
    }
    
    seen.add(nameKey);
    cleanedSenators.push(senator);
  }
  
  return {
    cleanedSenators,
    duplicatesRemoved,
    issues
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting senators import...');
    
    const senators = await scrapeSenators();
    const result = await importSenators(senators);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported ${result.imported?.length} senators`,
        data: {
          senators: result.imported,
          duplicatesRemoved: result.duplicatesRemoved,
          dataIssues: result.issues,
          totalScraped: senators.length,
          totalImported: result.imported?.length || 0
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});