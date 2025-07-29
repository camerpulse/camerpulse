-- Insert default rating criteria for each institution type
INSERT INTO public.rating_criteria (institution_type, criteria_name, criteria_description, weight, display_order) VALUES
-- Schools criteria
('school', 'teaching_quality', 'Quality of teaching and instruction', 1.5, 1),
('school', 'discipline', 'School discipline and student behavior', 1.0, 2),
('school', 'infrastructure', 'Buildings, classrooms, and facilities', 1.2, 3),
('school', 'exam_pass_rate', 'Academic performance and exam results', 1.3, 4),

-- Hospitals criteria
('hospital', 'cleanliness', 'Hygiene and cleanliness of facilities', 1.4, 1),
('hospital', 'staff_speed', 'Speed and efficiency of medical staff', 1.2, 2),
('hospital', 'emergency_response', 'Emergency care and response time', 1.5, 3),
('hospital', 'doctor_attitude', 'Professionalism and bedside manner', 1.3, 4),

-- Pharmacies criteria
('pharmacy', 'medicine_availability', 'Availability of required medications', 1.5, 1),
('pharmacy', 'service_speed', 'Speed of service and prescription filling', 1.1, 2),
('pharmacy', 'pricing', 'Fair and competitive pricing', 1.3, 3),
('pharmacy', 'authenticity', 'Quality and authenticity of medications', 1.4, 4),

-- Villages criteria
('village', 'development_projects', 'Community development and infrastructure projects', 1.3, 1),
('village', 'unity', 'Community unity and social cohesion', 1.2, 2),
('village', 'education_support', 'Support for education and youth development', 1.4, 3),
('village', 'conflict_resolution', 'Effectiveness in resolving disputes', 1.1, 4)
ON CONFLICT (institution_type, criteria_name) DO NOTHING;