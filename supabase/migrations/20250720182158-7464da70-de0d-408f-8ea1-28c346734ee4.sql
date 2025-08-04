-- CamerPulse Civic Shield & Whistleblower Protection System

-- Enum types for the system
CREATE TYPE shield_status AS ENUM ('active', 'protected', 'high_risk', 'inactive');
CREATE TYPE disclosure_type AS ENUM ('corruption', 'misconduct', 'abuse', 'financial_fraud', 'environmental', 'human_rights', 'other');
CREATE TYPE threat_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'disputed', 'dismissed');

-- Civic Shield Configuration Table
CREATE TABLE public.civic_shield_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  system_enabled BOOLEAN NOT NULL DEFAULT true,
  global_encryption_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_risk_assessment BOOLEAN NOT NULL DEFAULT true,
  region_restrictions TEXT[] DEFAULT ARRAY[]::TEXT[],
  sector_restrictions TEXT[] DEFAULT ARRAY[]::TEXT[],
  threat_threshold_config JSONB DEFAULT '{"auto_protect": 7, "alert_moderators": 8, "emergency_protocols": 9}'::JSONB,
  admin_id UUID NOT NULL,
  admin_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Whistleblower Submissions Table
CREATE TABLE public.whistleblower_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_code TEXT NOT NULL UNIQUE, -- Public tracking code
  pseudonym TEXT NOT NULL, -- Auto-generated alias
  encrypted_identity_hash TEXT, -- For internal tracking only
  disclosure_type disclosure_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_files TEXT[] DEFAULT ARRAY[]::TEXT[],
  related_entity_type TEXT, -- 'ministry', 'project', 'politician', etc.
  related_entity_id UUID,
  threat_level threat_level NOT NULL DEFAULT 'medium',
  verification_status verification_status NOT NULL DEFAULT 'pending',
  region TEXT,
  estimated_financial_impact BIGINT,
  urgency_level INTEGER NOT NULL DEFAULT 5, -- 1-10 scale
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  submitter_ip_hash TEXT, -- Hashed for security
  submission_metadata JSONB DEFAULT '{}'::JSONB,
  moderator_notes TEXT,
  admin_notes TEXT,
  assigned_moderator_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Civic Shield User Protection Table
CREATE TABLE public.civic_shield_protection (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID, -- Can be null for anonymous users
  protection_alias TEXT NOT NULL UNIQUE,
  shield_status shield_status NOT NULL DEFAULT 'active',
  risk_score INTEGER NOT NULL DEFAULT 0, -- 0-10 scale
  threat_indicators JSONB DEFAULT '[]'::JSONB,
  protection_measures JSONB DEFAULT '{}'::JSONB,
  ip_obfuscation_enabled BOOLEAN NOT NULL DEFAULT false,
  visibility_cloaked BOOLEAN NOT NULL DEFAULT false,
  public_profile_hidden BOOLEAN NOT NULL DEFAULT false,
  auto_protection_triggered BOOLEAN NOT NULL DEFAULT false,
  protection_expiry TIMESTAMP WITH TIME ZONE,
  activated_by UUID,
  activation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Submission Follow-up Communications
CREATE TABLE public.submission_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.whistleblower_submissions(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL, -- 'submitter', 'moderator', 'admin'
  sender_alias TEXT NOT NULL,
  message_content TEXT NOT NULL,
  is_encrypted BOOLEAN NOT NULL DEFAULT true,
  message_hash TEXT, -- For integrity verification
  attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Civic Shield Audit Trail (Encrypted)
CREATE TABLE public.civic_shield_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'submission', 'protection', 'config'
  target_id UUID NOT NULL,
  admin_id UUID,
  admin_name TEXT,
  action_description TEXT NOT NULL,
  encryption_used BOOLEAN NOT NULL DEFAULT true,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Risk Assessment Engine Data
CREATE TABLE public.civic_risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_type TEXT NOT NULL, -- 'user', 'submission', 'region'
  target_id UUID NOT NULL,
  risk_factors JSONB NOT NULL DEFAULT '[]'::JSONB,
  risk_score INTEGER NOT NULL DEFAULT 0,
  threat_level threat_level NOT NULL DEFAULT 'low',
  assessment_algorithm TEXT NOT NULL DEFAULT 'civic_shield_v1',
  confidence_level NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  recommendations JSONB DEFAULT '[]'::JSONB,
  auto_actions_taken JSONB DEFAULT '[]'::JSONB,
  expires_at TIMESTAMP WITH TIME ZONE,
  assessed_by TEXT DEFAULT 'auto_system',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Moderator Assignment & Workload
CREATE TABLE public.civic_shield_moderators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  moderator_name TEXT NOT NULL,
  specializations TEXT[] DEFAULT ARRAY[]::TEXT[], -- corruption, abuse, etc.
  regions_covered TEXT[] DEFAULT ARRAY[]::TEXT[],
  security_clearance_level INTEGER NOT NULL DEFAULT 1, -- 1-5
  active_cases INTEGER NOT NULL DEFAULT 0,
  max_case_load INTEGER NOT NULL DEFAULT 10,
  encryption_certified BOOLEAN NOT NULL DEFAULT false,
  last_active TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Civic Shield Legal Aid Requests
CREATE TABLE public.civic_legal_aid_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_alias TEXT NOT NULL,
  submission_id UUID REFERENCES public.whistleblower_submissions(id),
  request_type TEXT NOT NULL, -- 'advice', 'representation', 'protection'
  legal_issue_category TEXT NOT NULL,
  urgency_level INTEGER NOT NULL DEFAULT 5,
  request_description TEXT NOT NULL,
  contact_preference TEXT NOT NULL DEFAULT 'secure_messaging',
  encrypted_contact_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_legal_aid_id UUID,
  case_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.civic_shield_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whistleblower_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_shield_protection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_shield_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_shield_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_legal_aid_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Civic Shield Config - Only admins
CREATE POLICY "Admins can manage civic shield config" ON public.civic_shield_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Whistleblower Submissions - Complex access control
CREATE POLICY "Moderators can view assigned submissions" ON public.whistleblower_submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')) OR
    assigned_moderator_id = auth.uid()
  );

CREATE POLICY "System can create submissions" ON public.whistleblower_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins and assigned moderators can update submissions" ON public.whistleblower_submissions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin') OR
    assigned_moderator_id = auth.uid()
  );

-- Civic Shield Protection
CREATE POLICY "Users can view their own protection" ON public.civic_shield_protection
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Moderators can manage protection" ON public.civic_shield_protection
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- Submission Communications
CREATE POLICY "Participants can view submission communications" ON public.submission_communications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.whistleblower_submissions ws 
      WHERE ws.id = submission_communications.submission_id 
      AND (ws.assigned_moderator_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "Moderators can create communications" ON public.submission_communications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- Civic Shield Audit - Admin only
CREATE POLICY "Admins can view audit trail" ON public.civic_shield_audit
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Risk Assessments - Moderators and admins
CREATE POLICY "Moderators can view risk assessments" ON public.civic_risk_assessments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- Civic Shield Moderators
CREATE POLICY "Moderators can view moderator data" ON public.civic_shield_moderators
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage moderators" ON public.civic_shield_moderators
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Legal Aid Requests
CREATE POLICY "Moderators can view legal aid requests" ON public.civic_legal_aid_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

CREATE POLICY "System can create legal aid requests" ON public.civic_legal_aid_requests
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_whistleblower_submissions_code ON public.whistleblower_submissions(submission_code);
CREATE INDEX idx_whistleblower_submissions_type ON public.whistleblower_submissions(disclosure_type);
CREATE INDEX idx_whistleblower_submissions_threat ON public.whistleblower_submissions(threat_level);
CREATE INDEX idx_civic_shield_protection_user ON public.civic_shield_protection(user_id);
CREATE INDEX idx_civic_shield_protection_alias ON public.civic_shield_protection(protection_alias);
CREATE INDEX idx_submission_communications_submission ON public.submission_communications(submission_id);
CREATE INDEX idx_civic_risk_assessments_target ON public.civic_risk_assessments(target_id, assessment_type);

-- Functions for the system

-- Generate secure submission code
CREATE OR REPLACE FUNCTION generate_submission_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    code := 'CS-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
    SELECT EXISTS(SELECT 1 FROM public.whistleblower_submissions WHERE submission_code = code) INTO code_exists;
    IF NOT code_exists THEN EXIT; END IF;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Generate protection alias
CREATE OR REPLACE FUNCTION generate_protection_alias()
RETURNS TEXT AS $$
DECLARE
  alias_words TEXT[] := ARRAY['Shield', 'Guardian', 'Protector', 'Defender', 'Sentinel', 'Keeper', 'Watcher', 'Civic', 'Truth', 'Justice'];
  numbers TEXT;
  alias TEXT;
  alias_exists BOOLEAN;
BEGIN
  LOOP
    numbers := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    alias := alias_words[1 + (RANDOM() * array_length(alias_words, 1))::INT] || numbers;
    SELECT EXISTS(SELECT 1 FROM public.civic_shield_protection WHERE protection_alias = alias) INTO alias_exists;
    IF NOT alias_exists THEN EXIT; END IF;
  END LOOP;
  RETURN alias;
END;
$$ LANGUAGE plpgsql;

-- Calculate risk score
CREATE OR REPLACE FUNCTION calculate_civic_risk_score(p_target_type TEXT, p_target_id UUID)
RETURNS INTEGER AS $$
DECLARE
  risk_score INTEGER := 0;
  submission_record RECORD;
BEGIN
  IF p_target_type = 'submission' THEN
    SELECT * INTO submission_record FROM public.whistleblower_submissions WHERE id = p_target_id;
    
    -- Base score from disclosure type
    CASE submission_record.disclosure_type
      WHEN 'corruption' THEN risk_score := risk_score + 3;
      WHEN 'misconduct' THEN risk_score := risk_score + 2;
      WHEN 'abuse' THEN risk_score := risk_score + 4;
      WHEN 'financial_fraud' THEN risk_score := risk_score + 3;
      WHEN 'human_rights' THEN risk_score := risk_score + 5;
      ELSE risk_score := risk_score + 1;
    END CASE;
    
    -- Add urgency factor
    risk_score := risk_score + (submission_record.urgency_level / 2);
    
    -- Add financial impact factor
    IF submission_record.estimated_financial_impact > 1000000000 THEN -- 1 billion FCFA
      risk_score := risk_score + 2;
    ELSIF submission_record.estimated_financial_impact > 100000000 THEN -- 100 million FCFA
      risk_score := risk_score + 1;
    END IF;
  END IF;
  
  RETURN LEAST(10, risk_score);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log civic shield actions
CREATE OR REPLACE FUNCTION log_civic_shield_action(
  p_action_type TEXT,
  p_target_type TEXT,
  p_target_id UUID,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.civic_shield_audit (
    action_type, target_type, target_id, admin_id, admin_name,
    action_description, ip_address, metadata
  ) VALUES (
    p_action_type, p_target_type, p_target_id, auth.uid(),
    COALESCE((SELECT display_name FROM profiles WHERE id = auth.uid()), 'System'),
    p_description, inet_client_addr(), p_metadata
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers

-- Auto-generate submission code
CREATE OR REPLACE FUNCTION set_submission_defaults()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.submission_code IS NULL THEN
    NEW.submission_code := generate_submission_code();
  END IF;
  
  IF NEW.pseudonym IS NULL THEN
    NEW.pseudonym := 'Whistleblower' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER whistleblower_submissions_defaults
  BEFORE INSERT OR UPDATE ON public.whistleblower_submissions
  FOR EACH ROW EXECUTE FUNCTION set_submission_defaults();

-- Auto-generate protection alias
CREATE OR REPLACE FUNCTION set_protection_defaults()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.protection_alias IS NULL THEN
    NEW.protection_alias := generate_protection_alias();
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER civic_shield_protection_defaults
  BEFORE INSERT OR UPDATE ON public.civic_shield_protection
  FOR EACH ROW EXECUTE FUNCTION set_protection_defaults();

-- Auto risk assessment on submission
CREATE OR REPLACE FUNCTION auto_risk_assessment()
RETURNS TRIGGER AS $$
DECLARE
  calculated_risk INTEGER;
  threat_level_result threat_level;
BEGIN
  calculated_risk := calculate_civic_risk_score('submission', NEW.id);
  
  -- Determine threat level
  IF calculated_risk >= 8 THEN
    threat_level_result := 'critical';
  ELSIF calculated_risk >= 6 THEN
    threat_level_result := 'high';
  ELSIF calculated_risk >= 4 THEN
    threat_level_result := 'medium';
  ELSE
    threat_level_result := 'low';
  END IF;
  
  -- Insert risk assessment
  INSERT INTO public.civic_risk_assessments (
    assessment_type, target_id, risk_score, threat_level,
    risk_factors, recommendations
  ) VALUES (
    'submission', NEW.id, calculated_risk, threat_level_result,
    jsonb_build_array(
      jsonb_build_object('factor', 'disclosure_type', 'value', NEW.disclosure_type),
      jsonb_build_object('factor', 'urgency_level', 'value', NEW.urgency_level)
    ),
    CASE 
      WHEN calculated_risk >= 8 THEN '["immediate_protection", "priority_review", "legal_aid"]'::JSONB
      WHEN calculated_risk >= 6 THEN '["enhanced_protection", "expedited_review"]'::JSONB
      ELSE '["standard_protection", "regular_review"]'::JSONB
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_risk_assessment_trigger
  AFTER INSERT ON public.whistleblower_submissions
  FOR EACH ROW EXECUTE FUNCTION auto_risk_assessment();

-- Insert default civic shield configuration
INSERT INTO public.civic_shield_config (
  system_enabled,
  global_encryption_enabled,
  auto_risk_assessment,
  admin_id,
  admin_name,
  threat_threshold_config
) VALUES (
  true,
  true,
  true,
  gen_random_uuid(),
  'System',
  '{"auto_protect": 7, "alert_moderators": 8, "emergency_protocols": 9, "regions_high_risk": ["Far North", "Northwest", "Southwest"], "sectors_sensitive": ["Defense", "Finance", "Justice"]}'::JSONB
);

COMMENT ON TABLE public.whistleblower_submissions IS 'Secure submissions from whistleblowers with encryption and anonymity protection';
COMMENT ON TABLE public.civic_shield_protection IS 'User protection records for civic actors at risk';
COMMENT ON TABLE public.civic_shield_audit IS 'Encrypted audit trail for all civic shield activities';
COMMENT ON TABLE public.civic_risk_assessments IS 'Automated and manual risk assessments for civic protection';