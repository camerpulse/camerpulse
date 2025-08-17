-- Update the nokash configuration with the provided app space key
UPDATE public.nokash_payment_config 
SET 
  app_space_key = 'HBBEo/ehyhDndnlErAC4tw1A0S0HWTeupHXzYp4Ay/SZGZXIg1uJkKxhnmA9zICOLrV3o4JyGrQ1XmyrZQVJGyXA/uiy4z3Hf0ronyRQ8RjGrMlAob1RRoxbofhMddyNWui9ShXHGuI1yqLv4SbCng',
  is_active = true,
  supported_networks = ARRAY['MTN', 'ORANGE'],
  default_network = 'MTN',
  updated_at = now()
WHERE id = (SELECT id FROM public.nokash_payment_config LIMIT 1);

-- If no config exists, insert it
INSERT INTO public.nokash_payment_config (
  app_space_key,
  is_active,
  supported_networks,
  default_network
) 
SELECT 
  'HBBEo/ehyhDndnlErAC4tw1A0S0HWTeupHXzYp4Ay/SZGZXIg1uJkKxhnmA9zICOLrV3o4JyGrQ1XmyrZQVJGyXA/uiy4z3Hf0ronyRQ8RjGrMlAob1RRoxbofhMddyNWui9ShXHGuI1yqLv4SbCng',
  true,
  ARRAY['MTN', 'ORANGE'],
  'MTN'
WHERE NOT EXISTS (SELECT 1 FROM public.nokash_payment_config);