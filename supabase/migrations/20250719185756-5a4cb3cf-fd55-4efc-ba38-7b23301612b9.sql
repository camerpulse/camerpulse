-- Create enum types for hospitals directory
DO $$ BEGIN
    CREATE TYPE hospital_type AS ENUM ('general', 'private_clinic', 'district', 'diagnostic_center', 'emergency', 'traditional');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE hospital_ownership AS ENUM ('government', 'private', 'community', 'mission', 'ngo');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create hospitals table
CREATE TABLE public.hospitals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type hospital_type NOT NULL,
    ownership hospital_ownership NOT NULL,
    region TEXT NOT NULL,
    division TEXT NOT NULL,
    village_or_city TEXT NOT NULL,
    emergency_services BOOLEAN NOT NULL DEFAULT false,
    working_hours TEXT,
    services_offered TEXT[],
    photo_gallery TEXT[],
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    website TEXT,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    verification_status TEXT NOT NULL DEFAULT 'unverified',
    is_claimable BOOLEAN NOT NULL DEFAULT true,
    claimed_by UUID,
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    submitted_by UUID,
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    overall_rating DECIMAL(3,2) DEFAULT 0.00,
    total_ratings INTEGER DEFAULT 0,
    aggregate_ratings JSONB DEFAULT '{
        "cleanliness": 0,
        "staff_response_time": 0, 
        "equipment_availability": 0,
        "service_quality": 0,
        "emergency_readiness": 0,
        "patient_experience": 0
    }'::jsonb
);

-- Create hospital ratings table
CREATE TABLE public.hospital_ratings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
    staff_response_time INTEGER NOT NULL CHECK (staff_response_time >= 1 AND staff_response_time <= 5),
    equipment_availability INTEGER NOT NULL CHECK (equipment_availability >= 1 AND equipment_availability <= 5),
    service_quality INTEGER NOT NULL CHECK (service_quality >= 1 AND service_quality <= 5),
    emergency_readiness INTEGER NOT NULL CHECK (emergency_readiness >= 1 AND emergency_readiness <= 5),
    patient_experience INTEGER NOT NULL CHECK (patient_experience >= 1 AND patient_experience <= 5),
    review_text TEXT,
    anonymous BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(hospital_id, user_id)
);

-- Create hospital claims table
CREATE TABLE public.hospital_claims (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    claim_type TEXT NOT NULL DEFAULT 'ownership',
    evidence_documents TEXT[],
    justification TEXT NOT NULL,
    status claim_status NOT NULL DEFAULT 'pending',
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hospital updates table  
CREATE TABLE public.hospital_updates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    update_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    photos TEXT[],
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hospital monetization table
CREATE TABLE public.hospital_monetization (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    feature_type TEXT NOT NULL,
    amount_fcfa DECIMAL(12,2) NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    stripe_payment_intent_id TEXT,
    active_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_hospitals_region ON public.hospitals(region);
CREATE INDEX idx_hospitals_type ON public.hospitals(type);
CREATE INDEX idx_hospitals_ownership ON public.hospitals(ownership);
CREATE INDEX idx_hospitals_verification_status ON public.hospitals(verification_status);
CREATE INDEX idx_hospitals_location ON public.hospitals(latitude, longitude);
CREATE INDEX idx_hospital_ratings_hospital_id ON public.hospital_ratings(hospital_id);
CREATE INDEX idx_hospital_claims_hospital_id ON public.hospital_claims(hospital_id);
CREATE INDEX idx_hospital_claims_status ON public.hospital_claims(status);

-- Enable Row Level Security
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_monetization ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hospitals table
CREATE POLICY "Hospitals are viewable by everyone" 
ON public.hospitals FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can add hospitals" 
ON public.hospitals FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Hospital owners can update their hospitals" 
ON public.hospitals FOR UPDATE 
TO authenticated 
USING (auth.uid() = claimed_by OR auth.uid() = submitted_by);

CREATE POLICY "Admins can manage all hospitals" 
ON public.hospitals FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- RLS Policies for hospital_ratings
CREATE POLICY "Hospital ratings are viewable by everyone" 
ON public.hospital_ratings FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can rate hospitals" 
ON public.hospital_ratings FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON public.hospital_ratings FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- RLS Policies for hospital_claims
CREATE POLICY "Users can view their own claims" 
ON public.hospital_claims FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create hospital claims" 
ON public.hospital_claims FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all hospital claims" 
ON public.hospital_claims FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- RLS Policies for hospital_updates
CREATE POLICY "Hospital updates are viewable by everyone" 
ON public.hospital_updates FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create updates" 
ON public.hospital_updates FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hospital updates" 
ON public.hospital_updates FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- RLS Policies for hospital_monetization
CREATE POLICY "Users can view their own monetization records" 
ON public.hospital_monetization FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create monetization records" 
ON public.hospital_monetization FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all monetization" 
ON public.hospital_monetization FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Function to calculate hospital overall rating
CREATE OR REPLACE FUNCTION public.calculate_hospital_overall_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the hospital's overall rating and aggregate ratings
    UPDATE public.hospitals 
    SET 
        overall_rating = (
            SELECT ROUND(AVG((
                hr.cleanliness + 
                hr.staff_response_time + 
                hr.equipment_availability + 
                hr.service_quality + 
                hr.emergency_readiness + 
                hr.patient_experience
            )::decimal / 6), 2)
            FROM public.hospital_ratings hr 
            WHERE hr.hospital_id = COALESCE(NEW.hospital_id, OLD.hospital_id)
        ),
        total_ratings = (
            SELECT COUNT(*) 
            FROM public.hospital_ratings hr 
            WHERE hr.hospital_id = COALESCE(NEW.hospital_id, OLD.hospital_id)
        ),
        aggregate_ratings = (
            SELECT jsonb_build_object(
                'cleanliness', ROUND(AVG(hr.cleanliness), 2),
                'staff_response_time', ROUND(AVG(hr.staff_response_time), 2),
                'equipment_availability', ROUND(AVG(hr.equipment_availability), 2),
                'service_quality', ROUND(AVG(hr.service_quality), 2),
                'emergency_readiness', ROUND(AVG(hr.emergency_readiness), 2),
                'patient_experience', ROUND(AVG(hr.patient_experience), 2)
            )
            FROM public.hospital_ratings hr 
            WHERE hr.hospital_id = COALESCE(NEW.hospital_id, OLD.hospital_id)
        ),
        updated_at = now()
    WHERE id = COALESCE(NEW.hospital_id, OLD.hospital_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic rating calculation
CREATE TRIGGER calculate_hospital_overall_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.hospital_ratings
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_hospital_overall_rating();