-- Create review moderation tables
CREATE TABLE IF NOT EXISTS public.shipping_rating_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating_id UUID NOT NULL REFERENCES public.shipping_company_ratings(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL,
  report_reason TEXT NOT NULL,
  report_details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  moderator_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rating reports
ALTER TABLE public.shipping_rating_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for rating reports
CREATE POLICY "Users can report ratings" 
ON public.shipping_rating_reports 
FOR INSERT 
WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Users can view their own reports" 
ON public.shipping_rating_reports 
FOR SELECT 
USING (auth.uid() = reported_by);

CREATE POLICY "Admins can manage all reports" 
ON public.shipping_rating_reports 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_shipping_rating_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shipping_rating_reports_updated_at
  BEFORE UPDATE ON public.shipping_rating_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_shipping_rating_reports_updated_at();