-- Seed data for villages table with all required fields
INSERT INTO villages (village_name, region, division, subdivision, gps_latitude, gps_longitude, overall_rating, is_verified, infrastructure_score, education_score, health_score, created_by) VALUES
('Kumba', 'Southwest', 'Meme', 'Kumba I', 4.6364, 9.4469, 7.5, true, 8, 7, 6, '91569092-36c0-4867-8a0e-370ee026e202'),
('Bamenda', 'Northwest', 'Mezam', 'Bamenda I', 5.9597, 10.1491, 8.2, true, 9, 8, 7, '91569092-36c0-4867-8a0e-370ee026e202'),
('Garoua', 'North', 'Benoue', 'Garoua I', 9.3265, 13.3962, 6.8, true, 6, 7, 5, '91569092-36c0-4867-8a0e-370ee026e202'),
('Douala', 'Littoral', 'Wouri', 'Douala I', 4.0511, 9.7679, 9.1, true, 9, 9, 8, '91569092-36c0-4867-8a0e-370ee026e202'),
('Yaoundé', 'Centre', 'Mfoundi', 'Yaoundé I', 3.8480, 11.5021, 8.9, true, 9, 9, 8, '91569092-36c0-4867-8a0e-370ee026e202'),
('Kribi', 'South', 'Ocean', 'Kribi', 2.9450, 9.9057, 7.2, true, 7, 6, 7, '91569092-36c0-4867-8a0e-370ee026e202'),
('Maroua', 'Far North', 'Diamare', 'Maroua I', 10.5906, 14.3197, 6.5, true, 5, 6, 5, '91569092-36c0-4867-8a0e-370ee026e202'),
('Ngaoundéré', 'Adamawa', 'Vina', 'Ngaoundéré I', 7.3167, 13.5833, 7.0, true, 6, 7, 6, '91569092-36c0-4867-8a0e-370ee026e202'),
('Bertoua', 'East', 'Lom-et-Djerem', 'Bertoua I', 4.5774, 13.6848, 6.2, true, 5, 6, 5, '91569092-36c0-4867-8a0e-370ee026e202'),
('Bafoussam', 'West', 'Mifi', 'Bafoussam I', 5.4781, 10.4171, 7.8, true, 7, 8, 7, '91569092-36c0-4867-8a0e-370ee026e202');

-- Update latitude and longitude for compatibility
UPDATE villages SET latitude = gps_latitude, longitude = gps_longitude WHERE latitude IS NULL;