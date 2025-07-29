-- Auto-Tuning Patch Engine Tables

-- Table for tracking all patch attempts and outcomes
CREATE TABLE public.ashen_patch_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patch_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  patch_type TEXT NOT NULL, -- 'syntax', 'logic', 'ui', 'plugin', 'security'
  original_code TEXT,
  patched_code TEXT,
  patch_reasoning TEXT,
  outcome TEXT NOT NULL DEFAULT 'pending', -- 'accepted', 'edited', 'rolled_back', 'pending'
  admin_response_time_seconds INTEGER,
  fix_trust_score NUMERIC DEFAULT 50.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  applied_by TEXT DEFAULT 'ashen_auto_healer',
  admin_feedback TEXT,
  rollback_reason TEXT
);

-- Table for storing coding style patterns learned from admin behavior
CREATE TABLE public.ashen_style_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_category TEXT NOT NULL, -- 'naming', 'indentation', 'commenting', 'data_flow', 'structure'
  pattern_description TEXT NOT NULL,
  pattern_example JSONB,
  confidence_score NUMERIC DEFAULT 0.0,
  usage_frequency INTEGER DEFAULT 0,
  last_observed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Table for storing personal patch patterns that work well
CREATE TABLE public.ashen_personal_patch_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_name TEXT NOT NULL,
  problem_signature TEXT NOT NULL, -- Hash or description of the problem type
  solution_template TEXT NOT NULL,
  success_rate NUMERIC DEFAULT 0.0,
  usage_count INTEGER DEFAULT 0,
  avg_response_time_seconds NUMERIC DEFAULT 0.0,
  stability_score NUMERIC DEFAULT 0.0, -- Based on rollback rate
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used TIMESTAMP WITH TIME ZONE,
  admin_approved BOOLEAN DEFAULT false
);

-- Table for tracking unstable patterns that should be avoided
CREATE TABLE public.ashen_unstable_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_signature TEXT NOT NULL,
  pattern_description TEXT,
  failure_count INTEGER DEFAULT 0,
  rollback_count INTEGER DEFAULT 0,
  last_failure TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  is_permanently_blocked BOOLEAN DEFAULT false,
  admin_notes TEXT
);

-- Table for Fix Trust Scoring
CREATE TABLE public.ashen_fix_trust_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fix_type TEXT NOT NULL,
  total_attempts INTEGER DEFAULT 0,
  successful_fixes INTEGER DEFAULT 0,
  rollbacks INTEGER DEFAULT 0,
  manual_overrides INTEGER DEFAULT 0,
  auto_confirmations INTEGER DEFAULT 0,
  current_trust_score NUMERIC DEFAULT 50.0,
  trend_direction TEXT DEFAULT 'stable', -- 'improving', 'declining', 'stable'
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_patch_history_file_path ON public.ashen_patch_history(file_path);
CREATE INDEX idx_patch_history_outcome ON public.ashen_patch_history(outcome);
CREATE INDEX idx_patch_history_created_at ON public.ashen_patch_history(created_at);
CREATE INDEX idx_style_patterns_category ON public.ashen_style_patterns(pattern_category);
CREATE INDEX idx_personal_patch_problem ON public.ashen_personal_patch_index(problem_signature);
CREATE INDEX idx_unstable_patterns_signature ON public.ashen_unstable_patterns(pattern_signature);
CREATE INDEX idx_fix_trust_type ON public.ashen_fix_trust_metrics(fix_type);

-- Enable RLS
ALTER TABLE public.ashen_patch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_style_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_personal_patch_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_unstable_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_fix_trust_metrics ENABLE ROW LEVEL SECURITY;

-- Create admin-only policies
CREATE POLICY "Admins can manage patch history" ON public.ashen_patch_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage style patterns" ON public.ashen_style_patterns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage personal patch index" ON public.ashen_personal_patch_index
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage unstable patterns" ON public.ashen_unstable_patterns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage fix trust metrics" ON public.ashen_fix_trust_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to calculate fix trust score
CREATE OR REPLACE FUNCTION public.calculate_fix_trust_score(
  p_fix_type TEXT
) RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_attempts INTEGER := 0;
  successful_fixes INTEGER := 0;
  rollbacks INTEGER := 0;
  manual_overrides INTEGER := 0;
  auto_confirmations INTEGER := 0;
  trust_score NUMERIC := 50.0;
BEGIN
  -- Get metrics for this fix type
  SELECT 
    COALESCE(SUM(CASE WHEN outcome IN ('accepted') THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN outcome = 'rolled_back' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN outcome = 'edited' THEN 1 ELSE 0 END), 0),
    COALESCE(COUNT(*), 0)
  INTO successful_fixes, rollbacks, manual_overrides, total_attempts
  FROM public.ashen_patch_history
  WHERE patch_type = p_fix_type
    AND created_at >= NOW() - INTERVAL '30 days';

  -- Calculate trust score
  IF total_attempts > 0 THEN
    trust_score := (
      (successful_fixes * 1.0) + 
      (manual_overrides * 0.5) - 
      (rollbacks * 1.5)
    ) / total_attempts * 100;
    
    -- Ensure score is between 0 and 100
    trust_score := GREATEST(0, LEAST(100, trust_score));
  END IF;

  -- Update or insert metrics
  INSERT INTO public.ashen_fix_trust_metrics (
    fix_type, total_attempts, successful_fixes, rollbacks, 
    manual_overrides, auto_confirmations, current_trust_score
  ) VALUES (
    p_fix_type, total_attempts, successful_fixes, rollbacks,
    manual_overrides, auto_confirmations, trust_score
  )
  ON CONFLICT (fix_type) DO UPDATE SET
    total_attempts = EXCLUDED.total_attempts,
    successful_fixes = EXCLUDED.successful_fixes,
    rollbacks = EXCLUDED.rollbacks,
    manual_overrides = EXCLUDED.manual_overrides,
    current_trust_score = EXCLUDED.current_trust_score,
    last_calculated = now(),
    updated_at = now();

  RETURN trust_score;
END;
$$;

-- Function to learn from manual fixes
CREATE OR REPLACE FUNCTION public.learn_from_manual_fix(
  p_file_path TEXT,
  p_original_code TEXT,
  p_fixed_code TEXT,
  p_problem_description TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pattern_id UUID;
  problem_sig TEXT;
BEGIN
  -- Create a signature for this type of problem
  problem_sig := md5(p_problem_description || p_file_path);
  
  -- Insert into personal patch index
  INSERT INTO public.ashen_personal_patch_index (
    pattern_name,
    problem_signature,
    solution_template,
    admin_approved
  ) VALUES (
    'Manual Fix: ' || p_problem_description,
    problem_sig,
    p_fixed_code,
    true
  ) RETURNING id INTO pattern_id;
  
  RETURN pattern_id;
END;
$$;

-- Add trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_ashen_learning_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patch_history_timestamp
  BEFORE UPDATE ON public.ashen_patch_history
  FOR EACH ROW EXECUTE FUNCTION public.update_ashen_learning_timestamp();

CREATE TRIGGER update_style_patterns_timestamp
  BEFORE UPDATE ON public.ashen_style_patterns
  FOR EACH ROW EXECUTE FUNCTION public.update_ashen_learning_timestamp();

CREATE TRIGGER update_personal_patch_timestamp
  BEFORE UPDATE ON public.ashen_personal_patch_index
  FOR EACH ROW EXECUTE FUNCTION public.update_ashen_learning_timestamp();

CREATE TRIGGER update_fix_trust_timestamp
  BEFORE UPDATE ON public.ashen_fix_trust_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_ashen_learning_timestamp();