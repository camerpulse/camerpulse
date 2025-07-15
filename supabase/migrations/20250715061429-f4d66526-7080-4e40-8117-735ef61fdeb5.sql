-- Create party_ratings table for public rating system
CREATE TABLE IF NOT EXISTS public.party_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL REFERENCES public.political_parties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  approval_rating INTEGER NOT NULL DEFAULT 5 CHECK (approval_rating >= 1 AND approval_rating <= 5),
  transparency_rating INTEGER NOT NULL DEFAULT 5 CHECK (transparency_rating >= 1 AND transparency_rating <= 5),
  development_rating INTEGER NOT NULL DEFAULT 5 CHECK (development_rating >= 1 AND development_rating <= 5),
  trust_rating INTEGER NOT NULL DEFAULT 5 CHECK (trust_rating >= 1 AND trust_rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(party_id, user_id)
);

-- Enable RLS on party_ratings
ALTER TABLE public.party_ratings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for party_ratings
CREATE POLICY "Party ratings are viewable by everyone" 
ON public.party_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own party ratings" 
ON public.party_ratings 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_party_ratings_updated_at
  BEFORE UPDATE ON public.party_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update party average ratings
CREATE OR REPLACE FUNCTION public.update_party_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the political party's average ratings
  UPDATE public.political_parties 
  SET 
    approval_rating = (
      SELECT COALESCE(AVG(approval_rating), 0) 
      FROM public.party_ratings 
      WHERE party_id = COALESCE(NEW.party_id, OLD.party_id)
    ),
    transparency_rating = (
      SELECT COALESCE(AVG(transparency_rating), 0) 
      FROM public.party_ratings 
      WHERE party_id = COALESCE(NEW.party_id, OLD.party_id)
    ),
    development_rating = (
      SELECT COALESCE(AVG(development_rating), 0) 
      FROM public.party_ratings 
      WHERE party_id = COALESCE(NEW.party_id, OLD.party_id)
    ),
    trust_rating = (
      SELECT COALESCE(AVG(trust_rating), 0) 
      FROM public.party_ratings 
      WHERE party_id = COALESCE(NEW.party_id, OLD.party_id)
    ),
    total_ratings = (
      SELECT COUNT(*) 
      FROM public.party_ratings 
      WHERE party_id = COALESCE(NEW.party_id, OLD.party_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.party_id, OLD.party_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update party ratings automatically
CREATE TRIGGER update_party_ratings_on_insert
  AFTER INSERT ON public.party_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_party_ratings();

CREATE TRIGGER update_party_ratings_on_update
  AFTER UPDATE ON public.party_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_party_ratings();

CREATE TRIGGER update_party_ratings_on_delete
  AFTER DELETE ON public.party_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_party_ratings();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_party_ratings_party_id ON public.party_ratings(party_id);
CREATE INDEX IF NOT EXISTS idx_party_ratings_user_id ON public.party_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_party_ratings_created_at ON public.party_ratings(created_at DESC);