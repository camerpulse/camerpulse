-- Update Mbessa village with detailed cultural and linguistic information
UPDATE villages 
SET 
  founding_story = 'Mbessa is both a kingdom and a language in Cameroon. The Mbessa kingdom was founded in the 18th century and is one of the many kingdoms in the grassfields of the Northwest Region, each headed by a Fon (or Foyn). It is situated between Akeh, Din, Kom, and Oku kingdoms.',
  traditional_languages = ARRAY['Mbessa', 'French', 'English'],
  ethnic_groups = ARRAY['Mbessa'],
  year_founded = 1700, -- 18th century
  oral_traditions = 'The Mbessa language (also called Mbesa, EMZ) is a distinct Ring language within the Bantoid branch of the Niger-Congo language family. It is linguistically related to Kom and Oku languages and is spoken near the Kom, Noone (Din), and Oku languages.',
  notable_events = 'Traditional Fondom kingdom with distinct cultural identity. The Mbessa language is taught in some schools and serves as a first language for the ethnic group. The kingdom is part of the grassfields political system of the Northwest Region.',
  village_motto = 'Preserving the Mbessa cultural heritage and Ring language tradition'
WHERE village_name = 'Mbessa' AND region = 'North West' AND division = 'Boyo';