-- Create a new logistics tenant for Cemac Track
INSERT INTO public.logistics_tenants (
  name,
  domain,
  contact_email,
  is_active,
  settings
) VALUES (
  'Cemac Track',
  'cemactrack.com',
  'cemactrack@gmail.com',
  true,
  '{"owner_user_id": "d435cdbe-b47c-4038-9b7b-83773324e80c", "created_by": "admin"}'::jsonb
);