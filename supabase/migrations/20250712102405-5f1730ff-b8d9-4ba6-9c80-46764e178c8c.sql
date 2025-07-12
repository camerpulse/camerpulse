-- Insert sample AI verification data for politicians
INSERT INTO public.politician_ai_verification (
  politician_id,
  last_verified_at,
  verification_status,
  verification_score,
  sources_count,
  last_sources_checked,
  outdated_fields,
  disputed_fields
)
SELECT 
  p.id,
  now() - (random() * interval '7 days'),
  CASE 
    WHEN random() < 0.6 THEN 'verified'
    WHEN random() < 0.8 THEN 'unverified'
    WHEN random() < 0.9 THEN 'pending'
    ELSE 'disputed'
  END,
  0.7 + (random() * 0.3), -- Score between 0.7 and 1.0
  floor(2 + random() * 4)::integer, -- 2-5 sources
  jsonb_build_array(
    jsonb_build_object('url', 'https://assemblee-nationale.cm/deputes', 'checked_at', now()::text),
    jsonb_build_object('url', 'https://gov.cm/gouvernement', 'checked_at', now()::text),
    jsonb_build_object('url', 'https://elecam.cm/partis-politiques', 'checked_at', now()::text)
  ),
  ARRAY[]::text[], -- No outdated fields for sample data
  ARRAY[]::text[]  -- No disputed fields for sample data
FROM public.politicians p
WHERE p.id IS NOT NULL
LIMIT 20;

-- Insert sample AI verification data for political parties
INSERT INTO public.party_ai_verification (
  party_id,
  last_verified_at,
  verification_status,
  verification_score,
  sources_count,
  last_sources_checked,
  outdated_fields,
  disputed_fields
)
SELECT 
  p.id,
  now() - (random() * interval '10 days'),
  CASE 
    WHEN random() < 0.7 THEN 'verified'
    WHEN random() < 0.85 THEN 'unverified'
    WHEN random() < 0.95 THEN 'pending'
    ELSE 'disputed'
  END,
  0.65 + (random() * 0.35), -- Score between 0.65 and 1.0
  floor(1 + random() * 3)::integer, -- 1-3 sources
  jsonb_build_array(
    jsonb_build_object('url', 'https://elecam.cm/partis-politiques', 'checked_at', now()::text),
    jsonb_build_object('url', 'https://minat.gov.cm/associations', 'checked_at', now()::text)
  ),
  ARRAY[]::text[], -- No outdated fields for sample data
  ARRAY[]::text[]  -- No disputed fields for sample data
FROM public.political_parties p
WHERE p.id IS NOT NULL
LIMIT 15;

-- Insert sample AI activity logs
INSERT INTO public.politica_ai_logs (
  target_type,
  target_id,
  action_type,
  status,
  changes_made,
  sources_verified,
  proof_urls,
  ai_confidence_score,
  created_at,
  completed_at
)
SELECT 
  'politician',
  p.id,
  CASE 
    WHEN random() < 0.5 THEN 'verification'
    WHEN random() < 0.8 THEN 'scan'
    ELSE 'update'
  END,
  CASE 
    WHEN random() < 0.8 THEN 'completed'
    WHEN random() < 0.95 THEN 'pending'
    ELSE 'failed'
  END,
  jsonb_build_array(
    jsonb_build_object('field', 'name', 'action', 'verified'),
    jsonb_build_object('field', 'position', 'action', 'verified')
  ),
  jsonb_build_array('assemblee-nationale.cm', 'gov.cm'),
  ARRAY['https://assemblee-nationale.cm/deputes', 'https://gov.cm/gouvernement'],
  0.8 + (random() * 0.2),
  now() - (random() * interval '5 days'),
  now() - (random() * interval '4 days')
FROM public.politicians p
ORDER BY random()
LIMIT 10;

-- Insert some logs for political parties too
INSERT INTO public.politica_ai_logs (
  target_type,
  target_id,
  action_type,
  status,
  changes_made,
  sources_verified,
  proof_urls,
  ai_confidence_score,
  created_at,
  completed_at
)
SELECT 
  'political_party',
  p.id,
  CASE 
    WHEN random() < 0.6 THEN 'verification'
    ELSE 'scan'
  END,
  CASE 
    WHEN random() < 0.85 THEN 'completed'
    ELSE 'pending'
  END,
  jsonb_build_array(
    jsonb_build_object('field', 'name', 'action', 'verified'),
    jsonb_build_object('field', 'founding_date', 'action', 'verified')
  ),
  jsonb_build_array('elecam.cm', 'minat.gov.cm'),
  ARRAY['https://elecam.cm/partis-politiques', 'https://minat.gov.cm/associations'],
  0.75 + (random() * 0.25),
  now() - (random() * interval '7 days'),
  now() - (random() * interval '6 days')
FROM public.political_parties p
ORDER BY random()
LIMIT 8;