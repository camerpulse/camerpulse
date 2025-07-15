-- Create CamerPulse Intelligence Watchdog system for Ashen Debug Core

-- Add CamerPulse module tracking to ashen monitoring config
INSERT INTO public.ashen_monitoring_config (config_key, config_value, is_active, updated_at)
VALUES 
  ('camerpulse_watchdog_enabled', 'true', true, now()),
  ('camerpulse_auto_repair_threshold', '85', true, now()),
  ('camerpulse_simulation_tests_enabled', 'true', true, now()),
  ('camerpulse_patch_notifications_enabled', 'true', true, now()),
  ('camerpulse_real_time_monitoring', 'true', true, now())
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  updated_at = EXCLUDED.updated_at;

-- Create table for CamerPulse module registry
CREATE TABLE IF NOT EXISTS public.camerpulse_module_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_name TEXT NOT NULL UNIQUE,
  module_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  route_path TEXT,
  component_type TEXT NOT NULL DEFAULT 'react_component',
  last_health_check TIMESTAMP WITH TIME ZONE DEFAULT now(),
  health_status TEXT NOT NULL DEFAULT 'healthy',
  error_count INTEGER DEFAULT 0,
  last_error_at TIMESTAMP WITH TIME ZONE,
  monitoring_enabled BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for CamerPulse watchdog logs
CREATE TABLE IF NOT EXISTS public.camerpulse_watchdog_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'error', 'warning', 'recovery', 'simulation_test', 'auto_fix'
  severity TEXT NOT NULL DEFAULT 'medium',
  event_message TEXT NOT NULL,
  error_details JSONB DEFAULT '{}',
  fix_attempted BOOLEAN DEFAULT false,
  fix_success BOOLEAN DEFAULT false,
  fix_confidence_score NUMERIC DEFAULT 0,
  auto_repaired BOOLEAN DEFAULT false,
  admin_notified BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for CamerPulse simulation tests
CREATE TABLE IF NOT EXISTS public.camerpulse_simulation_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL, -- 'user_flow', 'component_test', 'api_test'
  target_module TEXT NOT NULL,
  test_scenario JSONB NOT NULL,
  test_result TEXT NOT NULL DEFAULT 'pending', -- 'passed', 'failed', 'error'
  execution_time_ms INTEGER,
  error_details JSONB,
  success_metrics JSONB,
  screenshot_url TEXT,
  scheduled BOOLEAN DEFAULT false,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_camerpulse_module_registry_module_name ON public.camerpulse_module_registry(module_name);
CREATE INDEX IF NOT EXISTS idx_camerpulse_module_registry_health_status ON public.camerpulse_module_registry(health_status);
CREATE INDEX IF NOT EXISTS idx_camerpulse_watchdog_logs_module_id ON public.camerpulse_watchdog_logs(module_id);
CREATE INDEX IF NOT EXISTS idx_camerpulse_watchdog_logs_event_type ON public.camerpulse_watchdog_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_camerpulse_watchdog_logs_severity ON public.camerpulse_watchdog_logs(severity);
CREATE INDEX IF NOT EXISTS idx_camerpulse_watchdog_logs_created_at ON public.camerpulse_watchdog_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_camerpulse_simulation_tests_target_module ON public.camerpulse_simulation_tests(target_module);
CREATE INDEX IF NOT EXISTS idx_camerpulse_simulation_tests_test_result ON public.camerpulse_simulation_tests(test_result);

-- Enable RLS
ALTER TABLE public.camerpulse_module_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camerpulse_watchdog_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camerpulse_simulation_tests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin-only access
CREATE POLICY "Admins can manage CamerPulse module registry"
  ON public.camerpulse_module_registry
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Admins can manage CamerPulse watchdog logs"
  ON public.camerpulse_watchdog_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Admins can manage CamerPulse simulation tests"
  ON public.camerpulse_simulation_tests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_camerpulse_module_registry_updated_at
  BEFORE UPDATE ON public.camerpulse_module_registry
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial CamerPulse module registry entries
INSERT INTO public.camerpulse_module_registry (module_name, module_id, file_path, route_path, component_type, metadata) VALUES
  ('Sentiment Dashboard', 'sentiment-dashboard', 'src/pages/CamerPulseIntelligence.tsx', '/camerpulse-intelligence', 'react_page', '{"priority": "high", "criticality": "core"}'),
  ('Regional Sentiment Heatmap', 'regional-heatmap', 'src/components/AI/RegionalSentimentHeatmap.tsx', '/camerpulse-intelligence#regional', 'react_component', '{"priority": "high", "criticality": "core"}'),
  ('Election Sentiment Tracker', 'election-tracker', 'src/components/AI/ElectionSentimentTracker.tsx', '/camerpulse-intelligence#election', 'react_component', '{"priority": "high", "criticality": "core"}'),
  ('Civic Feed', 'civic-feed', 'src/components/AI/CivicFeed.tsx', '/camerpulse-intelligence#civic', 'react_component', '{"priority": "medium", "criticality": "important"}'),
  ('Civic Voice Agent', 'civic-voice-agent', 'src/components/AI/CivicVoiceAgent.tsx', '/camerpulse-intelligence#voice', 'react_component', '{"priority": "medium", "criticality": "important"}'),
  ('Civic Alert Bot', 'civic-alert-bot', 'src/components/AI/CivicAlertBot.tsx', '/camerpulse-intelligence#alert-bot', 'react_component', '{"priority": "high", "criticality": "core"}'),
  ('Civic Fusion Core', 'civic-fusion-core', 'src/components/AI/CivicFusionCore.tsx', '/camerpulse-intelligence#fusion', 'react_component', '{"priority": "high", "criticality": "core"}'),
  ('Government Sync Panel', 'gov-sync-panel', 'src/components/AI/GovSyncPanel.tsx', '/camerpulse-intelligence#gov-sync', 'react_component', '{"priority": "medium", "criticality": "important"}'),
  ('Pan-Africa Module', 'pan-africa-module', 'src/components/AI/PanAfricaModule.tsx', '/camerpulse-intelligence#pan-africa', 'react_component', '{"priority": "medium", "criticality": "important"}'),
  ('Civic Service Data Panel', 'civic-service-data', 'src/components/AI/CivicServiceDataPanel.tsx', '/camerpulse-intelligence#serviceData', 'react_component', '{"priority": "medium", "criticality": "important"}'),
  ('Multimodal Emotion Processor', 'multimodal-processor', 'src/components/AI/MultimodalEmotionProcessor.tsx', '/camerpulse-intelligence#multimodal', 'react_component', '{"priority": "medium", "criticality": "important"}'),
  ('Civic Memory Engine', 'civic-memory-engine', 'src/components/AI/CivicMemoryEngine.tsx', '/camerpulse-intelligence#memory', 'react_component', '{"priority": "low", "criticality": "enhancement"}'),
  ('Civic Trust Index', 'civic-trust-index', 'src/components/AI/CivicTrustIndex.tsx', '/camerpulse-intelligence#trust', 'react_component', '{"priority": "medium", "criticality": "important"}'),
  ('Local Sentiment Mapper', 'local-sentiment-mapper', 'src/components/AI/LocalSentimentMapper.tsx', '/camerpulse-intelligence#local', 'react_component', '{"priority": "medium", "criticality": "important"}'),
  ('Disinfo Shield AI', 'disinfo-shield', 'src/components/AI/DisinfoShieldAI.tsx', '/camerpulse-intelligence#disinfoShield', 'react_component', '{"priority": "high", "criticality": "core"}'),
  ('Election Interference Monitor', 'election-interference', 'src/components/AI/ElectionInterferenceMonitor.tsx', '/camerpulse-intelligence#interference', 'react_component', '{"priority": "high", "criticality": "core"}')