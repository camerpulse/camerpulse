-- Enhance politicians table with comprehensive features
ALTER TABLE public.politicians 
ADD COLUMN IF NOT EXISTS level_of_office TEXT DEFAULT 'National',
ADD COLUMN IF NOT EXISTS constituency TEXT,
ADD COLUMN IF NOT EXISTS contact_office TEXT,
ADD COLUMN IF NOT EXISTS contact_website TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS timeline_roles JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS promise_tracker JSONB DEFAULT '{"promises": []}'::jsonb,
ADD COLUMN IF NOT EXISTS integrity_rating NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS development_impact_rating NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS transparency_rating NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS former_roles TEXT[],
ADD COLUMN IF NOT EXISTS position_start_date DATE,
ADD COLUMN IF NOT EXISTS position_end_date DATE,
ADD COLUMN IF NOT EXISTS political_party_id UUID,
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS career_background TEXT;

-- Add foreign key constraint to link politicians with political parties
ALTER TABLE public.politicians 
ADD CONSTRAINT fk_politician_party 
FOREIGN KEY (political_party_id) REFERENCES public.political_parties(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_politicians_level_office ON public.politicians(level_of_office);
CREATE INDEX IF NOT EXISTS idx_politicians_region ON public.politicians(region);
CREATE INDEX IF NOT EXISTS idx_politicians_party_id ON public.politicians(political_party_id);
CREATE INDEX IF NOT EXISTS idx_politicians_archived ON public.politicians(is_archived);
CREATE INDEX IF NOT EXISTS idx_politicians_civic_score ON public.politicians(civic_score);

-- Create a table for politician following
CREATE TABLE IF NOT EXISTS public.politician_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  politician_id UUID NOT NULL REFERENCES public.politicians(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, politician_id)
);

-- Enable RLS on politician_follows
ALTER TABLE public.politician_follows ENABLE ROW LEVEL SECURITY;

-- Create policies for politician_follows
CREATE POLICY "Users can view all follows" ON public.politician_follows
FOR SELECT USING (true);

CREATE POLICY "Users can manage their own follows" ON public.politician_follows
FOR ALL USING (auth.uid() = user_id);

-- Create a table for politician promise tracking
CREATE TABLE IF NOT EXISTS public.politician_promises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  politician_id UUID NOT NULL REFERENCES public.politicians(id) ON DELETE CASCADE,
  promise_text TEXT NOT NULL,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('fulfilled', 'unfulfilled', 'in_progress')),
  date_made DATE,
  date_updated DATE DEFAULT CURRENT_DATE,
  evidence_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on politician_promises
ALTER TABLE public.politician_promises ENABLE ROW LEVEL SECURITY;

-- Create policies for politician_promises
CREATE POLICY "Promises are viewable by everyone" ON public.politician_promises
FOR SELECT USING (true);

CREATE POLICY "Only admins can manage promises" ON public.politician_promises
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Create a table for detailed politician ratings
CREATE TABLE IF NOT EXISTS public.politician_detailed_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  politician_id UUID NOT NULL REFERENCES public.politicians(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  integrity_rating INTEGER CHECK (integrity_rating BETWEEN 1 AND 5),
  development_impact_rating INTEGER CHECK (development_impact_rating BETWEEN 1 AND 5),
  transparency_rating INTEGER CHECK (transparency_rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, politician_id)
);

-- Enable RLS on politician_detailed_ratings
ALTER TABLE public.politician_detailed_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for politician_detailed_ratings
CREATE POLICY "Detailed ratings are viewable by everyone" ON public.politician_detailed_ratings
FOR SELECT USING (true);

CREATE POLICY "Users can manage their own detailed ratings" ON public.politician_detailed_ratings
FOR ALL USING (auth.uid() = user_id);

-- Create trigger to update politician follower count
CREATE OR REPLACE FUNCTION update_politician_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.politicians 
    SET follower_count = follower_count + 1 
    WHERE id = NEW.politician_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.politicians 
    SET follower_count = follower_count - 1 
    WHERE id = OLD.politician_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_politician_follower_count
  AFTER INSERT OR DELETE ON public.politician_follows
  FOR EACH ROW EXECUTE FUNCTION update_politician_follower_count();

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_politician_promises_updated_at
  BEFORE UPDATE ON public.politician_promises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_politician_detailed_ratings_updated_at
  BEFORE UPDATE ON public.politician_detailed_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();