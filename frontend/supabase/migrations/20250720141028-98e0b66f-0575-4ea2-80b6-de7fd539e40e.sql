-- Create reputation badges enum (if not exists)
DO $$ BEGIN
  CREATE TYPE reputation_badge AS ENUM (
    'excellent',
    'trusted', 
    'under_watch',
    'flagged'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create comprehensive civic ratings table (if not exists)
CREATE TABLE IF NOT EXISTS public.civic_entity_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type civic_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  entity_name TEXT NOT NULL,
  user_id UUID NOT NULL,
  
  -- Rating components (1-5 scale)
  transparency_rating INTEGER CHECK (transparency_rating >= 1 AND transparency_rating <= 5),
  performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 5),
  engagement_rating INTEGER CHECK (engagement_rating >= 1 AND engagement_rating <= 5),
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  
  -- Additional data
  comment TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID,
  region TEXT,
  ip_address INET,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent duplicate ratings from same user for same entity
  UNIQUE(entity_type, entity_id, user_id)
);

-- Create civic reputation scores table (computed scores)
CREATE TABLE IF NOT EXISTS public.civic_reputation_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type civic_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  entity_name TEXT NOT NULL,
  
  -- Score components (0-100)
  transparency_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  performance_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  citizen_rating_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  engagement_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  response_speed_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  negative_flags_penalty NUMERIC(5,2) NOT NULL DEFAULT 0,
  
  -- Final computed score
  total_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  reputation_badge reputation_badge NOT NULL DEFAULT 'under_watch',
  
  -- Rating statistics
  total_ratings INTEGER NOT NULL DEFAULT 0,
  average_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  five_star_count INTEGER NOT NULL DEFAULT 0,
  four_star_count INTEGER NOT NULL DEFAULT 0,
  three_star_count INTEGER NOT NULL DEFAULT 0,
  two_star_count INTEGER NOT NULL DEFAULT 0,
  one_star_count INTEGER NOT NULL DEFAULT 0,
  
  -- Additional metadata
  region TEXT,
  last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint
  UNIQUE(entity_type, entity_id)
);

-- Create table for tracking rating abuse
CREATE TABLE IF NOT EXISTS public.civic_rating_abuse_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reported_rating_id UUID NOT NULL REFERENCES civic_entity_ratings(id),
  reporter_user_id UUID NOT NULL,
  abuse_type TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  action_taken TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leaderboard entries table
CREATE TABLE IF NOT EXISTS public.civic_leaderboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL, -- 'top_officials', 'best_ministries', etc.
  entity_type civic_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  entity_name TEXT NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  rank_position INTEGER NOT NULL,
  region TEXT,
  period_type TEXT NOT NULL DEFAULT 'monthly', -- 'weekly', 'monthly', 'yearly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint for rankings per period
  UNIQUE(category, period_type, period_start, rank_position)
);

-- Enable RLS on all tables
ALTER TABLE public.civic_entity_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_reputation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_rating_abuse_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_leaderboards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view ratings" ON public.civic_entity_ratings;
DROP POLICY IF EXISTS "Users can create their own ratings" ON public.civic_entity_ratings;
DROP POLICY IF EXISTS "Users can update their own ratings" ON public.civic_entity_ratings;
DROP POLICY IF EXISTS "Admins can manage all ratings" ON public.civic_entity_ratings;

-- RLS Policies for civic_entity_ratings
CREATE POLICY "Anyone can view ratings" ON public.civic_entity_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own ratings" ON public.civic_entity_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" ON public.civic_entity_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all ratings" ON public.civic_entity_ratings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Drop existing policies for reputation scores
DROP POLICY IF EXISTS "Anyone can view reputation scores" ON public.civic_reputation_scores;
DROP POLICY IF EXISTS "Admins can manage reputation scores" ON public.civic_reputation_scores;

-- RLS Policies for civic_reputation_scores
CREATE POLICY "Anyone can view reputation scores" ON public.civic_reputation_scores
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage reputation scores" ON public.civic_reputation_scores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Drop existing policies for abuse reports
DROP POLICY IF EXISTS "Users can report abuse" ON public.civic_rating_abuse_reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.civic_rating_abuse_reports;
DROP POLICY IF EXISTS "Admins can manage abuse reports" ON public.civic_rating_abuse_reports;

-- RLS Policies for civic_rating_abuse_reports
CREATE POLICY "Users can report abuse" ON public.civic_rating_abuse_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_user_id);

CREATE POLICY "Users can view their own reports" ON public.civic_rating_abuse_reports
  FOR SELECT USING (auth.uid() = reporter_user_id);

CREATE POLICY "Admins can manage abuse reports" ON public.civic_rating_abuse_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Drop existing policies for leaderboards
DROP POLICY IF EXISTS "Anyone can view leaderboards" ON public.civic_leaderboards;
DROP POLICY IF EXISTS "Admins can manage leaderboards" ON public.civic_leaderboards;

-- RLS Policies for civic_leaderboards
CREATE POLICY "Anyone can view leaderboards" ON public.civic_leaderboards
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage leaderboards" ON public.civic_leaderboards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );