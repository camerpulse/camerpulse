-- Seed data for villages table with required division field
INSERT INTO villages (village_name, region, division, gps_latitude, gps_longitude, overall_rating, is_verified, infrastructure_score, education_score, health_score, created_by) VALUES
('Kumba', 'Southwest', 'Meme', 4.6364, 9.4469, 7.5, true, 8, 7, 6, '91569092-36c0-4867-8a0e-370ee026e202'),
('Bamenda', 'Northwest', 'Mezam', 5.9597, 10.1491, 8.2, true, 9, 8, 7, '91569092-36c0-4867-8a0e-370ee026e202'),
('Garoua', 'North', 'Benoue', 9.3265, 13.3962, 6.8, true, 6, 7, 5, '91569092-36c0-4867-8a0e-370ee026e202'),
('Douala', 'Littoral', 'Wouri', 4.0511, 9.7679, 9.1, true, 9, 9, 8, '91569092-36c0-4867-8a0e-370ee026e202'),
('Yaoundé', 'Centre', 'Mfoundi', 3.8480, 11.5021, 8.9, true, 9, 9, 8, '91569092-36c0-4867-8a0e-370ee026e202'),
('Kribi', 'South', 'Ocean', 2.9450, 9.9057, 7.2, true, 7, 6, 7, '91569092-36c0-4867-8a0e-370ee026e202'),
('Maroua', 'Far North', 'Diamare', 10.5906, 14.3197, 6.5, true, 5, 6, 5, '91569092-36c0-4867-8a0e-370ee026e202'),
('Ngaoundéré', 'Adamawa', 'Vina', 7.3167, 13.5833, 7.0, true, 6, 7, 6, '91569092-36c0-4867-8a0e-370ee026e202'),
('Bertoua', 'East', 'Lom-et-Djerem', 4.5774, 13.6848, 6.2, true, 5, 6, 5, '91569092-36c0-4867-8a0e-370ee026e202'),
('Bafoussam', 'West', 'Mifi', 5.4781, 10.4171, 7.8, true, 7, 8, 7, '91569092-36c0-4867-8a0e-370ee026e202');

-- Update latitude and longitude for compatibility with existing interface
UPDATE villages SET latitude = gps_latitude, longitude = gps_longitude WHERE latitude IS NULL;

-- Continue with other seed data only if villages are created successfully
INSERT INTO agriculture_data (region, crop_type, soil_type, land_area_hectares, yield_per_hectare, planting_season, harvest_season, irrigation_method, challenges, opportunities) VALUES
('Southwest', 'Cocoa', 'Volcanic', 150.5, 2.3, 'March-May', 'October-December', 'Rain-fed', '["Pest attacks", "Climate change"]', '["Organic farming", "Value addition"]'),
('Northwest', 'Coffee', 'Highland', 89.2, 1.8, 'April-June', 'November-January', 'Rain-fed', '["Market access", "Processing equipment"]', '["Fair trade certification", "Direct export"]'),
('North', 'Cotton', 'Sandy loam', 234.7, 3.2, 'May-July', 'October-November', 'Irrigation', '["Water scarcity", "Fertilizer costs"]', '["Mechanization", "Cooperative farming"]'),
('Littoral', 'Banana', 'Alluvial', 67.8, 45.6, 'Year-round', 'Year-round', 'Sprinkler', '["Disease management", "Transportation"]', '["Export markets", "Processing facilities"]'),
('Centre', 'Cassava', 'Forest soil', 123.4, 12.5, 'March-April', 'December-February', 'Rain-fed', '["Storage facilities", "Market fluctuation"]', '["Flour production", "Starch extraction"]');