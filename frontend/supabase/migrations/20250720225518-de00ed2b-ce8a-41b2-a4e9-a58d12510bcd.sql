-- Add missing values to existing application_status enum
ALTER TYPE public.application_status ADD VALUE 'draft';
ALTER TYPE public.application_status ADD VALUE 'awarded';

-- Create new ENUM types (skip if already exists)
DO $$ BEGIN
    CREATE TYPE public.grant_status AS ENUM ('draft', 'open', 'closed', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.reward_type AS ENUM ('badge', 'certificate', 'points', 'scholarship', 'grant', 'feature_access');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.eligibility_criteria_type AS ENUM ('age_range', 'location', 'education_level', 'civic_score', 'quiz_performance', 'petition_activity', 'project_contribution');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Grant Programs Table
CREATE TABLE public.grant_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_name TEXT NOT NULL,
  program_type TEXT NOT NULL, -- 'grant', 'scholarship', 'award'
  description TEXT NOT NULL,
  program_category TEXT NOT NULL, -- 'youth_innovation', 'village_development', 'startup_incubation', etc.
  total_budget_fcfa BIGINT,
  total_budget_usd NUMERIC,
  max_award_amount_fcfa BIGINT,
  max_award_amount_usd NUMERIC,
  min_award_amount_fcfa BIGINT DEFAULT 0,
  min_award_amount_usd NUMERIC DEFAULT 0,
  application_deadline TIMESTAMP WITH TIME ZONE,
  announcement_date TIMESTAMP WITH TIME ZONE,
  program_status grant_status NOT NULL DEFAULT 'draft',
  eligibility_criteria JSONB NOT NULL DEFAULT '{}',
  required_documents JSONB DEFAULT '[]',
  evaluation_criteria JSONB NOT NULL DEFAULT '{}',
  application_form_fields JSONB DEFAULT '[]',
  terms_and_conditions TEXT,
  contact_information JSONB DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grant Applications Table
CREATE TABLE public.grant_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.grant_programs(id) ON DELETE CASCADE,
  applicant_user_id UUID NOT NULL,
  application_data JSONB NOT NULL DEFAULT '{}',
  supporting_documents JSONB DEFAULT '[]',
  application_status application_status NOT NULL DEFAULT 'submitted',
  submitted_at TIMESTAMP WITH TIME ZONE,
  review_notes JSONB DEFAULT '[]',
  score_breakdown JSONB DEFAULT '{}',
  final_score NUMERIC DEFAULT 0,
  awarded_amount_fcfa BIGINT,
  awarded_amount_usd NUMERIC,
  reviewer_assignments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Civic Rewards and Badges System
CREATE TABLE public.civic_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reward_name TEXT NOT NULL,
  reward_type reward_type NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  badge_color TEXT DEFAULT '#3B82F6',
  points_value INTEGER DEFAULT 0,
  unlock_criteria JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT true,
  max_recipients INTEGER, -- NULL means unlimited
  current_recipients INTEGER DEFAULT 0,
  category TEXT NOT NULL, -- 'civic_engagement', 'education', 'innovation', etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Rewards Earned
CREATE TABLE public.user_civic_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_id UUID NOT NULL REFERENCES public.civic_rewards(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unlock_context JSONB DEFAULT '{}', -- what action triggered this reward
  is_displayed BOOLEAN NOT NULL DEFAULT true,
  certificate_url TEXT,
  verification_code TEXT,
  UNIQUE(user_id, reward_id)
);

-- Civic Leaderboards
CREATE TABLE public.civic_leaderboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  leaderboard_name TEXT NOT NULL,
  leaderboard_type TEXT NOT NULL, -- 'monthly', 'quarterly', 'yearly', 'all_time'
  category TEXT NOT NULL, -- 'youth', 'diaspora', 'schools', 'villages', 'overall'
  period_start DATE,
  period_end DATE,
  rankings JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Civic Scores and Metrics
CREATE TABLE public.user_civic_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_civic_score INTEGER NOT NULL DEFAULT 0,
  quiz_completions INTEGER DEFAULT 0,
  petitions_supported INTEGER DEFAULT 0,
  petitions_created INTEGER DEFAULT 0,
  projects_contributed INTEGER DEFAULT 0,
  events_attended INTEGER DEFAULT 0,
  grants_received INTEGER DEFAULT 0,
  scholarships_received INTEGER DEFAULT 0,
  badges_earned INTEGER DEFAULT 0,
  monthly_score INTEGER DEFAULT 0,
  last_activity_date TIMESTAMP WITH TIME ZONE,
  streak_days INTEGER DEFAULT 0,
  rank_overall INTEGER,
  rank_in_region INTEGER,
  rank_in_age_group INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grant Review Committees
CREATE TABLE public.grant_review_committees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.grant_programs(id) ON DELETE CASCADE,
  committee_name TEXT NOT NULL,
  reviewer_user_ids JSONB NOT NULL DEFAULT '[]',
  review_criteria JSONB NOT NULL DEFAULT '{}',
  max_score INTEGER DEFAULT 100,
  review_deadline TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Application Reviews
CREATE TABLE public.application_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.grant_applications(id) ON DELETE CASCADE,
  reviewer_user_id UUID NOT NULL,
  committee_id UUID REFERENCES public.grant_review_committees(id),
  criteria_scores JSONB NOT NULL DEFAULT '{}',
  total_score NUMERIC NOT NULL DEFAULT 0,
  review_comments TEXT,
  recommendation TEXT, -- 'approve', 'reject', 'needs_revision'
  is_final BOOLEAN NOT NULL DEFAULT false,
  reviewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.grant_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_civic_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_civic_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_review_committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Grant Programs
CREATE POLICY "Public can view active grant programs" ON public.grant_programs
  FOR SELECT USING (program_status = 'open');

CREATE POLICY "Admins can manage grant programs" ON public.grant_programs
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for Grant Applications
CREATE POLICY "Users can view their own applications" ON public.grant_applications
  FOR SELECT USING (auth.uid() = applicant_user_id);

CREATE POLICY "Users can create applications" ON public.grant_applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_user_id);

CREATE POLICY "Users can update their draft applications" ON public.grant_applications
  FOR UPDATE USING (auth.uid() = applicant_user_id AND application_status = 'submitted');

CREATE POLICY "Admins and reviewers can view applications" ON public.grant_applications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin') OR
    EXISTS (
      SELECT 1 FROM grant_review_committees grc 
      WHERE grc.program_id = grant_applications.program_id 
      AND auth.uid()::text = ANY(SELECT jsonb_array_elements_text(grc.reviewer_user_ids))
    )
  );

-- RLS Policies for Civic Rewards
CREATE POLICY "Public can view active rewards" ON public.civic_rewards
  FOR SELECT USING (is_active = true AND is_public = true);

CREATE POLICY "Admins can manage rewards" ON public.civic_rewards
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for User Civic Rewards
CREATE POLICY "Users can view their own rewards" ON public.user_civic_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public can view displayed rewards" ON public.user_civic_rewards
  FOR SELECT USING (is_displayed = true);

CREATE POLICY "System can create rewards" ON public.user_civic_rewards
  FOR INSERT WITH CHECK (true);

-- RLS Policies for Civic Leaderboards
CREATE POLICY "Public can view active leaderboards" ON public.civic_leaderboards
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage leaderboards" ON public.civic_leaderboards
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for User Civic Metrics
CREATE POLICY "Users can view their own metrics" ON public.user_civic_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public can view basic metrics for leaderboards" ON public.user_civic_metrics
  FOR SELECT USING (true);

CREATE POLICY "System can manage metrics" ON public.user_civic_metrics
  FOR ALL WITH CHECK (true);

-- RLS Policies for Review Committees
CREATE POLICY "Admins can manage review committees" ON public.grant_review_committees
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Committee members can view their committees" ON public.grant_review_committees
  FOR SELECT USING (
    auth.uid()::text = ANY(SELECT jsonb_array_elements_text(reviewer_user_ids))
  );

-- RLS Policies for Application Reviews
CREATE POLICY "Reviewers can manage their reviews" ON public.application_reviews
  FOR ALL USING (auth.uid() = reviewer_user_id);

CREATE POLICY "Admins can view all reviews" ON public.application_reviews
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Create indexes for performance
CREATE INDEX idx_grant_programs_status ON public.grant_programs(program_status);
CREATE INDEX idx_grant_programs_category ON public.grant_programs(program_category);
CREATE INDEX idx_grant_applications_user ON public.grant_applications(applicant_user_id);
CREATE INDEX idx_grant_applications_program ON public.grant_applications(program_id);
CREATE INDEX idx_grant_applications_status ON public.grant_applications(application_status);
CREATE INDEX idx_user_civic_rewards_user ON public.user_civic_rewards(user_id);
CREATE INDEX idx_user_civic_rewards_reward ON public.user_civic_rewards(reward_id);
CREATE INDEX idx_civic_leaderboards_type ON public.civic_leaderboards(leaderboard_type, category);
CREATE INDEX idx_user_civic_metrics_score ON public.user_civic_metrics(total_civic_score DESC);
CREATE INDEX idx_application_reviews_application ON public.application_reviews(application_id);

-- Functions and Triggers
CREATE OR REPLACE FUNCTION public.update_grant_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_grant_programs_updated_at
  BEFORE UPDATE ON public.grant_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_grant_updated_at();

CREATE TRIGGER update_grant_applications_updated_at
  BEFORE UPDATE ON public.grant_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_grant_updated_at();

CREATE TRIGGER update_civic_rewards_updated_at
  BEFORE UPDATE ON public.civic_rewards
  FOR EACH ROW EXECUTE FUNCTION public.update_grant_updated_at();

CREATE TRIGGER update_civic_leaderboards_updated_at
  BEFORE UPDATE ON public.civic_leaderboards
  FOR EACH ROW EXECUTE FUNCTION public.update_grant_updated_at();

CREATE TRIGGER update_user_civic_metrics_updated_at
  BEFORE UPDATE ON public.user_civic_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_grant_updated_at();

CREATE TRIGGER update_grant_review_committees_updated_at
  BEFORE UPDATE ON public.grant_review_committees
  FOR EACH ROW EXECUTE FUNCTION public.update_grant_updated_at();

CREATE TRIGGER update_application_reviews_updated_at
  BEFORE UPDATE ON public.application_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_grant_updated_at();

-- Function to calculate civic score
CREATE OR REPLACE FUNCTION public.calculate_civic_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  metrics RECORD;
BEGIN
  SELECT * INTO metrics FROM public.user_civic_metrics WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Calculate score based on activities
  score := (metrics.quiz_completions * 10) +
           (metrics.petitions_supported * 5) +
           (metrics.petitions_created * 25) +
           (metrics.projects_contributed * 15) +
           (metrics.events_attended * 8) +
           (metrics.grants_received * 50) +
           (metrics.scholarships_received * 40) +
           (metrics.badges_earned * 20);
  
  -- Bonus for streak
  IF metrics.streak_days > 7 THEN
    score := score + (metrics.streak_days * 2);
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to award civic reward
CREATE OR REPLACE FUNCTION public.award_civic_reward(p_user_id UUID, p_reward_id UUID, p_context JSONB DEFAULT '{}')
RETURNS BOOLEAN AS $$
DECLARE
  reward_record RECORD;
  existing_reward RECORD;
BEGIN
  -- Get reward details
  SELECT * INTO reward_record FROM public.civic_rewards WHERE id = p_reward_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if user already has this reward
  SELECT * INTO existing_reward FROM public.user_civic_rewards WHERE user_id = p_user_id AND reward_id = p_reward_id;
  
  IF FOUND THEN
    RETURN false; -- Already has this reward
  END IF;
  
  -- Check max recipients limit
  IF reward_record.max_recipients IS NOT NULL AND reward_record.current_recipients >= reward_record.max_recipients THEN
    RETURN false;
  END IF;
  
  -- Award the reward
  INSERT INTO public.user_civic_rewards (user_id, reward_id, unlock_context)
  VALUES (p_user_id, p_reward_id, p_context);
  
  -- Update current recipients count
  UPDATE public.civic_rewards 
  SET current_recipients = current_recipients + 1 
  WHERE id = p_reward_id;
  
  -- Update user badges count
  UPDATE public.user_civic_metrics 
  SET badges_earned = badges_earned + 1,
      total_civic_score = calculate_civic_score(p_user_id)
  WHERE user_id = p_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default civic rewards
INSERT INTO public.civic_rewards (reward_name, reward_type, description, icon_url, points_value, unlock_criteria, category) VALUES
('First Quiz Completed', 'badge', 'Completed your first civic education quiz', '/badges/first-quiz.svg', 10, '{"quiz_completions": 1}', 'education'),
('Quiz Master', 'badge', 'Completed 50 civic education quizzes', '/badges/quiz-master.svg', 100, '{"quiz_completions": 50}', 'education'),
('Petition Supporter', 'badge', 'Supported your first petition', '/badges/petition-supporter.svg', 5, '{"petitions_supported": 1}', 'civic_engagement'),
('Civic Advocate', 'badge', 'Supported 25 petitions', '/badges/civic-advocate.svg', 50, '{"petitions_supported": 25}', 'civic_engagement'),
('Change Maker', 'badge', 'Created your first petition', '/badges/change-maker.svg', 25, '{"petitions_created": 1}', 'civic_engagement'),
('Community Builder', 'badge', 'Contributed to 5 development projects', '/badges/community-builder.svg', 75, '{"projects_contributed": 5}', 'innovation'),
('Rising Star', 'badge', 'Earned 500 civic points', '/badges/rising-star.svg', 150, '{"total_civic_score": 500}', 'achievement'),
('Civic Champion', 'badge', 'Earned 2000 civic points', '/badges/civic-champion.svg', 500, '{"total_civic_score": 2000}', 'achievement'),
('Consistency Award', 'badge', 'Maintained a 30-day civic activity streak', '/badges/consistency.svg', 100, '{"streak_days": 30}', 'achievement'),
('Constitution Scholar', 'certificate', 'Demonstrated mastery of constitutional knowledge', '/certificates/constitution-scholar.svg', 200, '{"quiz_category": "constitution", "quiz_score": 90}', 'education');

-- Insert sample grant programs
INSERT INTO public.grant_programs (
  program_name, program_type, description, program_category, 
  total_budget_fcfa, total_budget_usd, max_award_amount_fcfa, max_award_amount_usd,
  application_deadline, program_status, eligibility_criteria, evaluation_criteria, created_by
) VALUES
(
  'Youth Civic Innovation Grant 2024', 'grant', 
  'Supporting young Cameroonians aged 18-30 who develop innovative solutions to civic challenges in their communities.',
  'youth_innovation',
  50000000, 83333, 5000000, 8333,
  '2024-12-31 23:59:59+00', 'open',
  '{"age_range": {"min": 18, "max": 30}, "location": "cameroon", "civic_score": {"min": 200}}',
  '{"innovation": 30, "impact_potential": 25, "feasibility": 20, "sustainability": 15, "presentation": 10}',
  '00000000-0000-0000-0000-000000000000'
),
(
  'Village Development Micro-Grants', 'grant',
  'Small grants for village-level development projects focused on improving local infrastructure and services.',
  'village_development', 
  30000000, 50000, 1000000, 1667,
  '2024-11-30 23:59:59+00', 'open',
  '{"location_type": "village", "community_support": true, "project_type": "infrastructure"}',
  '{"community_need": 35, "feasibility": 25, "community_support": 20, "sustainability": 20}',
  '00000000-0000-0000-0000-000000000000'
),
(
  'Constitution Literacy Scholarship', 'scholarship',
  'Full scholarships for students who demonstrate exceptional understanding of constitutional and civic principles.',
  'education',
  20000000, 33333, 2000000, 3333,
  '2024-09-30 23:59:59+00', 'open',
  '{"education_level": "secondary_or_higher", "quiz_performance": {"constitution_score": 85}}',
  '{"quiz_scores": 40, "essay_quality": 30, "civic_engagement": 20, "academic_performance": 10}',
  '00000000-0000-0000-0000-000000000000'
);