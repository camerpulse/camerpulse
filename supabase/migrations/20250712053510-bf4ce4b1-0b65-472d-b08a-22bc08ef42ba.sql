-- Insert additional political parties (avoiding duplicates)
INSERT INTO public.political_parties (
  name, acronym, logo_url, founding_date, party_president, 
  headquarters_city, headquarters_region, contact_email, official_website,
  mission_statement, vision_statement, ideology, is_active, auto_imported
) VALUES 
-- Additional major parties
('Union des Populations du Cameroun', 'UPC', '/api/placeholder/100/100', '1948-04-10', 'Provisoire', 'Douala', 'Littoral', 'info@upc.cm', 'www.upc.cm', 'Indépendance et unification', 'Cameroun libre et uni', 'Left-wing', true, true),
('Parti Démocratique du Cameroun', 'PDC', '/api/placeholder/100/100', '1991-06-15', 'Louis-Tobie Mbida', 'Yaoundé', 'Centre', 'contact@pdc.cm', 'www.pdc.cm', 'Démocratie participative', 'Société démocratique', 'Center', true, true),
('Front National du Progrès', 'FNP', '/api/placeholder/100/100', '1991-09-12', 'Célestin Bedzigui', 'Yaoundé', 'Centre', 'info@fnp.cm', 'www.fnp.cm', 'Progrès national', 'Développement durable', 'Center-right', true, true),
('Mouvement Démocratique Républicain', 'MDR', '/api/placeholder/100/100', '1991-07-08', 'Dakole Daissala', 'Maroua', 'Far North', 'contact@mdr.cm', 'www.mdr.cm', 'République démocratique', 'État de droit', 'Center', true, true),
('Alliance Nationale pour la Démocratie et le Progrès', 'ANDP', '/api/placeholder/100/100', '1991-10-05', 'Issa Tchiroma Bakary', 'Maroua', 'Far North', 'info@andp.cm', 'www.andp.cm', 'Démocratie et progrès', 'Société inclusive', 'Center', true, true),

-- Regional and local parties
('Mouvement Progressiste du Cameroun', 'MPC', '/api/placeholder/100/100', '1991-08-14', 'Jean-Jacques Ekindi', 'Douala', 'Littoral', 'contact@mpc.cm', 'www.mpc.cm', 'Progrès social', 'Société moderne', 'Progressive', true, true),
('Union Socialiste Démocratique', 'USD', '/api/placeholder/100/100', '1991-11-20', 'Henri Hogbe Nlend', 'Yaoundé', 'Centre', 'info@usd.cm', 'www.usd.cm', 'Socialisme démocratique', 'Justice sociale', 'Social-democratic', true, true),
('Parti Social Démocrate', 'PSD', '/api/placeholder/100/100', '1991-12-03', 'Jean-Michel Nintcheu', 'Bafoussam', 'West', 'contact@psd.cm', 'www.psd.cm', 'Social-démocratie', 'Égalité des chances', 'Social-democratic', true, true),
('Parti Libéral Démocratique', 'PLD', '/api/placeholder/100/100', '1992-02-28', 'Olivier Bilé', 'Douala', 'Littoral', 'contact@pld.cm', 'www.pld.cm', 'Libéralisme démocratique', 'Liberté économique', 'Liberal', true, true),
('Front des Forces Démocratiques', 'FFD', '/api/placeholder/100/100', '1992-03-12', 'Paul Eric Kingue', 'Yaoundé', 'Centre', 'info@ffd.cm', 'www.ffd.cm', 'Forces démocratiques', 'Démocratie participative', 'Democratic', true, true),

('Mouvement des Jeunes Démocrates', 'MJD', '/api/placeholder/100/100', '1992-04-05', 'Marcel Yondo', 'Douala', 'Littoral', 'contact@mjd.cm', 'www.mjd.cm', 'Jeunesse et démocratie', 'Avenir démocratique', 'Youth-oriented', true, true),
('Parti de l''Alliance Démocratique', 'PAD', '/api/placeholder/100/100', '1992-05-18', 'Emile Tchikaya', 'Bafoussam', 'West', 'info@pad.cm', 'www.pad.cm', 'Alliance démocratique', 'Unité démocratique', 'Democratic', true, true),
('Union pour le Changement', 'UPC2', '/api/placeholder/100/100', '1992-06-22', 'Célestin Bedzigui', 'Yaoundé', 'Centre', 'contact@upc2.cm', 'www.upc2.cm', 'Changement démocratique', 'Transformation sociale', 'Reform', true, true),
('Mouvement National Démocratique', 'MND', '/api/placeholder/100/100', '1992-07-10', 'Albert Dzongang', 'Yaoundé', 'Centre', 'info@mnd.cm', 'www.mnd.cm', 'Démocratie nationale', 'État démocratique', 'Nationalist', true, true);