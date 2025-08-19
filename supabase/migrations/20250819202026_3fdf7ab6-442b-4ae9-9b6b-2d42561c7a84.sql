-- Make get_entity_by_slug respect RLS (use invoker security)
CREATE OR REPLACE FUNCTION public.get_entity_by_slug(
  p_table_name text,
  p_slug text,
  p_id_column text DEFAULT 'id',
  p_slug_column text DEFAULT 'slug'
)
RETURNS TABLE(
  entity_id uuid,
  canonical_slug text,
  entity_data jsonb
)
LANGUAGE plpgsql
-- SECURITY INVOKER is default; explicitly set for clarity
SECURITY INVOKER
AS $$
DECLARE
  sql_query text;
  entity_record record;
BEGIN
  -- Validate table name to prevent SQL injection
  IF p_table_name NOT IN ('politicians', 'mps', 'senators', 'ministers', 'political_parties', 
                          'villages', 'hospitals', 'schools', 'events', 'petitions') THEN
    RAISE EXCEPTION 'Invalid table name: %', p_table_name;
  END IF;

  -- Try to find by slug first (RLS will apply per table)
  sql_query := format('SELECT %I as id, %I as slug, to_jsonb(t.*) as data FROM %I t WHERE %I = $1',
                      p_id_column, p_slug_column, p_table_name, p_slug_column);
  
  EXECUTE sql_query USING p_slug INTO entity_record;
  
  IF FOUND THEN
    entity_id := entity_record.id;
    canonical_slug := entity_record.slug;
    entity_data := entity_record.data;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Try to find by ID if slug lookup failed (for legacy support)
  sql_query := format('SELECT %I as id, %I as slug, to_jsonb(t.*) as data FROM %I t WHERE %I = $1',
                      p_id_column, p_slug_column, p_table_name, p_id_column);
  
  BEGIN
    EXECUTE sql_query USING p_slug::uuid INTO entity_record;
    
    IF FOUND THEN
      entity_id := entity_record.id;
      canonical_slug := entity_record.slug;
      entity_data := entity_record.data;
      RETURN NEXT;
    END IF;
  EXCEPTION
    WHEN invalid_text_representation THEN
      -- p_slug is not a valid UUID, return nothing
      RETURN;
  END;
END;
$$;

-- Add helpful non-unique indexes on slug columns for performance
CREATE INDEX IF NOT EXISTS idx_hospitals_slug ON public.hospitals(slug);
CREATE INDEX IF NOT EXISTS idx_schools_slug ON public.schools(slug);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_petitions_slug ON public.petitions(slug);
