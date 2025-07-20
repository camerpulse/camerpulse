-- National Civic Education & Constitution Hub - Fixed Migration

-- Constitution articles and content
CREATE TABLE public.constitution_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_number TEXT NOT NULL,
  title TEXT NOT NULL,
  content_french TEXT NOT NULL,
  content_english TEXT NOT NULL,
  content_pidgin TEXT,
  content_fulfulde TEXT,
  content_other JSONB DEFAULT '{}',
  section_name TEXT NOT NULL,
  chapter_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  summary TEXT,
  keywords TEXT[],
  related_articles UUID[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Civic educational content
CREATE TABLE public.civic_educational_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL, -- 'rights_duties', 'electoral_guide', 'government_roles', etc.
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- multilingual content
  content_order INTEGER NOT NULL DEFAULT 0,
  difficulty_level TEXT NOT NULL DEFAULT 'beginner', -- beginner, intermediate, advanced
  estimated_read_time INTEGER, -- in minutes
  tags TEXT[],
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  author_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User bookmarks and progress
CREATE TABLE public.civic_user_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL, -- 'constitution_article', 'educational_content'
  content_id UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Civic questions and answers
CREATE TABLE public.civic_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'general', -- 'constitution', 'rights', 'electoral', etc.
  related_article_id UUID,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, answered, approved, rejected
  is_public BOOLEAN NOT NULL DEFAULT true,
  answer_text TEXT,
  answered_by UUID,
  answered_at TIMESTAMP WITH TIME ZONE,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Civic quizzes
CREATE TABLE public.civic_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'constitution', 'rights', 'electoral', etc.
  difficulty_level TEXT NOT NULL DEFAULT 'beginner',
  questions JSONB NOT NULL, -- array of quiz questions with answers
  passing_score INTEGER NOT NULL DEFAULT 70,
  time_limit_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User civic learning progress
CREATE TABLE public.civic_learning_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

-- Civic achievement badges
CREATE TABLE public.civic_achievement_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_type TEXT NOT NULL, -- 'constitution_scholar', 'quiz_master', 'active_learner', etc.
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  requirements_met JSONB
);

-- Civic content comments
CREATE TABLE public.civic_content_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  parent_comment_id UUID,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.constitution_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_educational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_achievement_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_content_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Constitution articles (public read)
CREATE POLICY "Anyone can view constitution articles" 
ON public.constitution_articles FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage constitution articles" 
ON public.constitution_articles FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Educational content (public read)
CREATE POLICY "Anyone can view published educational content" 
ON public.civic_educational_content FOR SELECT USING (is_published = true);

CREATE POLICY "Authors and admins can manage educational content" 
ON public.civic_educational_content FOR ALL 
USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- User bookmarks (user-specific)
CREATE POLICY "Users can manage their own bookmarks" 
ON public.civic_user_bookmarks FOR ALL 
USING (auth.uid() = user_id);

-- Civic questions
CREATE POLICY "Users can view public questions" 
ON public.civic_questions FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create questions" 
ON public.civic_questions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions" 
ON public.civic_questions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all questions" 
ON public.civic_questions FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Civic quizzes (public read, admin manage)
CREATE POLICY "Anyone can view active quizzes" 
ON public.civic_quizzes FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage quizzes" 
ON public.civic_quizzes FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Quiz attempts (existing table - only policies)
CREATE POLICY "Users can view their own quiz attempts" 
ON public.civic_quiz_attempts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create quiz attempts" 
ON public.civic_quiz_attempts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Learning progress (user-specific)
CREATE POLICY "Users can manage their own learning progress" 
ON public.civic_learning_progress FOR ALL 
USING (auth.uid() = user_id);

-- Achievement badges (user-specific read, system create)
CREATE POLICY "Users can view their own badges" 
ON public.civic_achievement_badges FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create badges" 
ON public.civic_achievement_badges FOR INSERT 
WITH CHECK (true);

-- Content comments
CREATE POLICY "Anyone can view approved comments" 
ON public.civic_content_comments FOR SELECT 
USING (is_approved = true);

CREATE POLICY "Users can create comments" 
ON public.civic_content_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.civic_content_comments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments" 
ON public.civic_content_comments FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_constitution_articles_section ON public.constitution_articles(section_name);
CREATE INDEX idx_constitution_articles_keywords ON public.constitution_articles USING gin(keywords);
CREATE INDEX idx_civic_educational_content_type ON public.civic_educational_content(content_type);
CREATE INDEX idx_civic_educational_content_tags ON public.civic_educational_content USING gin(tags);
CREATE INDEX idx_civic_user_bookmarks_user ON public.civic_user_bookmarks(user_id);
CREATE INDEX idx_civic_questions_status ON public.civic_questions(status);
CREATE INDEX idx_civic_learning_progress_user ON public.civic_learning_progress(user_id);
CREATE INDEX idx_civic_content_comments_content ON public.civic_content_comments(content_type, content_id);

-- Update triggers
CREATE TRIGGER update_constitution_articles_updated_at
BEFORE UPDATE ON public.constitution_articles
FOR EACH ROW EXECUTE FUNCTION update_realtime_updated_at();

CREATE TRIGGER update_civic_educational_content_updated_at
BEFORE UPDATE ON public.civic_educational_content
FOR EACH ROW EXECUTE FUNCTION update_realtime_updated_at();

CREATE TRIGGER update_civic_questions_updated_at
BEFORE UPDATE ON public.civic_questions
FOR EACH ROW EXECUTE FUNCTION update_realtime_updated_at();

CREATE TRIGGER update_civic_quizzes_updated_at
BEFORE UPDATE ON public.civic_quizzes
FOR EACH ROW EXECUTE FUNCTION update_realtime_updated_at();

CREATE TRIGGER update_civic_content_comments_updated_at
BEFORE UPDATE ON public.civic_content_comments
FOR EACH ROW EXECUTE FUNCTION update_realtime_updated_at();