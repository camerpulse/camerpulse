import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapeTarget {
  url: string;
  category: 'government' | 'legislature' | 'election' | 'media';
  selectors: {
    name?: string;
    position?: string;
    party?: string;
    photo?: string;
    contact?: string;
  };
}

interface ScrapedRecord {
  name: string;
  position: string;
  party?: string;
  region?: string;
  photo_url?: string;
  contact_info?: string;
  source_url: string;
  confidence_score: number;
  validation_issues: string[];
}

const SCRAPE_TARGETS: Record<string, ScrapeTarget> = {
  'https://senat.cm': {
    url: 'https://senat.cm',
    category: 'legislature',
    selectors: {
      name: '.senator-name, .member-name',
      position: '.senator-title, .position',
      party: '.party-affiliation',
      photo: '.senator-photo img, .member-photo img'
    }
  },
  'https://www.assnat.cm': {
    url: 'https://www.assnat.cm',
    category: 'legislature',
    selectors: {
      name: '.deputy-name, .mp-name',
      position: '.deputy-title',
      party: '.political-party',
      photo: '.deputy-photo img'
    }
  },
  'https://spm.gov.cm': {
    url: 'https://spm.gov.cm',
    category: 'government',
    selectors: {
      name: '.minister-name, .official-name',
      position: '.minister-title, .official-title',
      photo: '.minister-photo img, .official-photo img'
    }
  },
  'https://elecam.cm': {
    url: 'https://elecam.cm',
    category: 'election',
    selectors: {
      name: '.official-name, .commissioner-name',
      position: '.official-title, .commissioner-title',
      photo: '.official-photo img'
    }
  },
  'https://minat.gov.cm': {
    url: 'https://minat.gov.cm',
    category: 'government',
    selectors: {
      name: '.official-name',
      position: '.official-title',
      photo: '.official-photo img'
    }
  },
  'https://www.prc.cm': {
    url: 'https://www.prc.cm',
    category: 'government',
    selectors: {
      name: '.official-name, .advisor-name',
      position: '.official-title, .advisor-title',
      photo: '.official-photo img'
    }
  },
  'https://cameroon-tribune.cm': {
    url: 'https://cameroon-tribune.cm',
    category: 'media',
    selectors: {
      name: '.official-name',
      position: '.official-title',
      photo: '.official-photo img'
    }
  }
};

// Simplified scraping simulation for demonstration
async function scrapeWebsite(target: ScrapeTarget): Promise<ScrapedRecord[]> {
  console.log(`Scraping ${target.url} for ${target.category} data...`);
  
  try {
    // In a real implementation, this would use a proper web scraping library
    // For now, we'll simulate the scraping process
    
    const mockData: ScrapedRecord[] = [];
    
    // Generate mock data based on the target
    const recordCount = Math.floor(Math.random() * 10) + 5; // 5-15 records
    
    for (let i = 0; i < recordCount; i++) {
      const record: ScrapedRecord = {
        name: `Official ${i + 1} from ${target.category}`,
        position: target.category === 'legislature' ? 'Member of Parliament' : 
                 target.category === 'government' ? 'Minister' : 
                 target.category === 'election' ? 'Commissioner' : 'Official',
        party: target.category === 'legislature' ? ['CPDM', 'SDF', 'UDC', 'FSNC'][Math.floor(Math.random() * 4)] : undefined,
        region: ['Centre', 'Littoral', 'West', 'Northwest', 'Southwest', 'North', 'Adamawa', 'East', 'South', 'Far North'][Math.floor(Math.random() * 10)],
        source_url: target.url,
        confidence_score: Math.floor(Math.random() * 30) + 70, // 70-100%
        validation_issues: []
      };
      
      // Add some validation issues randomly
      if (Math.random() < 0.1) {
        record.validation_issues.push('Missing photo');
      }
      if (Math.random() < 0.05) {
        record.validation_issues.push('Duplicate detected');
      }
      if (Math.random() < 0.08) {
        record.validation_issues.push('Outdated position');
      }
      
      mockData.push(record);
    }
    
    console.log(`Scraped ${mockData.length} records from ${target.url}`);
    return mockData;
    
  } catch (error) {
    console.error(`Error scraping ${target.url}:`, error);
    return [];
  }
}

function validateRecord(record: ScrapedRecord, existingRecords: any[]): number {
  let confidence = record.confidence_score;
  
  // Check for duplicates
  const duplicate = existingRecords.find(existing => 
    existing.name.toLowerCase() === record.name.toLowerCase() ||
    (existing.position === record.position && existing.region === record.region)
  );
  
  if (duplicate) {
    record.validation_issues.push('Potential duplicate found');
    confidence -= 15;
  }
  
  // Validate required fields
  if (!record.name || record.name.length < 3) {
    record.validation_issues.push('Invalid or missing name');
    confidence -= 20;
  }
  
  if (!record.position) {
    record.validation_issues.push('Missing position');
    confidence -= 10;
  }
  
  // Check for suspicious patterns
  if (record.name.includes('Official') || record.name.includes('Member')) {
    record.validation_issues.push('Generic name pattern detected');
    confidence -= 25;
  }
  
  return Math.max(0, Math.min(100, confidence));
}

async function storeValidatedRecords(supabase: any, records: ScrapedRecord[]): Promise<void> {
  for (const record of records) {
    try {
      // Check if politician already exists
      const { data: existing } = await supabase
        .from('politicians')
        .select('id, name, position')
        .ilike('name', record.name)
        .limit(1)
        .single();
      
      if (existing) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('politicians')
          .update({
            position: record.position,
            party_affiliation: record.party,
            region: record.region,
            photo_url: record.photo_url,
            updated_at: new Date().toISOString(),
            last_verified: new Date().toISOString()
          })
          .eq('id', existing.id);
        
        if (updateError) {
          console.error('Error updating politician:', updateError);
        } else {
          console.log(`Updated politician: ${record.name}`);
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('politicians')
          .insert({
            name: record.name,
            position: record.position,
            party_affiliation: record.party,
            region: record.region,
            photo_url: record.photo_url,
            contact_info: record.contact_info,
            source_url: record.source_url,
            verification_status: record.confidence_score >= 85 ? 'verified' : 'pending',
            last_verified: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Error inserting politician:', insertError);
        } else {
          console.log(`Inserted new politician: ${record.name}`);
        }
      }
      
      // Log import activity
      await supabase
        .from('camerpulse_activity_timeline')
        .insert({
          module: 'civic_import_core',
          activity_type: existing ? 'politician_updated' : 'politician_imported',
          activity_summary: `${existing ? 'Updated' : 'Imported'} ${record.name} from ${record.source_url}`,
          status: 'completed',
          details: {
            politician_name: record.name,
            source_url: record.source_url,
            confidence_score: record.confidence_score,
            validation_issues: record.validation_issues
          }
        });
      
    } catch (error) {
      console.error(`Error processing record for ${record.name}:`, error);
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { targets, confidenceThreshold = 0.85 } = await req.json();
    console.log('Starting CivicImportCore sync for targets:', targets);

    const allScrapedRecords: ScrapedRecord[] = [];
    const scrapeResults = [];

    // Get existing records for duplicate detection
    const { data: existingPoliticians } = await supabaseClient
      .from('politicians')
      .select('name, position, region, party_affiliation');

    // Scrape each target
    for (const targetUrl of targets) {
      const target = SCRAPE_TARGETS[targetUrl];
      if (!target) {
        console.warn(`Unknown target URL: ${targetUrl}`);
        continue;
      }

      try {
        const records = await scrapeWebsite(target);
        
        // Validate each record
        const validatedRecords = records.map(record => ({
          ...record,
          confidence_score: validateRecord(record, existingPoliticians || [])
        }));

        // Filter by confidence threshold
        const highConfidenceRecords = validatedRecords.filter(
          record => record.confidence_score >= (confidenceThreshold * 100)
        );

        allScrapedRecords.push(...highConfidenceRecords);
        
        scrapeResults.push({
          url: targetUrl,
          category: target.category,
          recordsFound: records.length,
          validatedRecords: validatedRecords.length,
          highConfidenceRecords: highConfidenceRecords.length,
          avgConfidence: records.reduce((sum, r) => sum + r.confidence_score, 0) / records.length || 0
        });

      } catch (error) {
        console.error(`Error processing target ${targetUrl}:`, error);
        scrapeResults.push({
          url: targetUrl,
          category: target.category,
          error: error.message,
          recordsFound: 0,
          validatedRecords: 0,
          highConfidenceRecords: 0,
          avgConfidence: 0
        });
      }
    }

    // Store validated records
    if (allScrapedRecords.length > 0) {
      await storeValidatedRecords(supabaseClient, allScrapedRecords);
    }

    // Log the sync operation
    await supabaseClient
      .from('camerpulse_activity_timeline')
      .insert({
        module: 'civic_import_core',
        activity_type: 'sync_completed',
        activity_summary: `CivicImportCore sync completed: ${allScrapedRecords.length} records processed`,
        status: 'completed',
        details: {
          total_targets: targets.length,
          total_records_scraped: scrapeResults.reduce((sum, r) => sum + (r.recordsFound || 0), 0),
          total_records_stored: allScrapedRecords.length,
          confidence_threshold: confidenceThreshold,
          scrape_results: scrapeResults
        }
      });

    console.log(`CivicImportCore sync completed. Processed ${allScrapedRecords.length} records.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'CivicImportCore sync completed successfully',
        summary: {
          totalTargets: targets.length,
          totalRecordsProcessed: allScrapedRecords.length,
          scrapeResults
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in CivicImportCore sync:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'CivicImportCore sync failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});