-- Create Politician Engagement Score System

-- Create engagement categories enum
CREATE TYPE engagement_category AS ENUM (
  'communication',
  'participation', 
  'constituency_outreach',
  'public_visibility',
  'policy_advocacy'
);

-- Create engagement activity types enum
CREATE TYPE engagement_activity_type AS ENUM (
  'public_appearance',
  'social_media_post',
  'parliament_attendance',
  'community_visit',
  'media_interview',
  'town_hall',
  'project_launch',
  'policy_statement',
  'citizen_interaction',
  'volunteer_work'
);

-- Create politician engagement scores table
CREATE TABLE public.politician_engagement_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  politician_id UUID NOT NULL,
  overall_score INTEGER NOT NULL DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  communication_score INTEGER NOT NULL DEFAULT 0 CHECK (communication_score >= 0 AND communication_score <= 100),
  participation_score INTEGER NOT NULL DEFAULT 0 CHECK (participation_score >= 0 AND participation_score <= 100),
  constituency_outreach_score INTEGER NOT NULL DEFAULT 0 CHECK (constituency_outreach_score >= 0 AND constituency_outreach_score <= 100),
  public_visibility_score INTEGER NOT NULL DEFAULT 0 CHECK (public_visibility_score >= 0 AND public_visibility_score <= 100),
  policy_advocacy_score INTEGER NOT NULL DEFAULT 0 CHECK (policy_advocacy_score >= 0 AND policy_advocacy_score <= 100),
  engagement_level TEXT NOT NULL DEFAULT 'inactive' CHECK (engagement_level IN ('highly_active', 'moderately_active', 'low_active', 'inactive')),
  last_activity_date TIMESTAMP WITH TIME ZONE,
  last_activity_description TEXT,
  total_activities INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(politician_id)
);

-- Create engagement activities table
CREATE TABLE public.engagement_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  politician_id UUID NOT NULL,
  activity_type engagement_activity_type NOT NULL,
  category engagement_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  activity_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  location TEXT,
  impact_score INTEGER NOT NULL DEFAULT 1 CHECK (impact_score >= 1 AND impact_score <= 10),
  source_url TEXT,
  source_type TEXT NOT NULL DEFAULT 'manual',
  verified BOOLEAN NOT NULL DEFAULT false,
  evidence_attachments TEXT[],
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create engagement monitoring sources table
CREATE TABLE public.engagement_monitoring_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  politician_id UUID NOT NULL,
  source_type TEXT NOT NULL,
  source_url TEXT NOT NULL,
  platform TEXT NOT NULL,
  last_checked_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  check_frequency_hours INTEGER NOT NULL DEFAULT 24,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(politician_id, source_url)
);

-- Create engagement score history table for tracking changes
CREATE TABLE public.engagement_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  politician_id UUID NOT NULL,
  score_date DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_score INTEGER NOT NULL,
  communication_score INTEGER NOT NULL,
  participation_score INTEGER NOT NULL,
  constituency_outreach_score INTEGER NOT NULL,
  public_visibility_score INTEGER NOT NULL,
  policy_advocacy_score INTEGER NOT NULL,
  activities_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(politician_id, score_date)
);

-- Enable RLS
ALTER TABLE public.politician_engagement_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_monitoring_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_score_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for politician_engagement_scores
CREATE POLICY "Everyone can view engagement scores" ON public.politician_engagement_scores
FOR SELECT USING (true);

CREATE POLICY "Admins can manage engagement scores" ON public.politician_engagement_scores
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create RLS policies for engagement_activities
CREATE POLICY "Everyone can view verified activities" ON public.engagement_activities
FOR SELECT USING (verified = true OR 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage activities" ON public.engagement_activities
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create RLS policies for monitoring sources
CREATE POLICY "Admins can view monitoring sources" ON public.engagement_monitoring_sources
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage monitoring sources" ON public.engagement_monitoring_sources
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create RLS policies for score history
CREATE POLICY "Everyone can view score history" ON public.engagement_score_history
FOR SELECT USING (true);

CREATE POLICY "Admins can manage score history" ON public.engagement_score_history
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create indexes for performance
CREATE INDEX idx_engagement_scores_politician ON public.politician_engagement_scores(politician_id);
CREATE INDEX idx_engagement_scores_level ON public.politician_engagement_scores(engagement_level);
CREATE INDEX idx_engagement_activities_politician ON public.engagement_activities(politician_id);
CREATE INDEX idx_engagement_activities_date ON public.engagement_activities(activity_date DESC);
CREATE INDEX idx_engagement_activities_type ON public.engagement_activities(activity_type);
CREATE INDEX idx_engagement_activities_verified ON public.engagement_activities(verified);
CREATE INDEX idx_engagement_monitoring_politician ON public.engagement_monitoring_sources(politician_id);
CREATE INDEX idx_engagement_score_history_politician_date ON public.engagement_score_history(politician_id, score_date DESC);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_engagement_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_engagement_scores_updated_at
  BEFORE UPDATE ON public.politician_engagement_scores
  FOR EACH ROW EXECUTE FUNCTION update_engagement_updated_at();

CREATE TRIGGER update_engagement_activities_updated_at
  BEFORE UPDATE ON public.engagement_activities
  FOR EACH ROW EXECUTE FUNCTION update_engagement_updated_at();

CREATE TRIGGER update_engagement_monitoring_updated_at
  BEFORE UPDATE ON public.engagement_monitoring_sources
  FOR EACH ROW EXECUTE FUNCTION update_engagement_updated_at();

-- Function to calculate engagement scores
CREATE OR REPLACE FUNCTION calculate_politician_engagement_score(p_politician_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  activity_record RECORD;
  communication_score INTEGER := 0;
  participation_score INTEGER := 0;
  outreach_score INTEGER := 0;
  visibility_score INTEGER := 0;
  advocacy_score INTEGER := 0;
  overall_score INTEGER := 0;
  total_activities INTEGER := 0;
  last_activity_date TIMESTAMP WITH TIME ZONE;
  last_activity_desc TEXT;
  engagement_level TEXT := 'inactive';
  result JSONB;
BEGIN
  -- Count activities by category in the last 90 days
  FOR activity_record IN
    SELECT 
      category,
      activity_type,
      COUNT(*) as activity_count,
      AVG(impact_score) as avg_impact,
      MAX(activity_date) as latest_date,
      MAX(title) as latest_title
    FROM public.engagement_activities
    WHERE politician_id = p_politician_id 
    AND verified = true
    AND activity_date > NOW() - INTERVAL '90 days'
    GROUP BY category, activity_type
  LOOP
    total_activities := total_activities + activity_record.activity_count;
    
    -- Update last activity info if this is the most recent
    IF last_activity_date IS NULL OR activity_record.latest_date > last_activity_date THEN
      last_activity_date := activity_record.latest_date;
      last_activity_desc := activity_record.latest_title;
    END IF;
    
    -- Calculate category scores based on activity count and impact
    CASE activity_record.category
      WHEN 'communication' THEN
        communication_score := LEAST(100, communication_score + (activity_record.activity_count * activity_record.avg_impact));
      WHEN 'participation' THEN
        participation_score := LEAST(100, participation_score + (activity_record.activity_count * activity_record.avg_impact));
      WHEN 'constituency_outreach' THEN
        outreach_score := LEAST(100, outreach_score + (activity_record.activity_count * activity_record.avg_impact));
      WHEN 'public_visibility' THEN
        visibility_score := LEAST(100, visibility_score + (activity_record.activity_count * activity_record.avg_impact));
      WHEN 'policy_advocacy' THEN
        advocacy_score := LEAST(100, advocacy_score + (activity_record.activity_count * activity_record.avg_impact));
    END CASE;
  END LOOP;
  
  -- Calculate overall score (weighted average)
  overall_score := ROUND((
    communication_score * 0.25 +
    participation_score * 0.20 +
    outreach_score * 0.25 +
    visibility_score * 0.15 +
    advocacy_score * 0.15
  ));
  
  -- Determine engagement level
  IF overall_score >= 75 THEN
    engagement_level := 'highly_active';
  ELSIF overall_score >= 50 THEN
    engagement_level := 'moderately_active';
  ELSIF overall_score >= 25 THEN
    engagement_level := 'low_active';
  ELSE
    engagement_level := 'inactive';
  END IF;
  
  -- Insert or update the score
  INSERT INTO public.politician_engagement_scores (
    politician_id, overall_score, communication_score, participation_score,
    constituency_outreach_score, public_visibility_score, policy_advocacy_score,
    engagement_level, last_activity_date, last_activity_description, total_activities
  )
  VALUES (
    p_politician_id, overall_score, communication_score, participation_score,
    outreach_score, visibility_score, advocacy_score,
    engagement_level, last_activity_date, last_activity_desc, total_activities
  )
  ON CONFLICT (politician_id) DO UPDATE SET
    overall_score = EXCLUDED.overall_score,
    communication_score = EXCLUDED.communication_score,
    participation_score = EXCLUDED.participation_score,
    constituency_outreach_score = EXCLUDED.constituency_outreach_score,
    public_visibility_score = EXCLUDED.public_visibility_score,
    policy_advocacy_score = EXCLUDED.policy_advocacy_score,
    engagement_level = EXCLUDED.engagement_level,
    last_activity_date = EXCLUDED.last_activity_date,
    last_activity_description = EXCLUDED.last_activity_description,
    total_activities = EXCLUDED.total_activities,
    updated_at = now();
  
  -- Save to history
  INSERT INTO public.engagement_score_history (
    politician_id, overall_score, communication_score, participation_score,
    constituency_outreach_score, public_visibility_score, policy_advocacy_score,
    activities_count
  )
  VALUES (
    p_politician_id, overall_score, communication_score, participation_score,
    outreach_score, visibility_score, advocacy_score, total_activities
  )
  ON CONFLICT (politician_id, score_date) DO UPDATE SET
    overall_score = EXCLUDED.overall_score,
    communication_score = EXCLUDED.communication_score,
    participation_score = EXCLUDED.participation_score,
    constituency_outreach_score = EXCLUDED.constituency_outreach_score,
    public_visibility_score = EXCLUDED.public_visibility_score,
    policy_advocacy_score = EXCLUDED.policy_advocacy_score,
    activities_count = EXCLUDED.activities_count;
  
  result := jsonb_build_object(
    'politician_id', p_politician_id,
    'overall_score', overall_score,
    'engagement_level', engagement_level,
    'total_activities', total_activities,
    'last_activity_date', last_activity_date,
    'scores', jsonb_build_object(
      'communication', communication_score,
      'participation', participation_score,
      'constituency_outreach', outreach_score,
      'public_visibility', visibility_score,
      'policy_advocacy', advocacy_score
    )
  );
  
  RETURN result;
END;
$$;

-- Function to get engagement statistics
CREATE OR REPLACE FUNCTION get_engagement_statistics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats JSONB := '{}';
  total_politicians INTEGER;
  highly_active INTEGER;
  moderately_active INTEGER;
  low_active INTEGER;
  inactive INTEGER;
  avg_score NUMERIC;
  total_activities INTEGER;
BEGIN
  -- Get basic counts
  SELECT COUNT(*) INTO total_politicians FROM public.politician_engagement_scores;
  
  SELECT 
    COUNT(*) FILTER (WHERE engagement_level = 'highly_active'),
    COUNT(*) FILTER (WHERE engagement_level = 'moderately_active'), 
    COUNT(*) FILTER (WHERE engagement_level = 'low_active'),
    COUNT(*) FILTER (WHERE engagement_level = 'inactive'),
    AVG(overall_score)
  INTO highly_active, moderately_active, low_active, inactive, avg_score
  FROM public.politician_engagement_scores;
  
  -- Get total activities in last 30 days
  SELECT COUNT(*) INTO total_activities
  FROM public.engagement_activities
  WHERE verified = true 
  AND activity_date > NOW() - INTERVAL '30 days';
  
  stats := jsonb_build_object(
    'total_politicians', COALESCE(total_politicians, 0),
    'highly_active', COALESCE(highly_active, 0),
    'moderately_active', COALESCE(moderately_active, 0),
    'low_active', COALESCE(low_active, 0),
    'inactive', COALESCE(inactive, 0),
    'average_score', ROUND(COALESCE(avg_score, 0), 1),
    'recent_activities', COALESCE(total_activities, 0),
    'last_updated', now()
  );
  
  RETURN stats;
END;
$$;

-- Trigger to recalculate scores when activities are added/updated
CREATE OR REPLACE FUNCTION trigger_recalculate_engagement_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate score for the politician
  PERFORM calculate_politician_engagement_score(
    COALESCE(NEW.politician_id, OLD.politician_id)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_score_on_activity_change
  AFTER INSERT OR UPDATE OR DELETE ON public.engagement_activities
  FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_engagement_score();

-- Insert some sample data for demonstration (without level filter)
INSERT INTO public.engagement_activities (
  politician_id, activity_type, category, title, description, 
  activity_date, location, impact_score, verified, source_type
) 
SELECT 
  p.id as politician_id,
  (ARRAY['public_appearance', 'social_media_post', 'community_visit', 'media_interview'])[floor(random() * 4 + 1)]::engagement_activity_type,
  (ARRAY['communication', 'participation', 'constituency_outreach', 'public_visibility', 'policy_advocacy'])[floor(random() * 5 + 1)]::engagement_category,
  'Sample Activity: ' || p.name,
  'Demonstration activity for politician engagement tracking',
  NOW() - (random() * INTERVAL '60 days'),
  'Various locations in Cameroon',
  floor(random() * 7 + 3), -- Random impact score 3-9
  true,
  'manual'
FROM public.politicians p
LIMIT 50; -- Create activities for first 50 politicians

-- Calculate initial scores for all politicians with activities
SELECT calculate_politician_engagement_score(politician_id)
FROM (
  SELECT DISTINCT politician_id 
  FROM public.engagement_activities 
  WHERE verified = true
) subq;