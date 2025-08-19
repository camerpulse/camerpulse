-- Create the politicians table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.politicians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'politician',
  position_title TEXT,
  constituency TEXT,
  region TEXT,
  gender TEXT,
  date_of_birth DATE,
  biography TEXT,
  profile_picture_url TEXT,
  email TEXT,
  phone TEXT,
  website_url TEXT,
  social_media_links JSONB DEFAULT '{}',
  achievements TEXT[],
  committees TEXT[],
  education_background TEXT,
  professional_background TEXT,
  languages_spoken TEXT[],
  average_rating NUMERIC DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  transparency_rating NUMERIC DEFAULT 0.00,
  performance_rating NUMERIC DEFAULT 0.00,
  responsiveness_rating NUMERIC DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  term_start_date DATE,
  term_end_date DATE,
  verification_status TEXT DEFAULT 'unverified',
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  
  CONSTRAINT valid_role CHECK (role IN ('mp', 'senator', 'minister', 'mayor', 'governor', 'politician')),
  CONSTRAINT valid_gender CHECK (gender IS NULL OR gender IN ('male', 'female', 'other')),
  CONSTRAINT valid_verification_status CHECK (verification_status IN ('unverified', 'pending', 'verified', 'disputed'))
);

-- Create party_affiliations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.party_affiliations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  politician_id UUID NOT NULL REFERENCES public.politicians(id) ON DELETE CASCADE,
  party_id UUID NOT NULL REFERENCES public.political_parties(id) ON DELETE CASCADE,
  position_in_party TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT true,
  reason_for_leaving TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(politician_id, party_id, start_date)
);

-- Create party_ratings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.party_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID NOT NULL REFERENCES public.political_parties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  approval_rating INTEGER NOT NULL CHECK (approval_rating >= 1 AND approval_rating <= 5),
  transparency_rating INTEGER NOT NULL CHECK (transparency_rating >= 1 AND transparency_rating <= 5),
  development_rating INTEGER NOT NULL CHECK (development_rating >= 1 AND development_rating <= 5),
  trust_rating INTEGER NOT NULL CHECK (trust_rating >= 1 AND trust_rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(party_id, user_id)
);

-- Enable RLS
ALTER TABLE public.politicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_affiliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_ratings ENABLE ROW LEVEL SECURITY;

-- Insert sample data to test the system
-- First insert some parties if they don't exist
INSERT INTO public.political_parties (name, acronym, description, political_leaning, ideology) 
VALUES 
  ('Cameroon People''s Democratic Movement', 'CPDM', 'The ruling party of Cameroon', 'Center-right', 'Democratic socialism'),
  ('Social Democratic Front', 'SDF', 'Opposition party', 'Center-left', 'Social democracy'),
  ('Union Nationale pour la Démocratie et le Progrès', 'UNDP', 'Opposition party', 'Center', 'Liberal democracy'),
  ('Cameroon Democratic Union', 'CDU', 'Opposition party', 'Center-right', 'Christian democracy'),
  ('Progressive Movement', 'MP', 'Opposition party', 'Left', 'Progressivism')
ON CONFLICT (name) DO NOTHING;

-- Insert sample politicians
INSERT INTO public.politicians (full_name, role, region, gender, biography, created_by)
VALUES 
  ('Paul Biya', 'politician', 'South', 'male', 'President of the Republic of Cameroon since 1982', '00000000-0000-0000-0000-000000000000'),
  ('Joseph Dion Ngute', 'minister', 'Southwest', 'male', 'Prime Minister of Cameroon', '00000000-0000-0000-0000-000000000000'),
  ('Ni John Fru Ndi', 'politician', 'Northwest', 'male', 'Chairman of the Social Democratic Front', '00000000-0000-0000-0000-000000000000'),
  ('Edith Kah Walla', 'politician', 'West', 'female', 'Cameroonian politician and entrepreneur', '00000000-0000-0000-0000-000000000000'),
  ('Maurice Kamto', 'politician', 'West', 'male', 'Leader of the Cameroon Renaissance Movement', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (full_name) DO NOTHING;

-- Create party affiliations
WITH party_data AS (
  SELECT id, name FROM public.political_parties WHERE name IN ('Cameroon People''s Democratic Movement', 'Social Democratic Front', 'Union Nationale pour la Démocratie et le Progrès')
),
politician_data AS (
  SELECT id, full_name FROM public.politicians WHERE full_name IN ('Paul Biya', 'Joseph Dion Ngute', 'Ni John Fru Ndi', 'Edith Kah Walla')
)
INSERT INTO public.party_affiliations (politician_id, party_id, start_date, is_current, created_by)
SELECT 
  p.id,
  CASE 
    WHEN p.full_name IN ('Paul Biya', 'Joseph Dion Ngute') THEN (SELECT id FROM party_data WHERE name = 'Cameroon People''s Democratic Movement')
    WHEN p.full_name = 'Ni John Fru Ndi' THEN (SELECT id FROM party_data WHERE name = 'Social Democratic Front')
    WHEN p.full_name = 'Edith Kah Walla' THEN (SELECT id FROM party_data WHERE name = 'Union Nationale pour la Démocratie et le Progrès')
  END,
  '2020-01-01'::date,
  true,
  '00000000-0000-0000-0000-000000000000'
FROM politician_data p
WHERE p.full_name IN ('Paul Biya', 'Joseph Dion Ngute', 'Ni John Fru Ndi', 'Edith Kah Walla')
ON CONFLICT (politician_id, party_id, start_date) DO NOTHING;