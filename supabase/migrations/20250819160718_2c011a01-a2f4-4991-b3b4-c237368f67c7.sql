-- Insert sample political parties with correct column names
INSERT INTO public.political_parties (name, acronym, mission, political_leaning, ideology) 
VALUES 
  ('Cameroon People''s Democratic Movement', 'CPDM', 'The ruling party of Cameroon focused on national unity and development', 'Center-right', 'Democratic socialism'),
  ('Social Democratic Front', 'SDF', 'Opposition party advocating for democratic reforms', 'Center-left', 'Social democracy'),
  ('Union Nationale pour la Démocratie et le Progrès', 'UNDP', 'Opposition party promoting progress and democracy', 'Center', 'Liberal democracy'),
  ('Cameroon Democratic Union', 'CDU', 'Opposition party with Christian democratic values', 'Center-right', 'Christian democracy'),
  ('Progressive Movement', 'MP', 'Opposition party focusing on progressive policies', 'Left', 'Progressivism')
ON CONFLICT (name) DO NOTHING;

-- Insert sample politicians
INSERT INTO public.politicians (full_name, role, region, gender, biography, created_by)
VALUES 
  ('Paul Biya', 'politician', 'South', 'male', 'President of the Republic of Cameroon since 1982', '00000000-0000-0000-0000-000000000000'),
  ('Joseph Dion Ngute', 'minister', 'Southwest', 'male', 'Prime Minister of Cameroon', '00000000-0000-0000-0000-000000000000'),
  ('Ni John Fru Ndi', 'politician', 'Northwest', 'male', 'Chairman of the Social Democratic Front', '00000000-0000-0000-0000-000000000000'),
  ('Edith Kah Walla', 'politician', 'West', 'female', 'Cameroonian politician and entrepreneur', '00000000-0000-0000-0000-000000000000'),
  ('Maurice Kamto', 'politician', 'West', 'male', 'Leader of the Cameroon Renaissance Movement', '00000000-0000-0000-0000-000000000000'),
  ('Garga Haman Adji', 'mp', 'Far North', 'male', 'Member of Parliament representing Far North region', '00000000-0000-0000-0000-000000000000'),
  ('Cavaye Yeguie Djibril', 'mp', 'North', 'male', 'Speaker of the National Assembly', '00000000-0000-0000-0000-000000000000'),
  ('Marcel Niat Njifenji', 'senator', 'Center', 'male', 'President of the Senate', '00000000-0000-0000-0000-000000000000'),
  ('Rose Mbah Acha', 'mayor', 'Southwest', 'female', 'Mayor of Limbe', '00000000-0000-0000-0000-000000000000'),
  ('Luc Magloire Mbarga Atangana', 'minister', 'Center', 'male', 'Minister of Arts and Culture', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (full_name) DO NOTHING;

-- Create party affiliations using proper queries
DO $$
DECLARE
    cpdm_id UUID;
    sdf_id UUID;
    undp_id UUID;
    paul_id UUID;
    joseph_id UUID;
    fru_ndi_id UUID;
    edith_id UUID;
    garga_id UUID;
    cavaye_id UUID;
    marcel_id UUID;
    rose_id UUID;
    luc_id UUID;
BEGIN
    -- Get party IDs
    SELECT id INTO cpdm_id FROM public.political_parties WHERE name = 'Cameroon People''s Democratic Movement';
    SELECT id INTO sdf_id FROM public.political_parties WHERE name = 'Social Democratic Front';
    SELECT id INTO undp_id FROM public.political_parties WHERE name = 'Union Nationale pour la Démocratie et le Progrès';
    
    -- Get politician IDs
    SELECT id INTO paul_id FROM public.politicians WHERE full_name = 'Paul Biya';
    SELECT id INTO joseph_id FROM public.politicians WHERE full_name = 'Joseph Dion Ngute';
    SELECT id INTO fru_ndi_id FROM public.politicians WHERE full_name = 'Ni John Fru Ndi';
    SELECT id INTO edith_id FROM public.politicians WHERE full_name = 'Edith Kah Walla';
    SELECT id INTO garga_id FROM public.politicians WHERE full_name = 'Garga Haman Adji';
    SELECT id INTO cavaye_id FROM public.politicians WHERE full_name = 'Cavaye Yeguie Djibril';
    SELECT id INTO marcel_id FROM public.politicians WHERE full_name = 'Marcel Niat Njifenji';
    SELECT id INTO rose_id FROM public.politicians WHERE full_name = 'Rose Mbah Acha';
    SELECT id INTO luc_id FROM public.politicians WHERE full_name = 'Luc Magloire Mbarga Atangana';
    
    -- Insert affiliations
    INSERT INTO public.party_affiliations (politician_id, party_id, start_date, is_current, created_by)
    VALUES 
        (paul_id, cpdm_id, '1982-11-06', true, '00000000-0000-0000-0000-000000000000'),
        (joseph_id, cpdm_id, '2019-01-04', true, '00000000-0000-0000-0000-000000000000'),
        (fru_ndi_id, sdf_id, '1990-05-26', true, '00000000-0000-0000-0000-000000000000'),
        (edith_id, undp_id, '2011-03-01', true, '00000000-0000-0000-0000-000000000000'),
        (garga_id, cpdm_id, '2018-02-25', true, '00000000-0000-0000-0000-000000000000'),
        (cavaye_id, cpdm_id, '2013-04-12', true, '00000000-0000-0000-0000-000000000000'),
        (marcel_id, cpdm_id, '2018-04-12', true, '00000000-0000-0000-0000-000000000000'),
        (rose_id, sdf_id, '2020-02-09', true, '00000000-0000-0000-0000-000000000000'),
        (luc_id, cpdm_id, '2018-03-02', true, '00000000-0000-0000-0000-000000000000')
    ON CONFLICT (politician_id, party_id, start_date) DO NOTHING;
END $$;