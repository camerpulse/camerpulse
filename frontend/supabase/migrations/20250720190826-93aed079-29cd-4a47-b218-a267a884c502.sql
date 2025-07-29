-- National Civic Education & Constitution Hub - Only new tables

-- Constitution articles and content (check if exists first)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'constitution_articles') THEN
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
  END IF;
END
$$;

-- Civic educational content
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'civic_educational_content') THEN
    CREATE TABLE public.civic_educational_content (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      content_type TEXT NOT NULL,
      title TEXT NOT NULL,
      content JSONB NOT NULL,
      content_order INTEGER NOT NULL DEFAULT 0,
      difficulty_level TEXT NOT NULL DEFAULT 'beginner',
      estimated_read_time INTEGER,
      tags TEXT[],
      is_featured BOOLEAN NOT NULL DEFAULT false,
      is_published BOOLEAN NOT NULL DEFAULT true,
      author_id UUID,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
  END IF;
END
$$;

-- User bookmarks
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'civic_user_bookmarks') THEN
    CREATE TABLE public.civic_user_bookmarks (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL,
      content_type TEXT NOT NULL,
      content_id UUID NOT NULL,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
  END IF;
END
$$;

-- Civic questions
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'civic_questions') THEN
    CREATE TABLE public.civic_questions (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL,
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL DEFAULT 'general',
      related_article_id UUID,
      status TEXT NOT NULL DEFAULT 'pending',
      is_public BOOLEAN NOT NULL DEFAULT true,
      answer_text TEXT,
      answered_by UUID,
      answered_at TIMESTAMP WITH TIME ZONE,
      upvotes INTEGER NOT NULL DEFAULT 0,
      downvotes INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
  END IF;
END
$$;

-- Civic quizzes
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'civic_quizzes') THEN
    CREATE TABLE public.civic_quizzes (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      difficulty_level TEXT NOT NULL DEFAULT 'beginner',
      questions JSONB NOT NULL,
      passing_score INTEGER NOT NULL DEFAULT 70,
      time_limit_minutes INTEGER DEFAULT 30,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_by UUID,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
  END IF;
END
$$;

-- Civic achievement badges
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'civic_achievement_badges') THEN
    CREATE TABLE public.civic_achievement_badges (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL,
      badge_type TEXT NOT NULL,
      badge_name TEXT NOT NULL,
      badge_description TEXT,
      badge_icon TEXT,
      earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      requirements_met JSONB
    );
  END IF;
END
$$;

-- Civic content comments
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'civic_content_comments') THEN
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
  END IF;
END
$$;

-- Enable RLS on new tables
DO $$ 
BEGIN
  PERFORM 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'constitution_articles';
  IF FOUND THEN
    ALTER TABLE public.constitution_articles ENABLE ROW LEVEL SECURITY;
  END IF;

  PERFORM 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'civic_educational_content';
  IF FOUND THEN
    ALTER TABLE public.civic_educational_content ENABLE ROW LEVEL SECURITY;
  END IF;

  PERFORM 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'civic_user_bookmarks';
  IF FOUND THEN
    ALTER TABLE public.civic_user_bookmarks ENABLE ROW LEVEL SECURITY;
  END IF;

  PERFORM 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'civic_questions';
  IF FOUND THEN
    ALTER TABLE public.civic_questions ENABLE ROW LEVEL SECURITY;
  END IF;

  PERFORM 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'civic_quizzes';
  IF FOUND THEN
    ALTER TABLE public.civic_quizzes ENABLE ROW LEVEL SECURITY;
  END IF;

  PERFORM 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'civic_achievement_badges';
  IF FOUND THEN
    ALTER TABLE public.civic_achievement_badges ENABLE ROW LEVEL SECURITY;
  END IF;

  PERFORM 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'civic_content_comments';
  IF FOUND THEN
    ALTER TABLE public.civic_content_comments ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;