import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerificationRequest {
  action: 'verify_politician' | 'verify_party_logo' | 'bulk_verify' | 'get_pending'
  entityId?: string
  imageUrl?: string
  sourceUrl?: string
  adminNotes?: string
}

interface FaceVerificationResult {
  confidence: number
  isMatch: boolean
  detectedFaces: number
  quality: 'high' | 'medium' | 'low'
  aiDetected?: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { action, entityId, imageUrl, sourceUrl, adminNotes }: VerificationRequest = await req.json()

    console.log(`Face verification action: ${action}`)

    switch (action) {
      case 'verify_politician':
        return await verifyPoliticianImage(supabase, entityId!, imageUrl, sourceUrl, adminNotes)
      
      case 'verify_party_logo':
        return await verifyPartyLogo(supabase, entityId!, imageUrl, sourceUrl, adminNotes)
      
      case 'bulk_verify':
        return await bulkVerifyImages(supabase)
      
      case 'get_pending':
        return await getPendingVerifications(supabase)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    console.error('Face verification error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function verifyPoliticianImage(
  supabase: any, 
  politicianId: string, 
  imageUrl?: string, 
  sourceUrl?: string, 
  adminNotes?: string
) {
  console.log(`Verifying politician image: ${politicianId}`)
  
  // Get politician data
  const { data: politician, error: politicianError } = await supabase
    .from('politicians')
    .select('*')
    .eq('id', politicianId)
    .single()

  if (politicianError || !politician) {
    return new Response(
      JSON.stringify({ error: 'Politician not found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    )
  }

  const targetImageUrl = imageUrl || politician.image_url || politician.photo_url

  if (!targetImageUrl) {
    // No image to verify - mark as missing
    await createVerificationRecord(supabase, 'politician', politicianId, null, 'missing', 0, 'no_image', null, sourceUrl, adminNotes)
    
    return new Response(
      JSON.stringify({ 
        status: 'missing',
        message: 'No image found for verification',
        politician: politician.name
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Perform face verification
  const verificationResult = await performFaceVerification(targetImageUrl, politician.name)
  
  // Create verification record
  const { data: verification } = await createVerificationRecord(
    supabase,
    'politician',
    politicianId,
    targetImageUrl,
    verificationResult.isMatch ? 'verified' : 'flagged',
    verificationResult.confidence,
    'face_matching',
    verificationResult,
    sourceUrl,
    adminNotes
  )

  // Update politician record
  await supabase
    .from('politicians')
    .update({
      image_verified: verificationResult.isMatch && verificationResult.confidence >= 85,
      image_confidence_score: verificationResult.confidence,
      image_last_verified: new Date().toISOString(),
      image_verification_id: verification?.id
    })
    .eq('id', politicianId)

  // Log the action
  await createVerificationLog(
    supabase,
    'politician',
    politicianId,
    'verification_run',
    null,
    verificationResult.isMatch ? 'verified' : 'flagged',
    verificationResult.confidence,
    null,
    adminNotes,
    verificationResult
  )

  return new Response(
    JSON.stringify({
      status: verificationResult.isMatch ? 'verified' : 'flagged',
      confidence: verificationResult.confidence,
      politician: politician.name,
      verification: verificationResult,
      verificationId: verification?.id
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function verifyPartyLogo(
  supabase: any, 
  partyId: string, 
  imageUrl?: string, 
  sourceUrl?: string, 
  adminNotes?: string
) {
  console.log(`Verifying party logo: ${partyId}`)
  
  // Get party data
  const { data: party, error: partyError } = await supabase
    .from('political_parties')
    .select('*')
    .eq('id', partyId)
    .single()

  if (partyError || !party) {
    return new Response(
      JSON.stringify({ error: 'Party not found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    )
  }

  const targetImageUrl = imageUrl || party.logo_url

  if (!targetImageUrl) {
    await createLogoVerificationRecord(supabase, partyId, null, 'missing', 0, null, sourceUrl, adminNotes)
    
    return new Response(
      JSON.stringify({ 
        status: 'missing',
        message: 'No logo found for verification',
        party: party.name
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Perform logo verification (simplified - check if image is accessible and reasonable quality)
  const logoResult = await performLogoVerification(targetImageUrl, party.name)
  
  // Create verification record
  await createLogoVerificationRecord(
    supabase,
    partyId,
    targetImageUrl,
    logoResult.isValid ? 'verified' : 'flagged',
    logoResult.confidence,
    logoResult,
    sourceUrl,
    adminNotes
  )

  // Update party record
  await supabase
    .from('political_parties')
    .update({
      logo_verified: logoResult.isValid && logoResult.confidence >= 70,
      logo_confidence_score: logoResult.confidence,
      logo_last_verified: new Date().toISOString()
    })
    .eq('id', partyId)

  return new Response(
    JSON.stringify({
      status: logoResult.isValid ? 'verified' : 'flagged',
      confidence: logoResult.confidence,
      party: party.name,
      verification: logoResult
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function bulkVerifyImages(supabase: any) {
  console.log('Starting bulk verification process')
  
  // Get all politicians without verification
  const { data: politicians } = await supabase
    .from('politicians')
    .select('id, name, image_url, photo_url, image_verified')
    .or('image_verified.is.null,image_verified.eq.false')
    .limit(50) // Process in batches

  const results = []

  for (const politician of politicians || []) {
    try {
      const imageUrl = politician.image_url || politician.photo_url
      if (imageUrl) {
        const verificationResult = await performFaceVerification(imageUrl, politician.name)
        
        await createVerificationRecord(
          supabase,
          'politician',
          politician.id,
          imageUrl,
          verificationResult.isMatch ? 'verified' : 'flagged',
          verificationResult.confidence,
          'bulk_verification',
          verificationResult,
          null,
          'Bulk verification process'
        )

        await supabase
          .from('politicians')
          .update({
            image_verified: verificationResult.isMatch && verificationResult.confidence >= 85,
            image_confidence_score: verificationResult.confidence,
            image_last_verified: new Date().toISOString()
          })
          .eq('id', politician.id)

        results.push({
          id: politician.id,
          name: politician.name,
          status: verificationResult.isMatch ? 'verified' : 'flagged',
          confidence: verificationResult.confidence
        })
      } else {
        results.push({
          id: politician.id,
          name: politician.name,
          status: 'missing',
          confidence: 0
        })
      }
    } catch (error) {
      console.error(`Error verifying ${politician.name}:`, error)
      results.push({
        id: politician.id,
        name: politician.name,
        status: 'error',
        error: error.message
      })
    }
  }

  return new Response(
    JSON.stringify({
      processed: results.length,
      results
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getPendingVerifications(supabase: any) {
  // Get pending politician verifications
  const { data: politicianVerifications } = await supabase
    .from('politician_image_verifications')
    .select(`
      *,
      politicians(name, position, region)
    `)
    .in('verification_status', ['pending', 'flagged'])
    .eq('admin_reviewed', false)
    .order('created_at', { ascending: false })

  // Get pending party logo verifications
  const { data: logoVerifications } = await supabase
    .from('party_logo_verifications')
    .select(`
      *,
      political_parties(name, description)
    `)
    .in('verification_status', ['pending', 'flagged'])
    .eq('admin_reviewed', false)
    .order('created_at', { ascending: false })

  return new Response(
    JSON.stringify({
      politicians: politicianVerifications || [],
      logos: logoVerifications || []
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function performFaceVerification(imageUrl: string, personName: string): Promise<FaceVerificationResult> {
  try {
    // Basic image validation
    const response = await fetch(imageUrl)
    if (!response.ok) {
      return {
        confidence: 0,
        isMatch: false,
        detectedFaces: 0,
        quality: 'low',
        aiDetected: false
      }
    }

    const contentType = response.headers.get('content-type')
    if (!contentType?.startsWith('image/')) {
      return {
        confidence: 0,
        isMatch: false,
        detectedFaces: 0,
        quality: 'low',
        aiDetected: false
      }
    }

    // Simulate face detection (in production, use AWS Rekognition or similar)
    const imageSize = parseInt(response.headers.get('content-length') || '0')
    
    // Simple heuristics for verification
    let confidence = 50 // Base confidence
    let quality: 'high' | 'medium' | 'low' = 'medium'
    
    // Image size check
    if (imageSize > 100000) { // > 100KB
      confidence += 20
      quality = 'high'
    } else if (imageSize < 10000) { // < 10KB
      confidence -= 30
      quality = 'low'
    }

    // URL-based checks for government sources
    if (imageUrl.includes('gov.cm') || 
        imageUrl.includes('senat.cm') || 
        imageUrl.includes('assemblee-nationale.cm') ||
        imageUrl.includes('prc.cm')) {
      confidence += 30
    }

    // Check for common profile image indicators
    if (imageUrl.includes('profile') || 
        imageUrl.includes('official') || 
        imageUrl.includes('portrait')) {
      confidence += 15
    }

    // Simulate face detection
    const detectedFaces = Math.random() > 0.2 ? 1 : 0
    if (detectedFaces === 0) {
      confidence -= 40
    }

    // AI detection simulation
    const aiDetected = imageUrl.includes('ai') || imageUrl.includes('generated') || Math.random() > 0.95

    if (aiDetected) {
      confidence -= 50
    }

    confidence = Math.max(0, Math.min(100, confidence))

    return {
      confidence,
      isMatch: confidence >= 70,
      detectedFaces,
      quality,
      aiDetected
    }
  } catch (error) {
    console.error('Face verification error:', error)
    return {
      confidence: 0,
      isMatch: false,
      detectedFaces: 0,
      quality: 'low',
      aiDetected: false
    }
  }
}

async function performLogoVerification(imageUrl: string, partyName: string) {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      return { isValid: false, confidence: 0 }
    }

    const contentType = response.headers.get('content-type')
    if (!contentType?.startsWith('image/')) {
      return { isValid: false, confidence: 0 }
    }

    const imageSize = parseInt(response.headers.get('content-length') || '0')
    let confidence = 60

    if (imageSize > 50000) confidence += 20
    if (imageSize < 5000) confidence -= 30

    // Check for vector formats (better for logos)
    if (contentType.includes('svg')) confidence += 25

    return {
      isValid: confidence >= 50,
      confidence: Math.max(0, Math.min(100, confidence))
    }
  } catch (error) {
    return { isValid: false, confidence: 0 }
  }
}

async function createVerificationRecord(
  supabase: any,
  entityType: string,
  entityId: string,
  imageUrl: string | null,
  status: string,
  confidence: number,
  method: string,
  metadata: any,
  sourceUrl?: string | null,
  adminNotes?: string | null
) {
  const { data, error } = await supabase
    .from('politician_image_verifications')
    .insert({
      politician_id: entityId,
      image_url: imageUrl,
      verification_status: status,
      confidence_score: confidence,
      verification_method: method,
      source_url: sourceUrl,
      admin_notes: adminNotes
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating verification record:', error)
  }

  return { data, error }
}

async function createLogoVerificationRecord(
  supabase: any,
  partyId: string,
  logoUrl: string | null,
  status: string,
  confidence: number,
  metadata: any,
  sourceUrl?: string | null,
  adminNotes?: string | null
) {
  const { data, error } = await supabase
    .from('party_logo_verifications')
    .insert({
      party_id: partyId,
      logo_url: logoUrl,
      verification_status: status,
      confidence_score: confidence,
      source_url: sourceUrl,
      admin_notes: adminNotes
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating logo verification record:', error)
  }

  return { data, error }
}

async function createVerificationLog(
  supabase: any,
  entityType: string,
  entityId: string,
  actionType: string,
  oldStatus: string | null,
  newStatus: string,
  confidenceChange: number,
  performedBy: string | null,
  adminNotes: string | null,
  metadata: any
) {
  await supabase
    .from('image_verification_logs')
    .insert({
      entity_type: entityType,
      entity_id: entityId,
      action_type: actionType,
      old_status: oldStatus,
      new_status: newStatus,
      confidence_change: confidenceChange,
      performed_by: performedBy,
      admin_notes: adminNotes,
      metadata: metadata
    })
}