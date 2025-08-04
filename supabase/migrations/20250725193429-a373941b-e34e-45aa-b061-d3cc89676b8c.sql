-- Phase 1: Critical Database Security Fixes (Fixed Syntax)

-- Fix remaining function search path vulnerabilities
CREATE OR REPLACE FUNCTION public.generate_qr_data()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  qr_data TEXT;
BEGIN
  -- Generate secure QR code data
  qr_data := 'TICKET:' || encode(gen_random_bytes(32), 'hex');
  RETURN qr_data;
END;
$function$;

-- Add RLS to unprotected tables
ALTER TABLE public.ashen_deduplication_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage deduplication analysis"
ON public.ashen_deduplication_analysis
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Fix critical data exposure in poll security
CREATE OR REPLACE FUNCTION public.validate_poll_vote_security(
  p_poll_id uuid,
  p_user_id uuid DEFAULT NULL,
  p_captcha_token text DEFAULT NULL,
  p_device_fingerprint text DEFAULT NULL,
  p_ip_hash text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  vote_allowed boolean := false;
  reason text := 'Unknown error';
  risk_score integer := 0;
  rate_limit_ok boolean;
BEGIN
  -- Check rate limiting first
  SELECT public.check_rate_limit_secure(
    'ip_address', 
    COALESCE(p_ip_hash, 'anonymous'), 
    'poll_vote', 
    10
  ) INTO rate_limit_ok;
  
  IF NOT rate_limit_ok THEN
    RETURN jsonb_build_object(
      'canVote', false,
      'reason', 'Rate limit exceeded',
      'riskScore', 100
    );
  END IF;
  
  -- Detect bot behavior
  SELECT public.detect_bot_behavior(
    '', -- user_agent handled separately
    p_device_fingerprint,
    p_ip_hash,
    p_poll_id,
    ''  -- session_id handled separately
  ) INTO risk_score;
  
  -- Check if vote is allowed based on risk score
  IF risk_score >= 80 THEN
    vote_allowed := false;
    reason := 'High risk bot behavior detected';
  ELSIF risk_score >= 50 AND p_captcha_token IS NULL THEN
    vote_allowed := false;
    reason := 'CAPTCHA verification required';
  ELSE
    vote_allowed := true;
    reason := 'Vote allowed';
  END IF;
  
  -- Log security event
  PERFORM public.log_security_event(
    'poll_vote_validation',
    'poll',
    p_poll_id,
    jsonb_build_object(
      'risk_score', risk_score,
      'vote_allowed', vote_allowed,
      'has_captcha', p_captcha_token IS NOT NULL
    ),
    CASE WHEN risk_score >= 80 THEN 'high' ELSE 'medium' END
  );
  
  RETURN jsonb_build_object(
    'canVote', vote_allowed,
    'reason', reason,
    'riskScore', risk_score,
    'requiresCaptcha', risk_score >= 50 AND p_captcha_token IS NULL
  );
END;
$function$;

-- Create secure API key management
CREATE TABLE IF NOT EXISTS public.secure_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  key_name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  permissions jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamp with time zone,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.secure_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own API keys"
ON public.secure_api_keys
FOR ALL
USING (auth.uid() = user_id);

-- Enhanced security audit logging
CREATE TABLE IF NOT EXISTS public.enhanced_security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  ip_address inet,
  user_agent text,
  event_type text NOT NULL,
  event_category text NOT NULL DEFAULT 'general',
  severity text NOT NULL DEFAULT 'info',
  resource_type text,
  resource_id uuid,
  event_data jsonb NOT NULL DEFAULT '{}',
  threat_indicators jsonb DEFAULT '{}',
  geolocation jsonb DEFAULT '{}',
  device_info jsonb DEFAULT '{}',
  timestamp timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes separately
CREATE INDEX IF NOT EXISTS enhanced_security_logs_user_timestamp_idx ON public.enhanced_security_logs (user_id, timestamp);
CREATE INDEX IF NOT EXISTS enhanced_security_logs_event_timestamp_idx ON public.enhanced_security_logs (event_type, timestamp);
CREATE INDEX IF NOT EXISTS enhanced_security_logs_severity_timestamp_idx ON public.enhanced_security_logs (severity, timestamp);
CREATE INDEX IF NOT EXISTS enhanced_security_logs_ip_timestamp_idx ON public.enhanced_security_logs (ip_address, timestamp);

ALTER TABLE public.enhanced_security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all security logs"
ON public.enhanced_security_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Users can view their own security logs"
ON public.enhanced_security_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert security logs"
ON public.enhanced_security_logs
FOR INSERT
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_secure_api_keys_updated_at
  BEFORE UPDATE ON public.secure_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate secure API keys
CREATE OR REPLACE FUNCTION public.generate_secure_api_key(
  p_user_id uuid,
  p_key_name text,
  p_permissions jsonb DEFAULT '{}',
  p_expires_at timestamp with time zone DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  api_key text;
  key_hash text;
  key_prefix text;
  new_key_id uuid;
BEGIN
  -- Generate secure API key
  api_key := 'sk_' || encode(gen_random_bytes(32), 'hex');
  key_prefix := left(api_key, 10) || '...';
  
  -- Hash the key for storage
  key_hash := encode(digest(api_key, 'sha256'), 'hex');
  
  -- Insert the key record
  INSERT INTO public.secure_api_keys (
    user_id, key_name, key_hash, key_prefix, permissions, expires_at
  ) VALUES (
    p_user_id, p_key_name, key_hash, key_prefix, p_permissions, p_expires_at
  ) RETURNING id INTO new_key_id;
  
  -- Log the key creation
  PERFORM public.log_security_event(
    'api_key_generated',
    'api_key',
    new_key_id,
    jsonb_build_object(
      'key_name', p_key_name,
      'permissions', p_permissions
    ),
    'medium'
  );
  
  RETURN jsonb_build_object(
    'id', new_key_id,
    'key', api_key,
    'prefix', key_prefix
  );
END;
$function$;