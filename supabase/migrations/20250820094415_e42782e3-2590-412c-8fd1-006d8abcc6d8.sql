-- Set search_path on SECURITY DEFINER functions (without IF EXISTS)
DO $$
BEGIN
  -- Try to update each function's search_path individually
  
  -- check_payment_alerts
  IF EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid 
            WHERE n.nspname = 'public' AND p.proname = 'check_payment_alerts') THEN
    EXECUTE 'ALTER FUNCTION public.check_payment_alerts() SET search_path = public';
  END IF;
  
  -- create_profile_extensions
  IF EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid 
            WHERE n.nspname = 'public' AND p.proname = 'create_profile_extensions') THEN
    EXECUTE 'ALTER FUNCTION public.create_profile_extensions() SET search_path = public';
  END IF;
  
  -- generate_api_key
  IF EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid 
            WHERE n.nspname = 'public' AND p.proname = 'generate_api_key') THEN
    EXECUTE 'ALTER FUNCTION public.generate_api_key(text, uuid) SET search_path = public';
  END IF;
  
  -- get_personalized_feed
  IF EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid 
            WHERE n.nspname = 'public' AND p.proname = 'get_personalized_feed') THEN
    EXECUTE 'ALTER FUNCTION public.get_personalized_feed(uuid, integer, integer) SET search_path = public';
  END IF;
  
  -- process_escalations
  IF EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid 
            WHERE n.nspname = 'public' AND p.proname = 'process_escalations') THEN
    EXECUTE 'ALTER FUNCTION public.process_escalations() SET search_path = public';
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the migration
  RAISE NOTICE 'Error updating function search paths: %', SQLERRM;
END $$;