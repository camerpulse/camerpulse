-- Seed weather data with correct column names
INSERT INTO weather_data (region, village_id, date, temperature_celsius, humidity_percentage, rainfall_mm, wind_speed_kmh, weather_condition) VALUES
('Southwest', (SELECT id FROM villages WHERE village_name = 'Kumba' LIMIT 1), '2025-01-27', 28.5, 78, 12.3, 8.2, 'Partly Cloudy'),
('Northwest', (SELECT id FROM villages WHERE village_name = 'Bamenda' LIMIT 1), '2025-01-27', 22.1, 65, 0.0, 12.5, 'Sunny'),
('North', (SELECT id FROM villages WHERE village_name = 'Garoua' LIMIT 1), '2025-01-27', 35.2, 45, 0.0, 15.8, 'Hot and Dry'),
('Littoral', (SELECT id FROM villages WHERE village_name = 'Douala' LIMIT 1), '2025-01-27', 29.8, 82, 5.7, 6.3, 'Cloudy'),
('Centre', (SELECT id FROM villages WHERE village_name = 'Yaoundé' LIMIT 1), '2025-01-27', 26.4, 72, 8.1, 9.7, 'Light Rain'),
('South', (SELECT id FROM villages WHERE village_name = 'Kribi' LIMIT 1), '2025-01-27', 27.3, 85, 15.2, 7.1, 'Heavy Rain'),
('Far North', (SELECT id FROM villages WHERE village_name = 'Maroua' LIMIT 1), '2025-01-27', 38.1, 35, 0.0, 18.5, 'Very Hot'),
('Adamawa', (SELECT id FROM villages WHERE village_name = 'Ngaoundéré' LIMIT 1), '2025-01-27', 24.8, 60, 3.2, 11.3, 'Partly Sunny'),
('East', (SELECT id FROM villages WHERE village_name = 'Bertoua' LIMIT 1), '2025-01-27', 26.7, 75, 8.5, 9.1, 'Overcast'),
('West', (SELECT id FROM villages WHERE village_name = 'Bafoussam' LIMIT 1), '2025-01-27', 21.4, 68, 2.1, 13.7, 'Cool and Windy');