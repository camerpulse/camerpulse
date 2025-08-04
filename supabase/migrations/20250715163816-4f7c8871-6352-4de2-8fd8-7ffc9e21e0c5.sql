-- Create auto-healing history table
CREATE TABLE IF NOT EXISTS public.ashen_auto_healing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_id UUID REFERENCES public.ashen_error_logs(id),
  fix_applied BOOLEAN NOT NULL DEFAULT false,
  fix_confidence NUMERIC NOT NULL,
  fix_method TEXT NOT NULL,
  fix_description TEXT,
  code_changes JSONB DEFAULT '{}',
  result_status TEXT NOT NULL DEFAULT 'pending', -- pending, success, failed
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  applied_by TEXT NOT NULL DEFAULT 'auto_healer',
  files_modified TEXT[] DEFAULT ARRAY[]::TEXT[],
  backup_created BOOLEAN DEFAULT false,
  rollback_info JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.ashen_auto_healing_history ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admins can manage auto-healing history"
ON public.ashen_auto_healing_history
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_ashen_auto_healing_history_created_at 
ON public.ashen_auto_healing_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ashen_auto_healing_history_error_id 
ON public.ashen_auto_healing_history(error_id);

-- Insert default auto-healing config with proper JSON values
INSERT INTO public.ashen_monitoring_config (config_key, config_value)
VALUES ('auto_healing_enabled', 'false'::jsonb)
ON CONFLICT (config_key) DO NOTHING;

INSERT INTO public.ashen_monitoring_config (config_key, config_value)
VALUES ('auto_healing_confidence_threshold', '0.85'::jsonb)
ON CONFLICT (config_key) DO NOTHING;

INSERT INTO public.ashen_monitoring_config (config_key, config_value)
VALUES ('auto_healing_last_run', '"never"'::jsonb)
ON CONFLICT (config_key) DO NOTHING;