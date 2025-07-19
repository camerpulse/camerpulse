-- SECURITY FIXES Phase 2: Extensions and Critical Functions (Fixed)

-- Move pg_trgm extension to extensions schema if it exists in public
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm' AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
    CREATE SCHEMA IF NOT EXISTS extensions;
    ALTER EXTENSION pg_trgm SET SCHEMA extensions;
  END IF;
END $$;

-- Fix the most critical security-sensitive functions with search_path
-- Remove the incorrect get_current_user_role function since profiles doesn't have role column
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Fix role-related functions
CREATE OR REPLACE FUNCTION public.update_politician_term_status(p_politician_id uuid, p_new_status text, p_reason text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  old_status text;
  old_office_status boolean;
BEGIN
  -- Get current status
  SELECT term_status, is_currently_in_office 
  INTO old_status, old_office_status
  FROM public.politicians 
  WHERE id = p_politician_id;
  
  -- Update status
  UPDATE public.politicians 
  SET 
    term_status = p_new_status,
    is_currently_in_office = CASE 
      WHEN p_new_status IN ('expired', 'deceased') THEN false
      ELSE true
    END,
    last_term_validation = now(),
    office_history = office_history || jsonb_build_object(
      'timestamp', now(),
      'old_status', old_status,
      'new_status', p_new_status,
      'reason', COALESCE(p_reason, 'Status update'),
      'old_office_status', old_office_status,
      'new_office_status', CASE 
        WHEN p_new_status IN ('expired', 'deceased') THEN false
        ELSE true
      END
    )
  WHERE id = p_politician_id;
  
  RETURN FOUND;
END;
$$;

-- Fix authentication-related functions
CREATE OR REPLACE FUNCTION public.create_default_notification_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_notification_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Fix search villages function
CREATE OR REPLACE FUNCTION public.search_villages(
  p_query TEXT,
  p_region TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  p_min_rating NUMERIC DEFAULT 0,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  village_name TEXT,
  region TEXT,
  division TEXT,
  subdivision TEXT,
  overall_rating NUMERIC,
  sons_daughters_count INTEGER,
  view_count INTEGER,
  is_verified BOOLEAN,
  total_ratings_count INTEGER,
  infrastructure_score INTEGER,
  education_score INTEGER,
  health_score INTEGER,
  diaspora_engagement_score INTEGER,
  relevance_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.village_name,
    v.region,
    v.division,
    v.subdivision,
    v.overall_rating,
    v.sons_daughters_count,
    v.view_count,
    v.is_verified,
    v.total_ratings_count,
    v.infrastructure_score,
    v.education_score,
    v.health_score,
    v.diaspora_engagement_score,
    CASE 
      WHEN p_query IS NOT NULL AND p_query != '' THEN
        similarity(v.village_name, p_query) * 0.5 +
        similarity(v.division, p_query) * 0.3 +
        similarity(v.subdivision, p_query) * 0.2
      ELSE 1.0
    END as relevance_score
  FROM public.villages v
  WHERE 
    (p_query IS NULL OR p_query = '' OR (
      v.village_name ILIKE '%' || p_query || '%' OR
      v.division ILIKE '%' || p_query || '%' OR
      v.subdivision ILIKE '%' || p_query || '%'
    ))
    AND (p_region IS NULL OR v.region = p_region)
    AND v.overall_rating >= p_min_rating
    AND (
      array_length(p_tags, 1) IS NULL OR
      EXISTS (
        SELECT 1 FROM public.village_tags vt
        JOIN public.content_tags ct ON vt.tag_id = ct.id
        WHERE vt.village_id = v.id
        AND ct.tag_name = ANY(p_tags)
      )
    )
  ORDER BY 
    CASE WHEN p_query IS NOT NULL AND p_query != '' THEN relevance_score ELSE v.overall_rating END DESC,
    v.view_count DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;