-- Step 4: Create Pharmacy Directory Module

-- Create pharmacy type enum
CREATE TYPE public.pharmacy_type AS ENUM (
  'registered_pharmacy',
  'otc_store', 
  'herbal_shop',
  'hospital_linked'
);

-- Create pharmacies table
CREATE TABLE public.pharmacies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type pharmacy_type NOT NULL,
  license_number TEXT,
  pharmacist_in_charge TEXT,
  region TEXT NOT NULL,
  division TEXT NOT NULL,
  village_or_city TEXT NOT NULL,
  working_hours TEXT,
  delivery_available BOOLEAN DEFAULT FALSE,
  photo_gallery TEXT[] DEFAULT '{}',
  contact_info JSONB DEFAULT '{}',
  status TEXT DEFAULT 'unverified' CHECK (status IN ('unverified', 'verified')),
  claimable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  claimed_by UUID,
  claimed_at TIMESTAMP WITH TIME ZONE,
  -- Rating averages (calculated)
  medicine_availability_rating NUMERIC DEFAULT 0,
  price_fairness_rating NUMERIC DEFAULT 0,
  service_quality_rating NUMERIC DEFAULT 0,
  staff_knowledge_rating NUMERIC DEFAULT 0,
  license_status_rating NUMERIC DEFAULT 0,
  overall_rating NUMERIC DEFAULT 0,
  total_ratings INTEGER DEFAULT 0
);

-- Create pharmacy ratings table
CREATE TABLE public.pharmacy_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  medicine_availability_rating INTEGER CHECK (medicine_availability_rating >= 1 AND medicine_availability_rating <= 5),
  price_fairness_rating INTEGER CHECK (price_fairness_rating >= 1 AND price_fairness_rating <= 5),
  service_quality_rating INTEGER CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5),
  staff_knowledge_rating INTEGER CHECK (staff_knowledge_rating >= 1 AND staff_knowledge_rating <= 5),
  license_status_rating INTEGER CHECK (license_status_rating >= 1 AND license_status_rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pharmacy_id, user_id)
);

-- Create pharmacy claims table
CREATE TABLE public.pharmacy_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  claim_status TEXT DEFAULT 'pending' CHECK (claim_status IN ('pending', 'approved', 'rejected')),
  evidence_files TEXT[] DEFAULT '{}',
  claim_message TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Create pharmacy updates table
CREATE TABLE public.pharmacy_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  update_type TEXT NOT NULL CHECK (update_type IN ('announcement', 'hours_change', 'services_update', 'contact_update')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pharmacy monetization table
CREATE TABLE public.pharmacy_monetization (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  feature_type TEXT NOT NULL CHECK (feature_type IN ('claim_pharmacy', 'enable_inbox', 'post_updates', 'feature_pharmacy')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  amount_fcfa INTEGER NOT NULL,
  payment_reference TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_monetization ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pharmacies
CREATE POLICY "Pharmacies are viewable by everyone" ON public.pharmacies FOR SELECT USING (true);
CREATE POLICY "Users can create pharmacies" ON public.pharmacies FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own pharmacies" ON public.pharmacies FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage all pharmacies" ON public.pharmacies FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for pharmacy_ratings
CREATE POLICY "Pharmacy ratings are viewable by everyone" ON public.pharmacy_ratings FOR SELECT USING (true);
CREATE POLICY "Users can rate pharmacies" ON public.pharmacy_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ratings" ON public.pharmacy_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all ratings" ON public.pharmacy_ratings FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for pharmacy_claims
CREATE POLICY "Users can view their own claims" ON public.pharmacy_claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create claims" ON public.pharmacy_claims FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their pending claims" ON public.pharmacy_claims 
  FOR UPDATE USING (auth.uid() = user_id AND claim_status = 'pending');
CREATE POLICY "Admins can manage all claims" ON public.pharmacy_claims FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for pharmacy_updates
CREATE POLICY "Pharmacy updates are viewable by everyone" ON public.pharmacy_updates FOR SELECT USING (true);
CREATE POLICY "Users can create updates for their pharmacies" ON public.pharmacy_updates FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (SELECT 1 FROM pharmacies WHERE id = pharmacy_id AND created_by = auth.uid())
);
CREATE POLICY "Users can update their own updates" ON public.pharmacy_updates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all updates" ON public.pharmacy_updates FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for pharmacy_monetization
CREATE POLICY "Users can view their own monetization records" ON public.pharmacy_monetization FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create monetization records" ON public.pharmacy_monetization FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all monetization" ON public.pharmacy_monetization FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create indexes for performance
CREATE INDEX idx_pharmacies_region ON public.pharmacies(region);
CREATE INDEX idx_pharmacies_type ON public.pharmacies(type);
CREATE INDEX idx_pharmacies_status ON public.pharmacies(status);
CREATE INDEX idx_pharmacies_delivery ON public.pharmacies(delivery_available);
CREATE INDEX idx_pharmacy_ratings_pharmacy_id ON public.pharmacy_ratings(pharmacy_id);
CREATE INDEX idx_pharmacy_claims_pharmacy_id ON public.pharmacy_claims(pharmacy_id);
CREATE INDEX idx_pharmacy_claims_status ON public.pharmacy_claims(claim_status);

-- Function to update pharmacy ratings
CREATE OR REPLACE FUNCTION public.update_pharmacy_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the pharmacy's average ratings
  UPDATE public.pharmacies 
  SET 
    medicine_availability_rating = (
      SELECT COALESCE(AVG(medicine_availability_rating), 0) 
      FROM public.pharmacy_ratings 
      WHERE pharmacy_id = COALESCE(NEW.pharmacy_id, OLD.pharmacy_id)
    ),
    price_fairness_rating = (
      SELECT COALESCE(AVG(price_fairness_rating), 0) 
      FROM public.pharmacy_ratings 
      WHERE pharmacy_id = COALESCE(NEW.pharmacy_id, OLD.pharmacy_id)
    ),
    service_quality_rating = (
      SELECT COALESCE(AVG(service_quality_rating), 0) 
      FROM public.pharmacy_ratings 
      WHERE pharmacy_id = COALESCE(NEW.pharmacy_id, OLD.pharmacy_id)
    ),
    staff_knowledge_rating = (
      SELECT COALESCE(AVG(staff_knowledge_rating), 0) 
      FROM public.pharmacy_ratings 
      WHERE pharmacy_id = COALESCE(NEW.pharmacy_id, OLD.pharmacy_id)
    ),
    license_status_rating = (
      SELECT COALESCE(AVG(license_status_rating), 0) 
      FROM public.pharmacy_ratings 
      WHERE pharmacy_id = COALESCE(NEW.pharmacy_id, OLD.pharmacy_id)
    ),
    overall_rating = (
      SELECT COALESCE(
        (AVG(medicine_availability_rating) + AVG(price_fairness_rating) + 
         AVG(service_quality_rating) + AVG(staff_knowledge_rating) + 
         AVG(license_status_rating)) / 5, 0
      ) 
      FROM public.pharmacy_ratings 
      WHERE pharmacy_id = COALESCE(NEW.pharmacy_id, OLD.pharmacy_id)
    ),
    total_ratings = (
      SELECT COUNT(*) 
      FROM public.pharmacy_ratings 
      WHERE pharmacy_id = COALESCE(NEW.pharmacy_id, OLD.pharmacy_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.pharmacy_id, OLD.pharmacy_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rating updates
CREATE TRIGGER update_pharmacy_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.pharmacy_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_pharmacy_ratings();