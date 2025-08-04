import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, MapPin, Flag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Country {
  country_code: string;
  country_name: string;
  flag_emoji: string;
  region: string;
  capital_city: string;
  is_active: boolean;
}

interface CountryRouterProps {
  children: (country: Country | null) => React.ReactNode;
}

const CountryRouter: React.FC<CountryRouterProps> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get country from URL or default to Cameroon
  const countryFromUrl = searchParams.get('country') || 'CM';

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    if (countries.length > 0 && countryFromUrl) {
      const country = countries.find(c => c.country_code === countryFromUrl);
      if (country) {
        setSelectedCountry(country);
      } else {
        // If country not found, default to Cameroon
        const defaultCountry = countries.find(c => c.country_code === 'CM');
        if (defaultCountry) {
          setSelectedCountry(defaultCountry);
          updateUrlCountry('CM');
        }
      }
    }
  }, [countries, countryFromUrl]);

  const loadCountries = async () => {
    try {
      const { data } = await supabase
        .from('pan_africa_countries')
        .select('*')
        .eq('is_active', true)
        .order('country_name');

      if (data) {
        setCountries(data);
      }
    } catch (error) {
      console.error('Error loading countries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUrlCountry = (countryCode: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('country', countryCode);
    setSearchParams(newSearchParams);
  };

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.country_code === countryCode);
    if (country) {
      setSelectedCountry(country);
      updateUrlCountry(countryCode);
    }
  };

  const getCountryRoutingPath = (countryCode: string) => {
    return `/camerpulse-intelligence?country=${countryCode}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center space-y-4">
          <Globe className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading African countries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Country Selection Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Pan-African Intelligence Platform</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Country</label>
              <Select value={selectedCountry?.country_code || ''} onValueChange={handleCountryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.country_code} value={country.country_code}>
                      <div className="flex items-center space-x-2">
                        <span>{country.flag_emoji}</span>
                        <span>{country.country_name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {country.region}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCountry && (
              <div className="md:col-span-2">
                <div className="text-sm text-muted-foreground mb-2">Current Intelligence Focus</div>
                <div className="flex items-center space-x-4 p-3 bg-background border rounded-lg">
                  <span className="text-2xl">{selectedCountry.flag_emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{selectedCountry.country_name}</div>
                    <div className="text-sm text-muted-foreground flex items-center space-x-2">
                      <MapPin className="h-3 w-3" />
                      <span>{selectedCountry.capital_city}</span>
                      <span>•</span>
                      <span>{selectedCountry.region}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="secondary">
                      <Flag className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Country Links */}
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground mb-2">Quick Access</div>
            <div className="flex flex-wrap gap-2">
              {countries.slice(0, 8).map((country) => (
                <Button
                  key={country.country_code}
                  variant={selectedCountry?.country_code === country.country_code ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCountryChange(country.country_code)}
                  className="h-8"
                >
                  <span className="mr-1">{country.flag_emoji}</span>
                  <span className="text-xs">{country.country_code}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Render children with selected country */}
      {children(selectedCountry)}
    </div>
  );
};

export default CountryRouter;