-- Multi-tenant Architecture & Advanced Features for CamerLogistics

-- Company tenants and white-label configurations
CREATE TABLE public.company_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.shipping_companies(id) ON DELETE CASCADE,
  tenant_slug TEXT UNIQUE NOT NULL,
  custom_domain TEXT,
  is_white_label BOOLEAN DEFAULT false,
  branding_config JSONB DEFAULT '{}',
  feature_flags JSONB DEFAULT '{}',
  billing_plan TEXT DEFAULT 'basic',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Fleet management
CREATE TABLE public.fleet_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.shipping_companies(id) ON DELETE CASCADE,
  vehicle_number TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  make_model TEXT,
  year INTEGER,
  license_plate TEXT,
  vin_number TEXT,
  capacity_kg NUMERIC,
  status TEXT DEFAULT 'active',
  current_location JSONB,
  last_maintenance_date DATE,
  next_maintenance_due DATE,
  insurance_expiry DATE,
  driver_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vehicle tracking
CREATE TABLE public.vehicle_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.fleet_vehicles(id) ON DELETE CASCADE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  speed_kmh NUMERIC,
  fuel_level NUMERIC,
  engine_status TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insurance policies
CREATE TABLE public.insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.shipping_companies(id) ON DELETE CASCADE,
  policy_number TEXT UNIQUE NOT NULL,
  provider_name TEXT NOT NULL,
  policy_type TEXT NOT NULL,
  coverage_amount NUMERIC,
  premium_amount NUMERIC,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  policy_document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Claims management
CREATE TABLE public.insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID REFERENCES public.insurance_policies(id) ON DELETE CASCADE,
  shipment_id UUID,
  claim_number TEXT UNIQUE NOT NULL,
  incident_date DATE NOT NULL,
  incident_description TEXT NOT NULL,
  claimed_amount NUMERIC NOT NULL,
  approved_amount NUMERIC,
  status TEXT DEFAULT 'submitted',
  documents JSONB DEFAULT '[]',
  adjuster_notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- API Gateway configurations
CREATE TABLE public.api_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.shipping_companies(id) ON DELETE CASCADE,
  integration_name TEXT NOT NULL,
  integration_type TEXT NOT NULL,
  api_endpoint TEXT,
  api_key_hash TEXT,
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT true,
  rate_limit INTEGER DEFAULT 1000,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Advanced analytics views
CREATE TABLE public.analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.shipping_companies(id) ON DELETE CASCADE,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  parameters JSONB DEFAULT '{}',
  schedule_config JSONB,
  last_generated_at TIMESTAMP WITH TIME ZONE,
  is_automated BOOLEAN DEFAULT false,
  recipients TEXT[],
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Performance metrics
CREATE TABLE public.company_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.shipping_companies(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_date DATE NOT NULL,
  period_type TEXT DEFAULT 'daily',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for multi-tenant access
CREATE POLICY "Users can access their company tenant data" ON public.company_tenants
  FOR ALL USING (
    company_id IN (
      SELECT id FROM public.shipping_companies sc
      JOIN public.shipping_company_staff scs ON sc.id = scs.company_id
      WHERE scs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access their company fleet" ON public.fleet_vehicles
  FOR ALL USING (
    company_id IN (
      SELECT id FROM public.shipping_companies sc
      JOIN public.shipping_company_staff scs ON sc.id = scs.company_id
      WHERE scs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access their vehicle tracking" ON public.vehicle_tracking
  FOR ALL USING (
    vehicle_id IN (
      SELECT fv.id FROM public.fleet_vehicles fv
      JOIN public.shipping_companies sc ON fv.company_id = sc.id
      JOIN public.shipping_company_staff scs ON sc.id = scs.company_id
      WHERE scs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access their insurance policies" ON public.insurance_policies
  FOR ALL USING (
    company_id IN (
      SELECT id FROM public.shipping_companies sc
      JOIN public.shipping_company_staff scs ON sc.id = scs.company_id
      WHERE scs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access their insurance claims" ON public.insurance_claims
  FOR ALL USING (
    policy_id IN (
      SELECT ip.id FROM public.insurance_policies ip
      JOIN public.shipping_companies sc ON ip.company_id = sc.id
      JOIN public.shipping_company_staff scs ON sc.id = scs.company_id
      WHERE scs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access their API integrations" ON public.api_integrations
  FOR ALL USING (
    company_id IN (
      SELECT id FROM public.shipping_companies sc
      JOIN public.shipping_company_staff scs ON sc.id = scs.company_id
      WHERE scs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access their analytics reports" ON public.analytics_reports
  FOR ALL USING (
    company_id IN (
      SELECT id FROM public.shipping_companies sc
      JOIN public.shipping_company_staff scs ON sc.id = scs.company_id
      WHERE scs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access their company metrics" ON public.company_metrics
  FOR ALL USING (
    company_id IN (
      SELECT id FROM public.shipping_companies sc
      JOIN public.shipping_company_staff scs ON sc.id = scs.company_id
      WHERE scs.user_id = auth.uid()
    )
  );

-- Generate claim numbers
CREATE OR REPLACE FUNCTION public.generate_claim_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER := 0;
BEGIN
  LOOP
    new_number := 'CLM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    
    IF NOT EXISTS (SELECT 1 FROM public.insurance_claims WHERE claim_number = new_number) THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    IF counter > 100 THEN
      RAISE EXCEPTION 'Unable to generate unique claim number';
    END IF;
  END LOOP;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate claim numbers
CREATE OR REPLACE FUNCTION public.set_claim_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.claim_number IS NULL OR NEW.claim_number = '' THEN
    NEW.claim_number := public.generate_claim_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_insurance_claim_number
  BEFORE INSERT ON public.insurance_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.set_claim_number();

-- Update timestamps
CREATE TRIGGER update_company_tenants_updated_at
  BEFORE UPDATE ON public.company_tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fleet_vehicles_updated_at
  BEFORE UPDATE ON public.fleet_vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_insurance_policies_updated_at
  BEFORE UPDATE ON public.insurance_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_insurance_claims_updated_at
  BEFORE UPDATE ON public.insurance_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_integrations_updated_at
  BEFORE UPDATE ON public.api_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_analytics_reports_updated_at
  BEFORE UPDATE ON public.analytics_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();