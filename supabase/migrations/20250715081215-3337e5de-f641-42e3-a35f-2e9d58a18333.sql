-- Enable realtime for notification tables
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.camerpulse_intelligence_alerts REPLICA IDENTITY FULL;
ALTER TABLE public.poll_responses REPLICA IDENTITY FULL;
ALTER TABLE public.subscribers REPLICA IDENTITY FULL;
ALTER TABLE public.election_disinformation_alerts REPLICA IDENTITY FULL;
ALTER TABLE public.civic_fusion_alerts REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.camerpulse_intelligence_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscribers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.election_disinformation_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.civic_fusion_alerts;