import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Plug, 
  Shield, 
  Activity, 
  Search, 
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Package,
  Network,
  BarChart3,
  TestTube,
  GitBranch
} from 'lucide-react';
import { usePlugins, useTogglePlugin, usePluginHistory, Plugin } from '@/hooks/usePluginSystem';
import { PluginIntelligenceDashboard } from '../PluginIntelligence/PluginIntelligenceDashboard';
import { PluginDependencyVisualizer } from '../PluginIntelligence/PluginDependencyVisualizer';
import { PluginSandbox } from '../PluginIntelligence/PluginSandbox';
import { PluginVersionControl } from './PluginVersionControl';
import { toast } from 'sonner';

export const PluginManagerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);

  const { data: plugins, isLoading } = usePlugins();
  const { data: history } = usePluginHistory();
  const togglePlugin = useTogglePlugin();

  const getDisplayName = (plugin: Plugin) => {
    return plugin.metadata?.display_name || plugin.plugin_name.replace('CamerPulse.Plugin.', '');
  };

  const getDescription = (plugin: Plugin) => {
    return plugin.metadata?.description || 'No description available';
  };

  const filteredPlugins = plugins?.filter(plugin => {
    const matchesSearch = getDisplayName(plugin).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.plugin_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || plugin.plugin_status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleTogglePlugin = async (pluginId: string, newStatus: 'enabled' | 'disabled') => {
    try {
      await togglePlugin.mutateAsync({
        pluginId,
        newStatus,
        reason: `Toggled via admin panel`
      });
    } catch (error) {
      toast.error('Failed to toggle plugin');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enabled':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disabled':
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
      case 'maintenance':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      enabled: 'default',
      disabled: 'secondary',
      maintenance: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'destructive'}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const enabledCount = plugins?.filter(p => p.plugin_status === 'enabled').length || 0;
  const totalCount = plugins?.length || 0;
  const corePlugins = plugins?.filter(p => p.metadata?.category === 'core').length || 0;
  const governancePlugins = plugins?.filter(p => p.metadata?.category === 'governance').length || 0;
  const economyPlugins = plugins?.filter(p => p.metadata?.category === 'economy').length || 0;
  const entertainmentPlugins = plugins?.filter(p => p.metadata?.category === 'entertainment').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plugin Management System</h1>
          <p className="text-muted-foreground">
            Comprehensive plugin management with intelligence monitoring
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1">
            <Plug className="h-4 w-4 mr-2" />
            {enabledCount}/{totalCount} Active
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Plugins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{enabledCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Disabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {totalCount - enabledCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Core:</span>
                <span className="font-medium">{corePlugins}</span>
              </div>
              <div className="flex justify-between">
                <span>Governance:</span>
                <span className="font-medium">{governancePlugins}</span>
              </div>
              <div className="flex justify-between">
                <span>Economy:</span>
                <span className="font-medium">{economyPlugins}</span>
              </div>
              <div className="flex justify-between">
                <span>Entertainment:</span>
                <span className="font-medium">{entertainmentPlugins}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="plugins" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="plugins" className="flex items-center space-x-1">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Registry</span>
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center space-x-1">
            <GitBranch className="h-4 w-4" />
            <span className="hidden sm:inline">Versions</span>
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="flex items-center space-x-1">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Intelligence</span>
          </TabsTrigger>
          <TabsTrigger value="dependencies" className="flex items-center space-x-1">
            <Network className="h-4 w-4" />
            <span className="hidden sm:inline">Dependencies</span>
          </TabsTrigger>
          <TabsTrigger value="sandbox" className="flex items-center space-x-1">
            <TestTube className="h-4 w-4" />
            <span className="hidden sm:inline">Sandbox</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-1">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plugins" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search plugins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>

          {/* Plugins Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlugins?.map((plugin) => (
              <Card key={plugin.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{getDisplayName(plugin)}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(plugin.plugin_status)}
                        {getStatusBadge(plugin.plugin_status)}
                      </div>
                    </div>
                    <Switch
                      checked={plugin.plugin_status === 'enabled'}
                      onCheckedChange={() => handleTogglePlugin(plugin.id, plugin.plugin_status === 'enabled' ? 'disabled' : 'enabled')}
                      disabled={togglePlugin.isPending}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription className="text-sm">
                    {getDescription(plugin)}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline" className="text-xs">
                        {plugin.plugin_type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Version:</span>
                      <span>{plugin.plugin_version}</span>
                    </div>

                    {plugin.routes_introduced.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Routes:</span>
                        <div className="flex flex-wrap gap-1">
                          {plugin.routes_introduced.slice(0, 2).map((route, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {route}
                            </Badge>
                          ))}
                          {plugin.routes_introduced.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{plugin.routes_introduced.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPlugin(plugin)}
                    >
                      Configure
                    </Button>
                    
                    {plugin.dependencies_used && Object.keys(plugin.dependencies_used).length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {(plugin.dependencies_used.dependencies || []).length} deps
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPlugins?.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Plug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No plugins found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : 'No plugins match the current filter'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="versions">
          <PluginVersionControl />
        </TabsContent>

        <TabsContent value="intelligence">
          <PluginIntelligenceDashboard />
        </TabsContent>

        <TabsContent value="dependencies">
          <PluginDependencyVisualizer />
        </TabsContent>

        <TabsContent value="sandbox">
          <PluginSandbox />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plugin Activity History</CardTitle>
              <CardDescription>
                Recent plugin activation and configuration changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history?.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{entry.action_type}</Badge>
                        <span className="font-medium">Plugin Activity</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {entry.reason || 'No reason provided'}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                
                {!history?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    No activity history available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Plugin security and permissions are managed automatically based on user roles and plugin configurations.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Security Overview</CardTitle>
              <CardDescription>
                System security status and plugin permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Sandbox Execution</h4>
                    <p className="text-sm text-muted-foreground">
                      All plugins run in isolated environments
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Role-Based Access</h4>
                    <p className="text-sm text-muted-foreground">
                      Plugin access controlled by user permissions
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Dependency Validation</h4>
                    <p className="text-sm text-muted-foreground">
                      Plugin dependencies are validated before activation
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};