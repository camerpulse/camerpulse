-- Fix community_events table column name
ALTER TABLE public.community_events RENAME COLUMN start_date TO start_time;
ALTER TABLE public.community_events RENAME COLUMN end_date TO end_time;

-- Update the index to match the correct column name
DROP INDEX IF EXISTS idx_community_events_start_date;
CREATE INDEX IF NOT EXISTS idx_community_events_start_time ON public.community_events(start_time);