-- Batch set search_path = public for remaining SECURITY DEFINER functions
ALTER FUNCTION public.process_scheduled_notifications() SET search_path = public;
ALTER FUNCTION public.sync_petition_data(p_petition_id text) SET search_path = public;
ALTER FUNCTION public.update_audit_investigation_count() SET search_path = public;
ALTER FUNCTION public.update_civic_reputation_on_status_change() SET search_path = public;
ALTER FUNCTION public.update_feed_scores_on_engagement() SET search_path = public;
ALTER FUNCTION public.validate_migrated_urls() SET search_path = public;