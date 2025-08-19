-- Fix missing RLS policies for critical tables (corrected)

-- API Integrations - Admin only access
DROP POLICY IF EXISTS "Admin access for api_integrations" ON api_integrations;
CREATE POLICY "Admin access for api_integrations" 
ON api_integrations FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Company Metrics - Admins only (removed incorrect reference)
DROP POLICY IF EXISTS "Company metrics access" ON company_metrics;
CREATE POLICY "Company metrics access" 
ON company_metrics FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Insurance Claims - Users can manage their own claims
DROP POLICY IF EXISTS "Users manage own insurance claims" ON insurance_claims;
CREATE POLICY "Users manage own insurance claims" 
ON insurance_claims FOR ALL
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage all insurance claims" ON insurance_claims;
CREATE POLICY "Admins manage all insurance claims" 
ON insurance_claims FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Insurance Policies - Users can view their own policies
DROP POLICY IF EXISTS "Users view own insurance policies" ON insurance_policies;
CREATE POLICY "Users view own insurance policies" 
ON insurance_policies FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage all insurance policies" ON insurance_policies;
CREATE POLICY "Admins manage all insurance policies" 
ON insurance_policies FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create security audit log table for monitoring
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID,
  event_details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on security audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view security audit logs
DROP POLICY IF EXISTS "Admins can view security audit logs" ON public.security_audit_log;
CREATE POLICY "Admins can view security audit logs" 
ON public.security_audit_log FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create secure audit logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_user_id UUID DEFAULT auth.uid(),
  p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.security_audit_log (
    event_type, user_id, event_details, created_at
  ) VALUES (
    p_event_type, p_user_id, p_details, now()
  );
END;
$function$;