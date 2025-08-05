import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe, MapPin } from 'lucide-react';
import { usePanAfrica } from '@/contexts/PanAfricaContext';

interface CountrySelectorProps {
  className?: string;
  variant?: 'default' | 'compact' | 'header';
  showRegion?: boolean;
  onCountryChange?: (countryCode: string) => void;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  className = '',
  variant = 'default',
  showRegion = true,
  onCountryChange
}) => {
  const { selectedCountry, setSelectedCountry, countries, getCountryData } = usePanAfrica();
  
  const selectedCountryData = getCountryData(selectedCountry);

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    if (onCountryChange) {
      onCountryChange(countryCode);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className="text-lg">{selectedCountryData?.flag_emoji}</span>
        <Select value={selectedCountry} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-32 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.country_code} value={country.country_code}>
                <div className="flex items-center space-x-2">
                  <span>{country.flag_emoji}</span>
                  <span className="text-xs">{country.country_code}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">Country:</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xl">{selectedCountryData?.flag_emoji}</span>
          <div>
            <p className="font-semibold text-sm">{selectedCountryData?.country_name}</p>
            {showRegion && (
              <p className="text-xs text-muted-foreground">{selectedCountryData?.region}</p>
            )}
          </div>
        </div>
        <Select value={selectedCountry} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.country_code} value={country.country_code}>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{country.flag_emoji}</span>
                  <div>
                    <span className="font-medium">{country.country_name}</span>
                    {showRegion && (
                      <div className="text-xs text-muted-foreground">{country.region}</div>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <MapPin className="h-4 w-4" />
        <span className="text-sm font-medium">Select Country</span>
      </div>
      
      {selectedCountryData && (
        <div className="flex items-center space-x-3 p-3 border rounded-lg bg-muted/50">
          <span className="text-2xl">{selectedCountryData.flag_emoji}</span>
          <div className="flex-1">
            <h3 className="font-semibold">{selectedCountryData.country_name}</h3>
            <p className="text-sm text-muted-foreground">{selectedCountryData.country_name_local}</p>
            {showRegion && (
              <Badge variant="outline" className="text-xs mt-1">
                {selectedCountryData.region}
              </Badge>
            )}
          </div>
        </div>
      )}

      <Select value={selectedCountry} onValueChange={handleCountryChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a country" />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.country_code} value={country.country_code}>
              <div className="flex items-center space-x-3">
                <span className="text-lg">{country.flag_emoji}</span>
                <div>
                  <div className="font-medium">{country.country_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {country.region} • {country.currency_code}
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CountrySelector;