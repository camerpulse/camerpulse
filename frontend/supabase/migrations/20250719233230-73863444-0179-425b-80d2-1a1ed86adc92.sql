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

-- RLS policies for institution_reviews
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

CREATE POLICY "Moderators can manage reviews" 
ON public.institution_reviews 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM moderator_assignments 
  WHERE user_id = auth.uid() AND is_active = true
));

-- RLS policies for review_votes
CREATE POLICY "Users can manage their own votes" 
ON public.review_votes 
FOR ALL 
USING (voter_id = auth.uid());

CREATE POLICY "Everyone can view vote counts" 
ON public.review_votes 
FOR SELECT 
USING (true);

-- RLS policies for review_comments
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

-- RLS policies for review_flags
CREATE POLICY "Users can create flags" 
ON public.review_flags 
FOR INSERT 
WITH CHECK (flagger_id = auth.uid());

CREATE POLICY "Users can view their own flags" 
ON public.review_flags 
FOR SELECT 
USING (flagger_id = auth.uid());

CREATE POLICY "Moderators can manage flags" 
ON public.review_flags 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM moderator_assignments 
  WHERE user_id = auth.uid() AND is_active = true
));

-- RLS policies for rating_criteria
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

-- Insert default rating criteria for each institution type
INSERT INTO public.rating_criteria (institution_type, criteria_name, criteria_description, weight, display_order) VALUES
-- Schools criteria
('school', 'teaching_quality', 'Quality of teaching and instruction', 1.5, 1),
('school', 'discipline', 'School discipline and student behavior', 1.0, 2),
('school', 'infrastructure', 'Buildings, classrooms, and facilities', 1.2, 3),
('school', 'exam_pass_rate', 'Academic performance and exam results', 1.3, 4),

-- Hospitals criteria
('hospital', 'cleanliness', 'Hygiene and cleanliness of facilities', 1.4, 1),
('hospital', 'staff_speed', 'Speed and efficiency of medical staff', 1.2, 2),
('hospital', 'emergency_response', 'Emergency care and response time', 1.5, 3),
('hospital', 'doctor_attitude', 'Professionalism and bedside manner', 1.3, 4),

-- Pharmacies criteria
('pharmacy', 'medicine_availability', 'Availability of required medications', 1.5, 1),
('pharmacy', 'service_speed', 'Speed of service and prescription filling', 1.1, 2),
('pharmacy', 'pricing', 'Fair and competitive pricing', 1.3, 3),
('pharmacy', 'authenticity', 'Quality and authenticity of medications', 1.4, 4),

-- Villages criteria
('village', 'development_projects', 'Community development and infrastructure projects', 1.3, 1),
('village', 'unity', 'Community unity and social cohesion', 1.2, 2),
('village', 'education_support', 'Support for education and youth development', 1.4, 3),
('village', 'conflict_resolution', 'Effectiveness in resolving disputes', 1.1, 4);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_review_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_institution_reviews_updated_at
  BEFORE UPDATE ON public.institution_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_review_updated_at();

CREATE TRIGGER update_review_comments_updated_at
  BEFORE UPDATE ON public.review_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_review_updated_at();

-- Create function to update vote counts
CREATE OR REPLACE FUNCTION update_review_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'helpful' THEN
      UPDATE public.institution_reviews 
      SET helpful_votes = helpful_votes + 1 
      WHERE id = NEW.review_id;
    ELSE
      UPDATE public.institution_reviews 
      SET unhelpful_votes = unhelpful_votes + 1 
      WHERE id = NEW.review_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'helpful' THEN
      UPDATE public.institution_reviews 
      SET helpful_votes = helpful_votes - 1 
      WHERE id = OLD.review_id;
    ELSE
      UPDATE public.institution_reviews 
      SET unhelpful_votes = unhelpful_votes - 1 
      WHERE id = OLD.review_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Remove old vote count
    IF OLD.vote_type = 'helpful' THEN
      UPDATE public.institution_reviews 
      SET helpful_votes = helpful_votes - 1 
      WHERE id = OLD.review_id;
    ELSE
      UPDATE public.institution_reviews 
      SET unhelpful_votes = unhelpful_votes - 1 
      WHERE id = OLD.review_id;
    END IF;
    -- Add new vote count
    IF NEW.vote_type = 'helpful' THEN
      UPDATE public.institution_reviews 
      SET helpful_votes = helpful_votes + 1 
      WHERE id = NEW.review_id;
    ELSE
      UPDATE public.institution_reviews 
      SET unhelpful_votes = unhelpful_votes + 1 
      WHERE id = NEW.review_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vote_counts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.review_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_vote_counts();