-- Insert 4 sample Cameroon billionaires

INSERT INTO public.billionaires (
  full_name,
  company_affiliation,
  wealth_source,
  verified_net_worth_fcfa,
  region,
  biography,
  business_investments,
  is_verified,
  current_rank,
  profile_views
) VALUES 
(
  'Vincent Bolloré Jr.',
  'Bolloré Group Cameroon',
  'logistics',
  75000000000,
  'Douala',
  'Leading logistics and transportation magnate in Central Africa, with extensive holdings in port operations, railways, and shipping across Cameroon and the region.',
  ARRAY['Douala Port Terminal', 'Camrail Railway', 'Bolloré Logistics Africa'],
  true,
  1,
  1247
),
(
  'Baba Ahmadou Danpullo',
  'Danpullo Group',
  'agriculture',
  45000000000,
  'North',
  'Cattle ranching and agricultural empire builder, known as the "Cattle King of Cameroon" with vast livestock holdings and agricultural ventures across the northern regions.',
  ARRAY['Danpullo Cattle Ranch', 'Mayo Dairy', 'Agricultural Processing Plants'],
  true,
  2,
  892
),
(
  'Fotso Victor',
  'FOTSO Group',
  'manufacturing',
  38000000000,
  'West',
  'Industrial manufacturing pioneer with diverse holdings in cement production, beverages, and construction materials. Built one of Cameroon''s largest industrial conglomerates.',
  ARRAY['FOTSO Cement', 'Brasseries du Cameroun', 'Construction Materials Ltd'],
  true,
  3,
  674
),
(
  'Samuel Fosso',
  'Fosso Real Estate Empire',
  'real_estate',
  22000000000,
  'Centre',
  'Real estate mogul and property development visionary, with luxury developments across Yaoundé and major urban centers. Pioneer in modern commercial real estate in Cameroon.',
  ARRAY['Fosso Towers Yaoundé', 'Commercial Plaza Networks', 'Luxury Residential Developments'],
  true,
  4,
  445
);

-- Update rankings function call
SELECT update_billionaire_rankings();