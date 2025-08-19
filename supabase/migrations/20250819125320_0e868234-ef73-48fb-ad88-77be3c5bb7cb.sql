-- Comprehensive security fixes migration with proper policy handling

-- 1. Create security definer function for role checking (avoid recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role::text FROM public.user_roles WHERE user_id = p_user_id ORDER BY created_at DESC LIMIT 1;
$$;

-- 2. Add missing RLS policies for critical tables (with conflict handling)

-- Fix hospitals table policies
DROP POLICY IF EXISTS "Hospital staff can update their hospital" ON public.hospitals;
CREATE POLICY "Hospital staff can update their hospital" ON public.hospitals
FOR UPDATE USING (
  claimed_by = auth.uid() OR 
  submitted_by = auth.uid() OR
  get_user_role(auth.uid()) = 'admin'
);

-- Add missing policies for nokash_transactions
CREATE POLICY "Users can view their own transactions" ON public.nokash_transactions
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all transactions" ON public.nokash_transactions
FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Add missing policies for shipping_companies
CREATE POLICY "Shipping companies are publicly viewable" ON public.shipping_companies
FOR SELECT USING (true);

CREATE POLICY "Admins can manage shipping companies" ON public.shipping_companies
FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Add missing policies for shipments
CREATE POLICY "Users can view shipments they're involved with" ON public.shipments
FOR SELECT USING (
  sender_id = auth.uid() OR 
  recipient_id = auth.uid() OR
  get_user_role(auth.uid()) = 'admin'
);

CREATE POLICY "Users can create shipments" ON public.shipments
FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Add missing policies for traditional_leaders
CREATE POLICY "Traditional leaders are publicly viewable" ON public.traditional_leaders
FOR SELECT USING (true);

CREATE POLICY "Admins can manage traditional leaders" ON public.traditional_leaders
FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Add missing policies for artist_memberships
CREATE POLICY "Artist memberships are publicly viewable" ON public.artist_memberships
FOR SELECT USING (true);

CREATE POLICY "Users can apply for artist membership" ON public.artist_memberships
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own membership" ON public.artist_memberships
FOR UPDATE USING (user_id = auth.uid());

-- Add missing policies for music_releases
CREATE POLICY "Music releases are publicly viewable" ON public.music_releases
FOR SELECT USING (true);

CREATE POLICY "Artists can manage their releases" ON public.music_releases
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM artist_memberships am 
    WHERE am.id = music_releases.artist_id 
    AND am.user_id = auth.uid()
  ) OR get_user_role(auth.uid()) = 'admin'
);

-- Add missing policies for music_tracks
CREATE POLICY "Music tracks are publicly viewable" ON public.music_tracks
FOR SELECT USING (true);

CREATE POLICY "Artists can manage their tracks" ON public.music_tracks
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM music_releases mr
    JOIN artist_memberships am ON mr.artist_id = am.id
    WHERE mr.id = music_tracks.release_id 
    AND am.user_id = auth.uid()
  ) OR get_user_role(auth.uid()) = 'admin'
);

-- 3. Create comprehensive input validation function
CREATE OR REPLACE FUNCTION public.validate_and_sanitize_input(
  p_input TEXT,
  p_max_length INTEGER DEFAULT 1000,
  p_allow_html BOOLEAN DEFAULT false
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sanitized_input TEXT;
BEGIN
  -- Return null for null input
  IF p_input IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Check length
  IF LENGTH(p_input) > p_max_length THEN
    RAISE EXCEPTION 'Input too long. Maximum % characters allowed.', p_max_length;
  END IF;
  
  -- Basic sanitization
  sanitized_input := TRIM(p_input);
  
  -- Remove dangerous patterns if HTML not allowed
  IF NOT p_allow_html THEN
    -- Remove script tags and dangerous patterns
    sanitized_input := regexp_replace(sanitized_input, '<script[^>]*>.*?</script>', '', 'gi');
    sanitized_input := regexp_replace(sanitized_input, 'javascript:', '', 'gi');
    sanitized_input := regexp_replace(sanitized_input, 'on\w+\s*=', '', 'gi');
  END IF;
  
  RETURN sanitized_input;
END;
$$;

-- 4. Create rate limiting table if not exists
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action_type TEXT NOT NULL,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS on rate_limit_log
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view rate limit logs" ON public.rate_limit_log
FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

-- 5. Enhanced rate limiting function
CREATE OR REPLACE FUNCTION public.check_advanced_rate_limit(
  p_user_id UUID,
  p_action TEXT,
  p_limit INTEGER,
  p_window_minutes INTEGER DEFAULT 60,
  p_ip_address INET DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  action_count INTEGER;
  ip_count INTEGER;
BEGIN
  -- Check user-based rate limit
  SELECT COUNT(*) INTO action_count
  FROM rate_limit_log
  WHERE user_id = p_user_id
    AND action_type = p_action
    AND created_at > now() - (p_window_minutes || ' minutes')::interval;
  
  -- Check IP-based rate limit if IP provided
  IF p_ip_address IS NOT NULL THEN
    SELECT COUNT(*) INTO ip_count
    FROM rate_limit_log
    WHERE ip_address = p_ip_address
      AND action_type = p_action
      AND created_at > now() - (p_window_minutes || ' minutes')::interval;
    
    -- Block if either limit exceeded
    IF action_count >= p_limit OR ip_count >= (p_limit * 2) THEN
      RETURN false;
    END IF;
  ELSE
    IF action_count >= p_limit THEN
      RETURN false;
    END IF;
  END IF;
  
  -- Log the action
  INSERT INTO rate_limit_log (user_id, action_type, ip_address)
  VALUES (p_user_id, p_action, p_ip_address);
  
  RETURN true;
END;
$$;

-- 6. Create security audit function
CREATE OR REPLACE FUNCTION public.audit_security_event(
  p_event_type TEXT,
  p_description TEXT,
  p_severity TEXT DEFAULT 'info',
  p_user_id UUID DEFAULT auth.uid(),
  p_metadata JSONB DEFAULT '{}'
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profile_activity_log (
    user_id,
    activity_type,
    activity_title,
    activity_description,
    metadata,
    is_public
  ) VALUES (
    p_user_id,
    'security_audit',
    p_event_type || ' (' || p_severity || ')',
    p_description,
    p_metadata || jsonb_build_object('severity', p_severity, 'timestamp', now()),
    false
  );
  
  -- Log critical events to separate audit table if needed
  IF p_severity IN ('critical', 'high') THEN
    -- Could integrate with external logging service here
    RAISE LOG 'SECURITY ALERT [%]: % - User: %, Metadata: %', 
      p_severity, p_description, p_user_id, p_metadata;
  END IF;
END;
$$;