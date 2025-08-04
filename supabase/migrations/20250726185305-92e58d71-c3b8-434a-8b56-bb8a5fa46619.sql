-- Add missing infrastructure and service fields to villages table
ALTER TABLE villages ADD COLUMN IF NOT EXISTS schools_count integer DEFAULT 0;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS hospitals_count integer DEFAULT 0;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS water_sources_count integer DEFAULT 0;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS electricity_coverage_percentage integer DEFAULT 0;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS road_network_km numeric DEFAULT 0;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS mtn_coverage boolean DEFAULT false;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS orange_coverage boolean DEFAULT false;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS nexttel_coverage boolean DEFAULT false;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS main_economic_activity text;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS development_partners jsonb DEFAULT '[]'::jsonb;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS village_scorecard_rating numeric(3,1) DEFAULT 0;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS flag_image_url text;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS logo_image_url text;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS village_anthem_url text;