-- Drop existing function
DROP FUNCTION IF EXISTS get_legislation_statistics();

-- Enable realtime for legislation tables
ALTER TABLE public.legislation_registry REPLICA IDENTITY FULL;
ALTER TABLE public.citizen_bill_engagement REPLICA IDENTITY FULL;
ALTER TABLE public.bill_comments REPLICA IDENTITY FULL;
ALTER TABLE public.bill_followers REPLICA IDENTITY FULL;
ALTER TABLE public.mp_votes REPLICA IDENTITY FULL;

-- Add tables to realtime publication (skip if already exists)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.legislation_registry;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.citizen_bill_engagement;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bill_comments;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bill_followers;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mp_votes;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

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