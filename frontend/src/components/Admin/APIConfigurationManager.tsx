import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Key, 
  Cloud, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Save,
  AlertTriangle,
  Globe
} from 'lucide-react';

interface APIConfig {
  id: string;
  service_name: string;
  api_key: string;
  base_url: string;
  is_active: boolean;
  additional_config: any;
  created_at: string;
  updated_at: string;
}

export const APIConfigurationManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [editingConfig, setEditingConfig] = useState<Partial<APIConfig> | null>(null);

  // Fetch API configurations
  const { data: apiConfigs, isLoading } = useQuery({
    queryKey: ['api_configurations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_configurations')
        .select('*')
        .order('service_name');
      
      if (error) throw error;
      return data as APIConfig[];
    },
  });

  // Create/Update API configuration
  const configMutation = useMutation({
    mutationFn: async (config: Partial<APIConfig>) => {
      if (config.id) {
        const { error } = await supabase
          .from('api_configurations')
          .update({
            service_name: config.service_name,
            api_key: config.api_key,
            base_url: config.base_url,
            is_active: config.is_active,
            additional_config: config.additional_config,
            updated_at: new Date().toISOString(),
          })
          .eq('id', config.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('api_configurations')
          .insert({
            service_name: config.service_name,
            api_key: config.api_key,
            base_url: config.base_url,
            is_active: config.is_active || false,
            additional_config: config.additional_config || {},
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api_configurations'] });
      setEditingConfig(null);
      toast({
        title: "API Configuration saved",
        description: "The configuration has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving configuration",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Test API connection
  const testConnectionMutation = useMutation({
    mutationFn: async (config: APIConfig) => {
      // This would test the API connection based on service type
      if (config.service_name === 'OpenWeatherMap') {
        const response = await fetch(
          `${config.base_url}/weather?q=London&appid=${config.api_key}`
        );
        if (!response.ok) throw new Error('API connection failed');
        return await response.json();
      }
      // Add other service tests here
      throw new Error('Service test not implemented');
    },
    onSuccess: () => {
      toast({
        title: "Connection successful",
        description: "API is responding correctly.",
      });
    },
    onError: (error) => {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleSecret = (configId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [configId]: !prev[configId]
    }));
  };

  const maskApiKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '*'.repeat(key.length);
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  const predefinedServices = [
    {
      name: 'OpenWeatherMap',
      baseUrl: 'https://api.openweathermap.org/data/2.5',
      description: 'Weather data API for village weather updates',
      icon: <Cloud className="h-4 w-4" />
    },
    {
      name: 'Mapbox',
      baseUrl: 'https://api.mapbox.com',
      description: 'Mapping and geolocation services',
      icon: <Globe className="h-4 w-4" />
    }
  ];

  const handleSaveConfig = () => {
    if (!editingConfig?.service_name || !editingConfig?.api_key) {
      toast({
        title: "Missing required fields",
        description: "Service name and API key are required.",
        variant: "destructive",
      });
      return;
    }
    configMutation.mutate(editingConfig);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <Key className="h-6 w-6 mr-2 text-primary" />
          API Configuration Manager
        </h2>
        <p className="text-muted-foreground">
          Manage external API keys and service configurations
        </p>
      </div>

      {/* Add New Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Add New API Configuration</CardTitle>
          <CardDescription>
            Configure new external service integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {predefinedServices.map((service) => (
              <Card
                key={service.name}
                className="cursor-pointer hover:shadow-md transition-all duration-200 border-dashed"
                onClick={() => setEditingConfig({
                  service_name: service.name,
                  base_url: service.baseUrl,
                  api_key: '',
                  is_active: false,
                  additional_config: {}
                })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    {service.icon}
                    <h3 className="font-semibold">{service.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {editingConfig && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {editingConfig.id ? 'Edit' : 'Add'} Configuration
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingConfig(null)}
                >
                  Cancel
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service_name">Service Name</Label>
                  <Input
                    id="service_name"
                    value={editingConfig.service_name || ''}
                    onChange={(e) => setEditingConfig(prev => ({
                      ...prev,
                      service_name: e.target.value
                    }))}
                    placeholder="e.g., OpenWeatherMap"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base_url">Base URL</Label>
                  <Input
                    id="base_url"
                    value={editingConfig.base_url || ''}
                    onChange={(e) => setEditingConfig(prev => ({
                      ...prev,
                      base_url: e.target.value
                    }))}
                    placeholder="https://api.example.com"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="api_key">API Key</Label>
                  <Input
                    id="api_key"
                    type="password"
                    value={editingConfig.api_key || ''}
                    onChange={(e) => setEditingConfig(prev => ({
                      ...prev,
                      api_key: e.target.value
                    }))}
                    placeholder="Enter your API key"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={editingConfig.is_active || false}
                    onCheckedChange={(checked) => setEditingConfig(prev => ({
                      ...prev,
                      is_active: checked
                    }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  onClick={handleSaveConfig}
                  disabled={configMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {configMutation.isPending ? 'Saving...' : 'Save Configuration'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Configurations */}
      <Card>
        <CardHeader>
          <CardTitle>Existing API Configurations</CardTitle>
          <CardDescription>
            Manage and monitor your configured external services
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading configurations...</span>
            </div>
          ) : !apiConfigs?.length ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No API configurations</h3>
              <p className="text-muted-foreground">
                Add your first API configuration to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiConfigs.map((config) => (
                <div
                  key={config.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{config.service_name}</h3>
                      <Badge variant={config.is_active ? "default" : "secondary"}>
                        {config.is_active ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testConnectionMutation.mutate(config)}
                        disabled={testConnectionMutation.isPending || !config.is_active}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingConfig(config)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Base URL</Label>
                      <p className="font-mono">{config.base_url}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">API Key</Label>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">
                          {showSecrets[config.id] ? config.api_key : maskApiKey(config.api_key)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSecret(config.id)}
                        >
                          {showSecrets[config.id] ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last updated: {new Date(config.updated_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
