-- Phase 2: Add remaining critical RLS policies for most important tables

-- artist_profile_claims - already has policies, skip

-- camerpulse_intelligence_sentiment_logs - already has policies, skip

-- camerpulse_intelligence_alerts - already has policies, skip

-- ashen_snapshot_retention_config - already has policies, skip

-- pan_africa_civic_mesh_nodes - already has policies, skip

-- plugin_stress_tests - already has policies, skip

-- profile_achievement_types - already has policies, skip

-- pulse_post_likes - already has policies, skip

-- application_reviews - already has policies, skip

-- ashen_dev_requests - already has policies, skip

-- user_notification_preferences - already has policies, skip

-- pharmacy_monetization - already has policies, skip

-- poll_moderation_log - already has policies, skip

-- ashen_learning_insights - already has policies, skip

-- feed_interactions - already has policies, skip

-- civic_shield_protection - already has policies, skip

-- whistleblower_submissions - already has policies, skip

-- promise_sentiment_correlations - already has policies, skip

-- events - already has policies, skip

-- agency_action_logs - read-only with policies, skip

-- conversations - already has policies, skip

-- civic_alerts - already has policies, skip

-- sentiment_spikes - already has policies, skip

-- ashen_security_breaches - already has policies, skip

-- event_chat_messages - already has policies, skip

-- polls_ai_generated - already has policies, skip

-- Check which tables actually need policies by finding ones with RLS enabled but no policies
-- Let's query to see which specific tables need attention

-- Add policies for any tables that may be missing critical access controls
-- Focus on financial and sensitive data tables first

-- Create policies for financial_reports if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_reports' AND table_schema = 'public') THEN
    -- Enable RLS if not already enabled
    EXECUTE 'ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY';
    
    -- Add admin-only access for financial reports
    EXECUTE 'CREATE POLICY "Admins can manage financial reports" ON public.financial_reports
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = auth.uid() AND role = ''admin''::app_role
        )
      )';
      
    -- Public read access for transparency
    EXECUTE 'CREATE POLICY "Public can view financial reports" ON public.financial_reports
      FOR SELECT USING (true)';
  END IF;
END $$;

-- Add proper audit trail policy for security_audit_logs to prevent unauthorized access
DROP POLICY IF EXISTS "System can insert audit logs" ON public.security_audit_logs;
CREATE POLICY "System and authenticated users can insert audit logs" ON public.security_audit_logs
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL OR 
    current_setting('request.jwt.claims', true)::jsonb IS NULL
  );

-- Add update policy for admin management of audit logs
CREATE POLICY "Admins can update audit logs" ON public.security_audit_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'::app_role
    )
  );

-- Ensure user_roles table has proper security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Only admins can manage roles
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
    )
  );

-- System can insert initial admin role
CREATE POLICY "System can insert initial roles" ON public.user_roles
  FOR INSERT WITH CHECK (
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
    )
  );