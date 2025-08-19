-- Insert sample political parties
INSERT INTO public.political_parties (name, short_name, logo_url, description, founding_date, chairman_name, ideology, region, website_url, member_count, political_orientation, status) VALUES
('Cameroon People''s Democratic Movement', 'CPDM', '/api/placeholder/150/150', 'The ruling party of Cameroon since 1985, focusing on national unity and economic development.', '1985-03-24', 'Paul Biya', 'Centrist', 'All Regions', 'https://cpdm.cm', 15, 'center', 'active'),
('Social Democratic Front', 'SDF', '/api/placeholder/150/150', 'Main opposition party advocating for democratic reforms and federalism.', '1990-05-26', 'Joshua Osih', 'Social Democratic', 'Northwest/Southwest', 'https://sdf.cm', 8, 'left', 'active'),
('Cameroon Renaissance Movement', 'MRC', '/api/placeholder/150/150', 'Opposition party focused on political and economic renewal.', '2012-08-12', 'Maurice Kamto', 'Liberal Democratic', 'Centre/Littoral', 'https://mrc.cm', 3, 'center', 'active'),
('National Union for Democracy and Progress', 'UNDP', '/api/placeholder/150/150', 'Opposition party promoting democracy and national integration.', '1991-04-17', 'Bello Bouba Maigari', 'Democratic', 'North/Adamawa', 'https://undp.cm', 2, 'center', 'active'),
('Union of the Peoples of Cameroon', 'UPC', '/api/placeholder/150/150', 'Historic opposition party advocating for independence and social justice.', '1948-04-10', 'Provisoire Dobgima', 'Socialist', 'Centre/South', 'https://upc.cm', 1, 'left', 'active');

-- Insert sample politicians  
INSERT INTO public.politicians (full_name, first_name, last_name, title, position_type, position_title, constituency, region, gender, date_of_birth, photo_url, biography, is_active, verification_status, status) VALUES
('Paul Biya', 'Paul', 'Biya', 'His Excellency', 'president', 'President of the Republic of Cameroon', 'National', 'Centre', 'Male', '1933-02-13', '/api/placeholder/200/200', 'President of Cameroon since 1982, leader of CPDM. Longest-serving current head of state in Africa.', true, 'verified', 'active'),
('Joseph Dion Ngute', 'Joseph', 'Dion Ngute', 'Dr.', 'minister', 'Prime Minister', 'National', 'Southwest', 'Male', '1954-12-12', '/api/placeholder/200/200', 'Prime Minister of Cameroon since 2019, former Secretary General at the Presidency.', true, 'verified', 'active'),
('Cavaye Yeguie Djibril', 'Cavaye', 'Yeguie Djibril', 'Hon.', 'mp', 'Speaker of the National Assembly', 'Maroua Urban', 'Far North', 'Male', '1948-01-01', '/api/placeholder/200/200', 'Speaker of the National Assembly since 1992, veteran CPDM politician.', true, 'verified', 'active'),
('Joshua Osih', 'Joshua', 'Osih', 'Hon.', 'mp', 'Member of Parliament for Wouri Centre', 'Wouri Centre', 'Littoral', 'Male', '1970-03-15', '/api/placeholder/200/200', 'Chairman of SDF, MP and prominent opposition leader advocating for democratic reforms.', true, 'verified', 'active'),
('Maurice Kamto', 'Maurice', 'Kamto', 'Prof.', 'opposition_leader', 'President of MRC', 'National', 'Centre', 'Male', '1954-05-15', '/api/placeholder/200/200', 'International lawyer, university professor, and leader of the MRC opposition party.', true, 'verified', 'active'),
('Edith Kah Walla', 'Edith', 'Kah Walla', 'Dr.', 'opposition_leader', 'Political Leader', 'National', 'Northwest', 'Female', '1965-09-08', '/api/placeholder/200/200', 'Entrepreneur and politician, advocate for women''s rights and good governance.', true, 'verified', 'active'),
('Louis Paul Motaze', 'Louis Paul', 'Motaze', 'Hon.', 'minister', 'Minister of Finance', 'National', 'Centre', 'Male', '1960-07-20', '/api/placeholder/200/200', 'Minister of Finance, economist and CPDM member with extensive government experience.', true, 'verified', 'active'),
('Atanga Nji Paul', 'Paul', 'Atanga Nji', 'Hon.', 'minister', 'Minister of Territorial Administration', 'National', 'Northwest', 'Male', '1967-11-03', '/api/placeholder/200/200', 'Minister of Territorial Administration, responsible for internal security and decentralization.', true, 'verified', 'active'),
('Lejeune Mbella Mbella', 'Lejeune', 'Mbella Mbella', 'Hon.', 'minister', 'Minister of External Relations', 'National', 'South', 'Male', '1956-08-12', '/api/placeholder/200/200', 'Minister of External Relations, diplomat and former ambassador.', true, 'verified', 'active'),
('Célestine Ketcha Courtès', 'Célestine', 'Ketcha Courtès', 'Dr.', 'minister', 'Minister of Housing and Urban Development', 'National', 'West', 'Female', '1964-03-22', '/api/placeholder/200/200', 'Minister of Housing and Urban Development, urban planner and women''s rights advocate.', true, 'verified', 'active');

-- Create party affiliations (linking politicians to parties)
INSERT INTO public.party_affiliations (politician_id, party_id, start_date, is_current, position_in_party, notes) VALUES
-- CPDM Members
((SELECT id FROM politicians WHERE full_name = 'Paul Biya'), (SELECT id FROM political_parties WHERE short_name = 'CPDM'), '1982-11-06', true, 'National Chairman', 'Founding member and leader'),
((SELECT id FROM politicians WHERE full_name = 'Joseph Dion Ngute'), (SELECT id FROM political_parties WHERE short_name = 'CPDM'), '1990-01-01', true, 'Central Committee Member', 'Senior party member'),
((SELECT id FROM politicians WHERE full_name = 'Cavaye Yeguie Djibril'), (SELECT id FROM political_parties WHERE short_name = 'CPDM'), '1985-03-24', true, 'Vice Chairman', 'Long-serving party official'),
((SELECT id FROM politicians WHERE full_name = 'Louis Paul Motaze'), (SELECT id FROM political_parties WHERE short_name = 'CPDM'), '1988-01-01', true, 'Central Committee Member', 'Economic advisor to party'),
((SELECT id FROM politicians WHERE full_name = 'Atanga Nji Paul'), (SELECT id FROM political_parties WHERE short_name = 'CPDM'), '1992-01-01', true, 'Regional Coordinator', 'Party organizer for Northwest'),
((SELECT id FROM politicians WHERE full_name = 'Lejeune Mbella Mbella'), (SELECT id FROM political_parties WHERE short_name = 'CPDM'), '1990-01-01', true, 'Central Committee Member', 'Diplomatic wing coordinator'),
((SELECT id FROM politicians WHERE full_name = 'Célestine Ketcha Courtès'), (SELECT id FROM political_parties WHERE short_name = 'CPDM'), '2000-01-01', true, 'Women''s Wing Leader', 'Promotes women''s participation'),

-- SDF Members  
((SELECT id FROM politicians WHERE full_name = 'Joshua Osih'), (SELECT id FROM political_parties WHERE short_name = 'SDF'), '1995-01-01', true, 'National Chairman', 'Elected party leader in 2016'),

-- MRC Members
((SELECT id FROM politicians WHERE full_name = 'Maurice Kamto'), (SELECT id FROM political_parties WHERE short_name = 'MRC'), '2012-08-12', true, 'National President', 'Founder and leader'),

-- Independent (for demonstration)
((SELECT id FROM politicians WHERE full_name = 'Edith Kah Walla'), (SELECT id FROM political_parties WHERE short_name = 'UPC'), '2010-01-01', false, 'Former Member', 'Left party in 2015'),
((SELECT id FROM politicians WHERE full_name = 'Edith Kah Walla'), (SELECT id FROM political_parties WHERE short_name = 'UNDP'), '2015-06-01', false, 'Former Member', 'Short association');

-- Update politicians to mark Edith as independent (no current affiliation)
UPDATE public.politicians SET is_independent = true WHERE full_name = 'Edith Kah Walla';

-- Insert some sample ratings
INSERT INTO public.politician_ratings (politician_id, user_id, overall_rating, leadership_rating, transparency_rating, performance_rating, accessibility_rating, review_title, review_content, is_verified) VALUES
((SELECT id FROM politicians WHERE full_name = 'Joshua Osih'), '00000000-0000-0000-0000-000000000001', 4, 4, 5, 4, 4, 'Strong Opposition Leadership', 'Consistent advocate for democratic reforms and transparent governance.', true),
((SELECT id FROM politicians WHERE full_name = 'Maurice Kamto'), '00000000-0000-0000-0000-000000000002', 4, 4, 4, 4, 3, 'Principled Leadership', 'Stands firm on democratic principles despite challenges.', true),
((SELECT id FROM politicians WHERE full_name = 'Paul Biya'), '00000000-0000-0000-0000-000000000003', 3, 3, 2, 3, 2, 'Long-serving Leader', 'Decades of experience but mixed results on transparency.', true);

-- Update party seat counts with realistic numbers
UPDATE public.political_parties SET 
  national_assembly_seats = CASE short_name
    WHEN 'CPDM' THEN 152
    WHEN 'SDF' THEN 18
    WHEN 'MRC' THEN 5
    WHEN 'UNDP' THEN 4
    WHEN 'UPC' THEN 1
    ELSE 0
  END,
  senate_seats = CASE short_name  
    WHEN 'CPDM' THEN 63
    WHEN 'SDF' THEN 6
    WHEN 'MRC' THEN 2
    WHEN 'UNDP' THEN 1
    WHEN 'UPC' THEN 0
    ELSE 0
  END;