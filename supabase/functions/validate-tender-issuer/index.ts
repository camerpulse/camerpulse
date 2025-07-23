import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationRequest {
  issuer_name: string;
  issuer_registration?: string;
  tender_id?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { issuer_name, issuer_registration, tender_id }: ValidationRequest = await req.json();

    console.log('Validating issuer:', { issuer_name, issuer_registration });

    // Search in Business Directory
    let businessQuery = supabase
      .from('business_directory')
      .select('*')
      .or(`business_name.ilike.%${issuer_name}%,registered_name.ilike.%${issuer_name}%`);

    if (issuer_registration) {
      businessQuery = businessQuery.or(`registration_number.eq.${issuer_registration}`);
    }

    const { data: businesses, error: businessError } = await businessQuery;

    if (businessError) {
      console.error('Business directory query error:', businessError);
    }

    // Search in Government Agencies
    const { data: agencies, error: agencyError } = await supabase
      .from('government_agencies')
      .select('*')
      .or(`agency_name.ilike.%${issuer_name}%,official_name.ilike.%${issuer_name}%`);

    if (agencyError) {
      console.error('Agency query error:', agencyError);
    }

    // Compile validation results
    const results = {
      is_valid: false,
      validation_type: 'unknown',
      entity_details: null,
      confidence_score: 0,
      validation_checks: {
        business_directory_match: false,
        government_agency_match: false,
        registration_verified: false,
        active_status: false
      },
      recommendations: [],
      warnings: []
    };

    // Check business directory matches
    if (businesses && businesses.length > 0) {
      const bestMatch = businesses[0];
      
      results.is_valid = true;
      results.validation_type = 'business';
      results.entity_details = bestMatch;
      results.validation_checks.business_directory_match = true;
      results.validation_checks.active_status = bestMatch.status === 'active';
      
      if (issuer_registration && bestMatch.registration_number === issuer_registration) {
        results.validation_checks.registration_verified = true;
        results.confidence_score = 95;
      } else {
        results.confidence_score = 75;
        results.warnings.push('Registration number could not be verified');
      }

      if (bestMatch.status !== 'active') {
        results.warnings.push('Business is not listed as active in the directory');
      }
    }

    // Check government agency matches
    if (agencies && agencies.length > 0) {
      const bestMatch = agencies[0];
      
      results.is_valid = true;
      results.validation_type = 'government_agency';
      results.entity_details = bestMatch;
      results.validation_checks.government_agency_match = true;
      results.validation_checks.active_status = bestMatch.status === 'active';
      results.confidence_score = 90;

      if (bestMatch.status !== 'active') {
        results.warnings.push('Government agency status requires verification');
      }
    }

    // Generate recommendations
    if (!results.is_valid) {
      results.recommendations.push('Verify issuer credentials through official channels');
      results.recommendations.push('Check government procurement portals for issuer validation');
      results.warnings.push('Issuer not found in verified directories');
    } else if (results.confidence_score < 80) {
      results.recommendations.push('Additional verification recommended');
      results.recommendations.push('Contact issuer directly to confirm authenticity');
    }

    // Log validation attempt
    if (tender_id) {
      await supabase
        .from('tender_validation_logs')
        .insert({
          tender_id,
          issuer_name,
          validation_type: results.validation_type,
          is_valid: results.is_valid,
          confidence_score: results.confidence_score,
          validation_details: results,
          created_at: new Date().toISOString()
        });
    }

    return new Response(
      JSON.stringify(results),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        is_valid: false,
        validation_type: 'error',
        confidence_score: 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});