-- Enable realtime for legislation tables
ALTER TABLE public.legislation_registry REPLICA IDENTITY FULL;
ALTER TABLE public.citizen_bill_engagement REPLICA IDENTITY FULL;
ALTER TABLE public.bill_comments REPLICA IDENTITY FULL;
ALTER TABLE public.bill_followers REPLICA IDENTITY FULL;
ALTER TABLE public.mp_votes REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.legislation_registry;
ALTER PUBLICATION supabase_realtime ADD TABLE public.citizen_bill_engagement;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bill_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bill_followers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mp_votes;

-- Create function to get legislation statistics
CREATE OR REPLACE FUNCTION get_legislation_statistics()
RETURNS TABLE(
  total_bills INTEGER,
  active_bills INTEGER,
  passed_bills INTEGER,
  rejected_bills INTEGER,
  total_citizen_votes INTEGER,
  avg_citizen_engagement NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM legislation_registry) as total_bills,
    (SELECT COUNT(*)::INTEGER FROM legislation_registry WHERE status IN ('draft', 'in_committee', 'first_reading', 'second_reading', 'third_reading', 'voted')) as active_bills,
    (SELECT COUNT(*)::INTEGER FROM legislation_registry WHERE status = 'passed') as passed_bills,
    (SELECT COUNT(*)::INTEGER FROM legislation_registry WHERE status = 'rejected') as rejected_bills,
    (SELECT COUNT(*)::INTEGER FROM citizen_bill_engagement) as total_citizen_votes,
    (SELECT COALESCE(AVG(citizen_upvotes + citizen_downvotes), 0) FROM legislation_registry) as avg_citizen_engagement;
END;
$$;