-- Create activity annotations table for admin comments on timeline entries
CREATE TABLE public.activity_annotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES public.camerpulse_activity_timeline(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL,
  comment_text TEXT NOT NULL CHECK (length(comment_text) > 0 AND length(comment_text) <= 500),
  annotation_tag TEXT CHECK (annotation_tag IN ('verified', 'false_positive', 'manual_fix_needed', 'security_risk', 'data_incomplete', 'escalated', 'ignored', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by_name TEXT NOT NULL -- Store admin display name for UI
);

-- Create indexes for efficient querying
CREATE INDEX idx_activity_annotations_activity_id ON public.activity_annotations(activity_id);
CREATE INDEX idx_activity_annotations_admin_id ON public.activity_annotations(admin_id);
CREATE INDEX idx_activity_annotations_tag ON public.activity_annotations(annotation_tag);
CREATE INDEX idx_activity_annotations_created_at ON public.activity_annotations(created_at DESC);

-- Enable RLS
ALTER TABLE public.activity_annotations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage activity annotations" 
ON public.activity_annotations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create trigger for updated_at
CREATE TRIGGER update_activity_annotations_updated_at
BEFORE UPDATE ON public.activity_annotations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for activity annotations
ALTER TABLE public.activity_annotations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_annotations;