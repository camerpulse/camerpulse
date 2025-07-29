-- Update politicians to link with their political parties
UPDATE politicians SET political_party_id = (
  SELECT id FROM political_parties WHERE acronym = 'RDPC' LIMIT 1
) WHERE party = 'RDPC';

UPDATE politicians SET political_party_id = (
  SELECT id FROM political_parties WHERE acronym = 'SDF' LIMIT 1
) WHERE party = 'SDF';

UPDATE politicians SET political_party_id = (
  SELECT id FROM political_parties WHERE acronym = 'MRC' LIMIT 1
) WHERE party = 'MRC';

-- Add some sample promises for existing politicians
INSERT INTO politician_promises (politician_id, promise_text, status, date_made, description) VALUES
(
  (SELECT id FROM politicians WHERE name = 'Paul Biya' LIMIT 1),
  'Moderniser l''infrastructure du Cameroun d''ici 2025',
  'in_progress',
  '2018-10-07',
  'Construction de routes, ponts et amélioration des systèmes de transport'
),
(
  (SELECT id FROM politicians WHERE name = 'Paul Biya' LIMIT 1),
  'Réduire le chômage des jeunes de 50%',
  'in_progress',
  '2018-10-07',
  'Création d''emplois et programmes de formation professionnelle'
),
(
  (SELECT id FROM politicians WHERE name = 'Maurice Kamto' LIMIT 1),
  'Lutter contre la corruption de manière transparente',
  'in_progress',
  '2018-09-15',
  'Mise en place de mécanismes de transparence et de redevabilité'
),
(
  (SELECT id FROM politicians WHERE name = 'Maurice Kamto' LIMIT 1),
  'Améliorer le système éducatif national',
  'in_progress',
  '2018-09-15',
  'Réformes éducatives et augmentation du budget de l''éducation'
),
(
  (SELECT id FROM politicians WHERE name = 'Joshua Osih' LIMIT 1),
  'Promouvoir la décentralisation effective',
  'in_progress',
  '2018-08-20',
  'Transfert effectif des compétences vers les collectivités territoriales'
);

-- Update some politician details with more comprehensive information
UPDATE politicians SET 
  level_of_office = 'National',
  constituency = 'Cameroun',
  education = 'Université de Paris, Droit International',
  career_background = 'Avocat, Diplomate, Homme politique',
  gender = 'Masculin',
  birth_date = '1933-02-13'
WHERE name = 'Paul Biya';

UPDATE politicians SET 
  level_of_office = 'National',
  constituency = 'Littoral',
  education = 'Université de Paris 1 Panthéon-Sorbonne, Droit International',
  career_background = 'Avocat, Professeur universitaire, Homme politique',
  gender = 'Masculin',
  birth_date = '1962-03-15'
WHERE name = 'Maurice Kamto';

UPDATE politicians SET 
  level_of_office = 'National',
  constituency = 'Sud-Ouest',
  education = 'Université de Buea, Sciences Politiques',
  career_background = 'Journaliste, Homme politique',
  gender = 'Masculin',
  birth_date = '1970-05-25'
WHERE name = 'Joshua Osih';

UPDATE politicians SET 
  level_of_office = 'National',
  constituency = 'Nord-Ouest',
  education = 'Université de Cambridge, Sciences Économiques',
  career_background = 'Femme d''affaires, Militante des droits des femmes',
  gender = 'Féminin',
  birth_date = '1960-10-08'
WHERE name = 'Edith Kah Walla';