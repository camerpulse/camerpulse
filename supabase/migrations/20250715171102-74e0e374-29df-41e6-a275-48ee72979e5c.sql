-- Create activity timeline table for tracking all system activities
CREATE TABLE public.camerpulse_activity_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  module TEXT NOT NULL, -- 'ashen_debug_core', 'civic_import_core', 'camerpulse_intelligence', 'admin_action'
  activity_type TEXT NOT NULL, -- 'fix_applied', 'error_detected', 'suggestion_proposed', 'test_run', 'admin_override', 'data_import', 'verified_updated'
  activity_summary TEXT NOT NULL,
  related_component TEXT, -- component/page/official affected
  related_entity_id UUID, -- ID of related entity if applicable
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 100),
  status TEXT NOT NULL DEFAULT 'success', -- 'success', 'failed', 'pending_review'
  details JSONB DEFAULT '{}', -- additional details about the activity
  performed_by UUID, -- user_id if admin action, null if AI action
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_activity_timeline_timestamp ON public.camerpulse_activity_timeline(timestamp DESC);
CREATE INDEX idx_activity_timeline_module ON public.camerpulse_activity_timeline(module);
CREATE INDEX idx_activity_timeline_activity_type ON public.camerpulse_activity_timeline(activity_type);
CREATE INDEX idx_activity_timeline_status ON public.camerpulse_activity_timeline(status);
CREATE INDEX idx_activity_timeline_performed_by ON public.camerpulse_activity_timeline(performed_by);

-- Enable RLS
ALTER TABLE public.camerpulse_activity_timeline ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage activity timeline" 
ON public.camerpulse_activity_timeline 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Enable realtime for activity timeline
ALTER TABLE public.camerpulse_activity_timeline REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.camerpulse_activity_timeline;