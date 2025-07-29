-- Create employer reviews table for job seekers to rate employers
CREATE TABLE public.employer_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  work_environment_rating INTEGER CHECK (work_environment_rating >= 1 AND work_environment_rating <= 5),
  management_rating INTEGER CHECK (management_rating >= 1 AND management_rating <= 5),
  compensation_rating INTEGER CHECK (compensation_rating >= 1 AND compensation_rating <= 5),
  work_life_balance_rating INTEGER CHECK (work_life_balance_rating >= 1 AND work_life_balance_rating <= 5),
  career_growth_rating INTEGER CHECK (career_growth_rating >= 1 AND career_growth_rating <= 5),
  review_title TEXT NOT NULL,
  review_content TEXT NOT NULL,
  employment_type TEXT,
  employment_duration TEXT,
  would_recommend BOOLEAN DEFAULT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'flagged', 'removed', 'under_review')),
  toxicity_score NUMERIC DEFAULT 0.0,
  moderation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employer_id, reviewer_id, job_id)
);

-- Create expert performance reviews table
CREATE TABLE public.expert_performance_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  project_id UUID,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  technical_skills_rating INTEGER CHECK (technical_skills_rating >= 1 AND technical_skills_rating <= 5),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  problem_solving_rating INTEGER CHECK (problem_solving_rating >= 1 AND problem_solving_rating <= 5),
  review_title TEXT NOT NULL,
  review_content TEXT NOT NULL,
  project_duration TEXT,
  project_budget_range TEXT,
  would_recommend BOOLEAN DEFAULT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'flagged', 'removed', 'under_review')),
  toxicity_score NUMERIC DEFAULT 0.0,
  moderation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(expert_id, reviewer_id, project_id)
);

-- Create counter reviews table for responses to reviews
CREATE TABLE public.review_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_review_id UUID NOT NULL,
  original_review_type TEXT NOT NULL CHECK (original_review_type IN ('employer_review', 'expert_review')),
  responder_id UUID NOT NULL,
  responder_type TEXT NOT NULL CHECK (responder_type IN ('employer', 'expert', 'admin')),
  response_content TEXT NOT NULL,
  is_official_response BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'flagged', 'removed', 'under_review')),
  toxicity_score NUMERIC DEFAULT 0.0,
  moderation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create review moderation queue table
CREATE TABLE public.review_moderation_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL,
  review_type TEXT NOT NULL CHECK (review_type IN ('employer_review', 'expert_review', 'review_response')),
  flagged_reason TEXT NOT NULL,
  flagged_by UUID,
  auto_flagged BOOLEAN DEFAULT false,
  toxicity_score NUMERIC DEFAULT 0.0,
  moderation_priority INTEGER DEFAULT 1 CHECK (moderation_priority >= 1 AND moderation_priority <= 5),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'escalated')),
  moderator_id UUID,
  moderator_action TEXT,
  moderator_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create review helpfulness votes table
CREATE TABLE public.review_helpfulness_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL,
  review_type TEXT NOT NULL CHECK (review_type IN ('employer_review', 'expert_review')),
  voter_id UUID NOT NULL,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(review_id, review_type, voter_id)
);

-- Create review analytics table
CREATE TABLE public.review_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('employer', 'expert')),
  metric_type TEXT NOT NULL CHECK (metric_type IN ('total_reviews', 'average_rating', 'response_rate', 'recommendation_rate')),
  metric_value NUMERIC NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(entity_id, entity_type, metric_type, period_start, period_end)
);

-- Enable RLS on all tables
ALTER TABLE public.employer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpfulness_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for employer reviews
CREATE POLICY "Users can view approved employer reviews" ON public.employer_reviews
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create employer reviews" ON public.employer_reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own employer reviews" ON public.employer_reviews
  FOR UPDATE USING (auth.uid() = reviewer_id AND status = 'active');

-- Create RLS policies for expert reviews
CREATE POLICY "Users can view approved expert reviews" ON public.expert_performance_reviews
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create expert reviews" ON public.expert_performance_reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own expert reviews" ON public.expert_performance_reviews
  FOR UPDATE USING (auth.uid() = reviewer_id AND status = 'active');

-- Create RLS policies for review responses
CREATE POLICY "Users can view approved review responses" ON public.review_responses
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create review responses" ON public.review_responses
  FOR INSERT WITH CHECK (auth.uid() = responder_id);

-- Create RLS policies for review helpfulness votes
CREATE POLICY "Users can view helpfulness votes" ON public.review_helpfulness_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own helpfulness votes" ON public.review_helpfulness_votes
  FOR ALL USING (auth.uid() = voter_id);

-- Create RLS policies for review analytics
CREATE POLICY "Public can view review analytics" ON public.review_analytics
  FOR SELECT USING (true);

-- Create RLS policies for moderation queue (admin only)
CREATE POLICY "Admins can manage moderation queue" ON public.review_moderation_queue
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  ));

-- Create triggers for updated_at columns
CREATE TRIGGER update_employer_reviews_updated_at
  BEFORE UPDATE ON public.employer_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expert_performance_reviews_updated_at
  BEFORE UPDATE ON public.expert_performance_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_review_responses_updated_at
  BEFORE UPDATE ON public.review_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_review_moderation_queue_updated_at
  BEFORE UPDATE ON public.review_moderation_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_employer_reviews_employer_id ON public.employer_reviews(employer_id);
CREATE INDEX idx_employer_reviews_reviewer_id ON public.employer_reviews(reviewer_id);
CREATE INDEX idx_employer_reviews_status ON public.employer_reviews(status);
CREATE INDEX idx_expert_performance_reviews_expert_id ON public.expert_performance_reviews(expert_id);
CREATE INDEX idx_expert_performance_reviews_reviewer_id ON public.expert_performance_reviews(reviewer_id);
CREATE INDEX idx_review_responses_original_review_id ON public.review_responses(original_review_id);
CREATE INDEX idx_review_moderation_queue_status ON public.review_moderation_queue(status);
CREATE INDEX idx_review_helpfulness_votes_review_id ON public.review_helpfulness_votes(review_id, review_type);

-- Add realtime functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.employer_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expert_performance_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.review_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.review_helpfulness_votes;