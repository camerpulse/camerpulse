-- Create comprehensive civic rating system

-- First, let's update the existing approval_ratings table to support both politicians and parties
ALTER TABLE public.approval_ratings RENAME TO civic_ratings;

-- Add support for different entity types
ALTER TABLE public.civic_ratings 
ADD COLUMN entity_type text NOT NULL DEFAULT 'politician',
ADD COLUMN entity_id uuid NOT NULL DEFAULT politician_id,
ADD COLUMN rating_category text DEFAULT 'overall',
ADD COLUMN is_anonymous boolean DEFAULT false,
ADD COLUMN ip_address inet;

-- Update the entity_id to use politician_id for existing records
UPDATE public.civic_ratings SET entity_id = politician_id WHERE entity_type = 'politician';

-- Add indexes for better performance
CREATE INDEX idx_civic_ratings_entity ON public.civic_ratings(entity_type, entity_id);
CREATE INDEX idx_civic_ratings_user ON public.civic_ratings(user_id);
CREATE INDEX idx_civic_ratings_category ON public.civic_ratings(rating_category);

-- Create table for party ratings specifically
CREATE TABLE public.party_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES political_parties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  approval_rating numeric(3,2) CHECK (approval_rating >= 0 AND approval_rating <= 5),
  transparency_rating numeric(3,2) CHECK (transparency_rating >= 0 AND transparency_rating <= 5),
  development_rating numeric(3,2) CHECK (development_rating >= 0 AND development_rating <= 5),
  trust_rating numeric(3,2) CHECK (trust_rating >= 0 AND trust_rating <= 5),
  comment text,
  is_anonymous boolean DEFAULT false,
  ip_address inet,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(party_id, user_id)
);

-- Enable RLS on party_ratings
ALTER TABLE public.party_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for party_ratings
CREATE POLICY "Party ratings are viewable by everyone" 
ON public.party_ratings FOR SELECT USING (true);

CREATE POLICY "Users can manage their own party ratings" 
ON public.party_ratings FOR ALL USING (auth.uid() = user_id);

-- Create detailed politician ratings table (expanding existing structure)
CREATE TABLE public.politician_detailed_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  politician_id uuid NOT NULL REFERENCES politicians(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  integrity_rating numeric(3,2) CHECK (integrity_rating >= 0 AND integrity_rating <= 5),
  development_impact_rating numeric(3,2) CHECK (development_impact_rating >= 0 AND development_impact_rating <= 5),
  transparency_rating numeric(3,2) CHECK (transparency_rating >= 0 AND transparency_rating <= 5),
  responsiveness_rating numeric(3,2) CHECK (responsiveness_rating >= 0 AND responsiveness_rating <= 5),
  leadership_rating numeric(3,2) CHECK (leadership_rating >= 0 AND leadership_rating <= 5),
  comment text,
  is_anonymous boolean DEFAULT false,
  ip_address inet,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(politician_id, user_id)
);

-- Enable RLS on politician_detailed_ratings
ALTER TABLE public.politician_detailed_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for politician_detailed_ratings
CREATE POLICY "Detailed ratings are viewable by everyone" 
ON public.politician_detailed_ratings FOR SELECT USING (true);

CREATE POLICY "Users can manage their own detailed ratings" 
ON public.politician_detailed_ratings FOR ALL USING (auth.uid() = user_id);

-- Create rating abuse monitoring table
CREATE TABLE public.rating_abuse_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  ip_address inet NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  rating_count_in_timeframe integer NOT NULL,
  timeframe_minutes integer NOT NULL,
  flagged_at timestamp with time zone DEFAULT now(),
  admin_reviewed boolean DEFAULT false,
  admin_action text,
  metadata jsonb DEFAULT '{}'
);

-- Enable RLS on rating_abuse_logs
ALTER TABLE public.rating_abuse_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for rating_abuse_logs
CREATE POLICY "Admins can manage abuse logs" 
ON public.rating_abuse_logs FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Update political_parties table to include rating aggregates
ALTER TABLE public.political_parties 
ADD COLUMN IF NOT EXISTS approval_rating numeric(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS transparency_rating numeric(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS development_rating numeric(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS trust_rating numeric(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_ratings integer DEFAULT 0;

-- Update politicians table to include rating aggregates
ALTER TABLE public.politicians 
ADD COLUMN IF NOT EXISTS average_detailed_rating numeric(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_detailed_ratings integer DEFAULT 0;

-- Create trigger function to update party ratings
CREATE OR REPLACE FUNCTION public.update_party_ratings()
RETURNS trigger AS $$
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

-- Create trigger for party ratings
CREATE TRIGGER update_party_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.party_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_party_ratings();

-- Create trigger function to update politician detailed ratings
CREATE OR REPLACE FUNCTION public.update_politician_detailed_ratings()
RETURNS trigger AS $$
BEGIN
  -- Update the politician's average detailed rating
  UPDATE public.politicians 
  SET 
    average_detailed_rating = (
      SELECT COALESCE(
        (COALESCE(AVG(integrity_rating), 0) + 
         COALESCE(AVG(development_impact_rating), 0) + 
         COALESCE(AVG(transparency_rating), 0) + 
         COALESCE(AVG(responsiveness_rating), 0) + 
         COALESCE(AVG(leadership_rating), 0)) / 5, 0
      )
      FROM public.politician_detailed_ratings 
      WHERE politician_id = COALESCE(NEW.politician_id, OLD.politician_id)
    ),
    total_detailed_ratings = (
      SELECT COUNT(*) 
      FROM public.politician_detailed_ratings 
      WHERE politician_id = COALESCE(NEW.politician_id, OLD.politician_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.politician_id, OLD.politician_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for politician detailed ratings
CREATE TRIGGER update_politician_detailed_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.politician_detailed_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_politician_detailed_ratings();

-- Update updated_at columns triggers
CREATE TRIGGER update_party_ratings_updated_at
  BEFORE UPDATE ON public.party_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_politician_detailed_ratings_updated_at
  BEFORE UPDATE ON public.politician_detailed_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();