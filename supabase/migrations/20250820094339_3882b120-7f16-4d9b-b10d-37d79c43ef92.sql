-- Set search_path on known SECURITY DEFINER functions without it
ALTER FUNCTION IF EXISTS public.check_payment_alerts() SET search_path = public;
ALTER FUNCTION IF EXISTS public.create_profile_extensions() SET search_path = public;
ALTER FUNCTION IF EXISTS public.generate_api_key(text, uuid) SET search_path = public;
ALTER FUNCTION IF EXISTS public.get_personalized_feed(uuid, integer, integer) SET search_path = public;
ALTER FUNCTION IF EXISTS public.process_escalations() SET search_path = public;