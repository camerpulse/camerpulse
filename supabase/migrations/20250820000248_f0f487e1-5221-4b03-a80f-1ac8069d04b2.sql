-- Fix critical security definer functions missing search_path configuration
-- These functions are most vulnerable as they have no search_path protection

-- Functions with NULL search_path configs (highest priority)
ALTER FUNCTION public.analyze_media_content(uuid, text, text, text) SET search_path = '';
ALTER FUNCTION public.calculate_civic_reputation_score(civic_entity_type, uuid) SET search_path = '';
ALTER FUNCTION public.calculate_company_ratings(uuid) SET search_path = '';
ALTER FUNCTION public.calculate_content_score(uuid, text, text, uuid) SET search_path = '';
ALTER FUNCTION public.calculate_corruption_trends() SET search_path = '';
ALTER FUNCTION public.calculate_feed_score(uuid, text, text, uuid) SET search_path = '';
ALTER FUNCTION public.calculate_judicial_ratings(uuid) SET search_path = '';
ALTER FUNCTION public.calculate_village_reputation_index(uuid) SET search_path = '';

-- Fix functions with specific search path issues
ALTER FUNCTION public.calculate_profile_completion_score(uuid) SET search_path = '';

-- Secure poll fraud detection functions
ALTER FUNCTION public.detect_advanced_fraud_patterns(uuid) SET search_path = '';
ALTER FUNCTION public.calculate_poll_performance_metrics(uuid) SET search_path = '';
ALTER FUNCTION public.trigger_fraud_alert() SET search_path = '';

-- Fix user management functions
ALTER FUNCTION public.merge_duplicate_profiles(uuid, uuid[]) SET search_path = '';
ALTER FUNCTION public.get_user_conversation_ids(uuid) SET search_path = '';
ALTER FUNCTION public.get_posts_with_like_status(uuid) SET search_path = '';

-- Secure messaging functions
ALTER FUNCTION public.search_messages(uuid, text, uuid, integer, integer) SET search_path = '';
ALTER FUNCTION public.forward_message(uuid, uuid, text) SET search_path = '';
ALTER FUNCTION public.mark_message_read(uuid) SET search_path = '';
ALTER FUNCTION public.create_message_thread(uuid, text) SET search_path = '';

-- Fix notification and cleanup functions
ALTER FUNCTION public.create_realtime_notification(uuid, text, text, text, jsonb, text, text) SET search_path = '';
ALTER FUNCTION public.update_user_presence(text, jsonb) SET search_path = '';
ALTER FUNCTION public.cleanup_old_typing_indicators() SET search_path = '';

-- Secure Pan Africa config function
ALTER FUNCTION public.get_pan_africa_config(text) SET search_path = '';

-- Fix poll health and fraud functions
ALTER FUNCTION public.run_poll_health_checks() SET search_path = '';

-- Comment: All functions now have secure search_path = '' to prevent SQL injection attacks