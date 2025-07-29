-- Phase 1: Core Civic Tools Database Schema
-- Petition Engine, Civic Complaint Portal, Budget Transparency Tracker

-- Create enum types for petitions
CREATE TYPE petition_status AS ENUM ('draft', 'active', 'closed', 'successful', 'rejected');
CREATE TYPE petition_category AS ENUM ('infrastructure', 'education', 'health', 'environment', 'governance', 'social_justice', 'economic', 'other');
CREATE TYPE signature_verification_status AS ENUM ('pending', 'verified', 'rejected', 'flagged');

-- Create enum types for complaints
CREATE TYPE complaint_status AS ENUM ('submitted', 'under_review', 'in_progress', 'resolved', 'closed', 'escalated');
CREATE TYPE complaint_priority AS ENUM ('low', 'medium', 'high', 'urgent', 'critical');
CREATE TYPE complaint_category AS ENUM ('roads', 'water', 'electricity', 'waste_management', 'public_transport', 'healthcare', 'education', 'safety', 'corruption', 'other');

-- Create enum types for budget tracking
CREATE TYPE budget_item_type AS ENUM ('revenue', 'expenditure', 'investment', 'debt', 'grant', 'loan');
CREATE TYPE budget_status AS ENUM ('proposed', 'approved', 'allocated', 'disbursed', 'completed', 'cancelled');

-- =====================
-- PETITION ENGINE TABLES
-- =====================

-- Main petitions table
CREATE TABLE public.civic_petitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  petition_text TEXT NOT NULL,
  category petition_category NOT NULL,
  target_signatures INTEGER NOT NULL DEFAULT 1000,
  current_signatures INTEGER DEFAULT 0,
  status petition_status DEFAULT 'draft',
  created_by UUID NOT NULL,
  target_authority TEXT, -- Which government body/official
  deadline DATE,
  location_scope TEXT, -- village, city, region, national
  specific_location TEXT,
  coordinates JSONB,
  supporting_documents JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  featured BOOLEAN DEFAULT false,
  verified_petition BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  response_received BOOLEAN DEFAULT false,
  official_response TEXT,
  response_date TIMESTAMP WITH TIME ZONE,
  response_from TEXT,
  success_outcome TEXT,
  media_coverage JSONB DEFAULT '[]',
  social_media_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE,
  closure_reason TEXT,
  impact_achieved TEXT,
  follow_up_actions JSONB DEFAULT '[]'
);

-- Petition signatures
CREATE TABLE public.petition_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  petition_id UUID NOT NULL REFERENCES public.civic_petitions(id) ON DELETE CASCADE,
  user_id UUID, -- Can be null for anonymous signatures
  signer_name TEXT NOT NULL,
  signer_email TEXT,
  signer_location TEXT,
  signature_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verification_status signature_verification_status DEFAULT 'pending',
  verification_token TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  comment TEXT,
  public_comment BOOLEAN DEFAULT false,
  notification_preferences JSONB DEFAULT '{"updates": true, "responses": true}',
  UNIQUE(petition_id, user_id), -- Prevent duplicate signatures from same user
  UNIQUE(petition_id, signer_email) -- Prevent duplicate signatures from same email
);

-- Petition updates and milestones
CREATE TABLE public.petition_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  petition_id UUID NOT NULL REFERENCES public.civic_petitions(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL, -- milestone, response, media, general
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID NOT NULL,
  update_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  media_files JSONB DEFAULT '[]',
  is_major_update BOOLEAN DEFAULT false,
  notify_signers BOOLEAN DEFAULT true,
  signatures_at_update INTEGER DEFAULT 0
);

-- Petition campaigns and actions
CREATE TABLE public.petition_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  petition_id UUID NOT NULL REFERENCES public.civic_petitions(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  campaign_description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  campaign_type TEXT, -- social_media, rally, letter_writing, media_outreach
  target_reach INTEGER,
  actual_reach INTEGER DEFAULT 0,
  budget_allocated BIGINT DEFAULT 0,
  budget_spent BIGINT DEFAULT 0,
  success_metrics JSONB DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- =====================
-- CIVIC COMPLAINT PORTAL TABLES
-- =====================

-- Main complaints table
CREATE TABLE public.civic_complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_number TEXT UNIQUE NOT NULL, -- Auto-generated unique identifier
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category complaint_category NOT NULL,
  priority complaint_priority DEFAULT 'medium',
  status complaint_status DEFAULT 'submitted',
  location_description TEXT NOT NULL,
  specific_address TEXT,
  coordinates JSONB,
  region TEXT,
  submitted_by UUID, -- Can be null for anonymous
  submitter_name TEXT NOT NULL,
  submitter_email TEXT,
  submitter_phone TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  evidence_photos JSONB DEFAULT '[]',
  evidence_documents JSONB DEFAULT '[]',
  affected_people_count INTEGER DEFAULT 1,
  estimated_cost_fcfa BIGINT,
  urgency_level INTEGER DEFAULT 5 CHECK (urgency_level >= 1 AND urgency_level <= 10),
  public_safety_risk BOOLEAN DEFAULT false,
  environmental_impact BOOLEAN DEFAULT false,
  economic_impact BOOLEAN DEFAULT false,
  assigned_to TEXT, -- Department/agency responsible
  assigned_official UUID,
  assigned_at TIMESTAMP WITH TIME ZONE,
  response_deadline DATE,
  resolution_deadline DATE,
  estimated_resolution_time INTEGER, -- in days
  actual_resolution_time INTEGER, -- in days
  resolution_description TEXT,
  resolution_cost BIGINT,
  resolution_photos JSONB DEFAULT '[]',
  citizen_satisfaction_rating INTEGER CHECK (citizen_satisfaction_rating >= 1 AND citizen_satisfaction_rating <= 5),
  satisfaction_comment TEXT,
  duplicate_of UUID REFERENCES public.civic_complaints(id),
  related_complaints JSONB DEFAULT '[]',
  escalation_level INTEGER DEFAULT 1,
  escalated_to TEXT,
  escalation_reason TEXT,
  media_attention BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  community_impact_score INTEGER DEFAULT 5,
  metadata JSONB DEFAULT '{}'
);

-- Complaint status updates and communications
CREATE TABLE public.complaint_status_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID NOT NULL REFERENCES public.civic_complaints(id) ON DELETE CASCADE,
  previous_status complaint_status,
  new_status complaint_status NOT NULL,
  update_message TEXT,
  internal_notes TEXT,
  updated_by UUID,
  updater_role TEXT, -- citizen, official, admin, system
  estimated_completion DATE,
  completion_percentage INTEGER DEFAULT 0,
  photos_attached JSONB DEFAULT '[]',
  documents_attached JSONB DEFAULT '[]',
  public_update BOOLEAN DEFAULT true,
  notify_submitter BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  budget_update JSONB DEFAULT '{}'
);

-- Government department assignments
CREATE TABLE public.complaint_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID NOT NULL REFERENCES public.civic_complaints(id) ON DELETE CASCADE,
  department_name TEXT NOT NULL,
  department_contact TEXT,
  assigned_official_name TEXT,
  assigned_official_email TEXT,
  assignment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expected_response_time INTEGER, -- in hours
  assignment_reason TEXT,
  is_primary_assignee BOOLEAN DEFAULT true,
  assignment_status TEXT DEFAULT 'active', -- active, transferred, completed
  transferred_to TEXT,
  transfer_reason TEXT,
  created_by UUID NOT NULL
);

-- =====================
-- BUDGET TRANSPARENCY TRACKER TABLES
-- =====================

-- Main budget tracking table
CREATE TABLE public.budget_transparency (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_year INTEGER NOT NULL,
  budget_title TEXT NOT NULL,
  description TEXT,
  budget_type budget_item_type NOT NULL,
  ministry_department TEXT NOT NULL,
  budget_line_item TEXT,
  allocated_amount_fcfa BIGINT NOT NULL,
  allocated_amount_usd NUMERIC,
  disbursed_amount_fcfa BIGINT DEFAULT 0,
  disbursed_amount_usd NUMERIC DEFAULT 0,
  spent_amount_fcfa BIGINT DEFAULT 0,
  spent_amount_usd NUMERIC DEFAULT 0,
  remaining_amount_fcfa BIGINT DEFAULT 0,
  status budget_status DEFAULT 'proposed',
  approval_date DATE,
  disbursement_schedule JSONB DEFAULT '[]',
  actual_disbursements JSONB DEFAULT '[]',
  expenditure_breakdown JSONB DEFAULT '{}',
  beneficiary_regions JSONB DEFAULT '[]',
  target_beneficiaries INTEGER,
  actual_beneficiaries INTEGER DEFAULT 0,
  project_codes JSONB DEFAULT '[]', -- Link to government projects
  procurement_details JSONB DEFAULT '{}',
  audit_status TEXT DEFAULT 'pending',
  audit_findings TEXT,
  audit_date DATE,
  auditor_name TEXT,
  transparency_score NUMERIC DEFAULT 5.0 CHECK (transparency_score >= 0 AND transparency_score <= 10),
  public_accessibility_score NUMERIC DEFAULT 5.0,
  documentation_completeness NUMERIC DEFAULT 5.0,
  citizen_oversight_enabled BOOLEAN DEFAULT true,
  reporting_frequency TEXT DEFAULT 'quarterly', -- monthly, quarterly, annually
  last_report_date DATE,
  next_report_due DATE,
  variance_threshold_percentage NUMERIC DEFAULT 10.0,
  alert_on_variance BOOLEAN DEFAULT true,
  funding_source TEXT, -- national, world_bank, eu, etc.
  funding_conditions TEXT,
  performance_indicators JSONB DEFAULT '{}',
  expected_outcomes TEXT,
  actual_outcomes TEXT,
  impact_measurement JSONB DEFAULT '{}',
  created_by UUID,
  verified_by UUID,
  verification_date DATE,
  data_source TEXT, -- government_portal, manual_entry, api_sync
  source_document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Budget monitoring alerts
CREATE TABLE public.budget_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES public.budget_transparency(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- variance, delay, transparency, audit
  alert_severity TEXT DEFAULT 'medium', -- low, medium, high, critical
  alert_message TEXT NOT NULL,
  variance_percentage NUMERIC,
  threshold_exceeded NUMERIC,
  current_value NUMERIC,
  expected_value NUMERIC,
  alert_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN DEFAULT false,
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  auto_generated BOOLEAN DEFAULT true,
  notify_citizens BOOLEAN DEFAULT true,
  public_visibility BOOLEAN DEFAULT true
);

-- Citizen budget oversight and feedback
CREATE TABLE public.budget_citizen_oversight (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES public.budget_transparency(id) ON DELETE CASCADE,
  citizen_user_id UUID,
  oversight_type TEXT NOT NULL, -- question, concern, suggestion, complaint, commendation
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_files JSONB DEFAULT '[]',
  location_affected TEXT,
  priority_level TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'submitted', -- submitted, reviewed, responded, closed
  assigned_to TEXT,
  response_text TEXT,
  response_date TIMESTAMP WITH TIME ZONE,
  response_by UUID,
  citizen_satisfaction INTEGER CHECK (citizen_satisfaction >= 1 AND citizen_satisfaction <= 5),
  follow_up_required BOOLEAN DEFAULT false,
  public_interest_score INTEGER DEFAULT 5,
  media_attention BOOLEAN DEFAULT false,
  resolution_impact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  anonymous_submission BOOLEAN DEFAULT false,
  contact_email TEXT,
  contact_phone TEXT
);

-- Create indexes for performance
CREATE INDEX idx_civic_petitions_status ON public.civic_petitions(status);
CREATE INDEX idx_civic_petitions_category ON public.civic_petitions(category);
CREATE INDEX idx_civic_petitions_created_by ON public.civic_petitions(created_by);
CREATE INDEX idx_civic_petitions_deadline ON public.civic_petitions(deadline);
CREATE INDEX idx_petition_signatures_petition ON public.petition_signatures(petition_id);
CREATE INDEX idx_petition_signatures_user ON public.petition_signatures(user_id);
CREATE INDEX idx_petition_signatures_verification ON public.petition_signatures(verification_status);
CREATE INDEX idx_civic_complaints_status ON public.civic_complaints(status);
CREATE INDEX idx_civic_complaints_category ON public.civic_complaints(category);
CREATE INDEX idx_civic_complaints_priority ON public.civic_complaints(priority);
CREATE INDEX idx_civic_complaints_region ON public.civic_complaints(region);
CREATE INDEX idx_civic_complaints_assigned ON public.civic_complaints(assigned_to);
CREATE INDEX idx_civic_complaints_created_at ON public.civic_complaints(created_at);
CREATE INDEX idx_budget_transparency_year ON public.budget_transparency(budget_year);
CREATE INDEX idx_budget_transparency_ministry ON public.budget_transparency(ministry_department);
CREATE INDEX idx_budget_transparency_status ON public.budget_transparency(status);
CREATE INDEX idx_budget_transparency_type ON public.budget_transparency(budget_type);
CREATE INDEX idx_budget_alerts_budget ON public.budget_alerts(budget_id);
CREATE INDEX idx_budget_alerts_severity ON public.budget_alerts(alert_severity);

-- Enable RLS
ALTER TABLE public.civic_petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petition_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petition_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petition_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_transparency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_citizen_oversight ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Petitions
CREATE POLICY "Public can view active petitions" 
ON public.civic_petitions FOR SELECT USING (status IN ('active', 'successful', 'closed'));

CREATE POLICY "Users can create petitions" 
ON public.civic_petitions FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Petition creators can update their petitions" 
ON public.civic_petitions FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all petitions" 
ON public.civic_petitions FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for Petition Signatures
CREATE POLICY "Public can view verified signatures" 
ON public.petition_signatures FOR SELECT USING (verification_status = 'verified');

CREATE POLICY "Users can sign petitions" 
ON public.petition_signatures FOR INSERT WITH CHECK (
  auth.uid() = user_id OR user_id IS NULL
);

CREATE POLICY "Users can update their own signatures" 
ON public.petition_signatures FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Complaints
CREATE POLICY "Public can view non-sensitive complaints" 
ON public.civic_complaints FOR SELECT USING (is_anonymous = false OR auth.uid() = submitted_by);

CREATE POLICY "Users can submit complaints" 
ON public.civic_complaints FOR INSERT WITH CHECK (
  auth.uid() = submitted_by OR submitted_by IS NULL
);

CREATE POLICY "Complaint submitters can update their complaints" 
ON public.civic_complaints FOR UPDATE USING (auth.uid() = submitted_by);

CREATE POLICY "Officials can manage assigned complaints" 
ON public.civic_complaints FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'official'))
);

-- RLS Policies for Budget Transparency
CREATE POLICY "Public can view all budget information" 
ON public.budget_transparency FOR SELECT USING (true);

CREATE POLICY "Admins can manage budget data" 
ON public.budget_transparency FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Verified users can add budget oversight" 
ON public.budget_citizen_oversight FOR INSERT WITH CHECK (
  auth.uid() = citizen_user_id OR citizen_user_id IS NULL
);

-- Additional policies for related tables
CREATE POLICY "Public can view petition updates" 
ON public.petition_updates FOR SELECT USING (true);

CREATE POLICY "Public can view complaint updates" 
ON public.complaint_status_updates FOR SELECT USING (public_update = true);

CREATE POLICY "Public can view budget alerts" 
ON public.budget_alerts FOR SELECT USING (public_visibility = true);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION generate_complaint_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  number_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate complaint number: COMP-YYYY-XXXXXXXX
    new_number := 'COMP-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
    
    -- Check if number already exists
    SELECT EXISTS(SELECT 1 FROM public.civic_complaints WHERE complaint_number = new_number) INTO number_exists;
    
    IF NOT number_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate complaint numbers
CREATE OR REPLACE FUNCTION set_complaint_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.complaint_number IS NULL THEN
    NEW.complaint_number := generate_complaint_number();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_complaint_number_trigger
  BEFORE INSERT OR UPDATE ON public.civic_complaints
  FOR EACH ROW EXECUTE FUNCTION set_complaint_number();

-- Function to update petition signature counts
CREATE OR REPLACE FUNCTION update_petition_signature_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.civic_petitions 
    SET current_signatures = (
      SELECT COUNT(*) FROM public.petition_signatures 
      WHERE petition_id = NEW.petition_id AND verification_status = 'verified'
    )
    WHERE id = NEW.petition_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.civic_petitions 
    SET current_signatures = (
      SELECT COUNT(*) FROM public.petition_signatures 
      WHERE petition_id = NEW.petition_id AND verification_status = 'verified'
    )
    WHERE id = NEW.petition_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.civic_petitions 
    SET current_signatures = (
      SELECT COUNT(*) FROM public.petition_signatures 
      WHERE petition_id = OLD.petition_id AND verification_status = 'verified'
    )
    WHERE id = OLD.petition_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_petition_signature_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.petition_signatures
  FOR EACH ROW EXECUTE FUNCTION update_petition_signature_count();

-- Function to monitor budget variances
CREATE OR REPLACE FUNCTION check_budget_variances()
RETURNS INTEGER AS $$
DECLARE
  budget_record RECORD;
  variance_percentage NUMERIC;
  alert_count INTEGER := 0;
BEGIN
  FOR budget_record IN
    SELECT * FROM public.budget_transparency
    WHERE status IN ('allocated', 'disbursed') 
    AND alert_on_variance = true
  LOOP
    -- Calculate variance percentage
    IF budget_record.allocated_amount_fcfa > 0 THEN
      variance_percentage := ABS(
        (budget_record.spent_amount_fcfa - budget_record.allocated_amount_fcfa) 
        / budget_record.allocated_amount_fcfa * 100
      );
      
      -- Create alert if variance exceeds threshold
      IF variance_percentage > budget_record.variance_threshold_percentage THEN
        INSERT INTO public.budget_alerts (
          budget_id, alert_type, alert_severity, alert_message, 
          variance_percentage, threshold_exceeded, current_value, expected_value
        ) VALUES (
          budget_record.id,
          'variance',
          CASE 
            WHEN variance_percentage > 50 THEN 'critical'
            WHEN variance_percentage > 25 THEN 'high'
            ELSE 'medium'
          END,
          'Budget variance detected: ' || ROUND(variance_percentage, 2) || '% deviation from allocated amount',
          variance_percentage,
          budget_record.variance_threshold_percentage,
          budget_record.spent_amount_fcfa,
          budget_record.allocated_amount_fcfa
        )
        ON CONFLICT DO NOTHING; -- Prevent duplicate alerts
        
        alert_count := alert_count + 1;
      END IF;
    END IF;
  END LOOP;
  
  RETURN alert_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;