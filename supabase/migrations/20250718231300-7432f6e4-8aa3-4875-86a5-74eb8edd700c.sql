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

DROP TRIGGER IF EXISTS trigger_set_certificate_verification_code ON public.event_certificates;
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

DROP TRIGGER IF EXISTS trigger_update_certificate_templates_updated_at ON public.certificate_templates;
CREATE TRIGGER trigger_update_certificate_templates_updated_at
  BEFORE UPDATE ON public.certificate_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_certificate_updated_at();

DROP TRIGGER IF EXISTS trigger_update_certificate_settings_updated_at ON public.event_certificate_settings;
CREATE TRIGGER trigger_update_certificate_settings_updated_at
  BEFORE UPDATE ON public.event_certificate_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_certificate_updated_at();

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
      '', 
      'Certificate of Participation - ' || rsvp_record.event_name
    );
    certificate_count := certificate_count + 1;
  END LOOP;
  
  RETURN certificate_count;
END;
$$;