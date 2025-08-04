import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface EconomicIndicator {
  id: string;
  indicator_name: string;
  indicator_type: string;
  region: string;
  value: number;
  unit: string;
  measurement_date: string;
  data_source: string;
  reliability_score: number;
}

export interface DevelopmentProject {
  id: string;
  project_name: string;
  project_type: string;
  description?: string;
  implementing_agency: string;
  funding_source: string;
  region: string;
  total_budget: number;
  disbursed_amount: number;
  progress_percentage: number;
  current_status: string;
  transparency_rating: number;
}

export interface LocalBusiness {
  id: string;
  business_name: string;
  business_type: string;
  sector: string;
  description?: string;
  region: string;
  city: string;
  employees_count?: number;
  annual_revenue_range?: string;
  verification_status: string;
  economic_impact_score: number;
}

export interface EconomicAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  affected_region?: string;
  is_acknowledged: boolean;
  created_at: string;
}

export const useEconomics = () => {
  const [indicators, setIndicators] = useState<EconomicIndicator[]>([]);
  const [projects, setProjects] = useState<DevelopmentProject[]>([]);
  const [businesses, setBusinesses] = useState<LocalBusiness[]>([]);
  const [alerts, setAlerts] = useState<EconomicAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchEconomicData = async (region?: string) => {
    setIsLoading(true);
    try {
      // Fetch economic indicators
      let indicatorsQuery = supabase
        .from('economic_indicators')
        .select('*')
        .order('measurement_date', { ascending: false });
      
      if (region && region !== 'all') {
        indicatorsQuery = indicatorsQuery.eq('region', region);
      }
      
      const { data: indicatorsData, error: indicatorsError } = await indicatorsQuery;
      if (indicatorsError) throw indicatorsError;

      // Fetch development projects
      let projectsQuery = supabase
        .from('development_projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (region && region !== 'all') {
        projectsQuery = projectsQuery.eq('region', region);
      }
      
      const { data: projectsData, error: projectsError } = await projectsQuery;
      if (projectsError) throw projectsError;

      // Fetch local businesses
      let businessesQuery = supabase
        .from('local_businesses')
        .select('*')
        .eq('verification_status', 'verified')
        .eq('is_active', true)
        .order('economic_impact_score', { ascending: false });
      
      if (region && region !== 'all') {
        businessesQuery = businessesQuery.eq('region', region);
      }
      
      const { data: businessesData, error: businessesError } = await businessesQuery;
      if (businessesError) throw businessesError;

      // Fetch economic alerts
      let alertsQuery = supabase
        .from('economic_alerts')
        .select('*')
        .eq('is_acknowledged', false)
        .order('created_at', { ascending: false });
      
      if (region && region !== 'all') {
        alertsQuery = alertsQuery.eq('affected_region', region);
      }
      
      const { data: alertsData, error: alertsError } = await alertsQuery;
      if (alertsError) throw alertsError;

      setIndicators(indicatorsData || []);
      setProjects(projectsData || []);
      setBusinesses(businessesData || []);
      setAlerts(alertsData || []);
    } catch (error) {
      console.error('Error fetching economic data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch economic data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getEconomicSummary = async (region?: string) => {
    try {
      const { data, error } = await supabase.rpc('get_economic_summary', {
        p_region: region || null
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching economic summary:', error);
      return null;
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('economic_alerts')
        .update({ 
          is_acknowledged: true,
          acknowledged_by: (await supabase.auth.getUser()).data.user?.id,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      // Update local state
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      toast({
        title: "Success",
        description: "Alert acknowledged successfully",
      });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast({
        title: "Error",
        description: "Failed to acknowledge alert",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchEconomicData();
  }, []);

  return {
    indicators,
    projects,
    businesses,
    alerts,
    isLoading,
    fetchEconomicData,
    getEconomicSummary,
    acknowledgeAlert,
  };
};