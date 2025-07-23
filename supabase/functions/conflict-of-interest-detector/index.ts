import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConflictDetectionResult {
  has_conflict: boolean;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  conflicts_found: ConflictDetail[];
  recommendations: string[];
  requires_disclosure: boolean;
  auto_disqualify: boolean;
}

interface ConflictDetail {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: any;
  requires_action: boolean;
}

interface EntityRelationship {
  entity_id: string;
  entity_type: 'user' | 'company' | 'organization';
  relationship_type: string;
  start_date: string;
  end_date?: string;
  confidence_score: number;
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

    const { bidder_id, tender_id, tender_issuer_id } = await req.json()

    if (!bidder_id || !tender_id) {
      return new Response(JSON.stringify({
        error: 'Missing required parameters: bidder_id and tender_id'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    console.log(`Checking conflicts of interest for bidder ${bidder_id} on tender ${tender_id}`)

    // Fetch tender details
    const { data: tender, error: tenderError } = await supabase
      .from('tenders')
      .select('id, title, category, created_at')
      .eq('id', tender_id)
      .single()

    if (tenderError) {
      throw new Error(`Error fetching tender: ${tenderError.message}`)
    }

    // Fetch bidder profile
    const { data: bidderProfile, error: bidderError } = await supabase
      .from('profiles')
      .select('id, user_id, username, display_name, created_at')
      .eq('user_id', bidder_id)
      .single()

    if (bidderError) {
      throw new Error(`Error fetching bidder profile: ${bidderError.message}`)
    }

    const conflictResult: ConflictDetectionResult = {
      has_conflict: false,
      risk_level: 'low',
      conflicts_found: [],
      recommendations: [],
      requires_disclosure: false,
      auto_disqualify: false
    }

    // Mock relationship data (in real app, this would come from relationship tables)
    const mockRelationships: EntityRelationship[] = [
      // Family relationships
      {
        entity_id: tender_issuer_id || 'mock_issuer',
        entity_type: 'user',
        relationship_type: 'family_member',
        start_date: '2020-01-01',
        confidence_score: Math.random() > 0.9 ? 0.95 : 0
      },
      // Business partnerships
      {
        entity_id: tender_issuer_id || 'mock_issuer',
        entity_type: 'company',
        relationship_type: 'business_partner',
        start_date: '2021-06-01',
        confidence_score: Math.random() > 0.8 ? 0.87 : 0
      },
      // Employment history
      {
        entity_id: tender_issuer_id || 'mock_issuer',
        entity_type: 'organization',
        relationship_type: 'former_employee',
        start_date: '2018-01-01',
        end_date: '2020-12-31',
        confidence_score: Math.random() > 0.7 ? 0.78 : 0
      }
    ]

    // Check 1: Direct family relationships
    const familyRelationships = mockRelationships.filter(rel => 
      rel.relationship_type === 'family_member' && rel.confidence_score > 0.8
    )

    if (familyRelationships.length > 0) {
      conflictResult.conflicts_found.push({
        type: 'family_relationship',
        severity: 'critical',
        description: 'Direct family relationship detected with tender issuer',
        evidence: familyRelationships,
        requires_action: true
      })
      conflictResult.has_conflict = true
      conflictResult.risk_level = 'critical'
      conflictResult.auto_disqualify = true
    }

    // Check 2: Business partnerships
    const businessRelationships = mockRelationships.filter(rel => 
      rel.relationship_type === 'business_partner' && rel.confidence_score > 0.8
    )

    if (businessRelationships.length > 0) {
      conflictResult.conflicts_found.push({
        type: 'business_partnership',
        severity: 'high',
        description: 'Active business partnership with tender issuer or related entity',
        evidence: businessRelationships,
        requires_action: true
      })
      conflictResult.has_conflict = true
      conflictResult.risk_level = 'high'
      conflictResult.requires_disclosure = true
    }

    // Check 3: Recent employment history
    const recentEmployment = mockRelationships.filter(rel => {
      if (rel.relationship_type !== 'former_employee' || rel.confidence_score <= 0.7) return false
      
      const endDate = rel.end_date ? new Date(rel.end_date) : new Date()
      const monthsAgo = (Date.now() - endDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      return monthsAgo < 24 // Within last 2 years
    })

    if (recentEmployment.length > 0) {
      conflictResult.conflicts_found.push({
        type: 'recent_employment',
        severity: 'medium',
        description: 'Recent employment relationship with tender issuer',
        evidence: recentEmployment,
        requires_action: false
      })
      conflictResult.has_conflict = true
      conflictResult.risk_level = conflictResult.risk_level === 'low' ? 'medium' : conflictResult.risk_level
      conflictResult.requires_disclosure = true
    }

    // Check 4: Competing bids from related entities
    const { data: relatedBids, error: bidsError } = await supabase
      .from('tender_bids')
      .select('id, bidder_id, submitted_at')
      .eq('tender_id', tender_id)
      .neq('bidder_id', bidder_id)

    if (!bidsError && relatedBids) {
      // Mock check for related bidders (in real app, would check actual relationships)
      const suspiciousPatterns = relatedBids.filter(() => Math.random() > 0.95) // 5% chance

      if (suspiciousPatterns.length > 0) {
        conflictResult.conflicts_found.push({
          type: 'coordinated_bidding',
          severity: 'high',
          description: 'Potential coordinated bidding with related entities detected',
          evidence: { suspicious_bid_count: suspiciousPatterns.length },
          requires_action: true
        })
        conflictResult.has_conflict = true
        conflictResult.risk_level = 'high'
        conflictResult.requires_disclosure = true
      }
    }

    // Check 5: Financial interests
    const hasFinancialInterest = Math.random() > 0.92 // 8% chance for demo
    if (hasFinancialInterest) {
      conflictResult.conflicts_found.push({
        type: 'financial_interest',
        severity: 'medium',
        description: 'Potential financial interest in tender outcome detected',
        evidence: { interest_type: 'shareholder', confidence: 0.72 },
        requires_action: false
      })
      conflictResult.has_conflict = true
      conflictResult.risk_level = conflictResult.risk_level === 'low' ? 'medium' : conflictResult.risk_level
      conflictResult.requires_disclosure = true
    }

    // Generate recommendations based on findings
    if (conflictResult.auto_disqualify) {
      conflictResult.recommendations.push('Automatic disqualification recommended due to critical conflicts')
    } else if (conflictResult.requires_disclosure) {
      conflictResult.recommendations.push('Require formal conflict of interest disclosure')
      conflictResult.recommendations.push('Additional review by procurement committee recommended')
    }

    if (conflictResult.risk_level === 'high' || conflictResult.risk_level === 'critical') {
      conflictResult.recommendations.push('Enhanced due diligence required')
      conflictResult.recommendations.push('Independent oversight recommended')
    }

    if (conflictResult.conflicts_found.length === 0) {
      conflictResult.recommendations.push('No conflicts detected - proceed with standard evaluation')
    }

    // Log the conflict check
    await supabase.from('conflict_detection_log').insert({
      tender_id,
      bidder_id,
      detection_result: conflictResult,
      checked_at: new Date().toISOString(),
      checked_by: 'automated_system'
    })

    console.log(`Conflict detection completed for bidder ${bidder_id}:`, conflictResult)

    // If critical conflicts found, also log as alert
    if (conflictResult.auto_disqualify) {
      await supabase.from('tender_alerts').insert({
        tender_id,
        alert_type: 'conflict_of_interest',
        severity: 'critical',
        title: 'Critical Conflict of Interest Detected',
        description: `Bidder ${bidder_id} has critical conflicts that require automatic disqualification`,
        metadata: {
          bidder_id,
          conflicts: conflictResult.conflicts_found.filter(c => c.severity === 'critical')
        }
      })
    }

    return new Response(JSON.stringify({
      success: true,
      bidder_id,
      tender_id,
      conflict_detection_result: conflictResult,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in conflict of interest detector:', error)
    
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