-- Expand ashen_auto_healing_history to track admin feedback
ALTER TABLE public.ashen_auto_healing_history 
ADD COLUMN admin_feedback TEXT, -- 'approved', 'rejected', 'modified'
ADD COLUMN admin_feedback_reason TEXT,
ADD COLUMN admin_id UUID,
ADD COLUMN learning_weight NUMERIC DEFAULT 1.0; -- How much this example should influence learning

-- Create ashen_learning_insights table for advanced pattern recognition
CREATE TABLE public.ashen_learning_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_type TEXT NOT NULL, -- 'coding_style', 'ui_pattern', 'fix_strategy', 'component_structure'
  pattern_name TEXT NOT NULL,
  pattern_description TEXT,
  confidence_score NUMERIC DEFAULT 0.0,
  usage_frequency INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 0.0,
  example_cases JSONB DEFAULT '[]',
  learned_rules JSONB DEFAULT '{}',
  applicable_contexts JSONB DEFAULT '{}', -- When this pattern applies
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_applied TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.ashen_learning_insights ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage learning insights" 
ON public.ashen_learning_insights 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create indexes
CREATE INDEX idx_ashen_learning_insights_type ON public.ashen_learning_insights(insight_type);
CREATE INDEX idx_ashen_learning_insights_confidence ON public.ashen_learning_insights(confidence_score);
CREATE INDEX idx_ashen_learning_insights_success_rate ON public.ashen_learning_insights(success_rate);
CREATE INDEX idx_ashen_learning_insights_updated_at ON public.ashen_learning_insights(updated_at);

-- Create trigger for updated_at
CREATE TRIGGER update_ashen_learning_insights_updated_at
  BEFORE UPDATE ON public.ashen_learning_insights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert learning engine configuration
INSERT INTO public.ashen_monitoring_config (config_key, config_value, is_active)
VALUES 
  ('learning_engine_enabled', 'true', true),
  ('learning_confidence_threshold', '0.7', true),
  ('learning_auto_apply_patterns', 'false', true),
  ('learning_max_pattern_age_days', '30', true),
  ('learning_min_examples_for_pattern', '3', true),
  ('learning_last_training_run', 'null', true)
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  updated_at = now();

-- Create some initial learning patterns based on CamerPulse structure
INSERT INTO public.ashen_learning_insights (insight_type, pattern_name, pattern_description, confidence_score, learned_rules, applicable_contexts) VALUES
(
  'coding_style',
  'CamerPulse Import Structure',
  'Preferred import organization for CamerPulse components',
  0.85,
  '{
    "import_order": ["react", "ui_components", "hooks", "utils", "types"],
    "prefer_named_imports": true,
    "group_related_imports": true,
    "use_absolute_paths": true
  }',
  '{"file_types": ["tsx", "ts"], "project_context": "camerpulse"}'
),
(
  'ui_pattern',
  'CamerPulse Card Layout',
  'Standard card layout pattern for political content',
  0.90,
  '{
    "structure": {
      "container": "Card with border-l-4 border-l-primary",
      "header": "CardHeader with politician info",
      "content": "CardContent with stats and actions",
      "footer": "Optional CardFooter with metadata"
    },
    "responsive_classes": ["grid-cols-1", "sm:grid-cols-2", "md:grid-cols-3"],
    "common_props": ["loading_state", "error_boundary", "accessibility"]
  }',
  '{"components": ["PoliticianCard", "PartyCard", "PollCard"], "pages": ["/politicians", "/parties", "/polls"]}'
),
(
  'fix_strategy',
  'Mobile First Responsive Fix',
  'Standard approach for fixing mobile layout issues',
  0.88,
  '{
    "strategy": "mobile_first",
    "breakpoint_order": ["base", "sm", "md", "lg", "xl"],
    "common_fixes": {
      "overflow": "text-ellipsis overflow-hidden",
      "spacing": "space-y-2 sm:space-y-4",
      "grid": "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
    }
  }',
  '{"screen_sizes": ["320px", "768px"], "issue_types": ["mobile_break", "overflow"]}'
),
(
  'component_structure',
  'CamerPulse Hooks Pattern',
  'Standard structure for custom hooks in CamerPulse',
  0.82,
  '{
    "naming": "use[FeatureName][Action]",
    "return_pattern": "object_with_data_loading_error",
    "error_handling": "toast_notifications",
    "loading_states": "isLoading_boolean",
    "caching": "react_query_preferred"
  }',
  '{"file_prefix": "use", "location": "src/hooks/", "dependencies": ["@tanstack/react-query"]}'
);