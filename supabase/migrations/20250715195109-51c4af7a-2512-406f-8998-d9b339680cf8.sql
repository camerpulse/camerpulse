-- Create simulation tests table
CREATE TABLE public.ashen_simulation_tests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    test_name TEXT NOT NULL,
    test_type TEXT NOT NULL DEFAULT 'full_flow', -- 'full_flow', 'single_action', 'edge_case'
    device_type TEXT NOT NULL DEFAULT 'desktop', -- 'mobile', 'tablet', 'desktop'
    device_model TEXT,
    browser TEXT DEFAULT 'chrome',
    test_paths JSONB DEFAULT '[]'::JSONB,
    simulation_config JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    auto_run BOOLEAN DEFAULT false,
    run_frequency TEXT DEFAULT 'manual' -- 'manual', 'daily', 'weekly', 'on_deploy'
);

-- Create simulation results table
CREATE TABLE public.ashen_simulation_results (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID NOT NULL REFERENCES public.ashen_simulation_tests(id),
    execution_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    device_type TEXT NOT NULL,
    device_model TEXT,
    browser TEXT,
    test_duration_ms INTEGER,
    ux_score INTEGER DEFAULT 0, -- 0-100
    status TEXT NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed', 'cancelled'
    errors_found INTEGER DEFAULT 0,
    warnings_found INTEGER DEFAULT 0,
    performance_metrics JSONB DEFAULT '{}'::JSONB,
    results_summary JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create simulation replay logs table
CREATE TABLE public.ashen_simulation_replay_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    result_id UUID NOT NULL REFERENCES public.ashen_simulation_results(id),
    step_number INTEGER NOT NULL,
    action_type TEXT NOT NULL, -- 'click', 'scroll', 'type', 'navigate', 'wait'
    target_element TEXT,
    coordinates JSONB, -- {x: number, y: number}
    timestamp_ms INTEGER NOT NULL,
    screenshot_url TEXT,
    error_message TEXT,
    action_data JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create simulation device configs table
CREATE TABLE public.ashen_simulation_device_configs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    device_name TEXT NOT NULL,
    device_type TEXT NOT NULL, -- 'mobile', 'tablet', 'desktop'
    viewport_width INTEGER NOT NULL,
    viewport_height INTEGER NOT NULL,
    user_agent TEXT NOT NULL,
    touch_enabled BOOLEAN DEFAULT false,
    network_conditions JSONB DEFAULT '{}'::JSONB, -- {speed: 'fast'|'slow', latency: number}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create simulation test paths table
CREATE TABLE public.ashen_simulation_test_paths (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    path_name TEXT NOT NULL,
    path_description TEXT,
    steps JSONB NOT NULL DEFAULT '[]'::JSONB,
    expected_outcomes JSONB DEFAULT '[]'::JSONB,
    is_critical BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ashen_simulation_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_simulation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_simulation_replay_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_simulation_device_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ashen_simulation_test_paths ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage simulation tests" ON public.ashen_simulation_tests
    FOR ALL USING (EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'::app_role
    ));

CREATE POLICY "Admins can manage simulation results" ON public.ashen_simulation_results
    FOR ALL USING (EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'::app_role
    ));

CREATE POLICY "Admins can manage simulation replay logs" ON public.ashen_simulation_replay_logs
    FOR ALL USING (EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'::app_role
    ));

CREATE POLICY "Admins can manage simulation device configs" ON public.ashen_simulation_device_configs
    FOR ALL USING (EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'::app_role
    ));

CREATE POLICY "Admins can manage simulation test paths" ON public.ashen_simulation_test_paths
    FOR ALL USING (EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'::app_role
    ));

-- Create triggers for updated_at
CREATE TRIGGER update_ashen_simulation_tests_updated_at
    BEFORE UPDATE ON public.ashen_simulation_tests
    FOR EACH ROW EXECUTE FUNCTION public.update_ashen_timestamp();

CREATE TRIGGER update_ashen_simulation_device_configs_updated_at
    BEFORE UPDATE ON public.ashen_simulation_device_configs
    FOR EACH ROW EXECUTE FUNCTION public.update_ashen_timestamp();

CREATE TRIGGER update_ashen_simulation_test_paths_updated_at
    BEFORE UPDATE ON public.ashen_simulation_test_paths
    FOR EACH ROW EXECUTE FUNCTION public.update_ashen_timestamp();

-- Insert default device configurations
INSERT INTO public.ashen_simulation_device_configs (device_name, device_type, viewport_width, viewport_height, user_agent, touch_enabled, network_conditions) VALUES
('iPhone X', 'mobile', 375, 812, 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1', true, '{"speed": "fast", "latency": 50}'),
('Galaxy S21', 'mobile', 360, 800, 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36', true, '{"speed": "fast", "latency": 50}'),
('iPad Pro', 'tablet', 1024, 1366, 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1', true, '{"speed": "fast", "latency": 30}'),
('Desktop Chrome', 'desktop', 1920, 1080, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', false, '{"speed": "fast", "latency": 20}'),
('Desktop Firefox', 'desktop', 1920, 1080, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0', false, '{"speed": "fast", "latency": 20}'),
('Desktop Safari', 'desktop', 1440, 900, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15', false, '{"speed": "fast", "latency": 25}');

-- Insert default test paths
INSERT INTO public.ashen_simulation_test_paths (path_name, path_description, steps, expected_outcomes, is_critical) VALUES
('User Registration Flow', 'Complete user signup and verification process', 
 '[
   {"action": "navigate", "target": "/auth", "description": "Go to auth page"},
   {"action": "click", "target": "[data-testid=\"signup-tab\"]", "description": "Click signup tab"},
   {"action": "type", "target": "input[name=\"email\"]", "text": "test@example.com", "description": "Enter email"},
   {"action": "type", "target": "input[name=\"password\"]", "text": "TestPassword123!", "description": "Enter password"},
   {"action": "click", "target": "button[type=\"submit\"]", "description": "Submit form"},
   {"action": "wait", "duration": 2000, "description": "Wait for response"}
 ]'::JSONB,
 '[
   {"step": 3, "expectation": "Email input accepts text"},
   {"step": 4, "expectation": "Password input accepts text"},
   {"step": 5, "expectation": "Form submits successfully"}
 ]'::JSONB,
 true),
('Politician Search and Rating', 'Search for politician and leave rating', 
 '[
   {"action": "navigate", "target": "/politicians", "description": "Go to politicians page"},
   {"action": "type", "target": "input[type=\"search\"]", "text": "Paul Biya", "description": "Search for politician"},
   {"action": "wait", "duration": 1000, "description": "Wait for search results"},
   {"action": "click", "target": "[data-testid=\"politician-card\"]:first-child", "description": "Click first result"},
   {"action": "wait", "duration": 500, "description": "Wait for page load"},
   {"action": "click", "target": "[data-testid=\"rate-button\"]", "description": "Click rate button"}
 ]'::JSONB,
 '[
   {"step": 2, "expectation": "Search input accepts text"},
   {"step": 4, "expectation": "Politician card is clickable"},
   {"step": 6, "expectation": "Rating modal opens"}
 ]'::JSONB,
 true),
('Mobile Navigation Test', 'Test mobile navigation functionality', 
 '[
   {"action": "navigate", "target": "/", "description": "Go to homepage"},
   {"action": "click", "target": "[data-testid=\"mobile-menu-button\"]", "description": "Open mobile menu"},
   {"action": "wait", "duration": 300, "description": "Wait for menu animation"},
   {"action": "click", "target": "[href=\"/news\"]", "description": "Click news link"},
   {"action": "wait", "duration": 1000, "description": "Wait for page load"}
 ]'::JSONB,
 '[
   {"step": 2, "expectation": "Mobile menu opens"},
   {"step": 4, "expectation": "Navigation works correctly"},
   {"step": 5, "expectation": "News page loads"}
 ]'::JSONB,
 true);

-- Create function to run simulation
CREATE OR REPLACE FUNCTION public.run_ashen_simulation(
    p_test_id UUID DEFAULT NULL,
    p_device_type TEXT DEFAULT 'desktop',
    p_device_model TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_id UUID;
    test_record RECORD;
BEGIN
    -- Get test configuration
    IF p_test_id IS NOT NULL THEN
        SELECT * INTO test_record FROM public.ashen_simulation_tests WHERE id = p_test_id;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Test not found: %', p_test_id;
        END IF;
    ELSE
        -- Create default test
        INSERT INTO public.ashen_simulation_tests (test_name, device_type, device_model)
        VALUES ('Quick Simulation', p_device_type, p_device_model)
        RETURNING * INTO test_record;
    END IF;
    
    -- Create simulation result
    INSERT INTO public.ashen_simulation_results (
        test_id,
        device_type,
        device_model,
        browser,
        status
    ) VALUES (
        test_record.id,
        COALESCE(p_device_type, test_record.device_type),
        COALESCE(p_device_model, test_record.device_model),
        'chrome',
        'running'
    ) RETURNING id INTO result_id;
    
    RETURN result_id;
END;
$$;