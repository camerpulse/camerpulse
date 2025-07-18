-- Create enums for certificate types and status
CREATE TYPE certificate_type AS ENUM ('participation', 'speaker', 'organizer', 'education_completion');
CREATE TYPE certificate_status AS ENUM ('pending', 'issued', 'claimed', 'revoked');
CREATE TYPE certificate_template AS ENUM ('modern', 'classic', 'official');

-- Enhance existing event_certificates table
ALTER TABLE public.event_certificates 
ADD COLUMN IF NOT EXISTS certificate_type certificate_type NOT NULL DEFAULT 'participation',
ADD COLUMN IF NOT EXISTS certificate_status certificate_status NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS template_design certificate_template NOT NULL DEFAULT 'modern',
ADD COLUMN IF NOT EXISTS certificate_title TEXT,
ADD COLUMN IF NOT EXISTS recipient_name TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS recipient_role TEXT,
ADD COLUMN IF NOT EXISTS organizer_name TEXT,
ADD COLUMN IF NOT EXISTS organizer_signature_url TEXT,
ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
ADD COLUMN IF NOT EXISTS verification_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS custom_text TEXT,
ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS issued_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS downloaded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- Create certificate templates table
CREATE TABLE IF NOT EXISTS public.certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  template_type certificate_template NOT NULL,
  template_config JSONB NOT NULL DEFAULT '{}',
  preview_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create certificate verification logs
CREATE TABLE IF NOT EXISTS public.certificate_verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID REFERENCES public.event_certificates(id) ON DELETE CASCADE,
  verification_code TEXT NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verifier_ip INET,
  verifier_user_agent TEXT,
  is_valid BOOLEAN DEFAULT true
);

-- Create event certificate settings
CREATE TABLE IF NOT EXISTS public.event_certificate_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.civic_events(id) ON DELETE CASCADE UNIQUE,
  certificates_enabled BOOLEAN DEFAULT false,
  auto_issue BOOLEAN DEFAULT false,
  manual_approval_required BOOLEAN DEFAULT true,
  require_checkin BOOLEAN DEFAULT true,
  template_design certificate_template DEFAULT 'modern',
  custom_template_config JSONB DEFAULT '{}',
  organizer_signature_url TEXT,
  certificate_message TEXT,
  claim_deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Generate verification codes function
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists_flag BOOLEAN;
BEGIN
  LOOP
    code := 'CERT-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    SELECT EXISTS(SELECT 1 FROM public.event_certificates WHERE verification_code = code) INTO exists_flag;
    IF NOT exists_flag THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN code;
END;
$$;

-- Trigger to generate verification codes
CREATE OR REPLACE FUNCTION set_certificate_verification_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.verification_code IS NULL THEN
    NEW.verification_code := generate_verification_code();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_certificate_verification_code
  BEFORE INSERT OR UPDATE ON public.event_certificates
  FOR EACH ROW
  EXECUTE FUNCTION set_certificate_verification_code();

-- Update timestamp trigger for templates
CREATE OR REPLACE FUNCTION update_certificate_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_certificate_templates_updated_at
  BEFORE UPDATE ON public.certificate_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_certificate_updated_at();

CREATE TRIGGER trigger_update_certificate_settings_updated_at
  BEFORE UPDATE ON public.event_certificate_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_certificate_updated_at();

-- Enable RLS
ALTER TABLE public.event_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_certificate_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_certificates
CREATE POLICY "Users can view their own certificates"
ON public.event_certificates
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Event organizers can manage certificates"
ON public.event_certificates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.civic_events 
    WHERE id = event_id AND created_by = auth.uid()
  )
);

CREATE POLICY "Admins can manage all certificates"
ON public.event_certificates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for certificate_templates
CREATE POLICY "Everyone can view active templates"
ON public.certificate_templates
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage templates"
ON public.certificate_templates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for verification logs
CREATE POLICY "Public verification access"
ON public.certificate_verification_logs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view verification logs"
ON public.certificate_verification_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for certificate settings
CREATE POLICY "Event organizers can manage certificate settings"
ON public.event_certificate_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.civic_events 
    WHERE id = event_id AND created_by = auth.uid()
  )
);

CREATE POLICY "Public can view certificate settings"
ON public.event_certificate_settings
FOR SELECT
USING (true);

-- Insert default certificate templates
INSERT INTO public.certificate_templates (template_name, template_type, template_config) VALUES
('Modern Design', 'modern', '{"primaryColor": "#059669", "accentColor": "#10b981", "fontFamily": "Inter", "layout": "horizontal"}'),
('Classic Design', 'classic', '{"primaryColor": "#1f2937", "accentColor": "#6b7280", "fontFamily": "Times", "layout": "vertical"}'),
('Official Design', 'official', '{"primaryColor": "#dc2626", "accentColor": "#ef4444", "fontFamily": "Arial", "layout": "bordered"}');

-- Function to auto-issue certificates for RSVP attendees
CREATE OR REPLACE FUNCTION auto_issue_certificates_for_event(event_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  settings_record RECORD;
  rsvp_record RECORD;
  certificate_count INTEGER := 0;
BEGIN
  -- Get certificate settings for event
  SELECT * INTO settings_record 
  FROM public.event_certificate_settings 
  WHERE event_id = event_id_param;
  
  IF NOT FOUND OR NOT settings_record.certificates_enabled OR NOT settings_record.auto_issue THEN
    RETURN 0;
  END IF;
  
  -- Issue certificates for all RSVPs
  FOR rsvp_record IN 
    SELECT DISTINCT er.user_id, er.event_id, ce.name as event_name
    FROM public.event_rsvps er
    JOIN public.civic_events ce ON er.event_id = ce.id
    WHERE er.event_id = event_id_param
    AND er.status = 'confirmed'
    AND NOT EXISTS (
      SELECT 1 FROM public.event_certificates ec 
      WHERE ec.event_id = er.event_id AND ec.user_id = er.user_id
    )
  LOOP
    INSERT INTO public.event_certificates (
      event_id, user_id, certificate_type, certificate_status,
      template_design, recipient_name, recipient_role,
      organizer_name, certificate_title
    ) VALUES (
      rsvp_record.event_id, rsvp_record.user_id, 'participation', 'issued',
      settings_record.template_design, '', 'Attendee',
      settings_record.organizer_signature_url, 
      'Certificate of Participation - ' || rsvp_record.event_name
    );
    certificate_count := certificate_count + 1;
  END LOOP;
  
  RETURN certificate_count;
END;
$$;