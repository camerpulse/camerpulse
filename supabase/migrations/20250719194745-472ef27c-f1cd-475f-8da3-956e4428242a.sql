-- Create institution claims system for schools, hospitals, and pharmacies

-- Create claim_type enum
CREATE TYPE institution_claim_type AS ENUM ('school', 'hospital', 'pharmacy');

-- Create institution_claims table
CREATE TABLE IF NOT EXISTS public.institution_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  institution_type institution_claim_type NOT NULL,
  institution_id UUID NOT NULL,
  institution_name TEXT NOT NULL,
  claim_type TEXT NOT NULL DEFAULT 'ownership',
  claim_reason TEXT,
  evidence_files TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'payment_pending')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_reference TEXT,
  payment_amount NUMERIC(10,2),
  payment_currency TEXT DEFAULT 'NGN',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create claim_documents table for file uploads
CREATE TABLE IF NOT EXISTS public.claim_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.institution_claims(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('id_card', 'appointment_letter', 'utility_bill', 'business_license', 'other')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Create claim_notifications table
CREATE TABLE IF NOT EXISTS public.claim_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.institution_claims(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('claim_submitted', 'payment_completed', 'under_review', 'approved', 'rejected')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_institution_claims_user_id ON public.institution_claims(user_id);
CREATE INDEX idx_institution_claims_institution ON public.institution_claims(institution_type, institution_id);
CREATE INDEX idx_institution_claims_status ON public.institution_claims(status);
CREATE INDEX idx_claim_documents_claim_id ON public.claim_documents(claim_id);
CREATE INDEX idx_claim_notifications_recipient ON public.claim_notifications(recipient_id);

-- Enable RLS
ALTER TABLE public.institution_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for institution_claims
CREATE POLICY "Users can view their own claims" ON public.institution_claims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create claims" ON public.institution_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending claims" ON public.institution_claims
  FOR UPDATE USING (auth.uid() = user_id AND status IN ('pending', 'payment_pending'));

CREATE POLICY "Admins can manage all claims" ON public.institution_claims
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for claim_documents
CREATE POLICY "Users can view their claim documents" ON public.claim_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.institution_claims 
      WHERE id = claim_documents.claim_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload documents to their claims" ON public.claim_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.institution_claims 
      WHERE id = claim_documents.claim_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all claim documents" ON public.claim_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for claim_notifications
CREATE POLICY "Users can view their notifications" ON public.claim_notifications
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their notifications" ON public.claim_notifications
  FOR UPDATE USING (auth.uid() = recipient_id);

CREATE POLICY "System can create notifications" ON public.claim_notifications
  FOR INSERT WITH CHECK (true);

-- Function to update claim status and send notifications
CREATE OR REPLACE FUNCTION public.update_claim_status(
  p_claim_id UUID,
  p_new_status TEXT,
  p_admin_notes TEXT DEFAULT NULL,
  p_reviewed_by UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  claim_record RECORD;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Get the claim record
  SELECT * INTO claim_record FROM public.institution_claims WHERE id = p_claim_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Claim not found';
  END IF;
  
  -- Update the claim
  UPDATE public.institution_claims 
  SET 
    status = p_new_status,
    admin_notes = COALESCE(p_admin_notes, admin_notes),
    reviewed_by = COALESCE(p_reviewed_by, reviewed_by),
    reviewed_at = CASE WHEN p_new_status IN ('approved', 'rejected') THEN now() ELSE reviewed_at END,
    updated_at = now()
  WHERE id = p_claim_id;
  
  -- Determine notification content
  CASE p_new_status
    WHEN 'approved' THEN
      notification_title := 'Claim Approved!';
      notification_message := 'Your claim for ' || claim_record.institution_name || ' has been approved. You now have management access.';
    WHEN 'rejected' THEN
      notification_title := 'Claim Rejected';
      notification_message := 'Your claim for ' || claim_record.institution_name || ' has been rejected. ' || COALESCE(p_admin_notes, '');
    WHEN 'under_review' THEN
      notification_title := 'Claim Under Review';
      notification_message := 'Your claim for ' || claim_record.institution_name || ' is now under review by our moderation team.';
    ELSE
      notification_title := 'Claim Status Updated';
      notification_message := 'Your claim for ' || claim_record.institution_name || ' status has been updated to: ' || p_new_status;
  END CASE;
  
  -- Create notification
  INSERT INTO public.claim_notifications (
    claim_id,
    recipient_id,
    notification_type,
    title,
    message
  ) VALUES (
    p_claim_id,
    claim_record.user_id,
    p_new_status,
    notification_title,
    notification_message
  );
  
  -- If approved, update the institution's claimed status
  IF p_new_status = 'approved' THEN
    CASE claim_record.institution_type
      WHEN 'school' THEN
        UPDATE public.schools 
        SET is_claimable = false, claimed_by = claim_record.user_id, claimed_at = now()
        WHERE id = claim_record.institution_id;
      WHEN 'hospital' THEN
        UPDATE public.hospitals 
        SET is_claimable = false, claimed_by = claim_record.user_id, claimed_at = now()
        WHERE id = claim_record.institution_id;
      WHEN 'pharmacy' THEN
        UPDATE public.pharmacies 
        SET is_claimable = false, claimed_by = claim_record.user_id, claimed_at = now()
        WHERE id = claim_record.institution_id;
    END CASE;
  END IF;
END;
$$;

-- Function to create claim notification
CREATE OR REPLACE FUNCTION public.create_claim_notification(
  p_claim_id UUID,
  p_recipient_id UUID,
  p_notification_type TEXT,
  p_title TEXT,
  p_message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.claim_notifications (
    claim_id,
    recipient_id,
    notification_type,
    title,
    message
  ) VALUES (
    p_claim_id,
    p_recipient_id,
    p_notification_type,
    p_title,
    p_message
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;