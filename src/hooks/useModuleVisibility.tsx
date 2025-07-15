import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ModuleVisibility {
  module_name: string;
  is_visible: boolean;
  custom_settings: any;
}

export const useModuleVisibility = (region?: string) => {
  const { user } = useAuth();
  const [moduleVisibility, setModuleVisibility] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('citizen');

  useEffect(() => {
    loadVisibilitySettings();
  }, [user, region]);

  const loadVisibilitySettings = async () => {
    try {
      // Get user role
      let role = 'citizen';
      if (user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (roleData) {
          role = roleData.role;
        }
      }
      setUserRole(role);

      // Get module visibility for this role and region
      const { data, error } = await supabase
        .rpc('get_module_visibility', {
          p_user_role: role,
          p_region: region || null
        });

      if (error) throw error;

      // Convert to lookup object
      const visibilityMap: Record<string, boolean> = {};
      data?.forEach((item: ModuleVisibility) => {
        visibilityMap[item.module_name] = item.is_visible;
      });

      setModuleVisibility(visibilityMap);
    } catch (error) {
      console.error('Error loading module visibility:', error);
      // Default to showing basic modules on error
      setModuleVisibility({
        civic_feed: true,
        trending_topics: true,
        regional_sentiment: true,
        civic_reports: true,
        promise_tracker: true
      });
    } finally {
      setLoading(false);
    }
  };

  const isModuleVisible = (moduleName: string): boolean => {
    return moduleVisibility[moduleName] ?? false;
  };

  const getRestrictedMessage = (moduleName: string): string => {
    const messages: Record<string, string> = {
      red_room_alerts: "Emergency alerts are restricted to security personnel only.",
      insider_feed: "This section requires government partner access. Contact civic@camerpulse.org.",
      disinformation_shield: "Disinformation monitoring is available to verified analysts only.",
      election_monitoring: "Election monitoring requires special clearance.",
      sentiment_ledger: "Detailed sentiment logs are restricted for privacy reasons."
    };

    return messages[moduleName] || "This section is temporarily restricted by administrative control. For access, contact civic@camerpulse.org.";
  };

  return {
    moduleVisibility,
    userRole,
    loading,
    isModuleVisible,
    getRestrictedMessage,
    refreshVisibility: loadVisibilitySettings
  };
};