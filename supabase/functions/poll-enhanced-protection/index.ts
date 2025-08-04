import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, pollId, data } = await req.json();

    switch (action) {
      case 'verify_vote':
        return await verifyVote(supabase, pollId, data);
      
      case 'fraud_check':
        return await performFraudCheck(supabase, pollId, data);
        
      case 'rate_limit_check':
        return await checkRateLimit(supabase, pollId, data);
        
      case 'captcha_verify':
        return await verifyCaptcha(supabase, pollId, data);
        
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Enhanced protection error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function verifyVote(supabase: any, pollId: string, data: any) {
  const { sessionId, userAgent, deviceFingerprint, captchaToken } = data;
  
  // Get client IP from headers (in production deployment)
  const clientIP = '127.0.0.1'; // Placeholder - would be extracted from headers
  const hashedIP = await hashString(clientIP);
  
  console.log('Verifying vote for poll:', pollId);
  
  // 1. Check rate limits
  const rateLimitOk = await checkUserRateLimit(supabase, {
    sessionId,
    pollId,
    hashedIP,
    action: 'vote'
  });
  
  if (!rateLimitOk) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Rate limit exceeded',
        requireCaptcha: true
      }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // 2. Perform fraud detection
  const riskScore = await detectFraud(supabase, {
    userAgent,
    deviceFingerprint,
    hashedIP,
    pollId,
    sessionId
  });
  
  console.log('Risk score calculated:', riskScore);
  
  // 3. Determine if CAPTCHA is required
  let requireCaptcha = riskScore >= 50;
  let captchaValid = true;
  
  if (requireCaptcha && captchaToken) {
    captchaValid = await validateCaptcha(supabase, captchaToken, sessionId, pollId);
  }
  
  // 4. Block high-risk attempts
  if (riskScore >= 85) {
    // Log security event
    await supabase.from('security_audit_logs').insert([{
      action_type: 'vote_blocked',
      resource_type: 'poll',
      resource_id: pollId,
      details: {
        risk_score: riskScore,
        session_id: sessionId,
        reason: 'High risk score detected'
      },
      severity: 'high'
    }]);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Suspicious activity detected. Access temporarily blocked.',
        riskScore,
        blocked: true
      }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // 5. Require CAPTCHA for medium risk
  if (requireCaptcha && !captchaValid) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        requireCaptcha: true,
        riskScore
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // 6. Vote is allowed
  return new Response(
    JSON.stringify({ 
      success: true, 
      riskScore,
      message: 'Vote verification passed'
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function checkUserRateLimit(supabase: any, { sessionId, pollId, hashedIP, action }: any) {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier_type: 'session',
      p_identifier_value: sessionId,
      p_poll_id: pollId,
      p_action_type: action,
      p_limit_per_hour: action === 'vote' ? 10 : 100
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return true; // Allow by default if check fails
  }
}

async function detectFraud(supabase: any, { userAgent, deviceFingerprint, hashedIP, pollId, sessionId }: any) {
  try {
    const { data, error } = await supabase.rpc('detect_bot_behavior', {
      p_user_agent: userAgent,
      p_device_fingerprint: deviceFingerprint,
      p_hashed_ip: hashedIP,
      p_poll_id: pollId,
      p_session_id: sessionId
    });
    
    if (error) throw error;
    return data || 0;
  } catch (error) {
    console.error('Fraud detection error:', error);
    return 0; // Low risk by default if check fails
  }
}

async function validateCaptcha(supabase: any, captchaToken: string, sessionId: string, pollId: string) {
  try {
    const { data, error } = await supabase
      .from('poll_captcha_verifications')
      .select('*')
      .eq('captcha_token', captchaToken)
      .eq('session_id', sessionId)
      .eq('poll_id', pollId)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error || !data) {
      return false;
    }
    
    // Mark as used
    await supabase
      .from('poll_captcha_verifications')
      .update({ used: true })
      .eq('id', data.id);
    
    return true;
  } catch (error) {
    console.error('CAPTCHA validation error:', error);
    return false;
  }
}

async function performFraudCheck(supabase: any, pollId: string, data: any) {
  const riskScore = await detectFraud(supabase, { ...data, pollId });
  
  return new Response(
    JSON.stringify({ 
      riskScore,
      requireCaptcha: riskScore >= 50,
      blocked: riskScore >= 85
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function checkRateLimit(supabase: any, pollId: string, data: any) {
  const rateLimitOk = await checkUserRateLimit(supabase, { ...data, pollId });
  
  return new Response(
    JSON.stringify({ 
      allowed: rateLimitOk,
      message: rateLimitOk ? 'Rate limit OK' : 'Rate limit exceeded'
    }),
    { status: rateLimitOk ? 200 : 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function verifyCaptcha(supabase: any, pollId: string, data: any) {
  const { captchaToken, sessionId } = data;
  const isValid = await validateCaptcha(supabase, captchaToken, sessionId, pollId);
  
  return new Response(
    JSON.stringify({ 
      valid: isValid,
      message: isValid ? 'CAPTCHA verified' : 'CAPTCHA validation failed'
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}