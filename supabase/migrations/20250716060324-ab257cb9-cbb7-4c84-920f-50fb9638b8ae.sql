-- Enable verified political profiles to create and respond to polls

-- Add poll-related fields to politicians table
ALTER TABLE politicians ADD COLUMN IF NOT EXISTS can_create_polls BOOLEAN DEFAULT false;
ALTER TABLE politicians ADD COLUMN IF NOT EXISTS poll_creation_count INTEGER DEFAULT 0;
ALTER TABLE politicians ADD COLUMN IF NOT EXISTS last_poll_created_at TIMESTAMP WITH TIME ZONE;

-- Add politician responses table for civic poll engagement
CREATE TABLE IF NOT EXISTS public.politician_poll_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  politician_id UUID NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  response_type TEXT DEFAULT 'statement' CHECK (response_type IN ('statement', 'commitment', 'clarification', 'opposition')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'supporters_only', 'internal')),
  is_official_position BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  sentiment_score NUMERIC(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  engagement_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(politician_id, poll_id)
);

-- Enable RLS on politician poll responses
ALTER TABLE politician_poll_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies for politician poll responses
CREATE POLICY "Public responses are viewable by everyone" ON politician_poll_responses
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Verified politicians can manage their responses" ON politician_poll_responses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM politicians 
      WHERE id = politician_poll_responses.politician_id 
      AND user_id = auth.uid() 
      AND verified = true
      AND is_claimed = true
    )
  );

CREATE POLICY "Admins can manage all responses" ON politician_poll_responses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create poll impact tracking table
CREATE TABLE IF NOT EXISTS public.poll_impact_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  politician_id UUID REFERENCES politicians(id) ON DELETE SET NULL,
  party_id UUID REFERENCES political_parties(id) ON DELETE SET NULL,
  impact_type TEXT NOT NULL CHECK (impact_type IN ('rating_change', 'civic_score_change', 'engagement_boost', 'controversy')),
  impact_value NUMERIC(10,2),
  impact_direction TEXT CHECK (impact_direction IN ('positive', 'negative', 'neutral')),
  confidence_score NUMERIC(3,2) DEFAULT 0.5,
  region_affected TEXT,
  demographic_affected TEXT,
  impact_details JSONB DEFAULT '{}',
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on poll impact tracking
ALTER TABLE poll_impact_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policy for poll impact tracking
CREATE POLICY "Impact tracking viewable by all" ON poll_impact_tracking
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage impact tracking" ON poll_impact_tracking
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_politician_poll_responses_politician ON politician_poll_responses(politician_id);
CREATE INDEX IF NOT EXISTS idx_politician_poll_responses_poll ON politician_poll_responses(poll_id);
CREATE INDEX IF NOT EXISTS idx_politician_poll_responses_visibility ON politician_poll_responses(visibility);
CREATE INDEX IF NOT EXISTS idx_poll_impact_tracking_poll ON poll_impact_tracking(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_impact_tracking_politician ON poll_impact_tracking(politician_id);
CREATE INDEX IF NOT EXISTS idx_poll_impact_tracking_party ON poll_impact_tracking(party_id);

-- Function to update politician ratings based on poll outcomes
CREATE OR REPLACE FUNCTION public.update_politician_ratings_from_poll(
  p_poll_id UUID,
  p_politician_id UUID,
  p_rating_impact NUMERIC DEFAULT 0.0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_civic_score NUMERIC;
  current_performance_score NUMERIC;
  impact_record RECORD;
BEGIN
  -- Get current scores
  SELECT civic_score, performance_score
  INTO current_civic_score, current_performance_score
  FROM politicians
  WHERE id = p_politician_id;
  
  -- Calculate new scores
  current_civic_score := COALESCE(current_civic_score, 50.0);
  current_performance_score := COALESCE(current_performance_score, 50.0);
  
  -- Apply impact (cap between 0 and 100)
  current_civic_score := GREATEST(0, LEAST(100, current_civic_score + p_rating_impact));
  current_performance_score := GREATEST(0, LEAST(100, current_performance_score + (p_rating_impact * 0.7)));
  
  -- Update politician scores
  UPDATE politicians 
  SET 
    civic_score = current_civic_score,
    performance_score = current_performance_score,
    updated_at = now()
  WHERE id = p_politician_id;
  
  -- Record the impact
  INSERT INTO poll_impact_tracking (
    poll_id,
    politician_id,
    impact_type,
    impact_value,
    impact_direction,
    confidence_score,
    impact_details
  ) VALUES (
    p_poll_id,
    p_politician_id,
    'rating_change',
    ABS(p_rating_impact),
    CASE 
      WHEN p_rating_impact > 0 THEN 'positive'
      WHEN p_rating_impact < 0 THEN 'negative'
      ELSE 'neutral'
    END,
    0.8,
    jsonb_build_object(
      'civic_score_change', p_rating_impact,
      'performance_score_change', p_rating_impact * 0.7,
      'new_civic_score', current_civic_score,
      'new_performance_score', current_performance_score
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'new_civic_score', current_civic_score,
    'new_performance_score', current_performance_score,
    'impact_applied', p_rating_impact
  );
END;
$$;

-- Function to enable poll creation for verified politicians
CREATE OR REPLACE FUNCTION public.enable_politician_poll_creation(
  p_politician_id UUID,
  p_admin_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if requester is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = p_admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Enable poll creation for verified politician
  UPDATE politicians
  SET 
    can_create_polls = true,
    updated_at = now()
  WHERE id = p_politician_id 
    AND verified = true 
    AND is_claimed = true;
  
  RETURN FOUND;
END;
$$;