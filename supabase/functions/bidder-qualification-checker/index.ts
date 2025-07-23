import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QualificationResult {
  qualified: boolean;
  score: number;
  checks: {
    [key: string]: {
      passed: boolean;
      score: number;
      details?: string;
    };
  };
  disqualifying_factors: string[];
  recommendations: string[];
}

interface BidderProfile {
  id: string;
  company_name: string;
  registration_number: string;
  years_in_business: number;
  completed_projects: number;
  average_rating: number;
  financial_standing: string;
  certifications: string[];
  banned_until?: string;
  blacklisted: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { bidder_id, tender_id, bid_data } = await req.json()

    if (!bidder_id || !tender_id) {
      return new Response(JSON.stringify({
        error: 'Missing required parameters: bidder_id and tender_id'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    console.log(`Checking qualifications for bidder ${bidder_id} on tender ${tender_id}`)

    // Fetch tender requirements
    const { data: tender, error: tenderError } = await supabase
      .from('tenders')
      .select('id, title, category, budget_min, budget_max, requirements, minimum_qualifications')
      .eq('id', tender_id)
      .single()

    if (tenderError) {
      throw new Error(`Error fetching tender: ${tenderError.message}`)
    }

    // Fetch bidder profile (mock data structure)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, display_name, created_at')
      .eq('user_id', bidder_id)
      .single()

    if (profileError) {
      throw new Error(`Error fetching bidder profile: ${profileError.message}`)
    }

    // Mock bidder qualifications (in real app, this would come from bidder_profiles table)
    const bidderProfile: BidderProfile = {
      id: bidder_id,
      company_name: profile.display_name || 'Unknown Company',
      registration_number: `REG-${bidder_id.slice(0, 8)}`,
      years_in_business: Math.floor(Math.random() * 20) + 1,
      completed_projects: Math.floor(Math.random() * 50) + 1,
      average_rating: Math.random() * 2 + 3, // 3.0 to 5.0
      financial_standing: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)],
      certifications: ['ISO_9001', 'ISO_14001', 'OHSAS_18001'].filter(() => Math.random() > 0.5),
      banned_until: null,
      blacklisted: false
    }

    const qualificationResult: QualificationResult = {
      qualified: true,
      score: 0,
      checks: {},
      disqualifying_factors: [],
      recommendations: []
    }

    // Check 1: Blacklist status
    qualificationResult.checks.blacklist_check = {
      passed: !bidderProfile.blacklisted,
      score: bidderProfile.blacklisted ? 0 : 20,
      details: bidderProfile.blacklisted ? 'Company is blacklisted' : 'No blacklist issues'
    }

    if (bidderProfile.blacklisted) {
      qualificationResult.disqualifying_factors.push('Company is on the blacklist')
      qualificationResult.qualified = false
    }

    // Check 2: Ban status
    const isBanned = bidderProfile.banned_until && new Date(bidderProfile.banned_until) > new Date()
    qualificationResult.checks.ban_status = {
      passed: !isBanned,
      score: isBanned ? 0 : 15,
      details: isBanned ? `Banned until ${bidderProfile.banned_until}` : 'No active bans'
    }

    if (isBanned) {
      qualificationResult.disqualifying_factors.push('Company is currently banned')
      qualificationResult.qualified = false
    }

    // Check 3: Business experience
    const experienceScore = Math.min(bidderProfile.years_in_business * 2, 20)
    qualificationResult.checks.business_experience = {
      passed: bidderProfile.years_in_business >= 2,
      score: experienceScore,
      details: `${bidderProfile.years_in_business} years in business`
    }

    if (bidderProfile.years_in_business < 2) {
      qualificationResult.disqualifying_factors.push('Insufficient business experience (minimum 2 years required)')
      qualificationResult.qualified = false
    }

    // Check 4: Project history
    const projectScore = Math.min(bidderProfile.completed_projects, 15)
    qualificationResult.checks.project_history = {
      passed: bidderProfile.completed_projects >= 5,
      score: projectScore,
      details: `${bidderProfile.completed_projects} completed projects`
    }

    if (bidderProfile.completed_projects < 5) {
      qualificationResult.recommendations.push('Consider gaining more project experience')
    }

    // Check 5: Financial standing
    const financialScores = { excellent: 20, good: 15, fair: 10, poor: 0 }
    const financialScore = financialScores[bidderProfile.financial_standing as keyof typeof financialScores] || 0
    qualificationResult.checks.financial_standing = {
      passed: financialScore >= 10,
      score: financialScore,
      details: `Financial standing: ${bidderProfile.financial_standing}`
    }

    if (financialScore < 10) {
      qualificationResult.disqualifying_factors.push('Poor financial standing')
      qualificationResult.qualified = false
    }

    // Check 6: Rating threshold
    const ratingScore = bidderProfile.average_rating * 4 // Max 20 points
    qualificationResult.checks.rating_check = {
      passed: bidderProfile.average_rating >= 3.0,
      score: ratingScore,
      details: `Average rating: ${bidderProfile.average_rating.toFixed(2)}/5.0`
    }

    if (bidderProfile.average_rating < 3.0) {
      qualificationResult.disqualifying_factors.push('Average rating below minimum threshold (3.0)')
      qualificationResult.qualified = false
    }

    // Check 7: Required certifications (if any)
    const requiredCerts = tender.minimum_qualifications?.required_certifications || []
    const hasCertifications = requiredCerts.length === 0 || requiredCerts.some((cert: string) => 
      bidderProfile.certifications.includes(cert)
    )
    
    qualificationResult.checks.certifications = {
      passed: hasCertifications,
      score: hasCertifications ? 10 : 0,
      details: `Required: ${requiredCerts.join(', ')} | Has: ${bidderProfile.certifications.join(', ')}`
    }

    if (!hasCertifications && requiredCerts.length > 0) {
      qualificationResult.disqualifying_factors.push(`Missing required certifications: ${requiredCerts.join(', ')}`)
      qualificationResult.qualified = false
    }

    // Calculate total score
    qualificationResult.score = Object.values(qualificationResult.checks)
      .reduce((total, check) => total + check.score, 0)

    // Final qualification decision
    if (qualificationResult.score < 70 && qualificationResult.qualified) {
      qualificationResult.qualified = false
      qualificationResult.disqualifying_factors.push('Total qualification score below threshold (70)')
    }

    // Log the qualification check
    await supabase.from('bid_qualification_log').insert({
      tender_id,
      bidder_id,
      qualification_result: qualificationResult,
      checked_at: new Date().toISOString(),
      checked_by: 'automated_system'
    })

    console.log(`Qualification check completed for bidder ${bidder_id}:`, qualificationResult)

    return new Response(JSON.stringify({
      success: true,
      bidder_id,
      tender_id,
      qualification_result: qualificationResult,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in bidder qualification checker:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})