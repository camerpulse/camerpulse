-- Phase 6: Advanced Security & Permission System

-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'verified_user', 'super_admin');

-- Create user_roles table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (expires_at IS NULL OR expires_at > NOW())
  )
$$;

-- Create function to check if user has any of multiple roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles app_role[])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
      AND (expires_at IS NULL OR expires_at > NOW())
  )
$$;

-- Create function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 5
      WHEN 'admin' THEN 4
      WHEN 'moderator' THEN 3
      WHEN 'verified_user' THEN 2
      WHEN 'user' THEN 1
    END DESC
  LIMIT 1
$$;

-- Create security audit logs table
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

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource_type VARCHAR(100),
    action VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role_permissions table
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role app_role NOT NULL,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (role, permission_id)
);

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier_type VARCHAR(50) NOT NULL, -- 'user_id', 'ip_address', 'api_key'
    identifier_value VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (identifier_type, identifier_value, action_type, window_start)
);

-- Insert default permissions
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

-- Assign permissions to roles
INSERT INTO public.role_permissions (role, permission_id) 
SELECT 'super_admin', id FROM public.permissions
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id) 
SELECT 'admin', id FROM public.permissions 
WHERE name LIKE 'admin.%' OR name LIKE 'moderator.%' OR name LIKE 'user.%'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id) 
SELECT 'moderator', id FROM public.permissions 
WHERE name LIKE 'moderator.%' OR name LIKE 'user.%'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id) 
SELECT 'verified_user', id FROM public.permissions 
WHERE name LIKE 'user.%'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission_id) 
SELECT 'user', id FROM public.permissions 
WHERE name LIKE 'user.%'
ON CONFLICT DO NOTHING;

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'super_admin']));

CREATE POLICY "Admins can manage user roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'super_admin']))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'super_admin']));

-- Create RLS policies for security_audit_logs
CREATE POLICY "Admins can view audit logs" ON public.security_audit_logs
FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'super_admin']));

CREATE POLICY "System can insert audit logs" ON public.security_audit_logs
FOR INSERT TO authenticated
WITH CHECK (true);

-- Create function to check user permissions
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
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
  )
$$;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at
BEFORE UPDATE ON public.rate_limits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();