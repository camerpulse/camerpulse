-- Civic Reputation Engine Database Schema

-- Create reputation score table for all entities
CREATE TABLE public.civic_reputation_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('politician', 'senator', 'minister', 'mayor', 'institution', 'project', 'village', 'user')),
  entity_id UUID NOT NULL,
  entity_name TEXT NOT NULL,
  reputation_score INTEGER NOT NULL DEFAULT 50 CHECK (reputation_score BETWEEN 0 AND 100),
  reputation_level TEXT NOT NULL DEFAULT 'average' CHECK (reputation_level IN ('excellent', 'good', 'average', 'poor', 'critical')),
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  score_trend TEXT DEFAULT 'stable' CHECK (score_trend IN ('rising', 'stable', 'falling')),
  previous_score INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id)
);

-- Create score sources tracking table  
CREATE TABLE public.civic_score_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reputation_id UUID NOT NULL REFERENCES public.civic_reputation_scores(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('bill_passed', 'project_completed', 'petition_support', 'audit_result', 'attendance', 'corruption_flag', 'citizen_rating', 'promise_fulfilled', 'transparency_score')),
  source_reference_id UUID,
  score_impact INTEGER NOT NULL CHECK (score_impact BETWEEN -50 AND 50),
  weight NUMERIC(3,2) DEFAULT 1.0,
  description TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create reputation breakdown table
CREATE TABLE public.civic_reputation_breakdown (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reputation_id UUID NOT NULL REFERENCES public.civic_reputation_scores(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('projects_completed', 'bills_sponsored', 'citizen_complaints', 'promise_fulfillment', 'transparency_audit', 'attendance_score', 'corruption_flags')),
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 100,
  percentage NUMERIC(5,2) DEFAULT 0.0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(reputation_id, category)
);

-- Create reputation flags table
CREATE TABLE public.civic_reputation_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reputation_id UUID NOT NULL REFERENCES public.civic_reputation_scores(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('manipulation', 'fake_data', 'bias', 'spam', 'misinformation')),
  flag_reason TEXT NOT NULL,
  evidence TEXT,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed')),
  flagged_by UUID NOT NULL REFERENCES auth.users(id),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reputation history table for tracking changes
CREATE TABLE public.civic_reputation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reputation_id UUID NOT NULL REFERENCES public.civic_reputation_scores(id) ON DELETE CASCADE,
  old_score INTEGER NOT NULL,
  new_score INTEGER NOT NULL,
  score_change INTEGER NOT NULL,
  change_reason TEXT NOT NULL,
  change_source TEXT NOT NULL,
  calculation_details JSONB DEFAULT '{}',
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_civic_reputation_entity ON public.civic_reputation_scores(entity_type, entity_id);
CREATE INDEX idx_civic_reputation_score ON public.civic_reputation_scores(reputation_score DESC);
CREATE INDEX idx_civic_reputation_level ON public.civic_reputation_scores(reputation_level);
CREATE INDEX idx_civic_score_sources_reputation ON public.civic_score_sources(reputation_id);
CREATE INDEX idx_civic_score_sources_type ON public.civic_score_sources(source_type);
CREATE INDEX idx_civic_reputation_breakdown_reputation ON public.civic_reputation_breakdown(reputation_id);
CREATE INDEX idx_civic_reputation_flags_status ON public.civic_reputation_flags(status);
CREATE INDEX idx_civic_reputation_history_reputation ON public.civic_reputation_history(reputation_id);

-- Enable RLS
ALTER TABLE public.civic_reputation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_score_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_reputation_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_reputation_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_reputation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view reputation scores" 
ON public.civic_reputation_scores FOR SELECT USING (true);

CREATE POLICY "Anyone can view score sources" 
ON public.civic_score_sources FOR SELECT USING (true);

CREATE POLICY "Anyone can view reputation breakdown" 
ON public.civic_reputation_breakdown FOR SELECT USING (true);

CREATE POLICY "Anyone can view reputation history" 
ON public.civic_reputation_history FOR SELECT USING (true);

CREATE POLICY "Users can flag reputation issues" 
ON public.civic_reputation_flags FOR INSERT 
WITH CHECK (auth.uid() = flagged_by);

CREATE POLICY "Anyone can view active flags" 
ON public.civic_reputation_flags FOR SELECT 
USING (status = 'active');

CREATE POLICY "Admins can manage reputation flags" 
ON public.civic_reputation_flags FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Function to calculate reputation score
CREATE OR REPLACE FUNCTION calculate_civic_reputation_score(p_entity_type TEXT, p_entity_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_base_score INTEGER := 50;
  v_total_impact INTEGER := 0;
  v_final_score INTEGER := 50;
  v_reputation_id UUID;
BEGIN
  -- Get or create reputation record
  SELECT id INTO v_reputation_id
  FROM public.civic_reputation_scores
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id;
  
  IF v_reputation_id IS NULL THEN
    INSERT INTO public.civic_reputation_scores (entity_type, entity_id, entity_name)
    VALUES (p_entity_type, p_entity_id, 'Entity ' || p_entity_id)
    RETURNING id INTO v_reputation_id;
  END IF;
  
  -- Calculate weighted score from all sources
  SELECT COALESCE(SUM(score_impact * weight), 0) INTO v_total_impact
  FROM public.civic_score_sources
  WHERE reputation_id = v_reputation_id AND verified = true;
  
  -- Calculate final score
  v_final_score := GREATEST(0, LEAST(100, v_base_score + v_total_impact));
  
  -- Update reputation score
  UPDATE public.civic_reputation_scores
  SET 
    previous_score = reputation_score,
    reputation_score = v_final_score,
    reputation_level = CASE 
      WHEN v_final_score >= 85 THEN 'excellent'
      WHEN v_final_score >= 70 THEN 'good'
      WHEN v_final_score >= 40 THEN 'average'
      WHEN v_final_score >= 20 THEN 'poor'
      ELSE 'critical'
    END,
    score_trend = CASE 
      WHEN v_final_score > reputation_score THEN 'rising'
      WHEN v_final_score < reputation_score THEN 'falling'
      ELSE 'stable'
    END,
    last_calculated_at = now(),
    updated_at = now()
  WHERE id = v_reputation_id;
  
  -- Record history if score changed
  IF (SELECT reputation_score FROM public.civic_reputation_scores WHERE id = v_reputation_id) != v_final_score THEN
    INSERT INTO public.civic_reputation_history (
      reputation_id, old_score, new_score, score_change, 
      change_reason, change_source, calculation_details
    )
    SELECT 
      v_reputation_id,
      previous_score,
      v_final_score,
      v_final_score - previous_score,
      'Automatic calculation',
      'system',
      jsonb_build_object('total_impact', v_total_impact, 'base_score', v_base_score)
    FROM public.civic_reputation_scores
    WHERE id = v_reputation_id;
  END IF;
  
  RETURN v_final_score;
END;
$$;

-- Function to add score source
CREATE OR REPLACE FUNCTION add_civic_score_source(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_source_type TEXT,
  p_score_impact INTEGER,
  p_description TEXT,
  p_source_reference_id UUID DEFAULT NULL,
  p_weight NUMERIC DEFAULT 1.0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reputation_id UUID;
  v_source_id UUID;
BEGIN
  -- Ensure reputation record exists
  SELECT id INTO v_reputation_id
  FROM public.civic_reputation_scores
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id;
  
  IF v_reputation_id IS NULL THEN
    INSERT INTO public.civic_reputation_scores (entity_type, entity_id, entity_name)
    VALUES (p_entity_type, p_entity_id, 'Entity ' || p_entity_id)
    RETURNING id INTO v_reputation_id;
  END IF;
  
  -- Add score source
  INSERT INTO public.civic_score_sources (
    reputation_id, source_type, source_reference_id,
    score_impact, weight, description, verified, created_by
  )
  VALUES (
    v_reputation_id, p_source_type, p_source_reference_id,
    p_score_impact, p_weight, p_description, true, auth.uid()
  )
  RETURNING id INTO v_source_id;
  
  -- Recalculate reputation score
  PERFORM calculate_civic_reputation_score(p_entity_type, p_entity_id);
  
  RETURN v_source_id;
END;
$$;

-- Create triggers
CREATE TRIGGER update_civic_reputation_scores_updated_at
BEFORE UPDATE ON public.civic_reputation_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_civic_reputation_flags_updated_at
BEFORE UPDATE ON public.civic_reputation_flags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();