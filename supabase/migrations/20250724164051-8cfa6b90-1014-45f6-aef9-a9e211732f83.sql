-- Create tables for profile claims and edit suggestions

-- Profile claims table for all entity types
CREATE TABLE public.profile_claims (
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
CREATE TABLE public.edit_suggestions (
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

-- Minister ratings table (similar to senator_ratings)
CREATE TABLE public.minister_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  minister_id UUID NOT NULL,
  user_id UUID NOT NULL,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  leadership_rating INTEGER CHECK (leadership_rating >= 1 AND leadership_rating <= 5),
  transparency_rating INTEGER CHECK (transparency_rating >= 1 AND transparency_rating <= 5),
  responsiveness_rating INTEGER CHECK (responsiveness_rating >= 1 AND responsiveness_rating <= 5),
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  comment TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(minister_id, user_id)
);

-- Enable RLS
ALTER TABLE public.profile_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edit_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minister_ratings ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies for minister_ratings
CREATE POLICY "Users can view all minister ratings" 
ON public.minister_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own minister ratings" 
ON public.minister_ratings 
FOR ALL 
USING (auth.uid() = user_id);

-- Functions to update average ratings
CREATE OR REPLACE FUNCTION update_mp_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE mps 
  SET 
    average_rating = (
      SELECT COALESCE(AVG(overall_rating), 0) 
      FROM mp_ratings 
      WHERE mp_id = COALESCE(NEW.mp_id, OLD.mp_id)
    ),
    total_ratings = (
      SELECT COUNT(*) 
      FROM mp_ratings 
      WHERE mp_id = COALESCE(NEW.mp_id, OLD.mp_id)
    )
  WHERE id = COALESCE(NEW.mp_id, OLD.mp_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_minister_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- This will need to be implemented when ministers table exists
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_mp_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON mp_ratings
  FOR EACH ROW EXECUTE FUNCTION update_mp_average_rating();

CREATE TRIGGER update_minister_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON minister_ratings
  FOR EACH ROW EXECUTE FUNCTION update_minister_average_rating();

-- Update timestamps trigger function
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