-- Set up cron job to process escalations every 5 minutes
SELECT cron.schedule(
  'process-workflow-escalations',
  '*/5 * * * *', -- every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://wsiorhtiovwcajiarydw.supabase.co/functions/v1/workflow-processor',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzaW9yaHRpb3Z3Y2FqaWFyeWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODE3ODAsImV4cCI6MjA2Nzg1Nzc4MH0.4GKFhQTxlEzj6oTcfnAZQpPxPHW0nqGDEfBe-gVGoNE"}'::jsonb,
        body:='{"action": "process_escalations"}'::jsonb
    ) as request_id;
  $$
);

-- Insert sample workflows for demonstration
INSERT INTO public.notification_workflows (name, description, trigger_type, trigger_config, conditions, actions, escalation_rules, created_by) VALUES
('High Priority Alert Workflow', 'Escalates high priority notifications to management', 'event', 
 '{"event_type": "notification_sent", "conditions": [{"field": "priority", "operator": "equals", "value": "critical"}]}'::jsonb,
 '[]'::jsonb,
 '[{"type": "send_notification", "channels": ["email", "sms"], "template": "urgent_alert"}]'::jsonb,
 '[
   {"level": 1, "escalated_to": [{"user_id": "manager", "channels": ["email"]}], "timeout_hours": 1},
   {"level": 2, "escalated_to": [{"user_id": "director", "channels": ["email", "sms"]}], "timeout_hours": 2}
 ]'::jsonb,
 (SELECT id FROM auth.users LIMIT 1)),

('User Engagement Workflow', 'Follows up on low engagement notifications', 'event',
 '{"event_type": "notification_sent", "conditions": [{"field": "engagement_score", "operator": "less_than", "value": "30"}]}'::jsonb,
 '[]'::jsonb,
 '[{"type": "send_followup", "channels": ["in_app"], "delay_hours": 24}]'::jsonb,
 '[]'::jsonb,
 (SELECT id FROM auth.users LIMIT 1)),

('System Health Workflow', 'Monitors system performance and alerts on issues', 'schedule',
 '{"schedule": "0 */6 * * *", "check_type": "system_health"}'::jsonb,
 '[{"field": "cpu_usage", "operator": "greater_than", "value": "80"}]'::jsonb,
 '[{"type": "alert_ops", "channels": ["email", "slack"], "urgency": "high"}]'::jsonb,
 '[
   {"level": 1, "escalated_to": [{"user_id": "ops_team", "channels": ["slack"]}], "timeout_hours": 0.5},
   {"level": 2, "escalated_to": [{"user_id": "cto", "channels": ["email", "sms"]}], "timeout_hours": 1}
 ]'::jsonb,
 (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;