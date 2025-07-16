-- Extend existing polls system with Pulse Polls Pro features

-- Add new columns to polls table for enhanced features
ALTER TABLE public.polls ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE public.polls ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.polls ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted'));
ALTER TABLE public.polls ADD COLUMN IF NOT EXISTS anonymous_voting BOOLEAN DEFAULT false;
ALTER TABLE public.polls ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE public.polls ADD COLUMN IF NOT EXISTS embed_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.polls ADD COLUMN IF NOT EXISTS shareable_link TEXT;
ALTER TABLE public.polls ADD COLUMN IF NOT EXISTS premium_analytics BOOLEAN DEFAULT false;
ALTER TABLE public.polls ADD COLUMN IF NOT EXISTS poll_type TEXT DEFAULT 'basic' CHECK (poll_type IN ('basic', 'premium'));

-- Create poll analytics table for detailed tracking
CREATE TABLE IF NOT EXISTS public.poll_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id TEXT NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('view', 'vote', 'share', 'embed')),
  ip_address INET,
  user_agent TEXT,
  region TEXT,
  country TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create poll shares table for social sharing tracking
CREATE TABLE IF NOT EXISTS public.poll_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id TEXT NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'twitter', 'whatsapp', 'telegram', 'link', 'embed')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create poll reports table for moderation
CREATE TABLE IF NOT EXISTS public.poll_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id TEXT NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_reason TEXT NOT NULL CHECK (report_reason IN ('spam', 'inappropriate', 'misleading', 'offensive', 'other')),
  report_details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create poll payments table for premium features
CREATE TABLE IF NOT EXISTS public.poll_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id TEXT NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_fcfa INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('momo', 'card', 'bank_transfer')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_reference TEXT,
  payment_provider TEXT,
  features_unlocked TEXT[] DEFAULT ARRAY[]::TEXT[],
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.poll_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for poll_analytics
CREATE POLICY "Users can view their own analytics" ON public.poll_analytics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Poll creators can view their poll analytics" ON public.poll_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.polls 
      WHERE id = poll_analytics.poll_id AND creator_id = auth.uid()::text
    )
  );

CREATE POLICY "System can insert analytics" ON public.poll_analytics
  FOR INSERT WITH CHECK (true);

-- RLS policies for poll_shares
CREATE POLICY "Users can view their shares" ON public.poll_shares
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Poll creators can view their poll shares" ON public.poll_shares
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.polls 
      WHERE id = poll_shares.poll_id AND creator_id = auth.uid()::text
    )
  );

CREATE POLICY "System can insert shares" ON public.poll_shares
  FOR INSERT WITH CHECK (true);

-- RLS policies for poll_reports
CREATE POLICY "Users can view their own reports" ON public.poll_reports
  FOR SELECT USING (reported_by = auth.uid());

CREATE POLICY "Users can create reports" ON public.poll_reports
  FOR INSERT WITH CHECK (reported_by = auth.uid());

CREATE POLICY "Admins can manage all reports" ON public.poll_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for poll_payments
CREATE POLICY "Users can view their own payments" ON public.poll_payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create payments" ON public.poll_payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own payments" ON public.poll_payments
  FOR UPDATE USING (user_id = auth.uid());

-- Enhance existing polls table RLS to support visibility settings
DROP POLICY IF EXISTS "Polls are viewable by everyone" ON public.polls;

CREATE POLICY "Public polls are viewable by everyone" ON public.polls
  FOR SELECT USING (visibility = 'public' OR visibility = 'unlisted');

CREATE POLICY "Private polls viewable by creator only" ON public.polls
  FOR SELECT USING (visibility = 'private' AND creator_id = auth.uid()::text);

CREATE POLICY "Users can manage their own polls" ON public.polls
  FOR ALL USING (creator_id = auth.uid()::text);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_poll_analytics_poll_id ON public.poll_analytics(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_analytics_created_at ON public.poll_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_poll_shares_poll_id ON public.poll_shares(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_reports_status ON public.poll_reports(status);
CREATE INDEX IF NOT EXISTS idx_poll_payments_user_id ON public.poll_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_polls_tags ON public.polls USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_polls_visibility ON public.polls(visibility);

-- Create function to track poll analytics
CREATE OR REPLACE FUNCTION public.track_poll_analytics(
  p_poll_id TEXT,
  p_action_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  analytics_id UUID;
BEGIN
  INSERT INTO public.poll_analytics (
    poll_id, user_id, action_type, ip_address, user_agent, 
    region, country, referrer
  ) VALUES (
    p_poll_id, p_user_id, p_action_type, p_ip_address, p_user_agent,
    p_region, p_country, p_referrer
  ) RETURNING id INTO analytics_id;
  
  RETURN analytics_id;
END;
$$;

-- Create function to get poll analytics summary
CREATE OR REPLACE FUNCTION public.get_poll_analytics_summary(p_poll_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{}';
  total_views INTEGER;
  total_votes INTEGER;
  total_shares INTEGER;
  unique_voters INTEGER;
  regions_data JSONB;
  timeline_data JSONB;
BEGIN
  -- Check if user owns the poll or is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.polls 
    WHERE id = p_poll_id AND creator_id = auth.uid()::text
  ) AND NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Get total views
  SELECT COUNT(*) INTO total_views
  FROM public.poll_analytics
  WHERE poll_id = p_poll_id AND action_type = 'view';
  
  -- Get total votes
  SELECT COUNT(*) INTO total_votes
  FROM public.poll_votes
  WHERE poll_id = p_poll_id;
  
  -- Get total shares
  SELECT COUNT(*) INTO total_shares
  FROM public.poll_shares
  WHERE poll_id = p_poll_id;
  
  -- Get unique voters
  SELECT COUNT(DISTINCT user_id) INTO unique_voters
  FROM public.poll_votes
  WHERE poll_id = p_poll_id AND user_id IS NOT NULL;
  
  -- Get regional breakdown
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'region', region,
      'count', count
    )
  ), '[]'::jsonb) INTO regions_data
  FROM (
    SELECT region, COUNT(*) as count
    FROM public.poll_analytics
    WHERE poll_id = p_poll_id AND region IS NOT NULL
    GROUP BY region
    ORDER BY count DESC
    LIMIT 10
  ) regional_stats;
  
  -- Get timeline data (last 30 days)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'date', date,
      'views', views,
      'votes', votes
    ) ORDER BY date
  ), '[]'::jsonb) INTO timeline_data
  FROM (
    SELECT 
      DATE(created_at) as date,
      COUNT(CASE WHEN action_type = 'view' THEN 1 END) as views,
      COUNT(CASE WHEN action_type = 'vote' THEN 1 END) as votes
    FROM public.poll_analytics
    WHERE poll_id = p_poll_id 
    AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(created_at)
    ORDER BY date
  ) timeline_stats;
  
  result := jsonb_build_object(
    'total_views', total_views,
    'total_votes', total_votes,
    'total_shares', total_shares,
    'unique_voters', unique_voters,
    'regions', regions_data,
    'timeline', timeline_data,
    'engagement_rate', CASE 
      WHEN total_views > 0 THEN ROUND((total_votes::numeric / total_views::numeric) * 100, 2)
      ELSE 0
    END
  );
  
  RETURN result;
END;
$$;