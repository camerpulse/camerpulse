-- Create village_edit_requests table for proper update tracking
CREATE TABLE IF NOT EXISTS public.village_edit_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  village_id UUID NOT NULL REFERENCES public.villages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  update_reason TEXT NOT NULL,
  update_description TEXT NOT NULL,
  evidence_links TEXT,
  contact_info TEXT,
  proposed_changes JSONB NOT NULL DEFAULT '{}',
  reviewer_id UUID,
  reviewer_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_village_edit_requests_village_id ON public.village_edit_requests(village_id);
CREATE INDEX IF NOT EXISTS idx_village_edit_requests_user_id ON public.village_edit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_village_edit_requests_status ON public.village_edit_requests(status);

-- Enable RLS
ALTER TABLE public.village_edit_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create edit requests" 
ON public.village_edit_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own edit requests" 
ON public.village_edit_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all edit requests" 
ON public.village_edit_requests 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_village_edit_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_village_edit_requests_updated_at
  BEFORE UPDATE ON public.village_edit_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_village_edit_requests_updated_at();