-- Add Foyn Gilbert Njong III as the current traditional ruler of Mbessa Kingdom
INSERT INTO village_chiefs (
  village_id,
  chief_name,
  chief_title,
  current_chief,
  throne_name,
  ceremonial_titles,
  lineage_history,
  notable_achievements,
  palace_location,
  succession_type
) VALUES (
  'b708f3bc-4122-4363-afaa-45895e231830', -- Mbessa village ID
  'Gilbert Njong III',
  'Foyn',
  true,
  'His Majesty Foyn Gilbert Njong III',
  ARRAY['Foyn', 'Fon', 'Traditional Ruler of Mbessa Kingdom'],
  'Third in the lineage of Foyn Gilbert, traditional ruler of the Mbessa Fondom in the grassfields of the Northwest Region',
  'Current traditional ruler of over 25,000 people in the Mbessa Kingdom. Upholds the cultural heritage and Ring language tradition of the Mbessa people.',
  'Mbessa Palace, Belo Sub Division, Boyo Division, North West Region',
  'Traditional hereditary succession within the Mbessa royal lineage'
);