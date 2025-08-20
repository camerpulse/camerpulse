-- Force all views in public to be SECURITY INVOKER (safer than definer)
DO $$
DECLARE r record;
BEGIN
  FOR r IN 
    SELECT table_schema, table_name 
    FROM information_schema.views 
    WHERE table_schema = 'public'
  LOOP
    EXECUTE format('ALTER VIEW %I.%I SET (security_invoker = on)', r.table_schema, r.table_name);
  END LOOP;
END $$;

-- Ensure all SECURITY DEFINER functions set search_path = public
DO $$
DECLARE rec record;
BEGIN
  FOR rec IN 
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = TRUE
      AND (
        p.proconfig IS NULL OR NOT EXISTS (
          SELECT 1 FROM pg_options_to_table(p.proconfig) WHERE option_name = 'search_path'
        )
      )
  LOOP
    EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = public', rec.nspname, rec.proname, rec.args);
  END LOOP;
END $$;