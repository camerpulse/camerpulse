-- Add missing institution types to the enum
ALTER TYPE institution_type ADD VALUE 'school';
ALTER TYPE institution_type ADD VALUE 'hospital'; 
ALTER TYPE institution_type ADD VALUE 'pharmacy';
ALTER TYPE institution_type ADD VALUE 'village';

-- Add missing columns to institutions table for directory functionality
ALTER TABLE institutions 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sponsored_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS average_rating NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS claim_status TEXT DEFAULT 'unclaimed',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';