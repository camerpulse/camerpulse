-- Create artist applications table
CREATE TABLE public.artist_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  stage_name TEXT NOT NULL,
  real_name TEXT NOT NULL,
  gender TEXT,
  nationality TEXT,
  region TEXT,
  phone_number TEXT,
  
  -- Professional Information
  genres TEXT[] DEFAULT ARRAY[]::TEXT[],
  languages_spoken TEXT[] DEFAULT ARRAY[]::TEXT[],
  bio_short TEXT,
  bio_full TEXT,
  
  -- Social Media
  social_media_links JSONB DEFAULT '{}'::JSONB,
  
  -- Files
  profile_photo_url TEXT,
  id_document_url TEXT,
  
  -- Payment & Status
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  stripe_payment_intent_id TEXT,
  membership_fee_paid DECIMAL(10,2),
  
  -- Verification Status
  application_status TEXT DEFAULT 'submitted' CHECK (application_status IN ('submitted', 'under_review', 'approved', 'rejected', 'needs_changes')),
  admin_notes TEXT,
  rejection_reason TEXT,
  
  -- Artist ID
  artist_id_number TEXT UNIQUE,
  id_card_generated BOOLEAN DEFAULT FALSE,
  id_card_url TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create artist memberships table for approved artists
CREATE TABLE public.artist_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  application_id UUID REFERENCES public.artist_applications(id),
  
  artist_id_number TEXT NOT NULL UNIQUE,
  stage_name TEXT NOT NULL,
  real_name TEXT NOT NULL,
  
  -- Membership Details
  membership_active BOOLEAN DEFAULT TRUE,
  membership_expires_at TIMESTAMP WITH TIME ZONE,
  id_card_url TEXT,
  
  -- Feature Access
  features_enabled JSONB DEFAULT '{
    "camerplay": true,
    "album_store": true,
    "streaming": true,
    "events": true,
    "awards": true,
    "brand_ambassador": true,
    "earnings_dashboard": true
  }'::JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create membership configuration table
CREATE TABLE public.membership_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  membership_fee DECIMAL(10,2) DEFAULT 25.00,
  currency TEXT DEFAULT 'USD',
  features_description JSONB DEFAULT '{}'::JSONB,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default membership config
INSERT INTO public.membership_config (membership_fee, currency, features_description) VALUES 
(25.00, 'USD', '{
  "camerplay": "Upload unlimited tracks, albums, and singles",
  "album_store": "Sell music directly to fans with full control",
  "streaming": "Enable/disable streaming across platforms", 
  "events": "Create and manage ticketed events",
  "awards": "Eligible for CamerPulse music awards",
  "brand_ambassador": "Access to brand partnership opportunities",
  "earnings_dashboard": "Track royalties and earnings in real-time"
}'::JSONB);

-- Enable RLS
ALTER TABLE public.artist_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_config ENABLE ROW LEVEL SECURITY;

-- Policies for artist_applications
CREATE POLICY "Users can view their own applications" ON public.artist_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications" ON public.artist_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending applications" ON public.artist_applications
  FOR UPDATE USING (auth.uid() = user_id AND application_status IN ('submitted', 'needs_changes'));

CREATE POLICY "Admins can view all applications" ON public.artist_applications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

CREATE POLICY "Admins can update all applications" ON public.artist_applications
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

-- Policies for artist_memberships
CREATE POLICY "Users can view their own membership" ON public.artist_memberships
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all memberships" ON public.artist_memberships
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

CREATE POLICY "System can create memberships" ON public.artist_memberships
  FOR INSERT WITH CHECK (true);

-- Policies for membership_config
CREATE POLICY "Everyone can view membership config" ON public.membership_config
  FOR SELECT USING (true);

CREATE POLICY "Admins can update membership config" ON public.membership_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

-- Create function to generate unique artist ID
CREATE OR REPLACE FUNCTION generate_artist_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate ID in format: CPA-YYYY-XXXXXX (CamerPulse Artist)
    new_id := 'CPA-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Check if ID already exists
    SELECT EXISTS(SELECT 1 FROM artist_applications WHERE artist_id_number = new_id) INTO id_exists;
    
    IF NOT id_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle artist approval
CREATE OR REPLACE FUNCTION approve_artist_application(application_id UUID)
RETURNS JSONB AS $$
DECLARE
  app_record RECORD;
  artist_id TEXT;
  membership_id UUID;
BEGIN
  -- Get application details
  SELECT * INTO app_record FROM artist_applications WHERE id = application_id;
  
  IF NOT FOUND THEN
    RETURN '{"success": false, "error": "Application not found"}'::JSONB;
  END IF;
  
  -- Generate artist ID if not exists
  IF app_record.artist_id_number IS NULL THEN
    artist_id := generate_artist_id();
    
    UPDATE artist_applications 
    SET artist_id_number = artist_id,
        application_status = 'approved',
        verified_at = NOW(),
        updated_at = NOW()
    WHERE id = application_id;
  ELSE
    artist_id := app_record.artist_id_number;
  END IF;
  
  -- Create artist membership
  INSERT INTO artist_memberships (
    user_id, application_id, artist_id_number, stage_name, real_name,
    membership_expires_at
  ) VALUES (
    app_record.user_id, application_id, artist_id, 
    app_record.stage_name, app_record.real_name,
    NOW() + INTERVAL '1 year'
  ) RETURNING id INTO membership_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'artist_id', artist_id,
    'membership_id', membership_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at triggers
CREATE TRIGGER update_artist_applications_updated_at
  BEFORE UPDATE ON public.artist_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_artist_memberships_updated_at
  BEFORE UPDATE ON public.artist_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_membership_config_updated_at
  BEFORE UPDATE ON public.membership_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();