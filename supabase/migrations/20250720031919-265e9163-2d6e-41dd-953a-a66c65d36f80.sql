-- Phase 2: Enhanced Engagement Tools Migration

-- Create enum for poll security levels
CREATE TYPE public.poll_security_level AS ENUM ('open', 'verified_only', 'invite_only', 'region_limited');

-- Create enum for politician performance metrics
CREATE TYPE public.performance_metric_type AS ENUM ('attendance', 'voting_record', 'bill_sponsorship', 'committee_activity', 'public_engagement', 'transparency');

-- Create enum for civic education content types
CREATE TYPE public.education_content_type AS ENUM ('article', 'video', 'infographic', 'quiz', 'interactive', 'webinar');

-- Create enum for education difficulty levels
CREATE TYPE public.education_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');

-- Enhanced Polling System Tables

-- Enhanced poll configurations
CREATE TABLE public.enhanced_poll_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL,
    security_level public.poll_security_level NOT NULL DEFAULT 'open',
    requires_verification BOOLEAN NOT NULL DEFAULT false,
    demographic_targeting JSONB DEFAULT '{}',
    geographic_restrictions TEXT[],
    max_participants INTEGER,
    weighted_voting BOOLEAN NOT NULL DEFAULT false,
    anonymous_voting BOOLEAN NOT NULL DEFAULT true,
    real_time_results BOOLEAN NOT NULL DEFAULT true,
    advanced_analytics BOOLEAN NOT NULL DEFAULT false,
    ai_moderation BOOLEAN NOT NULL DEFAULT false,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Poll analytics and insights
CREATE TABLE public.poll_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL,
    demographic_breakdown JSONB DEFAULT '{}',
    geographic_breakdown JSONB DEFAULT '{}',
    engagement_metrics JSONB DEFAULT '{}',
    response_patterns JSONB DEFAULT '{}',
    bias_analysis JSONB DEFAULT '{}',
    confidence_score NUMERIC(5,2) DEFAULT 0.0,
    sample_quality NUMERIC(5,2) DEFAULT 0.0,
    statistical_significance BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Poll participant verification
CREATE TABLE public.poll_participant_verification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL,
    user_id UUID,
    verification_method TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'pending',
    verification_data JSONB DEFAULT '{}',
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Politician Performance Tracker Tables

-- Core performance metrics
CREATE TABLE public.politician_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_id UUID NOT NULL,
    metric_type public.performance_metric_type NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_details JSONB DEFAULT '{}',
    measurement_period_start DATE NOT NULL,
    measurement_period_end DATE NOT NULL,
    data_source TEXT,
    verified BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance scorecards
CREATE TABLE public.politician_scorecards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_id UUID NOT NULL,
    overall_score NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    attendance_score NUMERIC(5,2) DEFAULT 0.0,
    voting_alignment_score NUMERIC(5,2) DEFAULT 0.0,
    bill_effectiveness_score NUMERIC(5,2) DEFAULT 0.0,
    transparency_score NUMERIC(5,2) DEFAULT 0.0,
    public_engagement_score NUMERIC(5,2) DEFAULT 0.0,
    committee_participation_score NUMERIC(5,2) DEFAULT 0.0,
    scorecard_period_start DATE NOT NULL,
    scorecard_period_end DATE NOT NULL,
    methodology_version TEXT DEFAULT 'v1.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance comparisons
CREATE TABLE public.politician_performance_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_id UUID NOT NULL,
    comparison_group TEXT NOT NULL, -- 'region', 'party', 'national', 'experience_level'
    ranking INTEGER,
    percentile NUMERIC(5,2),
    comparison_metrics JSONB DEFAULT '{}',
    comparison_period_start DATE NOT NULL,
    comparison_period_end DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance alerts
CREATE TABLE public.performance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    politician_id UUID NOT NULL,
    alert_type TEXT NOT NULL,
    alert_title TEXT NOT NULL,
    alert_description TEXT,
    severity_level TEXT NOT NULL DEFAULT 'medium',
    metric_type public.performance_metric_type,
    threshold_value NUMERIC,
    actual_value NUMERIC,
    alert_data JSONB DEFAULT '{}',
    is_acknowledged BOOLEAN NOT NULL DEFAULT false,
    acknowledged_by UUID,
    acknowledged_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Civic Education Hub Tables

-- Educational content
CREATE TABLE public.civic_education_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content_type public.education_content_type NOT NULL,
    difficulty_level public.education_difficulty NOT NULL DEFAULT 'beginner',
    summary TEXT,
    content_body TEXT,
    content_url TEXT,
    thumbnail_url TEXT,
    duration_minutes INTEGER,
    tags TEXT[],
    categories TEXT[],
    target_audience TEXT[],
    learning_objectives TEXT[],
    prerequisites TEXT[],
    author_id UUID,
    author_name TEXT,
    source_organization TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    view_count INTEGER NOT NULL DEFAULT 0,
    like_count INTEGER NOT NULL DEFAULT 0,
    share_count INTEGER NOT NULL DEFAULT 0,
    completion_rate NUMERIC(5,2) DEFAULT 0.0,
    average_rating NUMERIC(3,2) DEFAULT 0.0,
    total_ratings INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Learning paths and curricula
CREATE TABLE public.civic_learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    difficulty_level public.education_difficulty NOT NULL DEFAULT 'beginner',
    estimated_duration_hours INTEGER,
    prerequisites TEXT[],
    learning_outcomes TEXT[],
    content_sequence JSONB NOT NULL DEFAULT '[]', -- Array of content IDs with order
    is_certification_path BOOLEAN NOT NULL DEFAULT false,
    certification_requirements JSONB DEFAULT '{}',
    created_by UUID,
    is_active BOOLEAN NOT NULL DEFAULT true,
    enrollment_count INTEGER NOT NULL DEFAULT 0,
    completion_count INTEGER NOT NULL DEFAULT 0,
    average_rating NUMERIC(3,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User learning progress
CREATE TABLE public.civic_learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    content_id UUID,
    learning_path_id UUID,
    progress_type TEXT NOT NULL, -- 'content', 'path'
    completion_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    current_position INTEGER DEFAULT 1,
    time_spent_minutes INTEGER NOT NULL DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    quiz_scores JSONB DEFAULT '{}',
    notes TEXT,
    bookmarked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, content_id),
    UNIQUE(user_id, learning_path_id)
);

-- Interactive quizzes and assessments
CREATE TABLE public.civic_education_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    questions JSONB NOT NULL DEFAULT '[]',
    correct_answers JSONB NOT NULL DEFAULT '{}',
    passing_score INTEGER NOT NULL DEFAULT 70,
    max_attempts INTEGER DEFAULT 3,
    time_limit_minutes INTEGER,
    randomize_questions BOOLEAN NOT NULL DEFAULT false,
    show_correct_answers BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    average_score NUMERIC(5,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quiz attempts and results
CREATE TABLE public.civic_quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL,
    user_id UUID NOT NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    answers JSONB NOT NULL DEFAULT '{}',
    score NUMERIC(5,2) NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT false,
    time_taken_minutes INTEGER,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User achievements and certifications
CREATE TABLE public.civic_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    achievement_type TEXT NOT NULL, -- 'completion', 'streak', 'mastery', 'participation'
    achievement_title TEXT NOT NULL,
    achievement_description TEXT,
    badge_icon_url TEXT,
    criteria_met JSONB DEFAULT '{}',
    points_awarded INTEGER NOT NULL DEFAULT 0,
    is_certification BOOLEAN NOT NULL DEFAULT false,
    certification_code TEXT,
    expires_at TIMESTAMPTZ,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Content interactions and ratings
CREATE TABLE public.civic_content_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    content_id UUID NOT NULL,
    interaction_type TEXT NOT NULL, -- 'view', 'like', 'share', 'comment', 'rate', 'bookmark'
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment_text TEXT,
    interaction_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, content_id, interaction_type)
);

-- Enable RLS on all tables
ALTER TABLE public.enhanced_poll_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_participant_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.politician_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.politician_scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.politician_performance_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_education_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_education_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_content_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Enhanced Polling
CREATE POLICY "Public can view enhanced poll configs for public polls" ON public.enhanced_poll_config
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create enhanced poll configs" ON public.enhanced_poll_config
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Poll creators can update their enhanced configs" ON public.enhanced_poll_config
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Public can view poll analytics" ON public.poll_analytics
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can view verification records" ON public.poll_participant_verification
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create their own verification records" ON public.poll_participant_verification
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Politician Performance
CREATE POLICY "Public can view performance metrics" ON public.politician_performance_metrics
FOR SELECT USING (true);

CREATE POLICY "Verified users can create performance metrics" ON public.politician_performance_metrics
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Public can view politician scorecards" ON public.politician_scorecards
FOR SELECT USING (true);

CREATE POLICY "Public can view performance comparisons" ON public.politician_performance_comparisons
FOR SELECT USING (true);

CREATE POLICY "Public can view performance alerts" ON public.performance_alerts
FOR SELECT USING (true);

-- RLS Policies for Civic Education
CREATE POLICY "Public can view active educational content" ON public.civic_education_content
FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create educational content" ON public.civic_education_content
FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Content authors can update their content" ON public.civic_education_content
FOR UPDATE TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "Public can view active learning paths" ON public.civic_learning_paths
FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create learning paths" ON public.civic_learning_paths
FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their own learning progress" ON public.civic_learning_progress
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own learning progress" ON public.civic_learning_progress
FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Public can view active quizzes" ON public.civic_education_quizzes
FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own quiz attempts" ON public.civic_quiz_attempts
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quiz attempts" ON public.civic_quiz_attempts
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own achievements" ON public.civic_achievements
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own content interactions" ON public.civic_content_interactions
FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_enhanced_poll_config_poll_id ON public.enhanced_poll_config(poll_id);
CREATE INDEX idx_poll_analytics_poll_id ON public.poll_analytics(poll_id);
CREATE INDEX idx_poll_verification_poll_user ON public.poll_participant_verification(poll_id, user_id);
CREATE INDEX idx_politician_metrics_politician_type ON public.politician_performance_metrics(politician_id, metric_type);
CREATE INDEX idx_politician_scorecards_politician_period ON public.politician_scorecards(politician_id, scorecard_period_start, scorecard_period_end);
CREATE INDEX idx_performance_comparisons_politician_group ON public.politician_performance_comparisons(politician_id, comparison_group);
CREATE INDEX idx_performance_alerts_politician_active ON public.performance_alerts(politician_id) WHERE is_acknowledged = false;
CREATE INDEX idx_civic_content_type_active ON public.civic_education_content(content_type) WHERE is_active = true;
CREATE INDEX idx_civic_content_tags ON public.civic_education_content USING GIN(tags);
CREATE INDEX idx_civic_content_categories ON public.civic_education_content USING GIN(categories);
CREATE INDEX idx_learning_paths_active ON public.civic_learning_paths(id) WHERE is_active = true;
CREATE INDEX idx_learning_progress_user_content ON public.civic_learning_progress(user_id, content_id);
CREATE INDEX idx_learning_progress_user_path ON public.civic_learning_progress(user_id, learning_path_id);
CREATE INDEX idx_quiz_attempts_quiz_user ON public.civic_quiz_attempts(quiz_id, user_id);
CREATE INDEX idx_civic_achievements_user_type ON public.civic_achievements(user_id, achievement_type);
CREATE INDEX idx_content_interactions_content_type ON public.civic_content_interactions(content_id, interaction_type);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION public.update_poll_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_performance_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_civic_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_enhanced_poll_config_updated_at
  BEFORE UPDATE ON public.enhanced_poll_config
  FOR EACH ROW EXECUTE FUNCTION public.update_poll_analytics_updated_at();

CREATE TRIGGER update_poll_analytics_updated_at
  BEFORE UPDATE ON public.poll_analytics
  FOR EACH ROW EXECUTE FUNCTION public.update_poll_analytics_updated_at();

CREATE TRIGGER update_politician_performance_metrics_updated_at
  BEFORE UPDATE ON public.politician_performance_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_performance_metrics_updated_at();

CREATE TRIGGER update_politician_scorecards_updated_at
  BEFORE UPDATE ON public.politician_scorecards
  FOR EACH ROW EXECUTE FUNCTION public.update_performance_metrics_updated_at();

CREATE TRIGGER update_civic_education_content_updated_at
  BEFORE UPDATE ON public.civic_education_content
  FOR EACH ROW EXECUTE FUNCTION public.update_civic_content_updated_at();

CREATE TRIGGER update_civic_learning_paths_updated_at
  BEFORE UPDATE ON public.civic_learning_paths
  FOR EACH ROW EXECUTE FUNCTION public.update_civic_content_updated_at();

CREATE TRIGGER update_civic_learning_progress_updated_at
  BEFORE UPDATE ON public.civic_learning_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_civic_content_updated_at();

CREATE TRIGGER update_civic_education_quizzes_updated_at
  BEFORE UPDATE ON public.civic_education_quizzes
  FOR EACH ROW EXECUTE FUNCTION public.update_civic_content_updated_at();

-- Insert sample civic education content
INSERT INTO public.civic_education_content (
  title, content_type, difficulty_level, summary, content_body, tags, categories, target_audience, learning_objectives, author_name, source_organization, is_verified, is_featured
) VALUES
  (
    'Understanding Democratic Governance in Cameroon',
    'article',
    'beginner',
    'A comprehensive introduction to how democratic institutions work in Cameroon',
    'Democratic governance forms the foundation of modern civic participation...',
    ARRAY['democracy', 'governance', 'cameroon', 'politics'],
    ARRAY['Government Structure', 'Democracy'],
    ARRAY['Students', 'New Citizens', 'General Public'],
    ARRAY['Understand basic democratic principles', 'Identify key government institutions', 'Explain the role of citizens in democracy'],
    'CamerPulse Education Team',
    'CamerPulse',
    true,
    true
  ),
  (
    'Your Rights as a Citizen',
    'video',
    'beginner',
    'Learn about your fundamental rights and how to protect them',
    'Understanding your rights is essential for effective civic participation...',
    ARRAY['rights', 'citizenship', 'constitution', 'law'],
    ARRAY['Constitutional Rights', 'Legal Framework'],
    ARRAY['All Citizens', 'Youth', 'Adults'],
    ARRAY['Know your constitutional rights', 'Understand legal protections', 'Learn how to seek redress'],
    'Legal Education Initiative',
    'Cameroon Bar Association',
    true,
    false
  ),
  (
    'How to Engage with Local Government',
    'interactive',
    'intermediate',
    'Interactive guide to participating in local governance and community decision-making',
    'Local government is where citizens can have the most direct impact...',
    ARRAY['local government', 'participation', 'community', 'civic duty'],
    ARRAY['Local Governance', 'Civic Participation'],
    ARRAY['Community Leaders', 'Active Citizens', 'Local Officials'],
    ARRAY['Navigate local government structures', 'Participate in community meetings', 'Advocate for local issues'],
    'Civic Engagement Network',
    'Ministry of Territorial Administration',
    true,
    true
  );

-- Insert sample learning paths
INSERT INTO public.civic_learning_paths (
  title, description, difficulty_level, estimated_duration_hours, learning_outcomes, content_sequence, is_certification_path, created_by
) VALUES
  (
    'Civic Participation Fundamentals',
    'A complete introduction to civic engagement and democratic participation',
    'beginner',
    8,
    ARRAY['Understand democratic principles', 'Know your rights and responsibilities', 'Engage effectively with government'],
    '[]'::jsonb,
    true,
    null
  );

-- Insert sample achievements
INSERT INTO public.civic_achievements (
  user_id, achievement_type, achievement_title, achievement_description, points_awarded, is_certification
) VALUES
  (
    null, -- Will be awarded to actual users
    'completion',
    'Civic Scholar',
    'Completed the Civic Participation Fundamentals learning path',
    100,
    true
  );

COMMENT ON TABLE public.enhanced_poll_config IS 'Enhanced polling system configuration and security settings';
COMMENT ON TABLE public.poll_analytics IS 'Detailed analytics and insights for polls';
COMMENT ON TABLE public.politician_performance_metrics IS 'Performance tracking metrics for politicians';
COMMENT ON TABLE public.politician_scorecards IS 'Comprehensive performance scorecards for politicians';
COMMENT ON TABLE public.civic_education_content IS 'Educational content for civic engagement and learning';
COMMENT ON TABLE public.civic_learning_paths IS 'Structured learning curricula for civic education';
COMMENT ON TABLE public.civic_learning_progress IS 'User progress tracking for civic education content';