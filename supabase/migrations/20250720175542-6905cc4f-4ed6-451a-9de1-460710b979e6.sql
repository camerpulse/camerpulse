-- Insert sample budget data with transparency scores between 1-10
INSERT INTO public.budget_allocations (
  project_name,
  ministry_department,
  sector,
  region,
  budget_year,
  allocated_amount,
  spent_amount,
  transparency_score,
  status,
  beneficiaries_target,
  beneficiaries_reached
) VALUES 
-- Health Sector Projects  
('National Hospital Modernization', 'MINSANTE', 'Health', 'Centre', 2024, 15000000000, 8500000000, 8, 'executing', 50000, 28000),
('Rural Health Centers', 'MINSANTE', 'Health', 'Northwest', 2024, 8000000000, 7200000000, 9, 'completed', 100000, 95000),
('Medical Equipment', 'MINSANTE', 'Health', 'Southwest', 2024, 12000000000, 3600000000, 4, 'executing', 200000, 60000),
-- Education Sector Projects  
('School Infrastructure', 'MINEDUB', 'Education', 'West', 2024, 20000000000, 18000000000, 9, 'completed', 150000, 142000),
('University Expansion', 'MINESUP', 'Education', 'Littoral', 2024, 35000000000, 14000000000, 7, 'executing', 80000, 32000),
('Digital Learning', 'MINEDUB', 'Education', 'East', 2024, 6000000000, 1800000000, 5, 'executing', 300000, 90000),
-- Infrastructure Projects
('Port Expansion', 'MINTRANS', 'Infrastructure', 'Littoral', 2024, 85000000000, 51000000000, 7, 'executing', 2000000, 1200000),
('Rural Roads', 'MINTP', 'Infrastructure', 'North', 2024, 45000000000, 40500000000, 9, 'completed', 500000, 475000),
('Bridge Construction', 'MINTP', 'Infrastructure', 'South', 2024, 28000000000, 8400000000, 3, 'executing', 100000, 30000),
-- Agriculture Projects
('Irrigation Systems', 'MINADER', 'Agriculture', 'Far North', 2024, 18000000000, 16200000000, 8, 'completed', 200000, 190000),
('Extension Services', 'MINADER', 'Agriculture', 'Adamawa', 2024, 9000000000, 4500000000, 6, 'executing', 150000, 75000),
('Livestock Development', 'MINEPIA', 'Agriculture', 'Northwest', 2024, 12000000000, 3600000000, 5, 'executing', 80000, 24000),
-- Security Projects
('Border Security Enhancement', 'MINDEF', 'Security', 'Far North', 2024, 25000000000, 20000000000, 3, 'executing', 50000, 40000),
('Police Equipment Modernization', 'MINDEL', 'Security', 'Centre', 2024, 15000000000, 12000000000, 4, 'executing', 30000, 24000),
-- Administration Projects
('Digital Government Platform', 'MINFI', 'Administration', 'Centre', 2024, 22000000000, 6600000000, 6, 'executing', 10000000, 3000000),
('Civil Service Training', 'MINFOPRA', 'Administration', 'West', 2024, 8000000000, 7200000000, 8, 'completed', 25000, 22500);