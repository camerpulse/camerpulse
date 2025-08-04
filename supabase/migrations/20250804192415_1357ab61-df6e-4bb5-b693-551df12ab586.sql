-- Fix the RLS policy conflict by dropping and recreating
DROP POLICY IF EXISTS "Admins can manage templates" ON public.notification_templates;

-- Recreate with proper naming
CREATE POLICY "notification_templates_admin_policy" 
ON public.notification_templates FOR ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));

-- Create trigger to auto-create user preferences on signup
CREATE OR REPLACE TRIGGER on_auth_user_created_notification_prefs
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_notification_preferences();