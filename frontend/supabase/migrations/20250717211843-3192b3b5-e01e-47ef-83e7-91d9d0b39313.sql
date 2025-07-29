-- Awards System Tables for CamerPulse Awards (₣100M prize pool)

-- Award Categories Table
CREATE TABLE public.award_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name TEXT NOT NULL,
  category_description TEXT,
  prize_amount_fcfa BIGINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  voting_weight_formula JSONB NOT NULL DEFAULT '{
    "camerplay_streams": 45,
    "external_platforms": 25,
    "jury_score": 10,
    "fan_votes": 20
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Awards Table (yearly awards)
CREATE TABLE public.awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  award_year INTEGER NOT NULL,
  award_title TEXT NOT NULL,
  award_description TEXT,
  total_prize_pool_fcfa BIGINT NOT NULL DEFAULT 100000000, -- ₣100M
  voting_start_date TIMESTAMPTZ NOT NULL,
  voting_end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'voting_open', 'voting_closed', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Award Nominations (artists eligible for categories)
CREATE TABLE public.award_nominations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  award_id UUID NOT NULL REFERENCES public.awards(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.award_categories(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.artist_memberships(id) ON DELETE CASCADE,
  nomination_reason TEXT,
  camerplay_score NUMERIC(10,2) DEFAULT 0, -- based on streams/engagement
  external_score NUMERIC(10,2) DEFAULT 0, -- based on external platforms
  total_calculated_score NUMERIC(10,2) DEFAULT 0,
  is_eligible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(award_id, category_id, artist_id)
);

-- Jury Panel Members
CREATE TABLE public.jury_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  expertise_area TEXT NOT NULL,
  bio TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  voting_weight NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Jury Votes
CREATE TABLE public.jury_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jury_member_id UUID NOT NULL REFERENCES public.jury_members(id) ON DELETE CASCADE,
  nomination_id UUID NOT NULL REFERENCES public.award_nominations(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 100),
  comment TEXT,
  voted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(jury_member_id, nomination_id)
);

-- Fan Votes
CREATE TABLE public.fan_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nomination_id UUID NOT NULL REFERENCES public.award_nominations(id) ON DELETE CASCADE,
  award_id UUID NOT NULL REFERENCES public.awards(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.award_categories(id) ON DELETE CASCADE,
  voted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET,
  UNIQUE(user_id, nomination_id)
);

-- Award Winners
CREATE TABLE public.award_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  award_id UUID NOT NULL REFERENCES public.awards(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.award_categories(id) ON DELETE CASCADE,
  nomination_id UUID NOT NULL REFERENCES public.award_nominations(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.artist_memberships(id) ON DELETE CASCADE,
  final_score NUMERIC(10,2) NOT NULL,
  prize_amount_fcfa BIGINT NOT NULL,
  announced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Voting Analytics and Logs
CREATE TABLE public.voting_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  award_id UUID NOT NULL REFERENCES public.awards(id) ON DELETE CASCADE,
  total_fan_votes INTEGER DEFAULT 0,
  total_jury_votes INTEGER DEFAULT 0,
  most_voted_category_id UUID REFERENCES public.award_categories(id),
  analytics_data JSONB DEFAULT '{}',
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.award_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.award_nominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jury_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jury_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.award_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voting_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Public can view active awards and categories
CREATE POLICY "Public can view active awards" ON public.awards FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active categories" ON public.award_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view nominations" ON public.award_nominations FOR SELECT USING (true);
CREATE POLICY "Public can view winners" ON public.award_winners FOR SELECT USING (true);
CREATE POLICY "Public can view voting analytics" ON public.voting_analytics FOR SELECT USING (true);

-- Authenticated users can vote
CREATE POLICY "Users can create fan votes" ON public.fan_votes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their votes" ON public.fan_votes FOR SELECT 
  USING (auth.uid() = user_id);

-- Jury members can vote and view their votes
CREATE POLICY "Jury can create votes" ON public.jury_votes FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.jury_members 
    WHERE user_id = auth.uid() AND id = jury_member_id AND is_active = true
  ));
CREATE POLICY "Jury can view their votes" ON public.jury_votes FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.jury_members 
    WHERE user_id = auth.uid() AND id = jury_member_id
  ));
CREATE POLICY "Public can view jury members" ON public.jury_members FOR SELECT USING (is_active = true);

-- Admins can manage everything
CREATE POLICY "Admins can manage awards" ON public.awards FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage categories" ON public.award_categories FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage nominations" ON public.award_nominations FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage jury" ON public.jury_members FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can view all votes" ON public.jury_votes FOR SELECT 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can view all fan votes" ON public.fan_votes FOR SELECT 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create functions for score calculation
CREATE OR REPLACE FUNCTION calculate_nomination_score(nomination_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  nom_record RECORD;
  category_weights JSONB;
  fan_vote_count INTEGER;
  jury_avg_score NUMERIC;
  final_score NUMERIC := 0;
BEGIN
  -- Get nomination and category details
  SELECT n.*, c.voting_weight_formula 
  INTO nom_record, category_weights
  FROM public.award_nominations n
  JOIN public.award_categories c ON n.category_id = c.id
  WHERE n.id = nomination_id;
  
  -- Calculate fan votes (20% weight)
  SELECT COUNT(*) INTO fan_vote_count
  FROM public.fan_votes
  WHERE nomination_id = nom_record.id;
  
  -- Calculate jury average score (10% weight)
  SELECT COALESCE(AVG(score), 0) INTO jury_avg_score
  FROM public.jury_votes
  WHERE nomination_id = nom_record.id;
  
  -- Calculate weighted final score
  final_score := 
    (nom_record.camerplay_score * (category_weights->>'camerplay_streams')::NUMERIC / 100) +
    (nom_record.external_score * (category_weights->>'external_platforms')::NUMERIC / 100) +
    (jury_avg_score * (category_weights->>'jury_score')::NUMERIC / 100) +
    (fan_vote_count * (category_weights->>'fan_votes')::NUMERIC / 100);
  
  -- Update nomination with calculated score
  UPDATE public.award_nominations 
  SET total_calculated_score = final_score, updated_at = now()
  WHERE id = nomination_id;
  
  RETURN final_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update scores when votes are cast
CREATE OR REPLACE FUNCTION update_nomination_score_on_vote()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_nomination_score(COALESCE(NEW.nomination_id, OLD.nomination_id));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_score_on_fan_vote
  AFTER INSERT OR DELETE ON public.fan_votes
  FOR EACH ROW EXECUTE FUNCTION update_nomination_score_on_vote();

CREATE TRIGGER update_score_on_jury_vote
  AFTER INSERT OR UPDATE OR DELETE ON public.jury_votes
  FOR EACH ROW EXECUTE FUNCTION update_nomination_score_on_vote();

-- Insert default award categories
INSERT INTO public.award_categories (category_name, category_description, prize_amount_fcfa) VALUES
('Best New Artist', 'Outstanding new talent in Cameroonian music', 5000000),
('Artist of the Year', 'Most outstanding artist across all genres', 15000000),
('Song of the Year', 'Most popular and impactful song', 10000000),
('Album of the Year', 'Best complete album release', 10000000),
('Best Afrobeats Artist', 'Excellence in Afrobeats genre', 8000000),
('Best Hip-Hop Artist', 'Excellence in Hip-Hop/Rap genre', 8000000),
('Best R&B Artist', 'Excellence in R&B/Soul genre', 8000000),
('Best Traditional Artist', 'Excellence in traditional Cameroonian music', 8000000),
('Best Collaboration', 'Outstanding collaborative work', 6000000),
('Fan Favorite', 'Most loved by fans across all platforms', 12000000),
('International Impact', 'Cameroonian artist with global reach', 10000000);