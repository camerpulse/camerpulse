-- Add slug columns to all political entities tables
ALTER TABLE public.politicians ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.senators ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.mps ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.ministers ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.political_parties ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.villages ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS slug text;

-- Create indexes on slug columns for better performance
CREATE INDEX IF NOT EXISTS idx_politicians_slug ON public.politicians(slug);
CREATE INDEX IF NOT EXISTS idx_senators_slug ON public.senators(slug);
CREATE INDEX IF NOT EXISTS idx_mps_slug ON public.mps(slug);
CREATE INDEX IF NOT EXISTS idx_ministers_slug ON public.ministers(slug);
CREATE INDEX IF NOT EXISTS idx_political_parties_slug ON public.political_parties(slug);
CREATE INDEX IF NOT EXISTS idx_villages_slug ON public.villages(slug);
CREATE INDEX IF NOT EXISTS idx_hospitals_slug ON public.hospitals(slug);
CREATE INDEX IF NOT EXISTS idx_schools_slug ON public.schools(slug);