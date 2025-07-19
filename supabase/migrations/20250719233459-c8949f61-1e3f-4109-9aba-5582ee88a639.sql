-- Create review tables for ratings and reviews
CREATE TABLE IF NOT EXISTS public.institution_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL,
  institution_type institution_type NOT NULL,
  reviewer_id UUID NOT NULL,
  overall_rating NUMERIC(2,1) NOT NULL CHECK (overall_rating >= 1.0 AND overall_rating <= 5.0),
  criteria_ratings JSONB NOT NULL DEFAULT '{}'::JSONB,
  review_title TEXT,
  review_text TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  media_attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  helpful_votes INTEGER NOT NULL DEFAULT 0,
  unhelpful_votes INTEGER NOT NULL DEFAULT 0,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  flag_reason TEXT,
  flagged_by UUID,
  flagged_at TIMESTAMP WITH TIME ZONE,
  is_verified_reviewer BOOLEAN NOT NULL DEFAULT false,
  moderation_status TEXT NOT NULL DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create review votes table
CREATE TABLE IF NOT EXISTS public.review_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.institution_reviews(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'unhelpful')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(review_id, voter_id)
);

-- Create review comments table
CREATE TABLE IF NOT EXISTS public.review_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.institution_reviews(id) ON DELETE CASCADE,
  commenter_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  is_owner_response BOOLEAN NOT NULL DEFAULT false,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create review flags table
CREATE TABLE IF NOT EXISTS public.review_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.institution_reviews(id) ON DELETE CASCADE,
  flagger_id UUID NOT NULL,
  flag_reason TEXT NOT NULL,
  flag_details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(review_id, flagger_id)
);

-- Create rating criteria table
CREATE TABLE IF NOT EXISTS public.rating_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_type institution_type NOT NULL,
  criteria_name TEXT NOT NULL,
  criteria_description TEXT,
  weight NUMERIC(3,2) DEFAULT 1.0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all review tables
ALTER TABLE public.institution_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_criteria ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for institution_reviews
CREATE POLICY "Everyone can view approved reviews" 
ON public.institution_reviews 
FOR SELECT 
USING (moderation_status = 'approved');

CREATE POLICY "Users can create reviews" 
ON public.institution_reviews 
FOR INSERT 
WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Users can update their own reviews" 
ON public.institution_reviews 
FOR UPDATE 
USING (reviewer_id = auth.uid());

CREATE POLICY "Admins can manage all reviews" 
ON public.institution_reviews 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Basic RLS policies for review_votes
CREATE POLICY "Users can manage their own votes" 
ON public.review_votes 
FOR ALL 
USING (voter_id = auth.uid());

CREATE POLICY "Everyone can view vote counts" 
ON public.review_votes 
FOR SELECT 
USING (true);

-- Basic RLS policies for review_comments
CREATE POLICY "Everyone can view comments" 
ON public.review_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create comments" 
ON public.review_comments 
FOR INSERT 
WITH CHECK (commenter_id = auth.uid());

CREATE POLICY "Users can update their own comments" 
ON public.review_comments 
FOR UPDATE 
USING (commenter_id = auth.uid());

-- Basic RLS policies for review_flags
CREATE POLICY "Users can create flags" 
ON public.review_flags 
FOR INSERT 
WITH CHECK (flagger_id = auth.uid());

CREATE POLICY "Users can view their own flags" 
ON public.review_flags 
FOR SELECT 
USING (flagger_id = auth.uid());

CREATE POLICY "Admins can manage flags" 
ON public.review_flags 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Basic RLS policies for rating_criteria
CREATE POLICY "Everyone can view active criteria" 
ON public.rating_criteria 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage criteria" 
ON public.rating_criteria 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));