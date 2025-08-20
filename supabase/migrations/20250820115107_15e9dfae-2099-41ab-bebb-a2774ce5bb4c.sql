-- Phase 6: Advanced Security & Permission System (Use existing enum values)

-- Create security audit logs table (if not exists)
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action_type VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id UUID
);

-- Enable RLS on security_audit_logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create permissions table (if not exists)
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource_type VARCHAR(100),
    action VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role_permissions table (if not exists)
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role app_role NOT NULL,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (role, permission_id)
);

-- Create rate limiting table (if not exists)
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier_type VARCHAR(50) NOT NULL,
    identifier_value VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (identifier_type, identifier_value, action_type, window_start)
);

-- Insert default permissions (safe with ON CONFLICT)
INSERT INTO public.permissions (name, description, resource_type, action) VALUES
('admin.users.read', 'View user information', 'users', 'read'),
('admin.users.write', 'Modify user information', 'users', 'write'),
('admin.users.delete', 'Delete users', 'users', 'delete'),
('admin.content.moderate', 'Moderate content', 'content', 'moderate'),
('admin.content.delete', 'Delete any content', 'content', 'delete'),
('admin.analytics.view', 'View analytics dashboard', 'analytics', 'read'),
('admin.settings.write', 'Modify system settings', 'settings', 'write'),
('moderator.content.flag', 'Flag content for review', 'content', 'flag'),
('moderator.content.hide', 'Hide inappropriate content', 'content', 'hide'),
('moderator.users.warn', 'Issue warnings to users', 'users', 'warn'),
('user.content.create', 'Create content', 'content', 'create'),
('user.content.edit', 'Edit own content', 'content', 'edit'),
('user.profile.edit', 'Edit own profile', 'profile', 'edit')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles using existing enum values
INSERT INTO public.role_permissions (role, permission_id) 
SELECT 'admin'::app_role, id FROM public.permissions
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id) 
SELECT 'moderator'::app_role, id FROM public.permissions 
WHERE name LIKE 'moderator.%' OR name LIKE 'user.%'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id) 
SELECT 'user'::app_role, id FROM public.permissions 
WHERE name LIKE 'user.%'
ON CONFLICT DO NOTHING;

-- Create function to check user permissions (replace if exists)
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission_name VARCHAR)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = _user_id
      AND p.name = _permission_name
  )
$$;

-- Create enhanced rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit_enhanced(
    _identifier_type VARCHAR(50),
    _identifier_value VARCHAR(255), 
    _action_type VARCHAR(100),
    _limit_per_hour INTEGER DEFAULT 100
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_count INTEGER;
    window_start TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate current hour window
    window_start := DATE_TRUNC('hour', NOW());
    
    -- Get current count for this hour
    SELECT COALESCE(SUM(request_count), 0) INTO current_count
    FROM public.rate_limits
    WHERE identifier_type = _identifier_type
      AND identifier_value = _identifier_value
      AND action_type = _action_type
      AND window_start >= window_start;
    
    -- Check if limit exceeded
    IF current_count >= _limit_per_hour THEN
        RETURN FALSE;
    END IF;
    
    -- Update request count
    INSERT INTO public.rate_limits (
        identifier_type, identifier_value, action_type, 
        request_count, window_start
    ) VALUES (
        _identifier_type, _identifier_value, _action_type, 
        1, window_start
    )
    ON CONFLICT (identifier_type, identifier_value, action_type, window_start)
    DO UPDATE SET request_count = rate_limits.request_count + 1;
    
    RETURN TRUE;
END;
$$;