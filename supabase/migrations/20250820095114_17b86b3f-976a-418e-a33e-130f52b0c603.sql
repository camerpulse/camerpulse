-- Set search_path=public on all functions in public schema missing it
DO $$
DECLARE rec record;
BEGIN
  FOR rec IN 
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND (p.proconfig IS NULL OR NOT EXISTS (
        SELECT 1 FROM pg_options_to_table(p.proconfig) WHERE option_name = 'search_path'
      ))
  LOOP
    EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = public', rec.nspname, rec.proname, rec.args);
  END LOOP;
END $$;