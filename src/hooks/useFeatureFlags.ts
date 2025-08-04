import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FeatureFlag {
  feature_name: string;
  is_enabled: boolean;
  disabled_reason?: string;
  disabled_at?: string;
}

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatureFlags = async () => {
      try {
        const { data, error } = await supabase
          .from('system_feature_flags')
          .select('feature_name, is_enabled');

        if (error) {
          console.error('Error fetching feature flags:', error);
          return;
        }

        const flagsMap = data.reduce((acc, flag) => {
          acc[flag.feature_name] = flag.is_enabled;
          return acc;
        }, {} as Record<string, boolean>);

        setFlags(flagsMap);
      } catch (error) {
        console.error('Error in feature flags hook:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatureFlags();
  }, []);

  const isFeatureEnabled = (featureName: string): boolean => {
    return flags[featureName] ?? true; // Default to enabled if not found
  };

  const isAshenDisabled = () => !isFeatureEnabled('ashen_ai_system');
  const isArtistRegistrationDisabled = () => !isFeatureEnabled('artist_registration');
  const isFanRegistrationDisabled = () => !isFeatureEnabled('fan_registration');
  const isPluginInstallationDisabled = () => !isFeatureEnabled('plugin_installation');

  return {
    flags,
    loading,
    isFeatureEnabled,
    isAshenDisabled,
    isArtistRegistrationDisabled,
    isFanRegistrationDisabled,
    isPluginInstallationDisabled
  };
};