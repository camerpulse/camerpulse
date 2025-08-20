-- Fix remaining security definer functions with improper search_path configurations
-- Change search_path from 'public' to '' for better security

-- Fix function with search_path=public (less secure)
ALTER FUNCTION public.calculate_profile_completion_score(uuid) SET search_path = '';

-- Fix sanitization function with improper search_path 
ALTER FUNCTION public.sanitize_message_content(text) SET search_path = '';

-- Fix trigger functions that may not have proper search_path
ALTER FUNCTION public.sanitize_message_trigger() SET search_path = '';
ALTER FUNCTION public.update_payment_analytics() SET search_path = '';
ALTER FUNCTION public.update_village_overall_rating() SET search_path = '';

-- Fix any remaining critical functions that might be missing
ALTER FUNCTION public.merge_duplicate_profiles(uuid, uuid[]) SET search_path = '';
ALTER FUNCTION public.get_user_conversation_ids(uuid) SET search_path = '';

-- Fix fraud detection functions  
ALTER FUNCTION public.detect_advanced_fraud_patterns(uuid) SET search_path = '';
ALTER FUNCTION public.calculate_poll_performance_metrics(uuid) SET search_path = '';
ALTER FUNCTION public.trigger_fraud_alert() SET search_path = '';
ALTER FUNCTION public.run_poll_health_checks() SET search_path = '';

-- Fix config and admin functions
ALTER FUNCTION public.get_pan_africa_config(text) SET search_path = '';
ALTER FUNCTION public.update_user_presence(text, jsonb) SET search_path = '';

-- Comment: All remaining vulnerable functions now secured with search_path = ''