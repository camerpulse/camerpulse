-- Create the remaining directory tables that don't exist yet

-- Hospitals Directory Tables
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  hospital_type TEXT NOT NULL DEFAULT 'general', -- general, specialized, clinic, health_center, district
  specializations TEXT[] DEFAULT ARRAY[]::TEXT[], -- cardiology, pediatrics, maternity, etc
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  phone_number TEXT,
  emergency_number TEXT,
  email TEXT,
  website_url TEXT,
  description TEXT,
  bed_capacity INTEGER,
  services TEXT[] DEFAULT ARRAY[]::TEXT[], -- emergency, surgery, pharmacy, etc
  operating_hours JSONB DEFAULT '{}',
  is_24_hours BOOLEAN DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_date TIMESTAMP WITH TIME ZONE,
  verification_type TEXT, -- health_ministry, medical_association, community
  license_number TEXT,
  director_name TEXT,
  average_rating NUMERIC DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'active',
  accepts_insurance BOOLEAN DEFAULT false,
  insurance_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Pharmacies Directory Tables
CREATE TABLE IF NOT EXISTS public.pharmacies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  pharmacy_type TEXT NOT NULL DEFAULT 'modern', -- modern, traditional, herbal
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  phone_number TEXT,
  email TEXT,
  website_url TEXT,
  description TEXT,
  operating_hours JSONB DEFAULT '{}',
  is_24_hours BOOLEAN DEFAULT false,
  pharmacist_name TEXT,
  license_number TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_date TIMESTAMP WITH TIME ZONE,
  verification_type TEXT, -- pharmacy_board, health_ministry, community
  services TEXT[] DEFAULT ARRAY[]::TEXT[], -- prescription, consultation, delivery, etc
  medicine_categories TEXT[] DEFAULT ARRAY[]::TEXT[], -- prescription, otc, herbal, etc
  delivery_available BOOLEAN DEFAULT false,
  delivery_radius_km INTEGER,
  average_rating NUMERIC DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'active',
  accepts_insurance BOOLEAN DEFAULT false,
  insurance_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Villages Directory Tables
CREATE TABLE IF NOT EXISTS public.villages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  division TEXT,
  subdivision TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  population INTEGER,
  description TEXT,
  history TEXT,
  heritage_sites TEXT[] DEFAULT ARRAY[]::TEXT[],
  traditional_activities TEXT[] DEFAULT ARRAY[]::TEXT[],
  main_languages TEXT[] DEFAULT ARRAY[]::TEXT[],
  chief_name TEXT,
  chief_contact TEXT,
  development_rating NUMERIC DEFAULT 0,
  culture_rating NUMERIC DEFAULT 0,
  education_rating NUMERIC DEFAULT 0,
  conflict_resolution_rating NUMERIC DEFAULT 0,
  overall_ranking INTEGER,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_date TIMESTAMP WITH TIME ZONE,
  verification_type TEXT, -- traditional_authority, government, community
  notable_elites JSONB DEFAULT '[]', -- array of elite profiles
  ongoing_projects JSONB DEFAULT '[]', -- array of development projects
  facilities TEXT[] DEFAULT ARRAY[]::TEXT[], -- school, health_center, market, etc
  accessibility TEXT, -- road_condition, transport_availability
  image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Common ratings table for all directories
CREATE TABLE IF NOT EXISTS public.directory_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  directory_type TEXT NOT NULL, -- schools, hospitals, pharmacies, villages
  directory_item_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  helpful_votes INTEGER DEFAULT 0,
  verified_visit BOOLEAN DEFAULT false,
  visit_date DATE,
  rating_categories JSONB DEFAULT '{}', -- specific ratings by category
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(directory_type, directory_item_id, user_id)
);

-- Village petitions table
CREATE TABLE IF NOT EXISTS public.village_petitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  village_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- infrastructure, health, education, security, etc
  target_audience TEXT NOT NULL, -- government, traditional_authority, ngo, etc
  petition_status TEXT NOT NULL DEFAULT 'active', -- active, closed, resolved
  signatures_count INTEGER DEFAULT 0,
  target_signatures INTEGER,
  resolution_notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Village fundraising campaigns
CREATE TABLE IF NOT EXISTS public.village_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  village_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal_amount_fcfa BIGINT NOT NULL,
  raised_amount_fcfa BIGINT DEFAULT 0,
  campaign_type TEXT NOT NULL, -- development, emergency, education, health
  campaign_status TEXT NOT NULL DEFAULT 'active', -- active, completed, cancelled
  start_date DATE NOT NULL,
  end_date DATE,
  organizer_name TEXT NOT NULL,
  organizer_contact TEXT,
  beneficiaries_count INTEGER,
  image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  documents TEXT[] DEFAULT ARRAY[]::TEXT[], -- project_proposal, budget, etc
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables only
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.directory_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Hospitals
CREATE POLICY "Hospitals are viewable by everyone" ON public.hospitals FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create hospitals" ON public.hospitals FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update hospitals they created" ON public.hospitals FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for Pharmacies
CREATE POLICY "Pharmacies are viewable by everyone" ON public.pharmacies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create pharmacies" ON public.pharmacies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update pharmacies they created" ON public.pharmacies FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for Villages
CREATE POLICY "Villages are viewable by everyone" ON public.villages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create villages" ON public.villages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update villages they created" ON public.villages FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for Directory Ratings
CREATE POLICY "Ratings are viewable by everyone" ON public.directory_ratings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create ratings" ON public.directory_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ratings" ON public.directory_ratings FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Village Petitions
CREATE POLICY "Village petitions are viewable by everyone" ON public.village_petitions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create petitions" ON public.village_petitions FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update petitions they created" ON public.village_petitions FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for Village Campaigns
CREATE POLICY "Village campaigns are viewable by everyone" ON public.village_campaigns FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create campaigns" ON public.village_campaigns FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update campaigns they created" ON public.village_campaigns FOR UPDATE USING (auth.uid() = created_by);

-- Foreign key constraints
ALTER TABLE public.hospitals ADD CONSTRAINT hospitals_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users (id);
ALTER TABLE public.pharmacies ADD CONSTRAINT pharmacies_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users (id);
ALTER TABLE public.villages ADD CONSTRAINT villages_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users (id);
ALTER TABLE public.directory_ratings ADD CONSTRAINT directory_ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id);
ALTER TABLE public.village_petitions ADD CONSTRAINT village_petitions_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages (id);
ALTER TABLE public.village_petitions ADD CONSTRAINT village_petitions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users (id);
ALTER TABLE public.village_campaigns ADD CONSTRAINT village_campaigns_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages (id);
ALTER TABLE public.village_campaigns ADD CONSTRAINT village_campaigns_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users (id);

-- Update triggers for timestamps
CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON public.hospitals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pharmacies_updated_at BEFORE UPDATE ON public.pharmacies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_villages_updated_at BEFORE UPDATE ON public.villages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_directory_ratings_updated_at BEFORE UPDATE ON public.directory_ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_village_petitions_updated_at BEFORE UPDATE ON public.village_petitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_village_campaigns_updated_at BEFORE UPDATE ON public.village_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();