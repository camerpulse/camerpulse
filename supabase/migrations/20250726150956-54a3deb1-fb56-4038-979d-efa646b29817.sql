-- Create feed content scoring table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feed_content_scores') THEN
        CREATE TABLE public.feed_content_scores (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          content_id UUID NOT NULL,
          content_type TEXT NOT NULL, -- 'pulse', 'job', 'artist_content', 'political_update'
          civic_relevance_score NUMERIC DEFAULT 0.0,
          geographic_relevance NUMERIC DEFAULT 0.0,
          time_sensitivity_score NUMERIC DEFAULT 0.0,
          authenticity_score NUMERIC DEFAULT 0.5,
          engagement_prediction NUMERIC DEFAULT 0.0,
          total_score NUMERIC DEFAULT 0.0,
          region TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          expires_at TIMESTAMP WITH TIME ZONE
        );
        
        ALTER TABLE public.feed_content_scores ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Public can view content scores" ON public.feed_content_scores
        FOR SELECT USING (true);
        
        CREATE POLICY "System can manage content scores" ON public.feed_content_scores
        FOR ALL USING (true);
        
        CREATE INDEX idx_feed_content_scores_content ON public.feed_content_scores(content_id, content_type);
        CREATE INDEX idx_feed_content_scores_total ON public.feed_content_scores(total_score DESC);
        CREATE INDEX idx_feed_content_scores_region ON public.feed_content_scores(region);
    END IF;
END $$;

-- Create feed interactions table for learning (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feed_interactions') THEN
        CREATE TABLE public.feed_interactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          content_id UUID NOT NULL,
          content_type TEXT NOT NULL,
          interaction_type TEXT NOT NULL, -- 'view', 'like', 'share', 'comment', 'skip', 'hide', 'report'
          dwell_time_seconds INTEGER DEFAULT 0,
          engagement_quality NUMERIC DEFAULT 0.0, -- 0-1 quality score
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          metadata JSONB DEFAULT '{}'::jsonb
        );
        
        ALTER TABLE public.feed_interactions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can manage their own interactions" ON public.feed_interactions
        FOR ALL USING (auth.uid() = user_id);
        
        CREATE INDEX idx_feed_interactions_user ON public.feed_interactions(user_id, created_at DESC);
        CREATE INDEX idx_feed_interactions_content ON public.feed_interactions(content_id, interaction_type);
    END IF;
END $$;

-- Create civic events calendar for time-sensitive content (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'civic_events_calendar') THEN
        CREATE TABLE public.civic_events_calendar (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          event_type TEXT NOT NULL, -- 'election', 'voting_deadline', 'public_hearing', 'emergency'
          event_name TEXT NOT NULL,
          event_date DATE NOT NULL,
          deadline_date DATE,
          priority_level TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
          regions_affected TEXT[] DEFAULT ARRAY[]::TEXT[],
          boost_multiplier NUMERIC DEFAULT 1.0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        ALTER TABLE public.civic_events_calendar ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Public can view active civic events" ON public.civic_events_calendar
        FOR SELECT USING (is_active = true);
        
        CREATE POLICY "Admins can manage civic events" ON public.civic_events_calendar
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'admin'::app_role
          )
        );
        
        CREATE INDEX idx_civic_events_date ON public.civic_events_calendar(event_date, is_active);
    END IF;
END $$;

-- Create content diversity tracking (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feed_diversity_tracking') THEN
        CREATE TABLE public.feed_diversity_tracking (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          session_id TEXT NOT NULL,
          civic_content_shown INTEGER DEFAULT 0,
          entertainment_content_shown INTEGER DEFAULT 0,
          job_content_shown INTEGER DEFAULT 0,
          artist_content_shown INTEGER DEFAULT 0,
          political_viewpoints_shown TEXT[] DEFAULT ARRAY[]::TEXT[],
          regions_shown TEXT[] DEFAULT ARRAY[]::TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours')
        );
        
        ALTER TABLE public.feed_diversity_tracking ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can manage their own diversity tracking" ON public.feed_diversity_tracking
        FOR ALL USING (auth.uid() = user_id);
        
        CREATE INDEX idx_feed_diversity_session ON public.feed_diversity_tracking(user_id, session_id);
    END IF;
END $$;

-- Update existing user_feed_preferences table if needed
DO $$ 
BEGIN
    -- Add civic_content_weight column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_feed_preferences' AND column_name = 'civic_content_weight') THEN
        ALTER TABLE public.user_feed_preferences ADD COLUMN civic_content_weight NUMERIC DEFAULT 0.4;
    END IF;
    
    -- Add entertainment_weight column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_feed_preferences' AND column_name = 'entertainment_weight') THEN
        ALTER TABLE public.user_feed_preferences ADD COLUMN entertainment_weight NUMERIC DEFAULT 0.3;
    END IF;
    
    -- Add job_content_weight column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_feed_preferences' AND column_name = 'job_content_weight') THEN
        ALTER TABLE public.user_feed_preferences ADD COLUMN job_content_weight NUMERIC DEFAULT 0.2;
    END IF;
    
    -- Add artist_content_weight column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_feed_preferences' AND column_name = 'artist_content_weight') THEN
        ALTER TABLE public.user_feed_preferences ADD COLUMN artist_content_weight NUMERIC DEFAULT 0.1;
    END IF;
    
    -- Add local_content_preference column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_feed_preferences' AND column_name = 'local_content_preference') THEN
        ALTER TABLE public.user_feed_preferences ADD COLUMN local_content_preference NUMERIC DEFAULT 0.7;
    END IF;
    
    -- Add political_engagement_level column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_feed_preferences' AND column_name = 'political_engagement_level') THEN
        ALTER TABLE public.user_feed_preferences ADD COLUMN political_engagement_level TEXT DEFAULT 'moderate';
    END IF;
    
    -- Add preferred_regions column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_feed_preferences' AND column_name = 'preferred_regions') THEN
        ALTER TABLE public.user_feed_preferences ADD COLUMN preferred_regions TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
    
    -- Add blocked_topics column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_feed_preferences' AND column_name = 'blocked_topics') THEN
        ALTER TABLE public.user_feed_preferences ADD COLUMN blocked_topics TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
END $$;

-- Create function to calculate content scores
CREATE OR REPLACE FUNCTION public.calculate_content_score(
  p_content_id UUID,
  p_content_type TEXT,
  p_user_region TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
) RETURNS NUMERIC AS $$
DECLARE
  civic_score NUMERIC := 0.0;
  geo_score NUMERIC := 0.0;
  time_score NUMERIC := 0.0;
  auth_score NUMERIC := 0.5;
  engagement_score NUMERIC := 0.0;
  total NUMERIC := 0.0;
BEGIN
  -- Calculate civic relevance (0-1)
  CASE p_content_type
    WHEN 'political_update' THEN civic_score := 0.9;
    WHEN 'pulse' THEN civic_score := 0.6;
    WHEN 'job' THEN civic_score := 0.4;
    WHEN 'artist_content' THEN civic_score := 0.2;
    ELSE civic_score := 0.3;
  END CASE;
  
  -- Calculate geographic relevance (0-1)
  IF p_user_region IS NOT NULL THEN
    -- Higher score for local content
    geo_score := 0.8;
  ELSE
    geo_score := 0.4;
  END IF;
  
  -- Calculate time sensitivity (0-1)
  -- Check if there are active civic events
  SELECT COALESCE(MAX(boost_multiplier), 1.0) * 0.3 INTO time_score
  FROM public.civic_events_calendar 
  WHERE is_active = true 
    AND event_date >= CURRENT_DATE 
    AND event_date <= CURRENT_DATE + INTERVAL '30 days';
  
  -- Calculate engagement prediction based on past interactions
  IF p_user_id IS NOT NULL THEN
    SELECT COALESCE(AVG(engagement_quality), 0.5) INTO engagement_score
    FROM public.feed_interactions 
    WHERE user_id = p_user_id 
      AND content_type = p_content_type
      AND created_at > now() - INTERVAL '30 days';
  END IF;
  
  -- Calculate weighted total score
  total := (civic_score * 0.3) + (geo_score * 0.25) + (time_score * 0.2) + (auth_score * 0.15) + (engagement_score * 0.1);
  
  RETURN LEAST(1.0, total);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;