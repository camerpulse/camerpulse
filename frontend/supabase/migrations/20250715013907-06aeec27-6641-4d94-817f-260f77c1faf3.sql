-- Enable cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule autonomous refresh every 3 minutes
SELECT cron.schedule(
    'autonomous-data-refresh',
    '*/3 * * * *', -- Every 3 minutes
    $$
    SELECT
        net.http_post(
            url := 'https://wsiorhtiovwcajiarydw.supabase.co/functions/v1/autonomous-refresh-engine',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaW9yaHRpb3Z3Y2FqaWFyeWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODE3ODAsImV4cCI6MjA2Nzg1Nzc4MH0.4GKFhQTxlEzj6oTcfnAZQpPxPHW0nqGDEfBe-gVGoNE"}'::jsonb,
            body := '{"action": "execute_refresh_cycle"}'::jsonb
        ) as request_id;
    $$
);

-- Create a function to check refresh engine health every hour
SELECT cron.schedule(
    'check-refresh-engine-health',
    '0 * * * *', -- Every hour
    $$
    SELECT
        net.http_post(
            url := 'https://wsiorhtiovwcajiarydw.supabase.co/functions/v1/autonomous-refresh-engine',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaW9yaHRpb3Z3Y2FqaWFyeWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODE3ODAsImV4cCI6MjA2Nzg1Nzc4MH0.4GKFhQTxlEzj6oTcfnAZQpPxPHW0nqGDEfBe-gVGoNE"}'::jsonb,
            body := '{"action": "get_status"}'::jsonb
        ) as request_id;
    $$
);