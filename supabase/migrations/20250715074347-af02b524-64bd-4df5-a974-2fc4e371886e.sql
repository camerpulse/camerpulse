-- Add missing term validation fields to politicians table
ALTER TABLE public.politicians 
ADD COLUMN IF NOT EXISTS term_status text DEFAULT 'active'::text,
ADD COLUMN IF NOT EXISTS is_currently_in_office boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS office_history jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_term_validation timestamp with time zone DEFAULT now();

-- Add check constraint for term_status
ALTER TABLE public.politicians 
ADD CONSTRAINT politicians_term_status_check 
CHECK (term_status IN ('active', 'expired', 'deceased', 'unknown'));

-- Create function to validate terms
CREATE OR REPLACE FUNCTION public.validate_politician_terms()
RETURNS TABLE(
  politician_id uuid,
  name text,
  current_status text,
  needs_update boolean,
  days_since_term_end integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as politician_id,
    p.name,
    p.term_status as current_status,
    CASE 
      WHEN p.term_end_date IS NOT NULL AND p.term_end_date < CURRENT_DATE AND p.term_status = 'active' THEN true
      WHEN p.term_end_date IS NULL AND p.term_status != 'unknown' THEN true
      ELSE false
    END as needs_update,
    CASE 
      WHEN p.term_end_date IS NOT NULL THEN 
        EXTRACT(DAY FROM CURRENT_DATE - p.term_end_date)::integer
      ELSE NULL
    END as days_since_term_end
  FROM public.politicians p
  WHERE p.term_status IN ('active', 'unknown')
  ORDER BY p.term_end_date ASC NULLS LAST;
END;
$$;

-- Create function to update politician term status
CREATE OR REPLACE FUNCTION public.update_politician_term_status(
  p_politician_id uuid,
  p_new_status text,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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