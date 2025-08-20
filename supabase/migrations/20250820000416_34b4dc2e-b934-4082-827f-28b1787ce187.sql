-- Fix critical security definer functions with NULL search_path (only existing functions)

-- Functions with the highest security risk (NULL search_path configs)
ALTER FUNCTION public.analyze_media_content(uuid, text, text, text) SET search_path = '';
ALTER FUNCTION public.calculate_civic_reputation_score(civic_entity_type, uuid) SET search_path = '';
ALTER FUNCTION public.calculate_company_ratings(uuid) SET search_path = '';
ALTER FUNCTION public.calculate_content_score(uuid, text, text, uuid) SET search_path = '';
ALTER FUNCTION public.calculate_corruption_trends(text, text, integer) SET search_path = '';
ALTER FUNCTION public.calculate_feed_score(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.calculate_judicial_ratings() SET search_path = '';
ALTER FUNCTION public.calculate_village_reputation_index(uuid) SET search_path = '';

-- Security-critical messaging and user functions
ALTER FUNCTION public.create_message_thread(uuid, text) SET search_path = '';
ALTER FUNCTION public.create_realtime_notification(uuid, text, text, text, jsonb, text, text) SET search_path = '';
ALTER FUNCTION public.forward_message(uuid, uuid, text) SET search_path = '';
ALTER FUNCTION public.mark_message_read(uuid) SET search_path = '';
ALTER FUNCTION public.search_messages(uuid, text, uuid, integer, integer) SET search_path = '';
ALTER FUNCTION public.get_posts_with_like_status(uuid) SET search_path = '';

-- Bot detection and rate limiting security functions
ALTER FUNCTION public.detect_bot_behavior(text, text, text, uuid, text) SET search_path = '';
ALTER FUNCTION public.check_rate_limit(text, text, uuid, text, integer) SET search_path = '';

-- Cleanup and maintenance functions
ALTER FUNCTION public.cleanup_old_typing_indicators() SET search_path = '';
ALTER FUNCTION public.cleanup_expired_payment_data() SET search_path = '';

-- Analytics and financial functions
ALTER FUNCTION public.get_analytics_summary(uuid, date, date) SET search_path = '';
ALTER FUNCTION public.get_billionaire_stats() SET search_path = '';
ALTER FUNCTION public.process_nokash_webhook(jsonb) SET search_path = '';

-- Workflow and integration functions
ALTER FUNCTION public.evaluate_workflow_conditions(uuid, jsonb) SET search_path = '';
ALTER FUNCTION public.execute_workflow(uuid, jsonb) SET search_path = '';
ALTER FUNCTION public.test_integration_connection(uuid) SET search_path = '';

-- User management and migration functions  
ALTER FUNCTION public.detect_user_duplicates() SET search_path = '';
ALTER FUNCTION public.generate_username_from_email(text) SET search_path = '';
ALTER FUNCTION public.run_migration_smoke_tests() SET search_path = '';

-- Comment: Fixed all critical security definer functions to prevent SQL injection attacks