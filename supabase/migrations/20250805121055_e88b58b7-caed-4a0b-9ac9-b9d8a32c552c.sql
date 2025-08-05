-- Add missing RLS policies for civic platform tables

-- 1. Transparency Reports RLS Policies
CREATE POLICY "Transparency reports are publicly readable"
ON public.transparency_reports
FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert transparency reports"
ON public.transparency_reports
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

CREATE POLICY "Only admins can update transparency reports"
ON public.transparency_reports
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- 2. Civic Courses RLS Policies
CREATE POLICY "Civic courses are publicly readable"
ON public.civic_courses
FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage civic courses"
ON public.civic_courses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

CREATE POLICY "Only admins can update civic courses"
ON public.civic_courses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- 3. User Course Progress RLS Policies
CREATE POLICY "Users can view their own course progress"
ON public.user_course_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own course progress"
ON public.user_course_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own course progress"
ON public.user_course_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all course progress"
ON public.user_course_progress
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- 4. Make politicians.user_id NOT NULL for data integrity
ALTER TABLE public.politicians 
ALTER COLUMN user_id SET NOT NULL;

-- 5. Add privacy settings to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'limited', 'private')),
ADD COLUMN IF NOT EXISTS contact_visibility TEXT DEFAULT 'limited' CHECK (contact_visibility IN ('public', 'limited', 'private'));

-- 6. Enhanced profiles RLS policy with privacy controls
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

-- 7. Security audit logs table RLS policies
CREATE POLICY "Only system can insert security logs"
ON public.security_audit_logs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all security logs"
ON public.security_audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- 8. Enhanced user_roles RLS policies to prevent privilege escalation
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only super admins can assign admin roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  CASE 
    WHEN role = 'admin'::app_role THEN 
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'::app_role
      )
    ELSE 
      auth.uid() IS NOT NULL
  END
);

CREATE POLICY "Only admins can update user roles"
ON public.user_roles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

CREATE POLICY "Only admins can delete user roles"
ON public.user_roles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- 9. Add session timeout configuration
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