-- Create senators table
CREATE TABLE public.senators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  photo_url TEXT,
  about TEXT,
  email TEXT,
  phone TEXT,
  region TEXT,
  constituency TEXT,
  party_affiliation TEXT,
  years_of_service INTEGER DEFAULT 0,
  committee_memberships JSONB DEFAULT '[]'::jsonb,
  social_media_links JSONB DEFAULT '{}'::jsonb,
  is_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  average_rating NUMERIC DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.senators ENABLE ROW LEVEL SECURITY;

-- Create policies for senators table
CREATE POLICY "Senators are viewable by everyone" 
ON public.senators 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage senators" 
ON public.senators 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create senator ratings table
CREATE TABLE public.senator_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  senator_id UUID NOT NULL REFERENCES public.senators(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  leadership_rating INTEGER CHECK (leadership_rating >= 1 AND leadership_rating <= 5),
  transparency_rating INTEGER CHECK (transparency_rating >= 1 AND transparency_rating <= 5),
  responsiveness_rating INTEGER CHECK (responsiveness_rating >= 1 AND responsiveness_rating <= 5),
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(senator_id, user_id)
);

-- Enable RLS for senator ratings
ALTER TABLE public.senator_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for senator ratings
CREATE POLICY "Senator ratings are viewable by everyone" 
ON public.senator_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own senator ratings" 
ON public.senator_ratings 
FOR ALL 
USING (auth.uid() = user_id);

-- Create function to update senator average ratings
CREATE OR REPLACE FUNCTION update_senator_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the senator's average ratings
  UPDATE public.senators 
  SET 
    average_rating = (
      SELECT COALESCE(AVG(overall_rating), 0) 
      FROM public.senator_ratings 
      WHERE senator_id = COALESCE(NEW.senator_id, OLD.senator_id)
    ),
    total_ratings = (
      SELECT COUNT(*) 
      FROM public.senator_ratings 
      WHERE senator_id = COALESCE(NEW.senator_id, OLD.senator_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.senator_id, OLD.senator_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for senator ratings
CREATE TRIGGER update_senator_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.senator_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_senator_ratings();

-- Create trigger for updated_at columns
CREATE TRIGGER update_senators_updated_at
  BEFORE UPDATE ON public.senators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_senator_ratings_updated_at
  BEFORE UPDATE ON public.senator_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_senators_name ON public.senators(name);
CREATE INDEX idx_senators_region ON public.senators(region);
CREATE INDEX idx_senators_position ON public.senators(position);
CREATE INDEX idx_senators_average_rating ON public.senators(average_rating);
CREATE INDEX idx_senator_ratings_senator_id ON public.senator_ratings(senator_id);
CREATE INDEX idx_senator_ratings_user_id ON public.senator_ratings(user_id);
CREATE INDEX idx_senator_ratings_overall_rating ON public.senator_ratings(overall_rating);