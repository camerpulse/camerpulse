-- Enable RLS on new tables
ALTER TABLE public.party_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.politician_claims ENABLE ROW LEVEL SECURITY;

-- RLS policies for party claims
CREATE POLICY "Users can view their own party claims" ON public.party_claims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create party claims" ON public.party_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all party claims" ON public.party_claims
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

-- RLS policies for politician claims
CREATE POLICY "Users can view their own politician claims" ON public.politician_claims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create politician claims" ON public.politician_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all politician claims" ON public.politician_claims
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'::app_role)
  );

-- Add updated_at triggers for new tables
CREATE TRIGGER update_party_claims_updated_at
  BEFORE UPDATE ON public.party_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_politician_claims_updated_at
  BEFORE UPDATE ON public.politician_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();