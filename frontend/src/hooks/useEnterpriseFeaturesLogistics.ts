import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  contact_email: string;
  is_active: boolean;
  settings?: any;
  created_at: string;
  updated_at: string;
}

interface ApiIntegration {
  id: string;
  tenant_id?: string;
  integration_name: string;
  integration_type: string;
  api_endpoint?: string;
  webhook_url?: string;
  is_active: boolean;
  configuration?: any;
  created_at: string;
  updated_at: string;
}

interface InsurancePolicy {
  id: string;
  tenant_id?: string;
  policy_number: string;
  provider_name: string;
  policy_type: string;
  coverage_amount?: number;
  premium_amount?: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FleetVehicle {
  id: string;
  tenant_id?: string;
  vehicle_number: string;
  vehicle_type: string;
  license_plate: string;
  driver_name?: string;
  status: string;
  last_location?: any;
  maintenance_due?: string;
  created_at: string;
  updated_at: string;
}

export const useEnterpriseFeaturesLogistics = () => {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [apiIntegrations, setApiIntegrations] = useState<ApiIntegration[]>([]);
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>([]);
  const { toast } = useToast();

  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('logistics_tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tenants",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createTenant = useCallback(async (tenantData: Omit<Tenant, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('logistics_tenants')
        .insert([tenantData])
        .select()
        .single();

      if (error) throw error;
      
      setTenants(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Tenant created successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating tenant:', error);
      toast({
        title: "Error",
        description: "Failed to create tenant",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateTenant = useCallback(async (id: string, updates: Partial<Tenant>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('logistics_tenants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTenants(prev => prev.map(tenant => 
        tenant.id === id ? { ...tenant, ...data } : tenant
      ));
      
      toast({
        title: "Success",
        description: "Tenant updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating tenant:', error);
      toast({
        title: "Error",
        description: "Failed to update tenant",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteTenant = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('logistics_tenants')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTenants(prev => prev.filter(tenant => tenant.id !== id));
      toast({
        title: "Success",
        description: "Tenant deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting tenant:', error);
      toast({
        title: "Error",
        description: "Failed to delete tenant",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchApiIntegrations = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('logistics_api_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching API integrations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch API integrations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createApiIntegration = useCallback(async (integrationData: Omit<ApiIntegration, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('logistics_api_integrations')
        .insert([integrationData])
        .select()
        .single();

      if (error) throw error;
      
      setApiIntegrations(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "API integration created successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating API integration:', error);
      toast({
        title: "Error",
        description: "Failed to create API integration",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateApiIntegration = useCallback(async (id: string, updates: Partial<ApiIntegration>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('logistics_api_integrations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setApiIntegrations(prev => prev.map(integration => 
        integration.id === id ? { ...integration, ...data } : integration
      ));
      
      toast({
        title: "Success",
        description: "API integration updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating API integration:', error);
      toast({
        title: "Error",
        description: "Failed to update API integration",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteApiIntegration = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('logistics_api_integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setApiIntegrations(prev => prev.filter(integration => integration.id !== id));
      toast({
        title: "Success",
        description: "API integration deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting API integration:', error);
      toast({
        title: "Error",
        description: "Failed to delete API integration",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch data on mount
  useEffect(() => {
    fetchTenants();
    fetchApiIntegrations();
  }, [fetchTenants, fetchApiIntegrations]);

  // Insurance and fleet functions (can be added later)
  const fetchInsurancePolicies = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('logistics_insurance_policies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInsurancePolicies(data || []);
    } catch (error) {
      console.error('Error fetching insurance policies:', error);
      toast({
        title: "Error",
        description: "Failed to fetch insurance policies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchFleetVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('logistics_fleet_vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFleetVehicles(data || []);
    } catch (error) {
      console.error('Error fetching fleet vehicles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch fleet vehicles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    tenants,
    apiIntegrations,
    insurancePolicies,
    fleetVehicles,
    fetchTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    fetchApiIntegrations,
    createApiIntegration,
    updateApiIntegration,
    deleteApiIntegration,
    fetchInsurancePolicies,
    fetchFleetVehicles
  };
};