-- Enhanced User Management Tables

-- User profile extensions for additional data
CREATE TABLE IF NOT EXISTS public.user_profile_extensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bio_extended TEXT,
  interests JSONB DEFAULT '[]'::jsonb,
  skills JSONB DEFAULT '[]'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb,
  privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "contact_visibility": "public"}'::jsonb,
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  verification_documents JSONB DEFAULT '[]'::jsonb,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  profile_completion_score INTEGER DEFAULT 0 CHECK (profile_completion_score >= 0 AND profile_completion_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- User verification queue for profile verification workflow
CREATE TABLE IF NOT EXISTS public.profile_verification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL DEFAULT 'identity' CHECK (verification_type IN ('identity', 'business', 'expert', 'artist', 'government')),
  submitted_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'in_review', 'approved', 'rejected', 'requires_additional_info')),
  reviewer_id UUID REFERENCES auth.users(id),
  reviewer_notes TEXT,
  rejection_reason TEXT,
  auto_verification_score NUMERIC(3,2) DEFAULT 0.0,
  manual_review_required BOOLEAN DEFAULT true,
  priority_level TEXT DEFAULT 'normal' CHECK (priority_level IN ('low', 'normal', 'high', 'urgent')),
  verification_deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Role change audit log
CREATE TABLE IF NOT EXISTS public.role_change_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_role TEXT,
  new_role TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT,
  approval_required BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  effective_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User engagement metrics
CREATE TABLE IF NOT EXISTS public.user_engagement_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  login_count INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  actions_performed INTEGER DEFAULT 0,
  content_created INTEGER DEFAULT 0,
  content_shared INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  feature_usage JSONB DEFAULT '{}'::jsonb,
  engagement_score NUMERIC(5,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, metric_date)
);

-- User behavior tracking
CREATE TABLE IF NOT EXISTS public.user_behavior_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_category TEXT,
  event_data JSONB DEFAULT '{}'::jsonb,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  device_info JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Failed login attempts for security tracking
CREATE TABLE IF NOT EXISTS public.failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  attempt_count INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User device management
CREATE TABLE IF NOT EXISTS public.user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_name TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'other')),
  operating_system TEXT,
  browser TEXT,
  is_trusted BOOLEAN DEFAULT false,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_ip_address INET,
  push_token TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, device_id)
);

-- Enable RLS
ALTER TABLE public.user_profile_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_verification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profile_extensions
CREATE POLICY "Users can view their own profile extensions" ON public.user_profile_extensions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile extensions" ON public.user_profile_extensions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile extensions" ON public.user_profile_extensions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profile extensions" ON public.user_profile_extensions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for profile_verification_queue
CREATE POLICY "Users can view their own verification requests" ON public.profile_verification_queue
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verification requests" ON public.profile_verification_queue
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and reviewers can manage verification queue" ON public.profile_verification_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- RLS Policies for role_change_audit
CREATE POLICY "Users can view their own role changes" ON public.role_change_audit
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage role change audit" ON public.role_change_audit
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for user_engagement_metrics
CREATE POLICY "Users can view their own engagement metrics" ON public.user_engagement_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert engagement metrics" ON public.user_engagement_metrics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all engagement metrics" ON public.user_engagement_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for user_behavior_tracking
CREATE POLICY "Users can view their own behavior data" ON public.user_behavior_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert behavior tracking" ON public.user_behavior_tracking
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all behavior tracking" ON public.user_behavior_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for failed_login_attempts
CREATE POLICY "Admins can manage failed login attempts" ON public.failed_login_attempts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for user_devices
CREATE POLICY "Users can manage their own devices" ON public.user_devices
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user devices" ON public.user_devices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profile_extensions_user_id ON public.user_profile_extensions(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_verification_queue_status ON public.profile_verification_queue(verification_status);
CREATE INDEX IF NOT EXISTS idx_profile_verification_queue_type ON public.profile_verification_queue(verification_type);
CREATE INDEX IF NOT EXISTS idx_role_change_audit_user_id ON public.role_change_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_user_engagement_metrics_user_date ON public.user_engagement_metrics(user_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_user_behavior_tracking_user_id ON public.user_behavior_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email ON public.failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON public.user_devices(user_id);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profile_extensions_updated_at
  BEFORE UPDATE ON public.user_profile_extensions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profile_verification_queue_updated_at
  BEFORE UPDATE ON public.profile_verification_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_engagement_metrics_updated_at
  BEFORE UPDATE ON public.user_engagement_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_failed_login_attempts_updated_at
  BEFORE UPDATE ON public.failed_login_attempts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_devices_updated_at
  BEFORE UPDATE ON public.user_devices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();