-- Create artist profile claims table for existing profiles
CREATE TABLE IF NOT EXISTS public.artist_profile_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claimed_artist_id UUID REFERENCES public.artist_memberships(id),
  claim_type TEXT NOT NULL DEFAULT 'ownership', -- 'ownership', 'correction', 'contact'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  evidence_files TEXT[],
  claim_reason TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Create artist search index for better performance
CREATE INDEX IF NOT EXISTS idx_artist_memberships_search ON public.artist_memberships 
USING gin(to_tsvector('english', stage_name || ' ' || COALESCE(real_name, '')));

-- Create artist submission drafts table
CREATE TABLE IF NOT EXISTS public.artist_submission_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  draft_data JSONB NOT NULL DEFAULT '{}',
  step_completed INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id) -- One draft per user
);

-- Enable RLS on new tables
ALTER TABLE public.artist_profile_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_submission_drafts ENABLE ROW LEVEL SECURITY;

-- RLS policies for artist profile claims
CREATE POLICY "Users can view their own claims" ON public.artist_profile_claims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create claims" ON public.artist_profile_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all claims" ON public.artist_profile_claims
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

-- RLS policies for submission drafts
CREATE POLICY "Users can manage their own drafts" ON public.artist_submission_drafts
  FOR ALL USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_artist_profile_claims_updated_at
  BEFORE UPDATE ON public.artist_profile_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_artist_submission_drafts_updated_at
  BEFORE UPDATE ON public.artist_submission_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to search for existing artists
CREATE OR REPLACE FUNCTION public.search_artists(
  p_stage_name TEXT DEFAULT NULL,
  p_social_url TEXT DEFAULT NULL,
  p_region TEXT DEFAULT NULL
) 
RETURNS TABLE(
  id UUID,
  stage_name TEXT,
  real_name TEXT,
  bio_short TEXT,
  profile_photo_url TEXT,
  region TEXT,
  application_status TEXT,
  similarity_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    am.id,
    am.stage_name,
    am.real_name,
    aa.bio_short,
    aa.profile_photo_url,
    aa.region,
    aa.application_status,
    CASE 
      WHEN p_stage_name IS NOT NULL THEN 
        similarity(am.stage_name, p_stage_name) * 100
      ELSE 50.0
    END as similarity_score
  FROM public.artist_memberships am
  LEFT JOIN public.artist_applications aa ON am.application_id = aa.id
  WHERE 
    (p_stage_name IS NULL OR similarity(am.stage_name, p_stage_name) > 0.3)
    AND (p_region IS NULL OR aa.region ILIKE '%' || p_region || '%')
    AND (p_social_url IS NULL OR aa.social_media_links::text ILIKE '%' || p_social_url || '%')
  ORDER BY similarity_score DESC
  LIMIT 10;
END;
$$;