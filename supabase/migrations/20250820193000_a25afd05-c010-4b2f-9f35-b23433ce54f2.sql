-- Create edit suggestions table for community contributions
CREATE TABLE IF NOT EXISTS public.edit_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('politician', 'senator', 'mp', 'minister', 'party')),
  entity_id UUID NOT NULL,
  entity_name TEXT NOT NULL,
  field_name TEXT NOT NULL,
  current_value TEXT,
  suggested_value TEXT NOT NULL,
  justification TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_edit_suggestions_entity ON public.edit_suggestions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_edit_suggestions_user ON public.edit_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_edit_suggestions_status ON public.edit_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_edit_suggestions_created_at ON public.edit_suggestions(created_at DESC);

-- Enable RLS
ALTER TABLE public.edit_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for edit suggestions
CREATE POLICY "Users can view edit suggestions for entities" 
  ON public.edit_suggestions FOR SELECT 
  USING (true);

CREATE POLICY "Users can create edit suggestions" 
  ON public.edit_suggestions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own edit suggestions" 
  ON public.edit_suggestions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all edit suggestions" 
  ON public.edit_suggestions FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_edit_suggestions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_edit_suggestions_updated_at
  BEFORE UPDATE ON public.edit_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_edit_suggestions_updated_at();