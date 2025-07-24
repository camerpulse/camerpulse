-- Create civic reputation tables for the reputation engine

-- Main reputation scores table
CREATE TABLE public.civic_reputation_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'politician', 'ministry', 'village', 'citizen', 'project'
  entity_id UUID NOT NULL,
  entity_name TEXT NOT NULL,
  total_score INTEGER NOT NULL DEFAULT 50,
  score_level TEXT NOT NULL DEFAULT 'average', -- 'excellent', 'good', 'average', 'poor', 'flagged'
  score_trend TEXT NOT NULL DEFAULT 'stable', -- 'rising', 'falling', 'stable'
  transparency_score INTEGER DEFAULT 0,
  performance_score INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  citizen_rating_score INTEGER DEFAULT 0,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id)
);

-- Score sources table (tracks individual contributions to reputation)
CREATE TABLE public.civic_score_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  source_type TEXT NOT NULL, -- 'petition', 'bill_vote', 'project_completion', 'citizen_complaint', etc.
  source_id UUID,
  impact_value INTEGER NOT NULL, -- positive or negative points
  weight NUMERIC(3,2) DEFAULT 1.0,
  description TEXT,
  verification_status TEXT DEFAULT 'pending', -- 'verified', 'pending', 'rejected'
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reputation breakdown by categories
CREATE TABLE public.civic_reputation_breakdown (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  category TEXT NOT NULL, -- 'projects_completed', 'bills_voted', 'citizen_complaints', etc.
  score INTEGER NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2) DEFAULT 0.0,
  data_points INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id, category)
);

-- Reputation flags and issues
CREATE TABLE public.civic_reputation_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  flag_type TEXT NOT NULL, -- 'manipulation', 'bias', 'data_quality', 'fraudulent_activity'
  flag_reason TEXT NOT NULL,
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status TEXT DEFAULT 'active', -- 'active', 'resolved', 'dismissed'
  flagged_by UUID,
  resolved_by UUID,
  resolution_notes TEXT,
  flagged_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- History of reputation score changes
CREATE TABLE public.civic_reputation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  entity_name TEXT NOT NULL,
  old_score INTEGER NOT NULL,
  new_score INTEGER NOT NULL,
  change_reason TEXT,
  calculation_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_civic_reputation_scores_entity ON public.civic_reputation_scores(entity_type, entity_id);
CREATE INDEX idx_civic_reputation_scores_score ON public.civic_reputation_scores(total_score DESC);
CREATE INDEX idx_civic_score_sources_entity ON public.civic_score_sources(entity_type, entity_id);
CREATE INDEX idx_civic_reputation_history_entity ON public.civic_reputation_history(entity_type, entity_id);
CREATE INDEX idx_civic_reputation_history_created ON public.civic_reputation_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.civic_reputation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_score_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_reputation_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_reputation_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_reputation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view reputation scores and breakdowns
CREATE POLICY "Anyone can view reputation scores" ON public.civic_reputation_scores FOR SELECT USING (true);
CREATE POLICY "Anyone can view reputation breakdowns" ON public.civic_reputation_breakdown FOR SELECT USING (true);

-- Users can insert reputation flags
CREATE POLICY "Users can report reputation issues" ON public.civic_reputation_flags FOR INSERT WITH CHECK (auth.uid() = flagged_by);
CREATE POLICY "Anyone can view active flags" ON public.civic_reputation_flags FOR SELECT USING (status = 'active');

-- Admins can manage flags
CREATE POLICY "Admins can manage reputation flags" ON public.civic_reputation_flags FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Anyone can view reputation history
CREATE POLICY "Anyone can view reputation history" ON public.civic_reputation_history FOR SELECT USING (true);

-- System can manage scores and sources (admin only for manual changes)
CREATE POLICY "System can manage reputation scores" ON public.civic_reputation_scores FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "System can manage score sources" ON public.civic_score_sources FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "System can manage reputation breakdowns" ON public.civic_reputation_breakdown FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Function to calculate reputation score
CREATE OR REPLACE FUNCTION public.calculate_civic_reputation_score(
  p_entity_type TEXT,
  p_entity_id UUID
) RETURNS VOID AS $$
DECLARE
  v_total_score INTEGER := 50; -- Base score
  v_score_level TEXT := 'average';
  v_score_trend TEXT := 'stable';
  v_old_score INTEGER;
  v_source_sum INTEGER;
BEGIN
  -- Get current score
  SELECT total_score INTO v_old_score 
  FROM public.civic_reputation_scores 
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id;
  
  -- Calculate new score from verified sources
  SELECT COALESCE(SUM(impact_value * weight), 0) INTO v_source_sum
  FROM public.civic_score_sources 
  WHERE entity_type = p_entity_type 
    AND entity_id = p_entity_id 
    AND verification_status = 'verified';
  
  v_total_score := GREATEST(0, LEAST(100, 50 + v_source_sum));
  
  -- Determine level
  IF v_total_score >= 80 THEN v_score_level := 'excellent';
  ELSIF v_total_score >= 60 THEN v_score_level := 'good';
  ELSIF v_total_score >= 40 THEN v_score_level := 'average';
  ELSIF v_total_score >= 20 THEN v_score_level := 'poor';
  ELSE v_score_level := 'flagged';
  END IF;
  
  -- Determine trend
  IF v_old_score IS NOT NULL THEN
    IF v_total_score > v_old_score + 5 THEN v_score_trend := 'rising';
    ELSIF v_total_score < v_old_score - 5 THEN v_score_trend := 'falling';
    ELSE v_score_trend := 'stable';
    END IF;
  END IF;
  
  -- Upsert score
  INSERT INTO public.civic_reputation_scores (
    entity_type, entity_id, entity_name, total_score, score_level, score_trend
  ) 
  SELECT p_entity_type, p_entity_id, 
    COALESCE((SELECT name FROM public.politicians WHERE id = p_entity_id LIMIT 1), 'Unknown Entity'),
    v_total_score, v_score_level, v_score_trend
  ON CONFLICT (entity_type, entity_id) DO UPDATE SET
    total_score = EXCLUDED.total_score,
    score_level = EXCLUDED.score_level,
    score_trend = EXCLUDED.score_trend,
    last_updated_at = now(),
    updated_at = now();
  
  -- Log history if score changed
  IF v_old_score IS NULL OR v_old_score != v_total_score THEN
    INSERT INTO public.civic_reputation_history (
      entity_type, entity_id, entity_name, old_score, new_score, 
      change_reason, calculation_details
    ) VALUES (
      p_entity_type, p_entity_id,
      COALESCE((SELECT name FROM public.politicians WHERE id = p_entity_id LIMIT 1), 'Unknown Entity'),
      COALESCE(v_old_score, 50), v_total_score,
      'Automatic calculation',
      jsonb_build_object('source_sum', v_source_sum, 'calculated_at', now())
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add score source
CREATE OR REPLACE FUNCTION public.add_civic_score_source(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_source_type TEXT,
  p_source_id UUID,
  p_impact_value INTEGER,
  p_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_source_id UUID;
BEGIN
  -- Insert score source
  INSERT INTO public.civic_score_sources (
    entity_type, entity_id, source_type, source_id, 
    impact_value, description, verification_status
  ) VALUES (
    p_entity_type, p_entity_id, p_source_type, p_source_id,
    p_impact_value, p_description, 'verified'
  ) RETURNING id INTO v_source_id;
  
  -- Recalculate reputation score
  PERFORM public.calculate_civic_reputation_score(p_entity_type, p_entity_id);
  
  RETURN v_source_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_civic_reputation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_civic_reputation_scores_updated_at
  BEFORE UPDATE ON public.civic_reputation_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_civic_reputation_updated_at();

CREATE TRIGGER update_civic_reputation_flags_updated_at
  BEFORE UPDATE ON public.civic_reputation_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_civic_reputation_updated_at();