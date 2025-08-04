-- Insert comprehensive political parties data
INSERT INTO public.political_parties (
  name, acronym, logo_url, founding_date, party_president, 
  headquarters_city, headquarters_region, contact_email, official_website,
  mission_statement, vision_statement, ideology, is_active, auto_imported
) VALUES 
-- Major parties (updating existing ones and adding new ones)
('Rassemblement Démocratique du Peuple Camerounais', 'RDPC', '/api/placeholder/100/100', '1985-03-24', 'Paul Biya', 'Yaoundé', 'Centre', 'info@rdpc.cm', 'www.rdpc.cm', 'Unité, Travail, Progrès', 'Un Cameroun uni et prospère', 'Center-right', true, true),
('Social Democratic Front', 'SDF', '/api/placeholder/100/100', '1990-05-26', 'John Fru Ndi', 'Bamenda', 'Northwest', 'info@sdf.cm', 'www.sdf.cm', 'Démocratie et justice sociale', 'Une société démocratique et juste', 'Center-left', true, true),
('Mouvement pour la Renaissance du Cameroun', 'MRC', '/api/placeholder/100/100', '2012-09-14', 'Maurice Kamto', 'Yaoundé', 'Centre', 'contact@mrc.cm', 'www.mrc.cm', 'Renaissance et transformation', 'Un Cameroun nouveau', 'Center-left', true, true),
('Union Nationale pour la Démocratie et le Progrès', 'UNDP', '/api/placeholder/100/100', '1991-03-17', 'Bello Bouba Maigari', 'Garoua', 'North', 'info@undp.cm', 'www.undp.cm', 'Démocratie et développement', 'Unité dans la diversité', 'Center', true, true),
('Cameroon Democratic Union', 'CDU', '/api/placeholder/100/100', '1991-04-20', 'Adamou Ndam Njoya', 'Foumban', 'West', 'contact@cdu.cm', 'www.cdu.cm', 'Union et progrès', 'Cameroun démocratique', 'Liberal', true, true),

-- Additional major parties
('Union des Populations du Cameroun', 'UPC', '/api/placeholder/100/100', '1948-04-10', 'Provisoire', 'Douala', 'Littoral', 'info@upc.cm', 'www.upc.cm', 'Indépendance et unification', 'Cameroun libre et uni', 'Left-wing', true, true),
('Parti Démocratique du Cameroun', 'PDC', '/api/placeholder/100/100', '1991-06-15', 'Louis-Tobie Mbida', 'Yaoundé', 'Centre', 'contact@pdc.cm', 'www.pdc.cm', 'Démocratie participative', 'Société démocratique', 'Center', true, true),
('Front National du Progrès', 'FNP', '/api/placeholder/100/100', '1991-09-12', 'Célestin Bedzigui', 'Yaoundé', 'Centre', 'info@fnp.cm', 'www.fnp.cm', 'Progrès national', 'Développement durable', 'Center-right', true, true),
('Mouvement Démocratique Républicain', 'MDR', '/api/placeholder/100/100', '1991-07-08', 'Dakole Daissala', 'Maroua', 'Far North', 'contact@mdr.cm', 'www.mdr.cm', 'République démocratique', 'État de droit', 'Center', true, true),
('Alliance Nationale pour la Démocratie et le Progrès', 'ANDP', '/api/placeholder/100/100', '1991-10-05', 'Issa Tchiroma Bakary', 'Maroua', 'Far North', 'info@andp.cm', 'www.andp.cm', 'Démocratie et progrès', 'Société inclusive', 'Center', true, true)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  headquarters_city = EXCLUDED.headquarters_city,
  headquarters_region = EXCLUDED.headquarters_region,
  contact_email = EXCLUDED.contact_email,
  official_website = EXCLUDED.official_website,
  mission_statement = EXCLUDED.mission_statement,
  vision_statement = EXCLUDED.vision_statement,
  ideology = EXCLUDED.ideology,
  auto_imported = EXCLUDED.auto_imported;