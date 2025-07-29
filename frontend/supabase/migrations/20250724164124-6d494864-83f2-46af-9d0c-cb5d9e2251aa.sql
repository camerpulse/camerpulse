-- Create tables for profile claims and edit suggestions (excluding minister_ratings)

-- Profile claims table for all entity types
CREATE TABLE IF NOT EXISTS public.profile_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('senator', 'mp', 'minister', 'politician')),
  entity_id UUID NOT NULL,
  claim_type TEXT NOT NULL DEFAULT 'ownership',
  claim_reason TEXT,
  evidence_files TEXT[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Edit suggestions table for all entity types
CREATE TABLE IF NOT EXISTS public.edit_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('senator', 'mp', 'minister', 'politician')),
  entity_id UUID NOT NULL,
  suggested_changes JSONB NOT NULL,
  change_reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edit_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_claims
CREATE POLICY "Users can view their own claims" 
ON public.profile_claims 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create claims" 
ON public.profile_claims 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all claims" 
ON public.profile_claims 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- RLS Policies for edit_suggestions
CREATE POLICY "Users can view their own suggestions" 
ON public.edit_suggestions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create suggestions" 
ON public.edit_suggestions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all suggestions" 
ON public.edit_suggestions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_profile_claims_updated_at
  BEFORE UPDATE ON profile_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_edit_suggestions_updated_at
  BEFORE UPDATE ON edit_suggestions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();