-- Create ashen_behavior_tests table for storing UX behavior test results
CREATE TABLE public.ashen_behavior_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL, -- 'user_flow', 'navigation', 'form_interaction', 'viewport_test'
  route_tested TEXT NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'desktop', -- 'desktop', 'mobile', 'tablet'
  test_result TEXT NOT NULL, -- 'passed', 'failed', 'warning'
  issues_found JSONB DEFAULT '[]',
  performance_metrics JSONB DEFAULT '{}',
  screenshot_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ashen_behavior_tests ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage behavior tests
CREATE POLICY "Admins can manage behavior tests" 
ON public.ashen_behavior_tests 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create indexes for performance
CREATE INDEX idx_ashen_behavior_tests_route ON public.ashen_behavior_tests(route_tested);
CREATE INDEX idx_ashen_behavior_tests_device ON public.ashen_behavior_tests(device_type);
CREATE INDEX idx_ashen_behavior_tests_result ON public.ashen_behavior_tests(test_result);
CREATE INDEX idx_ashen_behavior_tests_created_at ON public.ashen_behavior_tests(created_at DESC);