-- Insert sample political parties without conflict clause
INSERT INTO public.political_parties (name, acronym, mission, political_leaning, ideology) 
SELECT * FROM (VALUES 
  ('Cameroon People''s Democratic Movement', 'CPDM', 'The ruling party of Cameroon focused on national unity and development', 'Center-right', 'Democratic socialism'),
  ('Social Democratic Front', 'SDF', 'Opposition party advocating for democratic reforms', 'Center-left', 'Social democracy'),
  ('Union Nationale pour la Démocratie et le Progrès', 'UNDP', 'Opposition party promoting progress and democracy', 'Center', 'Liberal democracy'),
  ('Cameroon Democratic Union', 'CDU', 'Opposition party with Christian democratic values', 'Center-right', 'Christian democracy'),
  ('Progressive Movement', 'MP', 'Opposition party focusing on progressive policies', 'Left', 'Progressivism')
) AS t(name, acronym, mission, political_leaning, ideology)
WHERE NOT EXISTS (SELECT 1 FROM public.political_parties p WHERE p.name = t.name);

-- Insert sample politicians without conflict clause
INSERT INTO public.politicians (full_name, role, region, gender, biography, created_by)
SELECT * FROM (VALUES 
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
) AS t(full_name, role, region, gender, biography, created_by)
WHERE NOT EXISTS (SELECT 1 FROM public.politicians p WHERE p.full_name = t.full_name);

-- Create party affiliations safely
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
    SELECT id INTO cpdm_id FROM public.political_parties WHERE name = 'Cameroon People''s Democratic Movement' LIMIT 1;
    SELECT id INTO sdf_id FROM public.political_parties WHERE name = 'Social Democratic Front' LIMIT 1;
    SELECT id INTO undp_id FROM public.political_parties WHERE name = 'Union Nationale pour la Démocratie et le Progrès' LIMIT 1;
    
    -- Get politician IDs
    SELECT id INTO paul_id FROM public.politicians WHERE full_name = 'Paul Biya' LIMIT 1;
    SELECT id INTO joseph_id FROM public.politicians WHERE full_name = 'Joseph Dion Ngute' LIMIT 1;
    SELECT id INTO fru_ndi_id FROM public.politicians WHERE full_name = 'Ni John Fru Ndi' LIMIT 1;
    SELECT id INTO edith_id FROM public.politicians WHERE full_name = 'Edith Kah Walla' LIMIT 1;
    SELECT id INTO garga_id FROM public.politicians WHERE full_name = 'Garga Haman Adji' LIMIT 1;
    SELECT id INTO cavaye_id FROM public.politicians WHERE full_name = 'Cavaye Yeguie Djibril' LIMIT 1;
    SELECT id INTO marcel_id FROM public.politicians WHERE full_name = 'Marcel Niat Njifenji' LIMIT 1;
    SELECT id INTO rose_id FROM public.politicians WHERE full_name = 'Rose Mbah Acha' LIMIT 1;
    SELECT id INTO luc_id FROM public.politicians WHERE full_name = 'Luc Magloire Mbarga Atangana' LIMIT 1;
    
    -- Insert affiliations only if they don't exist
    IF paul_id IS NOT NULL AND cpdm_id IS NOT NULL THEN
        INSERT INTO public.party_affiliations (politician_id, party_id, start_date, is_current, created_by)
        SELECT paul_id, cpdm_id, '1982-11-06'::date, true, '00000000-0000-0000-0000-000000000000'
        WHERE NOT EXISTS (
            SELECT 1 FROM public.party_affiliations 
            WHERE politician_id = paul_id AND party_id = cpdm_id AND start_date = '1982-11-06'::date
        );
    END IF;
    
    IF joseph_id IS NOT NULL AND cpdm_id IS NOT NULL THEN
        INSERT INTO public.party_affiliations (politician_id, party_id, start_date, is_current, created_by)
        SELECT joseph_id, cpdm_id, '2019-01-04'::date, true, '00000000-0000-0000-0000-000000000000'
        WHERE NOT EXISTS (
            SELECT 1 FROM public.party_affiliations 
            WHERE politician_id = joseph_id AND party_id = cpdm_id AND start_date = '2019-01-04'::date
        );
    END IF;
    
    IF fru_ndi_id IS NOT NULL AND sdf_id IS NOT NULL THEN
        INSERT INTO public.party_affiliations (politician_id, party_id, start_date, is_current, created_by)
        SELECT fru_ndi_id, sdf_id, '1990-05-26'::date, true, '00000000-0000-0000-0000-000000000000'
        WHERE NOT EXISTS (
            SELECT 1 FROM public.party_affiliations 
            WHERE politician_id = fru_ndi_id AND party_id = sdf_id AND start_date = '1990-05-26'::date
        );
    END IF;
    
    IF edith_id IS NOT NULL AND undp_id IS NOT NULL THEN
        INSERT INTO public.party_affiliations (politician_id, party_id, start_date, is_current, created_by)
        SELECT edith_id, undp_id, '2011-03-01'::date, true, '00000000-0000-0000-0000-000000000000'
        WHERE NOT EXISTS (
            SELECT 1 FROM public.party_affiliations 
            WHERE politician_id = edith_id AND party_id = undp_id AND start_date = '2011-03-01'::date
        );
    END IF;
    
    IF garga_id IS NOT NULL AND cpdm_id IS NOT NULL THEN
        INSERT INTO public.party_affiliations (politician_id, party_id, start_date, is_current, created_by)
        SELECT garga_id, cpdm_id, '2018-02-25'::date, true, '00000000-0000-0000-0000-000000000000'
        WHERE NOT EXISTS (
            SELECT 1 FROM public.party_affiliations 
            WHERE politician_id = garga_id AND party_id = cpdm_id AND start_date = '2018-02-25'::date
        );
    END IF;
    
    IF cavaye_id IS NOT NULL AND cpdm_id IS NOT NULL THEN
        INSERT INTO public.party_affiliations (politician_id, party_id, start_date, is_current, created_by)
        SELECT cavaye_id, cpdm_id, '2013-04-12'::date, true, '00000000-0000-0000-0000-000000000000'
        WHERE NOT EXISTS (
            SELECT 1 FROM public.party_affiliations 
            WHERE politician_id = cavaye_id AND party_id = cpdm_id AND start_date = '2013-04-12'::date
        );
    END IF;
    
    IF marcel_id IS NOT NULL AND cpdm_id IS NOT NULL THEN
        INSERT INTO public.party_affiliations (politician_id, party_id, start_date, is_current, created_by)
        SELECT marcel_id, cpdm_id, '2018-04-12'::date, true, '00000000-0000-0000-0000-000000000000'
        WHERE NOT EXISTS (
            SELECT 1 FROM public.party_affiliations 
            WHERE politician_id = marcel_id AND party_id = cpdm_id AND start_date = '2018-04-12'::date
        );
    END IF;
    
    IF rose_id IS NOT NULL AND sdf_id IS NOT NULL THEN
        INSERT INTO public.party_affiliations (politician_id, party_id, start_date, is_current, created_by)
        SELECT rose_id, sdf_id, '2020-02-09'::date, true, '00000000-0000-0000-0000-000000000000'
        WHERE NOT EXISTS (
            SELECT 1 FROM public.party_affiliations 
            WHERE politician_id = rose_id AND party_id = sdf_id AND start_date = '2020-02-09'::date
        );
    END IF;
    
    IF luc_id IS NOT NULL AND cpdm_id IS NOT NULL THEN
        INSERT INTO public.party_affiliations (politician_id, party_id, start_date, is_current, created_by)
        SELECT luc_id, cpdm_id, '2018-03-02'::date, true, '00000000-0000-0000-0000-000000000000'
        WHERE NOT EXISTS (
            SELECT 1 FROM public.party_affiliations 
            WHERE politician_id = luc_id AND party_id = cpdm_id AND start_date = '2018-03-02'::date
        );
    END IF;
END $$;