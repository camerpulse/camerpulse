-- Final part: Indexes and slug resolution function

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_political_parties_slug ON political_parties(slug);
CREATE INDEX IF NOT EXISTS idx_mps_slug ON mps(slug);
CREATE INDEX IF NOT EXISTS idx_senators_slug ON senators(slug);
CREATE INDEX IF NOT EXISTS idx_ministers_slug ON ministers(slug);
CREATE INDEX IF NOT EXISTS idx_politicians_slug ON politicians(slug);
CREATE INDEX IF NOT EXISTS idx_slug_redirects_lookup ON slug_redirects(entity_type, old_slug);

-- Function to resolve slug (handles redirects)
CREATE OR REPLACE FUNCTION public.resolve_slug(entity_type text, input_slug text)
RETURNS table(resolved_slug text, entity_id uuid, is_redirect boolean)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  redirect_record record;
  sql_query text;
  result_record record;
BEGIN
  -- First check if this is a redirect
  SELECT new_slug, entity_id INTO redirect_record
  FROM public.slug_redirects 
  WHERE slug_redirects.entity_type = resolve_slug.entity_type 
    AND old_slug = input_slug;
  
  IF FOUND THEN
    -- Return the redirect
    RETURN QUERY SELECT redirect_record.new_slug, redirect_record.entity_id, true;
    RETURN;
  END IF;
  
  -- Otherwise, look up the entity directly
  sql_query := format('SELECT slug, id FROM %I WHERE slug = $1', entity_type);
  EXECUTE sql_query INTO result_record USING input_slug;
  
  IF FOUND THEN
    RETURN QUERY SELECT result_record.slug, result_record.id, false;
  END IF;
END;
$$;

-- Function to get entity by slug with redirect handling
CREATE OR REPLACE FUNCTION public.get_entity_by_slug(entity_type text, input_slug text)
RETURNS table(
  id uuid, 
  slug text, 
  is_redirect boolean,
  redirect_from text
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  sql_query text;
  result_record record;
  redirect_record record;
BEGIN
  -- First check for direct match
  sql_query := format('SELECT id, slug FROM %I WHERE slug = $1', entity_type);
  EXECUTE sql_query INTO result_record USING input_slug;
  
  IF FOUND THEN
    RETURN QUERY SELECT result_record.id, result_record.slug, false, null::text;
    RETURN;
  END IF;
  
  -- Check for redirect
  SELECT new_slug, entity_id INTO redirect_record
  FROM public.slug_redirects 
  WHERE slug_redirects.entity_type = get_entity_by_slug.entity_type 
    AND old_slug = input_slug;
  
  IF FOUND THEN
    RETURN QUERY SELECT redirect_record.entity_id, redirect_record.new_slug, true, input_slug;
  END IF;
END;
$$;