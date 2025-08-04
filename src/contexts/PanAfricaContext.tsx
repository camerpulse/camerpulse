import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Country {
  country_code: string;
  country_name: string;
  country_name_local: string;
  flag_emoji: string;
  primary_language: string;
  supported_languages: string[];
  currency_code: string;
  region: string;
  capital_city: string;
  is_active: boolean;
}

interface PanAfricaContextType {
  selectedCountry: string;
  setSelectedCountry: (countryCode: string) => void;
  countries: Country[];
  setCountries: (countries: Country[]) => void;
  getCountryData: (countryCode: string) => Country | undefined;
  getCountriesByRegion: (region: string) => Country[];
}

const PanAfricaContext = createContext<PanAfricaContextType | undefined>(undefined);

export const usePanAfrica = () => {
  const context = useContext(PanAfricaContext);
  if (!context) {
    throw new Error('usePanAfrica must be used within a PanAfricaProvider');
  }
  return context;
};

interface PanAfricaProviderProps {
  children: ReactNode;
}

export const PanAfricaProvider = ({ children }: PanAfricaProviderProps) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('CM'); // Default to Cameroon
  const [countries, setCountries] = useState<Country[]>([]);

  const getCountryData = (countryCode: string): Country | undefined => {
    return countries.find(country => country.country_code === countryCode);
  };

  const getCountriesByRegion = (region: string): Country[] => {
    return countries.filter(country => country.region === region);
  };

  const value: PanAfricaContextType = {
    selectedCountry,
    setSelectedCountry,
    countries,
    setCountries,
    getCountryData,
    getCountriesByRegion,
  };

  return (
    <PanAfricaContext.Provider value={value}>
      {children}
    </PanAfricaContext.Provider>
  );
};

// Hook for easy country switching with localization
export const useCountryLocalization = () => {
  const { selectedCountry, getCountryData } = usePanAfrica();
  
  const getCurrentCountry = () => getCountryData(selectedCountry);
  
  const getLocalizedText = (translations: Record<string, string>) => {
    const country = getCurrentCountry();
    const primaryLang = country?.primary_language || 'en';
    return translations[primaryLang] || translations['en'] || Object.values(translations)[0];
  };

  const formatCurrency = (amount: number) => {
    const country = getCurrentCountry();
    const currency = country?.currency_code || 'USD';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return {
    getCurrentCountry,
    getLocalizedText,
    formatCurrency,
  };
};