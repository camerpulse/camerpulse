-- Insert sample budget data for testing
INSERT INTO public.budget_allocations (
  project_name,
  ministry_department,
  sector,
  region,
  budget_year,
  allocated_amount,
  spent_amount,
  execution_percentage,
  transparency_score,
  status,
  project_description,
  beneficiaries_target,
  beneficiaries_reached
) VALUES 
-- Health Sector Projects
('National Hospital Modernization', 'MINSANTE', 'Health', 'Centre', 2024, 15000000000, 8500000000, 56.7, 78, 'executing', 'Modernization of national hospitals with new equipment and infrastructure', 50000, 28000),
('Rural Health Centers Construction', 'MINSANTE', 'Health', 'Northwest', 2024, 8000000000, 7200000000, 90.0, 85, 'completed', 'Construction of health centers in rural communities', 100000, 95000),
('Medical Equipment Procurement', 'MINSANTE', 'Health', 'Southwest', 2024, 12000000000, 3600000000, 30.0, 45, 'executing', 'Procurement of medical equipment for regional hospitals', 200000, 60000),
-- Education Sector Projects  
('Secondary School Infrastructure', 'MINEDUB', 'Education', 'West', 2024, 20000000000, 18000000000, 90.0, 92, 'completed', 'Construction and renovation of secondary schools', 150000, 142000),
('University Expansion Program', 'MINESUP', 'Education', 'Littoral', 2024, 35000000000, 14000000000, 40.0, 68, 'executing', 'Expansion of university facilities and research centers', 80000, 32000),
('Digital Learning Initiative', 'MINEDUB', 'Education', 'East', 2024, 6000000000, 1800000000, 30.0, 55, 'executing', 'Implementation of digital learning systems in schools', 300000, 90000),
-- Infrastructure Projects
('Douala Port Expansion', 'MINTRANS', 'Infrastructure', 'Littoral', 2024, 85000000000, 51000000000, 60.0, 72, 'executing', 'Expansion of Douala port facilities', 2000000, 1200000),
('Rural Road Network', 'MINTP', 'Infrastructure', 'North', 2024, 45000000000, 40500000000, 90.0, 88, 'completed', 'Construction of rural road networks', 500000, 475000),
('Bridge Construction Program', 'MINTP', 'Infrastructure', 'South', 2024, 28000000000, 8400000000, 30.0, 38, 'executing', 'Construction of bridges across major rivers', 100000, 30000),
-- Agriculture Projects
('Irrigation Systems Development', 'MINADER', 'Agriculture', 'Far North', 2024, 18000000000, 16200000000, 90.0, 82, 'completed', 'Development of modern irrigation systems', 200000, 190000),
('Agricultural Extension Services', 'MINADER', 'Agriculture', 'Adamawa', 2024, 9000000000, 4500000000, 50.0, 65, 'executing', 'Extension of agricultural support services', 150000, 75000),
('Livestock Development Program', 'MINEPIA', 'Agriculture', 'Northwest', 2024, 12000000000, 3600000000, 30.0, 48, 'executing', 'Development of livestock farming capabilities', 80000, 24000),
-- Security Projects
('Border Security Enhancement', 'MINDEF', 'Security', 'Far North', 2024, 25000000000, 20000000000, 80.0, 35, 'executing', 'Enhancement of border security infrastructure', 50000, 40000),
('Police Equipment Modernization', 'MINDEL', 'Security', 'Centre', 2024, 15000000000, 12000000000, 80.0, 42, 'executing', 'Modernization of police equipment and facilities', 30000, 24000),
-- Administration Projects
('Digital Government Platform', 'MINFI', 'Administration', 'Centre', 2024, 22000000000, 6600000000, 30.0, 58, 'executing', 'Implementation of digital government services', 10000000, 3000000),
('Civil Service Training', 'MINFOPRA', 'Administration', 'West', 2024, 8000000000, 7200000000, 90.0, 78, 'completed', 'Training programs for civil servants', 25000, 22500);