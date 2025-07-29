-- Add missing senator fields for enhanced functionality (corrected)
ALTER TABLE public.senators 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS political_party TEXT,
ADD COLUMN IF NOT EXISTS performance_score NUMERIC(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS transparency_score NUMERIC(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS civic_engagement_score NUMERIC(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS bills_proposed_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bills_passed_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS career_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS official_senate_url TEXT;

-- Update existing records to have some sample data
UPDATE public.senators 
SET 
  full_name = COALESCE(full_name, name),
  political_party = COALESCE(political_party, party_affiliation),
  performance_score = CASE 
    WHEN average_rating > 0 THEN (average_rating * 20)::numeric(3,2)
    ELSE (RANDOM() * 40 + 50)::numeric(3,2)
  END,
  transparency_score = (RANDOM() * 40 + 40)::numeric(3,2),
  civic_engagement_score = (RANDOM() * 30 + 60)::numeric(3,2),
  bills_proposed_count = (RANDOM() * 15)::integer,
  bills_passed_count = (RANDOM() * 8)::integer,
  badges = CASE 
    WHEN average_rating >= 4 THEN '["High Performer", "Civic Champion"]'::jsonb
    WHEN average_rating >= 3 THEN '["Active Legislator"]'::jsonb
    ELSE '["New Senator"]'::jsonb
  END,
  education = '[
    {
      "degree": "Master of Public Administration",
      "institution": "University of Yaoundé I",
      "year": "1995"
    },
    {
      "degree": "Bachelor of Law",
      "institution": "University of Buea",
      "year": "1992"
    }
  ]'::jsonb,
  career_history = '[
    {
      "position": "Regional Coordinator",
      "organization": "Ministry of Public Works",
      "startYear": "2010",
      "endYear": "2018"
    },
    {
      "position": "Legal Advisor",
      "organization": "Municipal Council",
      "startYear": "2005",
      "endYear": "2010"
    }
  ]'::jsonb
WHERE full_name IS NULL OR political_party IS NULL;