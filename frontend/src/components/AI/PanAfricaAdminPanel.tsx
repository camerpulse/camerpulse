import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Globe, 
  Settings, 
  Shield, 
  ToggleLeft, 
  ToggleRight,
  Flag,
  Users,
  Map,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Save,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PanAfricaConfig {
  enable_pan_africa: { enabled: boolean };
  enabled_countries: { countries: string[] };
  default_country: { country_code: string };
  restrict_access_by_role: { enabled: boolean };
  cross_country_analytics: { enabled: boolean };
  country_routing: { enabled: boolean; prefix: string };
}

interface Country {
  country_code: string;
  country_name: string;
  flag_emoji: string;
  region: string;
  is_active: boolean;
}

const PanAfricaAdminPanel = () => {
  const [config, setConfig] = useState<PanAfricaConfig>({
    enable_pan_africa: { enabled: true },
    enabled_countries: { countries: ['CM'] },
    default_country: { country_code: 'CM' },
    restrict_access_by_role: { enabled: false },
    cross_country_analytics: { enabled: true },
    country_routing: { enabled: true, prefix: 'camerpulse' }
  });
  
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfiguration();
    loadCountries();
  }, []);

  const loadConfiguration = async () => {
    try {
      const { data } = await supabase.rpc('get_pan_africa_config');
      if (data) {
        setConfig(data as unknown as PanAfricaConfig);
      }
    } catch (error) {
      console.error('Error loading Pan-Africa config:', error);
      toast({
        title: "Configuration Load Error",
        description: "Failed to load Pan-African settings.",
        variant: "destructive"
      });
    }
  };

  const loadCountries = async () => {
    try {
      const { data } = await supabase
        .from('pan_africa_countries')
        .select('*')
        .order('country_name');

      setCountries(data || []);
    } catch (error) {
      console.error('Error loading countries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async (key: keyof PanAfricaConfig, value: any) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('pan_africa_config')
        .update({ 
          config_value: value,
          updated_at: new Date().toISOString()
        })
        .eq('config_key', key);

      if (error) throw error;

      setConfig(prev => ({ ...prev, [key]: value }));
      
      toast({
        title: "Configuration Updated",
        description: `${key.replace('_', ' ')} has been updated successfully.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update configuration.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCountryToggle = (countryCode: string, enabled: boolean) => {
    const currentCountries = config.enabled_countries.countries;
    const updatedCountries = enabled 
      ? [...currentCountries, countryCode]
      : currentCountries.filter(code => code !== countryCode);

    updateConfig('enabled_countries', { countries: updatedCountries });
  };

  const getCountryData = (countryCode: string) => {
    return countries.find(c => c.country_code === countryCode);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <Activity className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading Pan-African controls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Pan-African Intelligence Controls</h1>
              <p className="text-green-100">Configure multi-country civic intelligence system</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
            <Shield className="h-3 w-3 mr-1" />
            Admin Only
          </Badge>
        </div>
      </div>

      {/* Master Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Master Pan-African Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                {config.enable_pan_africa.enabled ? (
                  <ToggleRight className="h-5 w-5 text-green-500" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-gray-400" />
                )}
                <Label className="text-base font-semibold">Enable Pan-African Mode</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Master switch for multi-country civic intelligence across Africa
              </p>
            </div>
            <Switch
              checked={config.enable_pan_africa.enabled}
              onCheckedChange={(enabled) => 
                updateConfig('enable_pan_africa', { enabled })
              }
              disabled={isSaving}
            />
          </div>

          {config.enable_pan_africa.enabled && (
            <>
              <Separator />
              
              {/* Default Country */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Default Country</Label>
                <p className="text-sm text-muted-foreground">
                  Which country loads first when users visit the platform
                </p>
                <Select 
                  value={config.default_country.country_code}
                  onValueChange={(countryCode) => 
                    updateConfig('default_country', { country_code: countryCode })
                  }
                >
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.filter(c => c.is_active).map((country) => (
                      <SelectItem key={country.country_code} value={country.country_code}>
                        <div className="flex items-center space-x-2">
                          <span>{country.flag_emoji}</span>
                          <span>{country.country_name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Feature Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="font-medium">Cross-Country Analytics</Label>
                    <p className="text-xs text-muted-foreground">Enable comparison dashboards</p>
                  </div>
                  <Switch
                    checked={config.cross_country_analytics.enabled}
                    onCheckedChange={(enabled) => 
                      updateConfig('cross_country_analytics', { enabled })
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="font-medium">Dynamic Country Routing</Label>
                    <p className="text-xs text-muted-foreground">Enable /camerpulse/cm, /ng routes</p>
                  </div>
                  <Switch
                    checked={config.country_routing.enabled}
                    onCheckedChange={(enabled) => 
                      updateConfig('country_routing', { 
                        enabled, 
                        prefix: config.country_routing.prefix 
                      })
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="font-medium">Restrict Access by Role</Label>
                    <p className="text-xs text-muted-foreground">Super Admin only access</p>
                  </div>
                  <Switch
                    checked={config.restrict_access_by_role.enabled}
                    onCheckedChange={(enabled) => 
                      updateConfig('restrict_access_by_role', { enabled })
                    }
                    disabled={isSaving}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Country Management */}
      {config.enable_pan_africa.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Flag className="h-5 w-5" />
              <span>Country Activation Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select which countries are available for civic intelligence monitoring
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {countries.map((country) => {
                  const isEnabled = config.enabled_countries.countries.includes(country.country_code);
                  
                  return (
                    <div key={country.country_code} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{country.flag_emoji}</span>
                          <div>
                            <h3 className="font-semibold">{country.country_name}</h3>
                            <p className="text-xs text-muted-foreground">{country.region}</p>
                          </div>
                        </div>
                        {isEnabled ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant={isEnabled ? "default" : "secondary"}>
                          {isEnabled ? "Active" : "Inactive"}
                        </Badge>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(enabled) => 
                            handleCountryToggle(country.country_code, enabled)
                          }
                          disabled={isSaving}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>System Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Active Countries</h3>
              <p className="text-2xl font-bold text-primary">
                {config.enabled_countries.countries.length}
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Map className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold">Default Country</h3>
              <p className="text-lg font-semibold">
                {getCountryData(config.default_country.country_code)?.flag_emoji}{' '}
                {getCountryData(config.default_country.country_code)?.country_name}
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Globe className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold">Pan-African Mode</h3>
              <p className="text-lg font-semibold">
                {config.enable_pan_africa.enabled ? (
                  <Badge className="bg-green-500">Enabled</Badge>
                ) : (
                  <Badge variant="secondary">Disabled</Badge>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings and Alerts */}
      {!config.enable_pan_africa.enabled && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Pan-African Mode Disabled:</strong> Country selector and multi-country features are currently hidden from users. 
            Only Cameroon intelligence is active.
          </AlertDescription>
        </Alert>
      )}

      {config.enable_pan_africa.enabled && config.enabled_countries.countries.length === 0 && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>No Countries Enabled:</strong> Pan-African mode is enabled but no countries are selected. 
            Please enable at least one country for the system to function.
          </AlertDescription>
        </Alert>
      )}

      {config.enable_pan_africa.enabled && config.enabled_countries.countries.length > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>System Active:</strong> Pan-African civic intelligence is running with {config.enabled_countries.countries.length} active countries. 
            Users can switch between countries and access cross-border analytics.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PanAfricaAdminPanel;