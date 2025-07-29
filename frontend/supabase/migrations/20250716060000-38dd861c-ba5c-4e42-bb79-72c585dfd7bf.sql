-- Add region tracking to poll votes
ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS region text;

-- Create index for efficient region-based queries
CREATE INDEX IF NOT EXISTS idx_poll_votes_region_poll ON poll_votes(poll_id, region);

-- Create a view for regional vote aggregation
CREATE OR REPLACE VIEW poll_regional_results AS
SELECT 
  pv.poll_id,
  pv.region,
  pv.option_index,
  COUNT(*) as vote_count,
  ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY pv.poll_id, pv.region)), 2) as percentage
FROM poll_votes pv
WHERE pv.region IS NOT NULL
GROUP BY pv.poll_id, pv.region, pv.option_index
ORDER BY pv.poll_id, pv.region, pv.option_index;