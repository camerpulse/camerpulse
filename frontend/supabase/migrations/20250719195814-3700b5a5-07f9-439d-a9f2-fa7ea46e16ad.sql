-- Create school ratings table
CREATE TABLE public.school_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL,
  user_id UUID NOT NULL,
  teaching_quality INTEGER CHECK (teaching_quality >= 1 AND teaching_quality <= 5),
  academic_performance INTEGER CHECK (academic_performance >= 1 AND academic_performance <= 5),
  infrastructure INTEGER CHECK (infrastructure >= 1 AND infrastructure <= 5),
  discipline_safety INTEGER CHECK (discipline_safety >= 1 AND discipline_safety <= 5),
  tech_access INTEGER CHECK (tech_access >= 1 AND tech_access <= 5),
  community_trust INTEGER CHECK (community_trust >= 1 AND community_trust <= 5),
  inclusiveness INTEGER CHECK (inclusiveness >= 1 AND inclusiveness <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(school_id, user_id)
);

-- Create hospital ratings table
CREATE TABLE public.hospital_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID NOT NULL,
  user_id UUID NOT NULL,
  cleanliness INTEGER CHECK (cleanliness >= 1 AND cleanliness <= 5),
  staff_response_time INTEGER CHECK (staff_response_time >= 1 AND staff_response_time <= 5),
  equipment_availability INTEGER CHECK (equipment_availability >= 1 AND equipment_availability <= 5),
  service_quality INTEGER CHECK (service_quality >= 1 AND service_quality <= 5),
  emergency_readiness INTEGER CHECK (emergency_readiness >= 1 AND emergency_readiness <= 5),
  patient_experience INTEGER CHECK (patient_experience >= 1 AND patient_experience <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(hospital_id, user_id)
);

-- Create pharmacy ratings table
CREATE TABLE public.pharmacy_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID NOT NULL,
  user_id UUID NOT NULL,
  medicine_availability INTEGER CHECK (medicine_availability >= 1 AND medicine_availability <= 5),
  price_fairness INTEGER CHECK (price_fairness >= 1 AND price_fairness <= 5),
  service_quality INTEGER CHECK (service_quality >= 1 AND service_quality <= 5),
  staff_knowledge INTEGER CHECK (staff_knowledge >= 1 AND staff_knowledge <= 5),
  license_status INTEGER CHECK (license_status >= 1 AND license_status <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pharmacy_id, user_id)
);

-- Enable RLS on all rating tables
ALTER TABLE public.school_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for school_ratings
CREATE POLICY "Users can create their own school ratings" 
ON public.school_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all school ratings" 
ON public.school_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own school ratings" 
ON public.school_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for hospital_ratings
CREATE POLICY "Users can create their own hospital ratings" 
ON public.hospital_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all hospital ratings" 
ON public.hospital_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own hospital ratings" 
ON public.hospital_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for pharmacy_ratings
CREATE POLICY "Users can create their own pharmacy ratings" 
ON public.pharmacy_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all pharmacy ratings" 
ON public.pharmacy_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own pharmacy ratings" 
ON public.pharmacy_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Functions to update average ratings
CREATE OR REPLACE FUNCTION public.update_school_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.schools 
  SET 
    average_rating = (
      SELECT AVG(
        COALESCE(teaching_quality, 0) + 
        COALESCE(academic_performance, 0) + 
        COALESCE(infrastructure, 0) + 
        COALESCE(discipline_safety, 0) + 
        COALESCE(tech_access, 0) + 
        COALESCE(community_trust, 0) + 
        COALESCE(inclusiveness, 0)
      ) / 7.0 
      FROM public.school_ratings 
      WHERE school_id = COALESCE(NEW.school_id, OLD.school_id)
    ),
    total_ratings = (
      SELECT COUNT(*) 
      FROM public.school_ratings 
      WHERE school_id = COALESCE(NEW.school_id, OLD.school_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.school_id, OLD.school_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_hospital_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.hospitals 
  SET 
    overall_rating = (
      SELECT AVG(
        COALESCE(cleanliness, 0) + 
        COALESCE(staff_response_time, 0) + 
        COALESCE(equipment_availability, 0) + 
        COALESCE(service_quality, 0) + 
        COALESCE(emergency_readiness, 0) + 
        COALESCE(patient_experience, 0)
      ) / 6.0 
      FROM public.hospital_ratings 
      WHERE hospital_id = COALESCE(NEW.hospital_id, OLD.hospital_id)
    ),
    total_ratings = (
      SELECT COUNT(*) 
      FROM public.hospital_ratings 
      WHERE hospital_id = COALESCE(NEW.hospital_id, OLD.hospital_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.hospital_id, OLD.hospital_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_pharmacy_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.pharmacies 
  SET 
    overall_rating = (
      SELECT AVG(
        COALESCE(medicine_availability, 0) + 
        COALESCE(price_fairness, 0) + 
        COALESCE(service_quality, 0) + 
        COALESCE(staff_knowledge, 0) + 
        COALESCE(license_status, 0)
      ) / 5.0 
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

-- Triggers to update ratings
CREATE TRIGGER update_school_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.school_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_school_ratings();

CREATE TRIGGER update_hospital_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.hospital_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_hospital_ratings();

CREATE TRIGGER update_pharmacy_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.pharmacy_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_pharmacy_ratings();