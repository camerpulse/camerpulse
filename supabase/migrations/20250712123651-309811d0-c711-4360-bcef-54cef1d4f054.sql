-- Grant admin role to user with username 'campulse' or '@campulse'
INSERT INTO public.user_roles (user_id, role, granted_by)
SELECT 
  p.user_id, 
  'admin'::app_role,
  p.user_id -- self-granted for now
FROM public.profiles p 
WHERE p.username IN ('campulse', '@campulse')
ON CONFLICT (user_id, role) DO NOTHING;