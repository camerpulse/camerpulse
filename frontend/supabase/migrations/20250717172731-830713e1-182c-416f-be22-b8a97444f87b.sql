-- Create awards system tables
CREATE TYPE award_status AS ENUM ('draft', 'nomination_open', 'voting_open', 'voting_closed', 'results_published');
CREATE TYPE nomination_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE vote_type AS ENUM ('public', 'jury');

-- Main awards table (yearly awards)
CREATE TABLE public.awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  total_prize_pool BIGINT DEFAULT 100000000, -- ₣100M in centimes
  status award_status DEFAULT 'draft',
  nomination_deadline TIMESTAMP WITH TIME ZONE,
  voting_deadline TIMESTAMP WITH TIME ZONE,
  results_date TIMESTAMP WITH TIME ZONE,
  scoring_weights JSONB DEFAULT '{"camerplay": 45, "external": 25, "jury": 10, "public": 20}',
  eligibility_criteria JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(year)
);

-- Award categories
CREATE TABLE public.award_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  award_id UUID REFERENCES public.awards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  prize_amount BIGINT DEFAULT 10000000, -- ₣10M for category winners
  max_nominees INTEGER DEFAULT 10,
  min_eligibility_score NUMERIC DEFAULT 0,
  is_main_category BOOLEAN DEFAULT false, -- for Artist of the Year (₣50M), 2nd place (₣30M), 3rd place (₣20M)
  category_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Nominations
CREATE TABLE public.award_nominations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  award_id UUID REFERENCES public.awards(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.award_categories(id) ON DELETE CASCADE,
  artist_id UUID, -- references artist_memberships
  nominated_work_title TEXT, -- song, album, etc.
  nominated_work_id UUID, -- reference to music_tracks, music_releases, etc.
  nomination_reason TEXT,
  status nomination_status DEFAULT 'pending',
  submitted_by UUID REFERENCES auth.users(id),
  admin_notes TEXT,
  eligibility_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(category_id, artist_id) -- one nomination per artist per category
);

-- Voting system
CREATE TABLE public.award_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomination_id UUID REFERENCES public.award_nominations(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type vote_type NOT NULL,
  score NUMERIC, -- 1-10 for jury, 1 for public vote
  vote_weight NUMERIC DEFAULT 1.0,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(nomination_id, voter_id, vote_type)
);

-- Jury members
CREATE TABLE public.award_jury (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  award_id UUID REFERENCES public.awards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  jury_name TEXT NOT NULL,
  jury_title TEXT, -- Producer, DJ, Music Expert, etc.
  bio TEXT,
  weight_percentage NUMERIC DEFAULT 1.0,
  assigned_categories UUID[] DEFAULT '{}',
  conflict_categories UUID[] DEFAULT '{}', -- categories they can't vote on
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(award_id, user_id)
);

-- Scoring system (aggregated scores for each nomination)
CREATE TABLE public.award_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomination_id UUID REFERENCES public.award_nominations(id) ON DELETE CASCADE,
  camerplay_score NUMERIC DEFAULT 0, -- 45% weight
  external_score NUMERIC DEFAULT 0, -- 25% weight (Spotify, YouTube, etc.)
  jury_score NUMERIC DEFAULT 0, -- 10% weight
  public_score NUMERIC DEFAULT 0, -- 20% weight
  total_score NUMERIC DEFAULT 0,
  rank_position INTEGER,
  is_winner BOOLEAN DEFAULT false,
  prize_amount BIGINT DEFAULT 0,
  score_breakdown JSONB DEFAULT '{}',
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(nomination_id)
);

-- External platform data (for scoring)
CREATE TABLE public.award_external_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomination_id UUID REFERENCES public.award_nominations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- spotify, youtube, boomplay, apple_music
  metric_type TEXT NOT NULL, -- streams, views, downloads
  metric_value BIGINT DEFAULT 0,
  data_period_start DATE,
  data_period_end DATE,
  verified BOOLEAN DEFAULT false,
  data_source JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Award winners and results
CREATE TABLE public.award_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  award_id UUID REFERENCES public.awards(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.award_categories(id) ON DELETE CASCADE,
  nomination_id UUID REFERENCES public.award_nominations(id) ON DELETE CASCADE,
  position INTEGER, -- 1st, 2nd, 3rd place
  prize_amount BIGINT,
  trophy_type TEXT DEFAULT 'Pure Gold',
  result_published BOOLEAN DEFAULT false,
  payout_status TEXT DEFAULT 'pending',
  trophy_delivery_status TEXT DEFAULT 'pending',
  acceptance_speech TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Award analytics and audit logs
CREATE TABLE public.award_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  award_id UUID REFERENCES public.awards(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  entity_type TEXT, -- nomination, vote, score, etc.
  entity_id UUID,
  admin_id UUID REFERENCES auth.users(id),
  action_details JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.award_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.award_nominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.award_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.award_jury ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.award_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.award_external_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.award_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.award_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Awards - Public can view active awards
CREATE POLICY "Awards are publicly viewable" ON public.awards
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage awards" ON public.awards
FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));

-- Award Categories - Public can view
CREATE POLICY "Award categories are publicly viewable" ON public.award_categories
FOR SELECT USING (true);

CREATE POLICY "Admins can manage award categories" ON public.award_categories
FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));

-- Nominations - Artists can view their own, public can view approved
CREATE POLICY "Users can view approved nominations" ON public.award_nominations
FOR SELECT USING (status = 'approved');

CREATE POLICY "Artists can view their own nominations" ON public.award_nominations
FOR SELECT USING (submitted_by = auth.uid());

CREATE POLICY "Verified artists can create nominations" ON public.award_nominations
FOR INSERT WITH CHECK (
  auth.uid() = submitted_by AND
  EXISTS (SELECT 1 FROM artist_memberships WHERE user_id = auth.uid() AND membership_active = true)
);

CREATE POLICY "Admins can manage nominations" ON public.award_nominations
FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));

-- Votes - Users can view public vote counts, manage their own votes
CREATE POLICY "Users can view public vote statistics" ON public.award_votes
FOR SELECT USING (vote_type = 'public');

CREATE POLICY "Users can manage their own votes" ON public.award_votes
FOR ALL USING (voter_id = auth.uid());

CREATE POLICY "Jury can manage their jury votes" ON public.award_votes
FOR ALL USING (
  voter_id = auth.uid() AND
  vote_type = 'jury' AND
  EXISTS (SELECT 1 FROM award_jury WHERE user_id = auth.uid())
);

-- Jury - Public can view, admins manage
CREATE POLICY "Jury members are publicly viewable" ON public.award_jury
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage jury" ON public.award_jury
FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));

-- Scores - Public can view
CREATE POLICY "Award scores are publicly viewable" ON public.award_scores
FOR SELECT USING (true);

CREATE POLICY "System can update scores" ON public.award_scores
FOR ALL USING (true);

-- External data - Admins only
CREATE POLICY "Admins can manage external data" ON public.award_external_data
FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));

-- Results - Public can view published results
CREATE POLICY "Users can view published results" ON public.award_results
FOR SELECT USING (result_published = true);

CREATE POLICY "Admins can manage results" ON public.award_results
FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));

-- Audit logs - Admins only
CREATE POLICY "Admins can view audit logs" ON public.award_audit_logs
FOR SELECT USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role));

CREATE POLICY "System can create audit logs" ON public.award_audit_logs
FOR INSERT WITH CHECK (true);

-- Functions for scoring calculations
CREATE OR REPLACE FUNCTION calculate_award_scores(p_nomination_id UUID)
RETURNS VOID AS $$
DECLARE
  nomination_record RECORD;
  award_weights JSONB;
  camerplay_raw NUMERIC := 0;
  external_raw NUMERIC := 0;
  jury_raw NUMERIC := 0;
  public_raw NUMERIC := 0;
  final_score NUMERIC := 0;
BEGIN
  -- Get nomination and award details
  SELECT n.*, a.scoring_weights 
  INTO nomination_record, award_weights
  FROM award_nominations n
  JOIN awards a ON n.award_id = a.id
  WHERE n.id = p_nomination_id;
  
  -- Calculate CamerPlay score (streams + sales from internal platform)
  -- This would integrate with music_tracks and play_logs tables
  
  -- Calculate external platform score
  SELECT COALESCE(SUM(metric_value), 0) INTO external_raw
  FROM award_external_data
  WHERE nomination_id = p_nomination_id AND verified = true;
  
  -- Calculate jury score (average of all jury votes)
  SELECT COALESCE(AVG(score), 0) INTO jury_raw
  FROM award_votes
  WHERE nomination_id = p_nomination_id AND vote_type = 'jury';
  
  -- Calculate public vote score
  SELECT COALESCE(COUNT(*), 0) INTO public_raw
  FROM award_votes
  WHERE nomination_id = p_nomination_id AND vote_type = 'public';
  
  -- Apply weighted formula
  final_score := 
    (camerplay_raw * (award_weights->>'camerplay')::NUMERIC / 100) +
    (external_raw * (award_weights->>'external')::NUMERIC / 100) +
    (jury_raw * (award_weights->>'jury')::NUMERIC / 100) +
    (public_raw * (award_weights->>'public')::NUMERIC / 100);
  
  -- Upsert score record
  INSERT INTO award_scores (
    nomination_id, camerplay_score, external_score, 
    jury_score, public_score, total_score, last_calculated
  ) VALUES (
    p_nomination_id, camerplay_raw, external_raw,
    jury_raw, public_raw, final_score, now()
  )
  ON CONFLICT (nomination_id) DO UPDATE SET
    camerplay_score = EXCLUDED.camerplay_score,
    external_score = EXCLUDED.external_score,
    jury_score = EXCLUDED.jury_score,
    public_score = EXCLUDED.public_score,
    total_score = EXCLUDED.total_score,
    last_calculated = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update scores when votes are cast
CREATE OR REPLACE FUNCTION update_scores_on_vote()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_award_scores(NEW.nomination_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scores_after_vote
AFTER INSERT OR UPDATE OR DELETE ON award_votes
FOR EACH ROW EXECUTE FUNCTION update_scores_on_vote();

-- Update timestamps triggers
CREATE OR REPLACE FUNCTION update_awards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_awards_updated_at
BEFORE UPDATE ON public.awards
FOR EACH ROW EXECUTE FUNCTION update_awards_updated_at();

CREATE TRIGGER update_award_categories_updated_at
BEFORE UPDATE ON public.award_categories
FOR EACH ROW EXECUTE FUNCTION update_awards_updated_at();

CREATE TRIGGER update_award_nominations_updated_at
BEFORE UPDATE ON public.award_nominations
FOR EACH ROW EXECUTE FUNCTION update_awards_updated_at();

CREATE TRIGGER update_award_jury_updated_at
BEFORE UPDATE ON public.award_jury
FOR EACH ROW EXECUTE FUNCTION update_awards_updated_at();

CREATE TRIGGER update_award_scores_updated_at
BEFORE UPDATE ON public.award_scores
FOR EACH ROW EXECUTE FUNCTION update_awards_updated_at();

CREATE TRIGGER update_award_external_data_updated_at
BEFORE UPDATE ON public.award_external_data
FOR EACH ROW EXECUTE FUNCTION update_awards_updated_at();

CREATE TRIGGER update_award_results_updated_at
BEFORE UPDATE ON public.award_results
FOR EACH ROW EXECUTE FUNCTION update_awards_updated_at();

-- Insert default 2024 awards
INSERT INTO public.awards (year, title, description, status) VALUES 
(2024, 'CamerPulse Awards 2024', 'The inaugural CamerPulse Awards celebrating the best in Cameroonian music', 'draft');

-- Get the award ID for categories
DO $$
DECLARE
  award_2024_id UUID;
BEGIN
  SELECT id INTO award_2024_id FROM public.awards WHERE year = 2024;
  
  -- Insert main categories with special prize amounts
  INSERT INTO public.award_categories (award_id, name, description, prize_amount, is_main_category, category_order) VALUES
  (award_2024_id, 'Artist of the Year', 'Overall best performing artist of the year', 50000000, true, 1), -- ₣50M
  (award_2024_id, 'Best Male Artist', 'Best male artist of the year', 10000000, false, 2),
  (award_2024_id, 'Best Female Artist', 'Best female artist of the year', 10000000, false, 3),
  (award_2024_id, 'Best Gospel Artist', 'Best gospel artist of the year', 10000000, false, 4),
  (award_2024_id, 'Song of the Year', 'Most popular song of the year', 10000000, false, 5),
  (award_2024_id, 'Album of the Year', 'Best album release of the year', 10000000, false, 6),
  (award_2024_id, 'Producer of the Year', 'Best music producer of the year', 10000000, false, 7),
  (award_2024_id, 'Best Diaspora Artist', 'Best Cameroonian artist in the diaspora', 10000000, false, 8),
  (award_2024_id, 'Best Collaboration', 'Best musical collaboration of the year', 10000000, false, 9),
  (award_2024_id, 'Best Music Video', 'Best music video of the year', 10000000, false, 10),
  (award_2024_id, 'Fan Favorite', 'Most loved artist by fans', 10000000, false, 11),
  (award_2024_id, 'Emerging Artist of the Year', 'Best new artist of the year', 10000000, false, 12);
END $$;