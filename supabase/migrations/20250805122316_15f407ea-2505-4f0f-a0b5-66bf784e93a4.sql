-- Continue adding RLS policies for the remaining tables

-- Fix political_parties table
CREATE POLICY "Political parties are publicly readable"
ON public.political_parties
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage political parties"
ON public.political_parties
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can update political parties"
ON public.political_parties
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- Fix petitions table
CREATE POLICY "Petitions are publicly readable"
ON public.petitions
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create petitions"
ON public.petitions
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Petition creators and admins can update petitions"
ON public.petitions
FOR UPDATE
USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- Add privacy settings to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'limited', 'private')),
ADD COLUMN IF NOT EXISTS contact_visibility TEXT DEFAULT 'limited' CHECK (contact_visibility IN ('public', 'limited', 'private'));

-- Enhanced profiles RLS policy with privacy controls
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (
  profile_visibility = 'public' OR 
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- Add session timeout configuration table
CREATE TABLE IF NOT EXISTS public.security_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on security config
ALTER TABLE public.security_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage security config"
ON public.security_config
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- Insert default security configuration
INSERT INTO public.security_config (config_key, config_value, description) VALUES
('session_timeout_minutes', '480', 'Session timeout in minutes (8 hours)'),
('max_login_attempts', '5', 'Maximum login attempts before account lockout'),
('lockout_duration_minutes', '30', 'Account lockout duration in minutes'),
('password_expiry_days', '90', 'Password expiry period in days')
ON CONFLICT (config_key) DO NOTHING;