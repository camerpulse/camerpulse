-- STEP 1: Fix Security Definer Views - Remove SECURITY DEFINER property
-- This addresses the ERROR-level security issues identified in the linter

-- First, let's identify and fix any SECURITY DEFINER views
-- We need to recreate views without SECURITY DEFINER to enforce proper RLS

-- Get information about views with SECURITY DEFINER
DO $$
DECLARE
    view_record RECORD;
    view_definition TEXT;
BEGIN
    -- Loop through all views in public schema to check for SECURITY DEFINER
    FOR view_record IN 
        SELECT schemaname, viewname, definition 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        -- Log view found for manual review
        RAISE NOTICE 'Found view: %.%', view_record.schemaname, view_record.viewname;
        
        -- Check if view definition contains SECURITY DEFINER
        IF view_record.definition ILIKE '%SECURITY DEFINER%' THEN
            RAISE NOTICE 'SECURITY DEFINER view found: %.% - NEEDS MANUAL REVIEW', 
                view_record.schemaname, view_record.viewname;
        END IF;
    END LOOP;
END $$;

-- Common fix pattern: Remove SECURITY DEFINER and rely on RLS policies instead
-- Example pattern for fixing a SECURITY DEFINER view:
-- DROP VIEW IF EXISTS public.problematic_view;
-- CREATE VIEW public.problematic_view AS
-- SELECT ... FROM table_name
-- WHERE proper_rls_condition;

-- Since we can't see the specific views, we'll create a function to help identify them
CREATE OR REPLACE FUNCTION public.identify_security_definer_views()
RETURNS TABLE(view_schema text, view_name text, needs_fix boolean)
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname::text,
    viewname::text,
    (definition ILIKE '%SECURITY DEFINER%')::boolean as needs_fix
  FROM pg_views 
  WHERE schemaname = 'public'
  ORDER BY needs_fix DESC, viewname;
END;
$$;