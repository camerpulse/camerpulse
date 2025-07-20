-- Advanced features for claim institution flow (handling existing tables)

-- Create institution dashboards table
CREATE TABLE IF NOT EXISTS public.institution_dashboards (
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

-- Create claim renewal tracking
CREATE TABLE IF NOT EXISTS public.institution_claim_renewals (
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
CREATE TABLE IF NOT EXISTS public.institution_access_logs (
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
CREATE INDEX IF NOT EXISTS idx_institution_dashboards_owner ON public.institution_dashboards(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_institution_dashboards_institution ON public.institution_dashboards(institution_id);
CREATE INDEX IF NOT EXISTS idx_claim_renewals_due_date ON public.institution_claim_renewals(renewal_due_date);
CREATE INDEX IF NOT EXISTS idx_claim_renewals_status ON public.institution_claim_renewals(renewal_status);
CREATE INDEX IF NOT EXISTS idx_access_logs_institution ON public.institution_access_logs(institution_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_user ON public.institution_access_logs(user_id);

-- Enable RLS
ALTER TABLE public.institution_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_claim_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for institution dashboards
CREATE POLICY "Institution owners can manage their dashboards" 
ON public.institution_dashboards FOR ALL USING (auth.uid() = owner_user_id);

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
      -- Create notification record in existing table
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
    
    renewals_count := renewals_count + 1;
  END LOOP;
  
  RETURN QUERY SELECT renewals_count, reminders_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to setup cron job for renewals (run manually once)
CREATE OR REPLACE FUNCTION setup_renewal_cron_job()
RETURNS TEXT AS $$
BEGIN
  -- Note: This function creates the cron job
  -- In a real deployment, this would be configured separately
  RETURN 'Cron job setup function created. Configure pg_cron to call check_claim_renewals() daily.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;