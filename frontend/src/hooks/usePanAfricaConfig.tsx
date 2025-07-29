import React, { useEffect, useState } from 'react';
import { usePanAfrica } from '@/contexts/PanAfricaContext';
import { supabase } from '@/integrations/supabase/client';

interface PanAfricaConfigData {
  enable_pan_africa: { enabled: boolean };
  enabled_countries: { countries: string[] };
  default_country: { country_code: string };
  restrict_access_by_role: { enabled: boolean };
  cross_country_analytics: { enabled: boolean };
  country_routing: { enabled: boolean; prefix: string };
}

// Hook to manage Pan-African configuration and localStorage persistence
export const usePanAfricaConfig = () => {
  const [config, setConfig] = useState<PanAfricaConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const { data } = await supabase.rpc('get_pan_africa_config');
      if (data) {
        setConfig(data as unknown as PanAfricaConfigData);
      }
    } catch (error) {
      console.error('Error loading Pan-Africa config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { config, isLoading, refreshConfig: loadConfiguration };
};

// Enhanced PanAfricaProvider with localStorage and configuration management
export const PanAfricaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedCountry, setSelectedCountry, countries, setCountries } = usePanAfrica();
  const { config } = usePanAfricaConfig();

  // Load saved country from localStorage on mount
  useEffect(() => {
    const savedCountry = localStorage.getItem('camerpulse_selected_country');
    if (savedCountry && config?.enabled_countries.countries.includes(savedCountry)) {
      setSelectedCountry(savedCountry);
    } else if (config?.default_country.country_code) {
      setSelectedCountry(config.default_country.country_code);
    }
  }, [config, setSelectedCountry]);

  // Save selected country to localStorage whenever it changes
  useEffect(() => {
    if (selectedCountry) {
      localStorage.setItem('camerpulse_selected_country', selectedCountry);
    }
  }, [selectedCountry]);

  // Load countries based on configuration
  useEffect(() => {
    if (config?.enable_pan_africa.enabled) {
      loadEnabledCountries();
    }
  }, [config]);

  const loadEnabledCountries = async () => {
    if (!config?.enabled_countries.countries) return;

    try {
      const { data } = await supabase
        .from('pan_africa_countries')
        .select('*')
        .in('country_code', config.enabled_countries.countries)
        .eq('is_active', true)
        .order('country_name');

      setCountries(data || []);
    } catch (error) {
      console.error('Error loading enabled countries:', error);
    }
  };

  return (
    <div>
      {children}
    </div>
  );
};

// Component to handle dynamic country routing
export const CountryRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config } = usePanAfricaConfig();
  const { setSelectedCountry } = usePanAfrica();

  useEffect(() => {
    if (!config?.country_routing.enabled) return;

    // Check URL for country code
    const urlPath = window.location.pathname;
    const routePrefix = config.country_routing.prefix || 'camerpulse';
    const countryMatch = urlPath.match(new RegExp(`/${routePrefix}/([a-z]{2})`, 'i'));

    if (countryMatch && countryMatch[1]) {
      const countryCode = countryMatch[1].toUpperCase();
      if (config.enabled_countries.countries.includes(countryCode)) {
        setSelectedCountry(countryCode);
      }
    }
  }, [config, setSelectedCountry]);

  return <>{children}</>;
};

// Hook for conditional rendering based on Pan-African mode
export const usePanAfricaFeatures = () => {
  const { config, isLoading } = usePanAfricaConfig();

  return {
    isPanAfricaEnabled: config?.enable_pan_africa.enabled || false,
    isCountryRoutingEnabled: config?.country_routing.enabled || false,
    isCrossCountryAnalyticsEnabled: config?.cross_country_analytics.enabled || false,
    isAccessRestricted: config?.restrict_access_by_role.enabled || false,
    enabledCountries: config?.enabled_countries.countries || [],
    defaultCountry: config?.default_country.country_code || 'CM',
    isLoading
  };
};