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

  // Phase 1 disabled features
  const isAshenDisabled = () => !isFeatureEnabled('ashen_ai_system');
  const isArtistRegistrationDisabled = () => !isFeatureEnabled('artist_registration');
  const isFanRegistrationDisabled = () => !isFeatureEnabled('fan_registration');
  const isPluginInstallationDisabled = () => !isFeatureEnabled('plugin_installation');

  // Phase 2 disabled features
  const isArtistPlatformDisabled = () => !isFeatureEnabled('artist_platform');
  const isLegacyPluginSystemDisabled = () => !isFeatureEnabled('legacy_plugin_system');
  const isEventManagementDisabled = () => !isFeatureEnabled('event_management');
  const isCamerpulseIntelligenceDisabled = () => !isFeatureEnabled('camerpulse_intelligence');

  // Phase 3 features
  const isUnifiedAdminDashboardEnabled = () => isFeatureEnabled('unified_admin_dashboard');
  const isSimplifiedNotificationsEnabled = () => isFeatureEnabled('simplified_notifications');
  const isCoreSentimentAnalysisEnabled = () => isFeatureEnabled('core_sentiment_analysis');
  const isAdvancedNotificationChannelsDisabled = () => !isFeatureEnabled('advanced_notification_channels');
  const isComplexSentimentFeaturesDisabled = () => !isFeatureEnabled('complex_sentiment_features');
  const isMultipleAdminInterfacesDisabled = () => !isFeatureEnabled('multiple_admin_interfaces');

  // Core civic features (should remain enabled)
  const isCivicPollingEnabled = () => isFeatureEnabled('civic_polling');
  const isCivicAlertsEnabled = () => isFeatureEnabled('civic_alerts');
  const isVillageManagementEnabled = () => isFeatureEnabled('village_management');
  const isGovernmentTransparencyEnabled = () => isFeatureEnabled('government_transparency');
  const isCitizenEngagementEnabled = () => isFeatureEnabled('citizen_engagement');

  // Marketplace features
  const isMarketplaceEnabled = () => isFeatureEnabled('marketplace');
  const isJobBoardEnabled = () => isFeatureEnabled('job_board');
  const isMessagingSystemEnabled = () => isFeatureEnabled('messaging_system');

  return {
    flags,
    loading,
    isFeatureEnabled,
    // Phase 1 checks
    isAshenDisabled,
    isArtistRegistrationDisabled,
    isFanRegistrationDisabled,
    isPluginInstallationDisabled,
    // Phase 2 checks
    isArtistPlatformDisabled,
    isLegacyPluginSystemDisabled,
    isEventManagementDisabled,
    isCamerpulseIntelligenceDisabled,
    // Phase 3 checks
    isUnifiedAdminDashboardEnabled,
    isSimplifiedNotificationsEnabled,
    isCoreSentimentAnalysisEnabled,
    isAdvancedNotificationChannelsDisabled,
    isComplexSentimentFeaturesDisabled,
    isMultipleAdminInterfacesDisabled,
    // Core feature checks
    isCivicPollingEnabled,
    isCivicAlertsEnabled,
    isVillageManagementEnabled,
    isGovernmentTransparencyEnabled,
    isCitizenEngagementEnabled,
    isMarketplaceEnabled,
    isJobBoardEnabled,
    isMessagingSystemEnabled
  };
};
