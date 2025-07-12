-- Create security logging table
CREATE TABLE public.security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'login_success', 'login_failed', 'logout', 'password_change', 
    '2fa_enabled', '2fa_disabled', '2fa_success', '2fa_failed',
    'device_registered', 'device_removed', 'suspicious_activity',
    'pgp_key_generated', 'pgp_message_encrypted', 'data_breach_attempt'
  )),
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  metadata JSONB,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create 2FA settings table
CREATE TABLE public.user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  totp_secret TEXT,
  backup_codes TEXT[],
  phone_number TEXT,
  is_totp_enabled BOOLEAN DEFAULT false,
  is_sms_enabled BOOLEAN DEFAULT false,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user devices table for device management
CREATE TABLE public.user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_name TEXT NOT NULL,
  device_fingerprint TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  is_trusted BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create PGP keys table
CREATE TABLE public.user_pgp_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  key_name TEXT NOT NULL,
  public_key TEXT NOT NULL,
  private_key_encrypted TEXT NOT NULL,
  key_fingerprint TEXT UNIQUE NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create encrypted messages table
CREATE TABLE public.encrypted_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  encrypted_content TEXT NOT NULL,
  encryption_method TEXT DEFAULT 'pgp' CHECK (encryption_method IN ('pgp', 'aes')),
  signature_verified BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create password policy table
CREATE TABLE public.password_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  min_length INTEGER DEFAULT 12,
  require_uppercase BOOLEAN DEFAULT true,
  require_lowercase BOOLEAN DEFAULT true,
  require_numbers BOOLEAN DEFAULT true,
  require_symbols BOOLEAN DEFAULT true,
  max_age_days INTEGER DEFAULT 90,
  prevent_reuse_count INTEGER DEFAULT 5,
  max_failed_attempts INTEGER DEFAULT 5,
  lockout_duration_minutes INTEGER DEFAULT 30,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create failed login attempts table
CREATE TABLE public.failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  attempt_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reason TEXT
);

-- Enable RLS on new security tables
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_2fa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pgp_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encrypted_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Security logs policies
CREATE POLICY "Admins can view all security logs" ON public.security_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can view their own security logs" ON public.security_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert security logs" ON public.security_logs FOR INSERT WITH CHECK (true);

-- 2FA policies
CREATE POLICY "Users can manage their own 2FA" ON public.user_2fa FOR ALL USING (auth.uid() = user_id);

-- Device management policies
CREATE POLICY "Users can view their own devices" ON public.user_devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own devices" ON public.user_devices FOR ALL USING (auth.uid() = user_id);

-- PGP keys policies
CREATE POLICY "Users can view public keys" ON public.user_pgp_keys FOR SELECT USING (true);
CREATE POLICY "Users can manage their own PGP keys" ON public.user_pgp_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own PGP keys" ON public.user_pgp_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own PGP keys" ON public.user_pgp_keys FOR DELETE USING (auth.uid() = user_id);

-- Encrypted messages policies
CREATE POLICY "Users can view their encrypted messages" ON public.encrypted_messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "Users can send encrypted messages" ON public.encrypted_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Password policies (admin only)
CREATE POLICY "Admins can manage password policies" ON public.password_policies FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Everyone can view password policies" ON public.password_policies FOR SELECT USING (true);

-- Failed login attempts (admin only)
CREATE POLICY "Admins can view failed login attempts" ON public.failed_login_attempts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create security functions
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_severity TEXT DEFAULT 'info'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_logs (user_id, event_type, ip_address, user_agent, metadata, severity)
  VALUES (p_user_id, p_event_type, p_ip_address, p_user_agent, p_metadata, p_severity)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Function to check password strength
CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  policy RECORD;
  result JSONB := '{"valid": true, "errors": []}'::JSONB;
  errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Get current password policy
  SELECT * INTO policy FROM public.password_policies ORDER BY updated_at DESC LIMIT 1;
  
  -- Check minimum length
  IF LENGTH(password) < policy.min_length THEN
    errors := array_append(errors, 'Password must be at least ' || policy.min_length || ' characters long');
  END IF;
  
  -- Check uppercase requirement
  IF policy.require_uppercase AND password !~ '[A-Z]' THEN
    errors := array_append(errors, 'Password must contain at least one uppercase letter');
  END IF;
  
  -- Check lowercase requirement
  IF policy.require_lowercase AND password !~ '[a-z]' THEN
    errors := array_append(errors, 'Password must contain at least one lowercase letter');
  END IF;
  
  -- Check numbers requirement
  IF policy.require_numbers AND password !~ '[0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one number');
  END IF;
  
  -- Check symbols requirement
  IF policy.require_symbols AND password !~ '[^A-Za-z0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one special character');
  END IF;
  
  -- Build result
  IF array_length(errors, 1) > 0 THEN
    result := jsonb_build_object('valid', false, 'errors', to_jsonb(errors));
  END IF;
  
  RETURN result;
END;
$$;

-- Function to register device
CREATE OR REPLACE FUNCTION public.register_user_device(
  p_device_name TEXT,
  p_device_fingerprint TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  device_id UUID;
BEGIN
  -- Insert or update device
  INSERT INTO public.user_devices (user_id, device_name, device_fingerprint, ip_address, user_agent)
  VALUES (auth.uid(), p_device_name, p_device_fingerprint, p_ip_address, p_user_agent)
  ON CONFLICT (device_fingerprint) 
  DO UPDATE SET 
    last_seen_at = now(),
    ip_address = EXCLUDED.ip_address,
    user_agent = EXCLUDED.user_agent
  RETURNING id INTO device_id;
  
  -- Log security event
  PERFORM public.log_security_event(
    auth.uid(), 
    'device_registered', 
    p_ip_address, 
    p_user_agent,
    jsonb_build_object('device_fingerprint', p_device_fingerprint)
  );
  
  RETURN device_id;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_user_2fa_updated_at BEFORE UPDATE ON public.user_2fa FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default password policy
INSERT INTO public.password_policies DEFAULT VALUES;