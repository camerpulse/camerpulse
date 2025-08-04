-- Create Plugin Stress & Compatibility Watchdog tables

-- Plugin Registry table
CREATE TABLE public.plugin_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plugin_name TEXT NOT NULL,
  plugin_author TEXT,
  plugin_version TEXT NOT NULL,
  plugin_status TEXT NOT NULL DEFAULT 'active', -- active, disabled, pending, blocked
  plugin_type TEXT NOT NULL DEFAULT 'component', -- component, module, extension, theme
  install_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  file_paths TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  routes_introduced TEXT[] DEFAULT ARRAY[]::TEXT[],
  dependencies_used JSONB DEFAULT '{}'::JSONB,
  api_endpoints TEXT[] DEFAULT ARRAY[]::TEXT[],
  database_migrations TEXT[] DEFAULT ARRAY[]::TEXT[],
  global_variables TEXT[] DEFAULT ARRAY[]::TEXT[],
  css_overrides TEXT[] DEFAULT ARRAY[]::TEXT[],
  component_overrides TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::JSONB,
  plugin_risk_score INTEGER DEFAULT 0 CHECK (plugin_risk_score >= 0 AND plugin_risk_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Plugin Conflict Detection table
CREATE TABLE public.plugin_conflicts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plugin_a_id UUID NOT NULL REFERENCES public.plugin_registry(id) ON DELETE CASCADE,
  plugin_b_id UUID NOT NULL REFERENCES public.plugin_registry(id) ON DELETE CASCADE,
  conflict_type TEXT NOT NULL, -- route_collision, component_override, global_variable, dependency_conflict, api_collision
  conflict_severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  conflict_description TEXT NOT NULL,
  affected_resources TEXT[] DEFAULT ARRAY[]::TEXT[],
  resolution_suggestion TEXT,
  auto_resolvable BOOLEAN DEFAULT false,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Plugin Stress Test Results table
CREATE TABLE public.plugin_stress_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plugin_id UUID NOT NULL REFERENCES public.plugin_registry(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL, -- load_test, ui_test, api_test, mobile_test, network_test
  test_scenario TEXT NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'desktop', -- desktop, mobile, tablet
  network_condition TEXT NOT NULL DEFAULT '4g', -- 3g, 4g, 5g, wifi, slow
  screen_resolution TEXT NOT NULL DEFAULT '1920x1080',
  test_duration_ms INTEGER,
  memory_usage_mb NUMERIC,
  cpu_usage_percent NUMERIC,
  render_time_ms INTEGER,
  error_count INTEGER DEFAULT 0,
  crash_detected BOOLEAN DEFAULT false,
  memory_leak_detected BOOLEAN DEFAULT false,
  test_result TEXT NOT NULL DEFAULT 'pending', -- passed, failed, warning, error
  performance_score INTEGER DEFAULT 0 CHECK (performance_score >= 0 AND performance_score <= 100),
  test_details JSONB DEFAULT '{}'::JSONB,
  error_logs JSONB DEFAULT '[]'::JSONB,
  screenshot_url TEXT,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Plugin Risk Assessment table
CREATE TABLE public.plugin_risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plugin_id UUID NOT NULL REFERENCES public.plugin_registry(id) ON DELETE CASCADE,
  assessment_version INTEGER NOT NULL DEFAULT 1,
  security_score INTEGER DEFAULT 50 CHECK (security_score >= 0 AND security_score <= 100),
  stability_score INTEGER DEFAULT 50 CHECK (stability_score >= 0 AND stability_score <= 100),
  performance_score INTEGER DEFAULT 50 CHECK (performance_score >= 0 AND performance_score <= 100),
  compatibility_score INTEGER DEFAULT 50 CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  overall_risk_score INTEGER DEFAULT 50 CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
  risk_factors JSONB DEFAULT '[]'::JSONB,
  recommendations JSONB DEFAULT '[]'::JSONB,
  assessed_by TEXT DEFAULT 'auto_assessment',
  assessment_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Plugin Installation Guards table
CREATE TABLE public.plugin_installation_guards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plugin_id UUID NOT NULL REFERENCES public.plugin_registry(id) ON DELETE CASCADE,
  installation_blocked BOOLEAN DEFAULT false,
  block_reason TEXT,
  admin_override_required BOOLEAN DEFAULT false,
  admin_override_by UUID,
  admin_override_reason TEXT,
  pre_install_checks JSONB DEFAULT '{}'::JSONB,
  post_install_verification JSONB DEFAULT '{}'::JSONB,
  rollback_plan JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add configuration entries for Plugin Watchdog
INSERT INTO public.ashen_monitoring_config (config_key, config_value, is_active, updated_at)
VALUES 
  ('plugin_watchdog_enabled', 'true', true, now()),
  ('block_high_risk_plugins', 'true', true, now()),
  ('auto_simulation_after_install', 'true', true, now()),
  ('plugin_risk_threshold', '70', true, now()),
  ('stress_test_frequency_hours', '168', true, now()), -- Weekly
  ('conflict_detection_enabled', 'true', true, now())
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  updated_at = EXCLUDED.updated_at;

-- Create indexes for performance
CREATE INDEX idx_plugin_registry_status ON public.plugin_registry(plugin_status);
CREATE INDEX idx_plugin_registry_risk_score ON public.plugin_registry(plugin_risk_score);
CREATE INDEX idx_plugin_conflicts_severity ON public.plugin_conflicts(conflict_severity);
CREATE INDEX idx_plugin_stress_tests_plugin_id ON public.plugin_stress_tests(plugin_id);
CREATE INDEX idx_plugin_stress_tests_result ON public.plugin_stress_tests(test_result);
CREATE INDEX idx_plugin_risk_assessments_plugin_id ON public.plugin_risk_assessments(plugin_id);

-- Enable RLS
ALTER TABLE public.plugin_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_stress_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_installation_guards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage plugin registry" ON public.plugin_registry
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage plugin conflicts" ON public.plugin_conflicts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage plugin stress tests" ON public.plugin_stress_tests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage plugin risk assessments" ON public.plugin_risk_assessments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage plugin installation guards" ON public.plugin_installation_guards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to calculate plugin risk score
CREATE OR REPLACE FUNCTION public.calculate_plugin_risk_score(p_plugin_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  risk_score INTEGER := 0;
  conflict_count INTEGER;
  failed_tests INTEGER;
  latest_assessment RECORD;
BEGIN
  -- Get conflict count
  SELECT COUNT(*) INTO conflict_count
  FROM public.plugin_conflicts
  WHERE (plugin_a_id = p_plugin_id OR plugin_b_id = p_plugin_id)
    AND resolved_at IS NULL;
  
  -- Get failed test count
  SELECT COUNT(*) INTO failed_tests
  FROM public.plugin_stress_tests
  WHERE plugin_id = p_plugin_id
    AND test_result IN ('failed', 'error')
    AND executed_at >= NOW() - INTERVAL '7 days';
  
  -- Get latest risk assessment
  SELECT * INTO latest_assessment
  FROM public.plugin_risk_assessments
  WHERE plugin_id = p_plugin_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Calculate base risk from assessment
  IF latest_assessment.overall_risk_score IS NOT NULL THEN
    risk_score := latest_assessment.overall_risk_score;
  ELSE
    risk_score := 50; -- Default medium risk
  END IF;
  
  -- Add conflict penalty
  risk_score := risk_score + (conflict_count * 10);
  
  -- Add failed test penalty
  risk_score := risk_score + (failed_tests * 5);
  
  -- Cap at 100
  IF risk_score > 100 THEN
    risk_score := 100;
  END IF;
  
  -- Update plugin registry
  UPDATE public.plugin_registry
  SET plugin_risk_score = risk_score
  WHERE id = p_plugin_id;
  
  RETURN risk_score;
END;
$$;