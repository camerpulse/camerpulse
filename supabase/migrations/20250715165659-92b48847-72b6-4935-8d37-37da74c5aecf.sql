-- Create UI bug logs table for visual inspector
CREATE TABLE public.ui_bug_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_name TEXT NOT NULL,
  component_path TEXT NOT NULL,
  issue_type TEXT NOT NULL, -- 'overlapping', 'overflow', 'mobile_break', 'unreadable_text', 'unresponsive_button'
  screen_size TEXT NOT NULL, -- '320px', '768px', '1440px'
  issue_description TEXT NOT NULL,
  screenshot_url TEXT,
  suggested_fix TEXT,
  element_selector TEXT,
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'ignored'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID
);

-- Enable RLS
ALTER TABLE public.ui_bug_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage UI bug logs" 
ON public.ui_bug_logs 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create indexes for better performance
CREATE INDEX idx_ui_bug_logs_page_name ON public.ui_bug_logs(page_name);
CREATE INDEX idx_ui_bug_logs_issue_type ON public.ui_bug_logs(issue_type);
CREATE INDEX idx_ui_bug_logs_screen_size ON public.ui_bug_logs(screen_size);
CREATE INDEX idx_ui_bug_logs_status ON public.ui_bug_logs(status);
CREATE INDEX idx_ui_bug_logs_severity ON public.ui_bug_logs(severity);
CREATE INDEX idx_ui_bug_logs_created_at ON public.ui_bug_logs(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_ui_bug_logs_updated_at
  BEFORE UPDATE ON public.ui_bug_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert Ashen monitoring config for UI Visual Inspector
INSERT INTO public.ashen_monitoring_config (config_key, config_value, is_active)
VALUES 
  ('ui_visual_inspector_enabled', 'true', true),
  ('ui_visual_inspector_auto_run', 'false', true),
  ('ui_visual_inspector_screen_sizes', '["320px", "768px", "1440px"]', true),
  ('ui_visual_inspector_routes_to_check', '["/", "/politicians", "/polls", "/news", "/marketplace"]', true),
  ('ui_visual_inspector_last_run', 'null', true)
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  updated_at = now();