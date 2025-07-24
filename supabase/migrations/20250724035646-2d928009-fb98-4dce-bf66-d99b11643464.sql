-- Complete CamerTenders cleanup - Update supabase config to remove tender notification function
UPDATE supabase.config 
SET value = value::jsonb - 'send-tender-notifications'
WHERE name = 'functions';