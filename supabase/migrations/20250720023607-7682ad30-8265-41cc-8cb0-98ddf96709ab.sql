-- Advanced features for claim institution flow

-- Create institution dashboards table
CREATE TABLE public.institution_dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dashboard_config JSONB DEFAULT '{}',
  analytics_enabled BOOLEAN DEFAULT true,
  messaging_enabled BOOLEAN DEFAULT true,
  review_management_enabled BOOLEAN DEFAULT true,
  payment_processing_enabled BOOLEAN DEFAULT false,
  custom_branding JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'basic',
  access_permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(institution_id, owner_user_id)
);

-- Create institution inbox/messaging system
CREATE TABLE public.institution_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  sender_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  recipient_type TEXT DEFAULT 'institution',
  subject TEXT NOT NULL,
  message_body TEXT NOT NULL,
  message_type TEXT DEFAULT 'inquiry',
  priority_level TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'unread',
  read_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE,
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create claim renewal tracking
CREATE TABLE public.institution_claim_renewals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_claim_id UUID NOT NULL REFERENCES public.institution_claims(id) ON DELETE CASCADE,
  renewal_claim_id UUID REFERENCES public.institution_claims(id) ON DELETE SET NULL,
  renewal_due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_sent_30_days BOOLEAN DEFAULT false,
  reminder_sent_7_days BOOLEAN DEFAULT false,
  reminder_sent_1_day BOOLEAN DEFAULT false,
  renewal_status TEXT DEFAULT 'pending',
  auto_renewed BOOLEAN DEFAULT false,
  grace_period_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create institution access logs
CREATE TABLE public.institution_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  access_type TEXT NOT NULL,
  action_performed TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  session_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_institution_dashboards_owner ON public.institution_dashboards(owner_user_id);
CREATE INDEX idx_institution_dashboards_institution ON public.institution_dashboards(institution_id);
CREATE INDEX idx_institution_messages_institution ON public.institution_messages(institution_id);
CREATE INDEX idx_institution_messages_status ON public.institution_messages(status);
CREATE INDEX idx_claim_renewals_due_date ON public.institution_claim_renewals(renewal_due_date);
CREATE INDEX idx_claim_renewals_status ON public.institution_claim_renewals(renewal_status);
CREATE INDEX idx_access_logs_institution ON public.institution_access_logs(institution_id);
CREATE INDEX idx_access_logs_user ON public.institution_access_logs(user_id);

-- Enable RLS
ALTER TABLE public.institution_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_claim_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for institution dashboards
CREATE POLICY "Institution owners can manage their dashboards" 
ON public.institution_dashboards FOR ALL USING (auth.uid() = owner_user_id);

CREATE POLICY "Admins can view all dashboards" 
ON public.institution_dashboards FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for institution messages
CREATE POLICY "Institution owners can manage their messages" 
ON public.institution_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.institutions WHERE id = institution_id AND claimed_by = auth.uid())
);

CREATE POLICY "Users can send messages to institutions" 
ON public.institution_messages FOR INSERT WITH CHECK (auth.uid() = sender_user_id);

CREATE POLICY "Public can view institution contact info" 
ON public.institution_messages FOR SELECT USING (true);

-- RLS Policies for claim renewals
CREATE POLICY "Users can view their own claim renewals" 
ON public.institution_claim_renewals FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.institution_claims ic WHERE ic.id = original_claim_id AND ic.user_id = auth.uid())
);

CREATE POLICY "Admins can manage all renewals" 
ON public.institution_claim_renewals FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for access logs
CREATE POLICY "Institution owners can view their access logs" 
ON public.institution_access_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.institutions WHERE id = institution_id AND claimed_by = auth.uid())
);

-- Advanced trigger: Auto-create dashboard and setup on claim approval
CREATE OR REPLACE FUNCTION auto_setup_institution_access()
RETURNS TRIGGER AS $$
DECLARE
  institution_record RECORD;
BEGIN
  -- Only proceed if claim was approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Get institution details
    SELECT * INTO institution_record FROM public.institutions WHERE name = NEW.institution_name;
    
    IF FOUND THEN
      -- Update institution with verified claim
      UPDATE public.institutions 
      SET claimed_by = NEW.user_id, claim_status = 'verified'
      WHERE id = institution_record.id;
      
      -- Create dashboard access
      INSERT INTO public.institution_dashboards (
        institution_id, owner_user_id, dashboard_config, access_permissions
      ) VALUES (
        institution_record.id, 
        NEW.user_id,
        jsonb_build_object(
          'welcome_setup_completed', false,
          'analytics_enabled', true,
          'messaging_enabled', true,
          'theme', 'default'
        ),
        jsonb_build_object(
          'admin', true,
          'analytics', true,
          'messaging', true,
          'settings', true
        )
      ) ON CONFLICT (institution_id, owner_user_id) DO UPDATE SET
        updated_at = now(),
        access_permissions = EXCLUDED.access_permissions;
      
      -- Create renewal tracking (12 months from now)
      INSERT INTO public.institution_claim_renewals (
        original_claim_id, renewal_due_date, grace_period_expires
      ) VALUES (
        NEW.id,
        now() + INTERVAL '12 months',
        now() + INTERVAL '13 months'
      );
      
      -- Log the access grant
      INSERT INTO public.institution_access_logs (
        institution_id, user_id, access_type, action_performed
      ) VALUES (
        institution_record.id, NEW.user_id, 'claim_approval', 'dashboard_access_granted'
      );
      
      -- Create welcome message
      INSERT INTO public.institution_messages (
        institution_id, sender_user_id, sender_name, sender_email,
        subject, message_body, message_type, priority_level
      ) VALUES (
        institution_record.id, NEW.user_id, 'CamerPulse System', 'noreply@camerpulse.com',
        'Welcome to your Institution Dashboard!',
        'Congratulations! Your claim has been approved. You now have full access to manage your institution profile, analytics, and messaging. Your next renewal date is ' || (now() + INTERVAL '12 months')::date || '.',
        'system_notification', 'high'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-setup
CREATE TRIGGER auto_setup_institution_access_trigger
  AFTER UPDATE ON public.institution_claims
  FOR EACH ROW EXECUTE FUNCTION auto_setup_institution_access();

-- Function to check for upcoming renewals (to be called by cron)
CREATE OR REPLACE FUNCTION check_claim_renewals()
RETURNS TABLE(renewals_processed integer, reminders_sent integer) AS $$
DECLARE
  renewal_record RECORD;
  renewals_count INTEGER := 0;
  reminders_count INTEGER := 0;
  days_until_renewal INTEGER;
BEGIN
  -- Process all upcoming renewals
  FOR renewal_record IN
    SELECT cr.*, ic.user_id, ic.institution_name, ic.status as claim_status
    FROM public.institution_claim_renewals cr
    JOIN public.institution_claims ic ON cr.original_claim_id = ic.id
    WHERE cr.renewal_status = 'pending'
    AND cr.renewal_due_date > now()
    AND cr.renewal_due_date <= now() + INTERVAL '30 days'
  LOOP
    days_until_renewal := EXTRACT(DAYS FROM renewal_record.renewal_due_date - now());
    
    -- Send 30-day reminder
    IF days_until_renewal <= 30 AND NOT renewal_record.reminder_sent_30_days THEN
      -- Create notification
      INSERT INTO public.institution_claim_notifications (
        claim_id, recipient_user_id, notification_type, title, message, action_url
      ) VALUES (
        renewal_record.original_claim_id,
        renewal_record.user_id,
        'renewal_reminder',
        'Institution Claim Renewal Due in 30 Days',
        'Your claim for ' || renewal_record.institution_name || ' expires in 30 days. Please renew to maintain access.',
        '/institutions/renew/' || renewal_record.original_claim_id
      );
      
      UPDATE public.institution_claim_renewals 
      SET reminder_sent_30_days = true 
      WHERE id = renewal_record.id;
      
      reminders_count := reminders_count + 1;
    END IF;
    
    -- Send 7-day reminder
    IF days_until_renewal <= 7 AND NOT renewal_record.reminder_sent_7_days THEN
      INSERT INTO public.institution_claim_notifications (
        claim_id, recipient_user_id, notification_type, title, message, action_url
      ) VALUES (
        renewal_record.original_claim_id,
        renewal_record.user_id,
        'renewal_urgent',
        'URGENT: Institution Claim Renewal Due in 7 Days',
        'Your claim for ' || renewal_record.institution_name || ' expires in 7 days. Immediate action required.',
        '/institutions/renew/' || renewal_record.original_claim_id
      );
      
      UPDATE public.institution_claim_renewals 
      SET reminder_sent_7_days = true 
      WHERE id = renewal_record.id;
      
      reminders_count := reminders_count + 1;
    END IF;
    
    -- Send 1-day final reminder
    IF days_until_renewal <= 1 AND NOT renewal_record.reminder_sent_1_day THEN
      INSERT INTO public.institution_claim_notifications (
        claim_id, recipient_user_id, notification_type, title, message, action_url
      ) VALUES (
        renewal_record.original_claim_id,
        renewal_record.user_id,
        'renewal_final',
        'FINAL NOTICE: Institution Claim Expires Today',
        'Your claim for ' || renewal_record.institution_name || ' expires today. Renew immediately to avoid losing access.',
        '/institutions/renew/' || renewal_record.original_claim_id
      );
      
      UPDATE public.institution_claim_renewals 
      SET reminder_sent_1_day = true 
      WHERE id = renewal_record.id;
      
      reminders_count := reminders_count + 1;
    END IF;
    
    renewals_count := renewals_count + 1;
  END LOOP;
  
  -- Handle expired claims (move to grace period or revoke access)
  UPDATE public.institution_claim_renewals 
  SET renewal_status = 'expired'
  WHERE renewal_due_date < now() 
  AND renewal_status = 'pending';
  
  -- Revoke access for claims past grace period
  UPDATE public.institutions 
  SET claimed_by = NULL, claim_status = 'unclaimed'
  WHERE id IN (
    SELECT i.id FROM public.institutions i
    JOIN public.institution_claim_renewals cr ON cr.original_claim_id = (
      SELECT ic.id FROM public.institution_claims ic WHERE ic.institution_name = i.name AND ic.user_id = i.claimed_by LIMIT 1
    )
    WHERE cr.grace_period_expires < now() AND cr.renewal_status = 'expired'
  );
  
  RETURN QUERY SELECT renewals_count, reminders_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;