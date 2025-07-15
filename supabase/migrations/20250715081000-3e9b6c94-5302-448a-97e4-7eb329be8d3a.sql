-- Insert demo polls with proper JSONB format
INSERT INTO public.polls (title, description, options, is_active, ends_at, creator_id) VALUES
('Who should be Cameroon''s next President in 2025?', 'Cast your vote for the candidate you believe will best lead Cameroon forward', 
 '["Paul Biya (RDPC)", "Maurice Kamto (MRC)", "Cabral Libii (PCRN)", "Joshua Osih (SDF)", "Akere Muna (Independent)", "Other Candidate"]'::jsonb, 
 true, NOW() + INTERVAL '90 days', (SELECT id FROM auth.users LIMIT 1)),

('What is the most pressing issue facing Cameroon today?', 'Help prioritize the challenges our nation needs to address urgently', 
 '["Anglophone Crisis", "Economic Development", "Corruption", "Education System", "Healthcare", "Infrastructure"]'::jsonb, 
 true, NOW() + INTERVAL '60 days', (SELECT id FROM auth.users LIMIT 1)),

('Should Cameroon adopt a federal system of government?', 'A fundamental question about our nation''s political structure', 
 '["Yes, full federalism", "Yes, but limited federalism", "No, maintain unitary system", "Not sure, need more information"]'::jsonb, 
 true, NOW() + INTERVAL '45 days', (SELECT id FROM auth.users LIMIT 1)),

('How should Cameroon address youth unemployment?', 'Young Cameroonians need opportunities - what''s the best approach?', 
 '["More government job programs", "Support entrepreneurship/startups", "Improve technical education", "Foreign investment incentives", "Agricultural modernization", "All of the above"]'::jsonb, 
 true, NOW() + INTERVAL '30 days', (SELECT id FROM auth.users LIMIT 1)),

('What language policy should Cameroon adopt in schools?', 'Education language policy affects our children''s future', 
 '["English and French equally", "Prioritize French", "Prioritize English", "Include more local languages", "International languages (Chinese, etc)"]'::jsonb, 
 true, NOW() + INTERVAL '40 days', (SELECT id FROM auth.users LIMIT 1)),

('Should Cameroon invest more in renewable energy?', 'Environmental and economic sustainability for our future', 
 '["Yes, solar power priority", "Yes, hydroelectric expansion", "Yes, wind power development", "No, focus on oil/gas", "Mixed approach"]'::jsonb, 
 true, NOW() + INTERVAL '50 days', (SELECT id FROM auth.users LIMIT 1));