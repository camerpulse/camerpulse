-- Create comprehensive civic reputation system

-- Create enum for entity types that can be rated
CREATE TYPE civic_entity_type AS ENUM (
  'ministry',
  'council', 
  'elected_official',
  'appointed_official',
  'hospital',
  'school',
  'pharmacy',
  'village',
  'project',
  'petition_owner'
);

-- Create enum for reputation badges
CREATE TYPE reputation_badge AS ENUM (
  'excellent',
  'trusted', 
  'under_watch',
  'flagged'
);

-- Create comprehensive civic ratings table
CREATE TABLE public.civic_entity_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type civic_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  entity_name TEXT NOT NULL,
  user_id UUID NOT NULL,
  
  -- Rating components (1-5 scale)
  transparency_rating INTEGER CHECK (transparency_rating >= 1 AND transparency_rating <= 5),
  performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 5),
  engagement_rating INTEGER CHECK (engagement_rating >= 1 AND engagement_rating <= 5),
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  
  -- Additional data
  comment TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID,
  region TEXT,
  ip_address INET,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent duplicate ratings from same user for same entity
  UNIQUE(entity_type, entity_id, user_id)
);

-- Create civic reputation scores table (computed scores)
CREATE TABLE public.civic_reputation_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type civic_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  entity_name TEXT NOT NULL,
  
  -- Score components (0-100)
  transparency_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  performance_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  citizen_rating_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  engagement_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  response_speed_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  negative_flags_penalty NUMERIC(5,2) NOT NULL DEFAULT 0,
  
  -- Final computed score
  total_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  reputation_badge reputation_badge NOT NULL DEFAULT 'under_watch',
  
  -- Rating statistics
  total_ratings INTEGER NOT NULL DEFAULT 0,
  average_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  five_star_count INTEGER NOT NULL DEFAULT 0,
  four_star_count INTEGER NOT NULL DEFAULT 0,
  three_star_count INTEGER NOT NULL DEFAULT 0,
  two_star_count INTEGER NOT NULL DEFAULT 0,
  one_star_count INTEGER NOT NULL DEFAULT 0,
  
  -- Additional metadata
  region TEXT,
  last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint
  UNIQUE(entity_type, entity_id)
);

-- Create table for tracking rating abuse
CREATE TABLE public.civic_rating_abuse_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reported_rating_id UUID NOT NULL REFERENCES civic_entity_ratings(id),
  reporter_user_id UUID NOT NULL,
  abuse_type TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  action_taken TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leaderboard entries table
CREATE TABLE public.civic_leaderboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL, -- 'top_officials', 'best_ministries', etc.
  entity_type civic_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  entity_name TEXT NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  rank_position INTEGER NOT NULL,
  region TEXT,
  period_type TEXT NOT NULL DEFAULT 'monthly', -- 'weekly', 'monthly', 'yearly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint for rankings per period
  UNIQUE(category, period_type, period_start, rank_position)
);

-- Enable RLS on all tables
ALTER TABLE public.civic_entity_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_reputation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_rating_abuse_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_leaderboards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for civic_entity_ratings
CREATE POLICY "Anyone can view ratings" ON public.civic_entity_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own ratings" ON public.civic_entity_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" ON public.civic_entity_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all ratings" ON public.civic_entity_ratings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for civic_reputation_scores
CREATE POLICY "Anyone can view reputation scores" ON public.civic_reputation_scores
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage reputation scores" ON public.civic_reputation_scores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for civic_rating_abuse_reports
CREATE POLICY "Users can report abuse" ON public.civic_rating_abuse_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_user_id);

CREATE POLICY "Users can view their own reports" ON public.civic_rating_abuse_reports
  FOR SELECT USING (auth.uid() = reporter_user_id);

CREATE POLICY "Admins can manage abuse reports" ON public.civic_rating_abuse_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for civic_leaderboards
CREATE POLICY "Anyone can view leaderboards" ON public.civic_leaderboards
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage leaderboards" ON public.civic_leaderboards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to calculate civic reputation score
CREATE OR REPLACE FUNCTION calculate_civic_reputation_score(
  p_entity_type civic_entity_type,
  p_entity_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transparency_score NUMERIC := 0;
  v_performance_score NUMERIC := 0;
  v_citizen_rating_score NUMERIC := 0;
  v_engagement_score NUMERIC := 0;
  v_response_speed_score NUMERIC := 0;
  v_negative_flags_penalty NUMERIC := 0;
  v_total_score NUMERIC := 0;
  v_reputation_badge reputation_badge := 'under_watch';
  v_total_ratings INTEGER := 0;
  v_average_rating NUMERIC := 0;
  v_five_star INTEGER := 0;
  v_four_star INTEGER := 0;
  v_three_star INTEGER := 0;
  v_two_star INTEGER := 0;
  v_one_star INTEGER := 0;
BEGIN
  -- Calculate rating statistics
  SELECT 
    COUNT(*),
    COALESCE(AVG(overall_rating), 0),
    COUNT(*) FILTER (WHERE overall_rating = 5),
    COUNT(*) FILTER (WHERE overall_rating = 4),
    COUNT(*) FILTER (WHERE overall_rating = 3),
    COUNT(*) FILTER (WHERE overall_rating = 2),
    COUNT(*) FILTER (WHERE overall_rating = 1)
  INTO v_total_ratings, v_average_rating, v_five_star, v_four_star, v_three_star, v_two_star, v_one_star
  FROM civic_entity_ratings 
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id;

  -- Calculate component scores (simplified algorithm)
  -- Transparency score (based on transparency ratings)
  SELECT COALESCE(AVG(transparency_rating) * 20, 0) INTO v_transparency_score
  FROM civic_entity_ratings 
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id 
    AND transparency_rating IS NOT NULL;

  -- Performance score (based on performance ratings)
  SELECT COALESCE(AVG(performance_rating) * 20, 0) INTO v_performance_score
  FROM civic_entity_ratings 
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id 
    AND performance_rating IS NOT NULL;

  -- Citizen rating score (based on overall ratings)
  v_citizen_rating_score := v_average_rating * 20;

  -- Engagement score (based on engagement ratings)
  SELECT COALESCE(AVG(engagement_rating) * 20, 0) INTO v_engagement_score
  FROM civic_entity_ratings 
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id 
    AND engagement_rating IS NOT NULL;

  -- Response speed score (placeholder - could be calculated from actual response data)
  v_response_speed_score := 75; -- Default score

  -- Negative flags penalty (count of abuse reports)
  SELECT COALESCE(COUNT(*) * 5, 0) INTO v_negative_flags_penalty
  FROM civic_rating_abuse_reports r
  JOIN civic_entity_ratings er ON r.reported_rating_id = er.id
  WHERE er.entity_type = p_entity_type AND er.entity_id = p_entity_id
    AND r.status = 'confirmed';

  -- Calculate total score using weights
  v_total_score := (
    v_transparency_score * 0.25 +
    v_performance_score * 0.25 +
    v_citizen_rating_score * 0.20 +
    v_engagement_score * 0.15 +
    v_response_speed_score * 0.10
  ) - v_negative_flags_penalty;

  -- Ensure score is within bounds
  v_total_score := GREATEST(0, LEAST(100, v_total_score));

  -- Determine reputation badge
  IF v_total_score >= 85 THEN
    v_reputation_badge := 'excellent';
  ELSIF v_total_score >= 70 THEN
    v_reputation_badge := 'trusted';
  ELSIF v_total_score >= 40 THEN
    v_reputation_badge := 'under_watch';
  ELSE
    v_reputation_badge := 'flagged';
  END IF;

  -- Insert or update reputation score
  INSERT INTO civic_reputation_scores (
    entity_type, entity_id, entity_name,
    transparency_score, performance_score, citizen_rating_score,
    engagement_score, response_speed_score, negative_flags_penalty,
    total_score, reputation_badge,
    total_ratings, average_rating,
    five_star_count, four_star_count, three_star_count, two_star_count, one_star_count,
    last_calculated_at
  ) VALUES (
    p_entity_type, p_entity_id, 
    COALESCE((SELECT entity_name FROM civic_entity_ratings WHERE entity_type = p_entity_type AND entity_id = p_entity_id LIMIT 1), 'Unknown'),
    v_transparency_score, v_performance_score, v_citizen_rating_score,
    v_engagement_score, v_response_speed_score, v_negative_flags_penalty,
    v_total_score, v_reputation_badge,
    v_total_ratings, v_average_rating,
    v_five_star, v_four_star, v_three_star, v_two_star, v_one_star,
    now()
  ) 
  ON CONFLICT (entity_type, entity_id) DO UPDATE SET
    transparency_score = EXCLUDED.transparency_score,
    performance_score = EXCLUDED.performance_score,
    citizen_rating_score = EXCLUDED.citizen_rating_score,
    engagement_score = EXCLUDED.engagement_score,
    response_speed_score = EXCLUDED.response_speed_score,
    negative_flags_penalty = EXCLUDED.negative_flags_penalty,
    total_score = EXCLUDED.total_score,
    reputation_badge = EXCLUDED.reputation_badge,
    total_ratings = EXCLUDED.total_ratings,
    average_rating = EXCLUDED.average_rating,
    five_star_count = EXCLUDED.five_star_count,
    four_star_count = EXCLUDED.four_star_count,
    three_star_count = EXCLUDED.three_star_count,
    two_star_count = EXCLUDED.two_star_count,
    one_star_count = EXCLUDED.one_star_count,
    last_calculated_at = EXCLUDED.last_calculated_at,
    updated_at = now();
END;
$$;

-- Trigger function to recalculate scores when ratings change
CREATE OR REPLACE FUNCTION update_civic_reputation_scores()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate for the affected entity
  PERFORM calculate_civic_reputation_score(
    COALESCE(NEW.entity_type, OLD.entity_type),
    COALESCE(NEW.entity_id, OLD.entity_id)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic score updates
CREATE TRIGGER civic_ratings_score_update_trigger
  AFTER INSERT OR UPDATE OR DELETE ON civic_entity_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_civic_reputation_scores();

-- Create updated_at triggers
CREATE TRIGGER update_civic_entity_ratings_updated_at
  BEFORE UPDATE ON civic_entity_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_realtime_updated_at();

CREATE TRIGGER update_civic_reputation_scores_updated_at
  BEFORE UPDATE ON civic_reputation_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_realtime_updated_at();