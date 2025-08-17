-- Create foreign key relationships between political entities

-- Add political_party_id foreign key to senators table if not exists
ALTER TABLE senators 
ADD COLUMN IF NOT EXISTS political_party_id UUID REFERENCES political_parties(id);

-- Add political_party_id foreign key to ministers table if not exists  
ALTER TABLE ministers
ADD COLUMN IF NOT EXISTS political_party_id UUID REFERENCES political_parties(id);

-- Add political_party_id foreign key to mps table if not exists
ALTER TABLE mps 
ADD COLUMN IF NOT EXISTS political_party_id UUID REFERENCES political_parties(id);

-- Update existing records to link parties based on party name matching
-- Update senators
UPDATE senators 
SET political_party_id = pp.id
FROM political_parties pp
WHERE senators.political_party_id IS NULL 
  AND (senators.political_party = pp.name OR senators.political_party = pp.acronym)
  AND senators.political_party IS NOT NULL;

-- Update ministers  
UPDATE ministers
SET political_party_id = pp.id
FROM political_parties pp
WHERE ministers.political_party_id IS NULL
  AND (ministers.political_party = pp.name OR ministers.political_party = pp.acronym)
  AND ministers.political_party IS NOT NULL;

-- Update MPs
UPDATE mps
SET political_party_id = pp.id  
FROM political_parties pp
WHERE mps.political_party_id IS NULL
  AND (mps.political_party = pp.name OR mps.political_party = pp.acronym)
  AND mps.political_party IS NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_senators_political_party_id ON senators(political_party_id);
CREATE INDEX IF NOT EXISTS idx_ministers_political_party_id ON ministers(political_party_id);
CREATE INDEX IF NOT EXISTS idx_mps_political_party_id ON mps(political_party_id);