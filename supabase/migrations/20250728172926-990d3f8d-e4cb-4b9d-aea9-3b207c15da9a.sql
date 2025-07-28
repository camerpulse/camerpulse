-- Create tenants table for multi-tenant architecture
CREATE TABLE public.logistics_tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  contact_email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create API integrations table
CREATE TABLE public.logistics_api_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.logistics_tenants(id) ON DELETE CASCADE,
  integration_name TEXT NOT NULL,
  integration_type TEXT NOT NULL,
  api_endpoint TEXT,
  webhook_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create insurance policies table
CREATE TABLE public.logistics_insurance_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.logistics_tenants(id) ON DELETE CASCADE,
  policy_number TEXT UNIQUE NOT NULL,
  provider_name TEXT NOT NULL,
  policy_type TEXT NOT NULL,
  coverage_amount NUMERIC,
  premium_amount NUMERIC,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fleet vehicles table
CREATE TABLE public.logistics_fleet_vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.logistics_tenants(id) ON DELETE CASCADE,
  vehicle_number TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  license_plate TEXT UNIQUE NOT NULL,
  driver_name TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  last_location JSONB,
  maintenance_due DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.logistics_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_api_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_fleet_vehicles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenants
CREATE POLICY "Authenticated users can view tenants" 
ON public.logistics_tenants 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage tenants" 
ON public.logistics_tenants 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for API integrations
CREATE POLICY "Users can view API integrations" 
ON public.logistics_api_integrations 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage API integrations" 
ON public.logistics_api_integrations 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for insurance policies
CREATE POLICY "Users can view insurance policies" 
ON public.logistics_insurance_policies 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage insurance policies" 
ON public.logistics_insurance_policies 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for fleet vehicles
CREATE POLICY "Users can view fleet vehicles" 
ON public.logistics_fleet_vehicles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage fleet vehicles" 
ON public.logistics_fleet_vehicles 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_logistics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_logistics_tenants_updated_at
BEFORE UPDATE ON public.logistics_tenants
FOR EACH ROW
EXECUTE FUNCTION public.update_logistics_updated_at();

CREATE TRIGGER update_logistics_api_integrations_updated_at
BEFORE UPDATE ON public.logistics_api_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_logistics_updated_at();

CREATE TRIGGER update_logistics_insurance_policies_updated_at
BEFORE UPDATE ON public.logistics_insurance_policies
FOR EACH ROW
EXECUTE FUNCTION public.update_logistics_updated_at();

CREATE TRIGGER update_logistics_fleet_vehicles_updated_at
BEFORE UPDATE ON public.logistics_fleet_vehicles
FOR EACH ROW
EXECUTE FUNCTION public.update_logistics_updated_at();