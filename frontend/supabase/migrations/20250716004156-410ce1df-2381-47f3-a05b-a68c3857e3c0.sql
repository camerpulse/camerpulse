-- Create missing tables for AI Civic Strategist Core

-- Table for storing civic problems and analysis
CREATE TABLE public.civic_strategy_problems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_title TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  problem_category TEXT NOT NULL DEFAULT 'governance',
  target_region TEXT,
  target_demographics JSONB DEFAULT '[]',
  urgency_level TEXT NOT NULL DEFAULT 'medium',
  volatility_score INTEGER DEFAULT 3,
  root_causes JSONB DEFAULT '[]',
  impact_groups JSONB DEFAULT '[]',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for storing generated strategies
CREATE TABLE public.civic_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID REFERENCES public.civic_strategy_problems(id) ON DELETE CASCADE,
  strategy_title TEXT NOT NULL,
  short_term_actions JSONB DEFAULT '[]',
  long_term_reforms JSONB DEFAULT '[]',
  policy_suggestions JSONB DEFAULT '[]',
  digital_tools JSONB DEFAULT '[]',
  leadership_recommendations JSONB DEFAULT '{}',
  implementation_timeline JSONB DEFAULT '{}',
  success_metrics JSONB DEFAULT '[]',
  is_public BOOLEAN NOT NULL DEFAULT false,
  visibility_level TEXT NOT NULL DEFAULT 'admin_only',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for tracking strategy execution
CREATE TABLE public.strategy_execution_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_id UUID REFERENCES public.civic_strategies(id) ON DELETE CASCADE,
  execution_phase TEXT NOT NULL,
  phase_status TEXT NOT NULL DEFAULT 'planning',
  progress_percentage INTEGER DEFAULT 0,
  milestones_completed JSONB DEFAULT '[]',
  challenges_encountered JSONB DEFAULT '[]',
  impact_measurements JSONB DEFAULT '{}',
  public_feedback JSONB DEFAULT '[]',
  executed_by UUID,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for civic simulation results
CREATE TABLE public.civic_simulation_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  simulation_scenario TEXT NOT NULL,
  input_parameters JSONB NOT NULL,
  predicted_outcomes JSONB DEFAULT '{}',
  risk_factors JSONB DEFAULT '[]',
  mitigation_strategies JSONB DEFAULT '[]',
  confidence_score NUMERIC DEFAULT 0.0,
  simulation_type TEXT NOT NULL DEFAULT 'impact_analysis',
  timeframe_years INTEGER DEFAULT 1,
  affected_regions TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for campaign templates and toolkits
CREATE TABLE public.civic_campaign_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL, -- sms, social_media, education, townhall
  target_audience TEXT NOT NULL,
  platform TEXT, -- whatsapp, tiktok, youtube, physical
  content_template JSONB NOT NULL,
  engagement_metrics JSONB DEFAULT '{}',
  success_stories JSONB DEFAULT '[]',
  customization_options JSONB DEFAULT '{}',
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.civic_strategy_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_simulation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_campaign_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage civic strategy problems" ON public.civic_strategy_problems
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage civic strategies" ON public.civic_strategies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Public can view public strategies" ON public.civic_strategies
  FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage execution logs" ON public.strategy_execution_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage simulation results" ON public.civic_simulation_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage campaign templates" ON public.civic_campaign_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_civic_strategy_problems_category ON public.civic_strategy_problems(problem_category);
CREATE INDEX idx_civic_strategy_problems_region ON public.civic_strategy_problems(target_region);
CREATE INDEX idx_civic_strategies_public ON public.civic_strategies(is_public);
CREATE INDEX idx_strategy_execution_status ON public.strategy_execution_logs(phase_status);
CREATE INDEX idx_simulation_type ON public.civic_simulation_results(simulation_type);
CREATE INDEX idx_campaign_templates_type ON public.civic_campaign_templates(template_type);

-- Create triggers for updating timestamps
CREATE TRIGGER update_civic_strategy_problems_updated_at
  BEFORE UPDATE ON public.civic_strategy_problems
  FOR EACH ROW EXECUTE FUNCTION public.update_ashen_timestamp();

CREATE TRIGGER update_civic_strategies_updated_at
  BEFORE UPDATE ON public.civic_strategies
  FOR EACH ROW EXECUTE FUNCTION public.update_ashen_timestamp();

CREATE TRIGGER update_civic_campaign_templates_updated_at
  BEFORE UPDATE ON public.civic_campaign_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_ashen_timestamp();

-- Function to get civic strategy dashboard stats
CREATE OR REPLACE FUNCTION public.get_civic_strategy_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{}';
  active_problems INTEGER;
  pending_strategies INTEGER;
  public_strategies INTEGER;
  recent_simulations INTEGER;
BEGIN
  -- Count active problems
  SELECT COUNT(*) INTO active_problems
  FROM public.civic_strategy_problems
  WHERE created_at > CURRENT_DATE - INTERVAL '30 days';
  
  -- Count pending strategies
  SELECT COUNT(*) INTO pending_strategies
  FROM public.civic_strategies cs
  JOIN public.strategy_execution_logs sel ON cs.id = sel.strategy_id
  WHERE sel.phase_status IN ('planning', 'in_progress');
  
  -- Count public strategies
  SELECT COUNT(*) INTO public_strategies
  FROM public.civic_strategies
  WHERE is_public = true;
  
  -- Count recent simulations
  SELECT COUNT(*) INTO recent_simulations
  FROM public.civic_simulation_results
  WHERE created_at > CURRENT_DATE - INTERVAL '7 days';
  
  result := jsonb_build_object(
    'active_problems', active_problems,
    'pending_strategies', pending_strategies,
    'public_strategies', public_strategies,
    'recent_simulations', recent_simulations,
    'last_updated', now()
  );
  
  RETURN result;
END;
$$;