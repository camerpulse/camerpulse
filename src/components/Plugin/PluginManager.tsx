import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { usePlugins, useTogglePlugin } from '@/hooks/usePluginSystem';
import { Truck, Settings, Shield, Loader2 } from 'lucide-react';

const PLUGIN_ICONS: Record<string, React.ComponentType<any>> = {
  'camer-logistics': Truck,
  'default': Settings
};

export function PluginManager() {
  const { data: plugins = [], isLoading, error } = usePlugins();
  const togglePlugin = useTogglePlugin();

  const handleToggle = async (pluginId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
    await togglePlugin.mutateAsync({ 
      pluginId, 
      newStatus: newStatus as 'enabled' | 'disabled' | 'maintenance' 
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading plugins...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        Failed to load plugins. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Plugin Manager</h2>
          <p className="text-muted-foreground">Manage platform plugins and extensions</p>
        </div>
        <Badge variant="secondary">{plugins.length} plugins</Badge>
      </div>

      <div className="grid gap-4">
        {plugins.map((plugin) => {
          const IconComponent = PLUGIN_ICONS[plugin.plugin_name] || PLUGIN_ICONS.default;
          const isEnabled = plugin.plugin_status === 'enabled';
          const displayName = plugin.metadata?.display_name || plugin.plugin_name;
          const description = plugin.metadata?.description || 'No description available';

          return (
            <Card key={plugin.id} className={`transition-all ${isEnabled ? 'border-green-200 bg-green-50/50' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{displayName}</CardTitle>
                      <CardDescription>{description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={isEnabled ? 'default' : 'secondary'}
                      className={isEnabled ? 'bg-green-500' : ''}
                    >
                      {plugin.plugin_status}
                    </Badge>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => handleToggle(plugin.id, plugin.plugin_status)}
                      disabled={togglePlugin.isPending}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-600">Version</div>
                    <div>{plugin.plugin_version}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600">Type</div>
                    <div className="capitalize">{plugin.plugin_type}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600">Author</div>
                    <div>{plugin.plugin_author}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-600">Routes</div>
                    <div>{plugin.routes_introduced?.length || 0} routes</div>
                  </div>
                </div>
                
                {plugin.routes_introduced && plugin.routes_introduced.length > 0 && (
                  <div className="mt-4">
                    <div className="font-medium text-gray-600 mb-2">Available Routes:</div>
                    <div className="flex flex-wrap gap-1">
                      {plugin.routes_introduced.map((route, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {route}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {plugins.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No plugins installed</h3>
            <p className="text-muted-foreground">Install plugins to extend platform functionality</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}