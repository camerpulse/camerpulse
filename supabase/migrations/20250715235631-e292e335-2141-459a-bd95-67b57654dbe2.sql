-- Intelligence Strategy Engine Tables

-- Strategy problems submitted by admins
CREATE TABLE public.strategy_problems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_title TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  problem_category TEXT NOT NULL DEFAULT 'governance',
  target_audience TEXT[] DEFAULT ARRAY['citizens'],
  priority_level INTEGER DEFAULT 3,
  submitted_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'analyzing',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Generated strategy solutions
CREATE TABLE public.strategy_solutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID NOT NULL REFERENCES public.strategy_problems(id) ON DELETE CASCADE,
  solution_title TEXT NOT NULL,
  solution_overview TEXT NOT NULL,
  recommended_features JSONB DEFAULT '[]'::JSONB,
  data_requirements JSONB DEFAULT '{}'::JSONB,
  user_flows JSONB DEFAULT '[]'::JSONB,
  dashboard_specs JSONB DEFAULT '{}'::JSONB,
  integration_suggestions JSONB DEFAULT '[]'::JSONB,
  engagement_strategy JSONB DEFAULT '{}'::JSONB,
  timeline_estimate TEXT,
  complexity_score INTEGER DEFAULT 5,
  confidence_score NUMERIC DEFAULT 0.8,
  build_ready_prompt TEXT,
  export_formats JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Strategy implementation tracking
CREATE TABLE public.strategy_implementations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id UUID NOT NULL REFERENCES public.strategy_solutions(id) ON DELETE CASCADE,
  implementation_status TEXT NOT NULL DEFAULT 'planned',
  progress_percentage INTEGER DEFAULT 0,
  implemented_features TEXT[] DEFAULT ARRAY[]::TEXT[],
  public_feedback JSONB DEFAULT '{}'::JSONB,
  success_metrics JSONB DEFAULT '{}'::JSONB,
  lessons_learned TEXT,
  deployed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Strategy knowledge base for patterns
CREATE TABLE public.strategy_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_name TEXT NOT NULL,
  pattern_category TEXT NOT NULL,
  problem_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  solution_template JSONB NOT NULL DEFAULT '{}',
  success_rate NUMERIC DEFAULT 0.0,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.strategy_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_implementations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage strategy problems" ON public.strategy_problems
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage strategy solutions" ON public.strategy_solutions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage strategy implementations" ON public.strategy_implementations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage strategy patterns" ON public.strategy_patterns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX idx_strategy_problems_category ON public.strategy_problems(problem_category);
CREATE INDEX idx_strategy_problems_status ON public.strategy_problems(status);
CREATE INDEX idx_strategy_solutions_problem_id ON public.strategy_solutions(problem_id);
CREATE INDEX idx_strategy_implementations_solution_id ON public.strategy_implementations(solution_id);
CREATE INDEX idx_strategy_patterns_category ON public.strategy_patterns(pattern_category);

-- Triggers for updated_at
CREATE TRIGGER update_strategy_problems_updated_at
  BEFORE UPDATE ON public.strategy_problems
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategy_solutions_updated_at
  BEFORE UPDATE ON public.strategy_solutions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategy_implementations_updated_at
  BEFORE UPDATE ON public.strategy_implementations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategy_patterns_updated_at
  BEFORE UPDATE ON public.strategy_patterns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to analyze strategy problem and generate solutions
CREATE OR REPLACE FUNCTION public.analyze_strategy_problem(
  p_problem_id UUID,
  p_problem_description TEXT,
  p_category TEXT DEFAULT 'governance'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  solution_blueprint JSONB := '{}';
  related_patterns RECORD;
  complexity_score INTEGER := 3;
BEGIN
  -- Basic complexity analysis
  IF p_problem_description ILIKE '%election%' OR p_problem_description ILIKE '%voting%' THEN
    complexity_score := complexity_score + 2;
  END IF;
  
  IF p_problem_description ILIKE '%corruption%' OR p_problem_description ILIKE '%fraud%' THEN
    complexity_score := complexity_score + 3;
  END IF;
  
  IF p_problem_description ILIKE '%youth%' OR p_problem_description ILIKE '%engagement%' THEN
    complexity_score := complexity_score + 1;
  END IF;

  -- Find related patterns
  FOR related_patterns IN
    SELECT pattern_name, solution_template, success_rate
    FROM public.strategy_patterns
    WHERE p_category = ANY(problem_types) AND is_active = true
    ORDER BY success_rate DESC, usage_count DESC
    LIMIT 3
  LOOP
    solution_blueprint := solution_blueprint || jsonb_build_object(
      'related_patterns',
      COALESCE(solution_blueprint->'related_patterns', '[]'::jsonb) ||
      jsonb_build_object(
        'name', related_patterns.pattern_name,
        'template', related_patterns.solution_template,
        'success_rate', related_patterns.success_rate
      )
    );
  END LOOP;

  -- Build solution blueprint
  solution_blueprint := solution_blueprint || jsonb_build_object(
    'complexity_score', LEAST(complexity_score, 10),
    'analysis_timestamp', now(),
    'recommended_layers', jsonb_build_array(
      'dashboard_layer',
      'fact_check_layer', 
      'sentiment_layer',
      'integration_layer',
      'engagement_layer'
    )
  );

  RETURN solution_blueprint;
END;
$$;

-- Insert sample strategy patterns
INSERT INTO public.strategy_patterns (pattern_name, pattern_category, problem_types, solution_template) VALUES
('Election Monitoring Framework', 'elections', ARRAY['elections', 'voting', 'transparency'], 
 '{"features": ["candidate_tracker", "promise_monitor", "sentiment_analysis"], "integrations": ["social_media", "news_apis"], "dashboards": ["public_metrics", "admin_alerts"]}'::JSONB),
('Corruption Detection System', 'governance', ARRAY['corruption', 'fraud', 'accountability'],
 '{"features": ["budget_tracker", "contract_monitor", "whistleblower_portal"], "integrations": ["financial_apis", "procurement_systems"], "dashboards": ["risk_alerts", "investigation_board"]}'::JSONB),
('Youth Engagement Platform', 'engagement', ARRAY['youth', 'education', 'participation'],
 '{"features": ["gamified_voting", "civic_education", "peer_discussion"], "integrations": ["social_platforms", "educational_content"], "dashboards": ["engagement_metrics", "learning_progress"]}'::JSONB);