import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Puzzle, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Info,
  Globe,
  Database,
  Users,
  Shield
} from 'lucide-react';

interface PluginInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  isEnabled: boolean;
  isCore: boolean;
  routes: string[];
  components: string[];
  dependencies: string[];
  status: 'active' | 'inactive' | 'error' | 'loading';
  lastUpdated: string;
  category: 'core' | 'civic' | 'business' | 'entertainment' | 'utilities';
}

const PluginManager: React.FC = () => {
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlugin, setSelectedPlugin] = useState<PluginInfo | null>(null);

  // Mock plugin data - in real implementation, this would come from your plugin system
  useEffect(() => {
    const mockPlugins: PluginInfo[] = [
      {
        id: 'camerplay',
        name: 'CamerPlay Music',
        version: '1.8.5',
        description: 'Music streaming and artist management platform',
        isEnabled: true,
        isCore: false,
        routes: ['/camerplay', '/artists', '/events', '/camerplay/upload'],
        components: ['MusicPlayer', 'ArtistDashboard', 'EventCalendar'],
        dependencies: ['audio-player', 'file-upload'],
        status: 'active',
        lastUpdated: '2024-01-18',
        category: 'entertainment'
      },
      {
        id: 'civic-engagement',
        name: 'Civic Engagement Core',
        version: '3.0.0',
        description: 'Core civic participation and polling system',
        isEnabled: true,
        isCore: true,
        routes: ['/polls', '/politicians', '/civic-reputation'],
        components: ['PollsDashboard', 'PoliticianTracker', 'ReputationSystem'],
        dependencies: ['analytics', 'notifications'],
        status: 'active',
        lastUpdated: '2024-01-22',
        category: 'core'
      },
      {
        id: 'business-directory',
        name: 'Business Directory',
        version: '1.5.2',
        description: 'Company listings and business verification system',
        isEnabled: true,
        isCore: false,
        routes: ['/companies', '/billionaires', '/business-verification'],
        components: ['CompanyDashboard', 'BusinessVerification', 'BillionaireTracker'],
        dependencies: ['verification-service'],
        status: 'active',
        lastUpdated: '2024-01-15',
        category: 'business'
      },
      {
        id: 'village-registry',
        name: 'Village Registry',
        version: '2.3.1',
        description: 'Comprehensive village documentation and management',
        isEnabled: true,
        isCore: false,
        routes: ['/villages', '/villages/search'],
        components: ['VillageDirectory', 'VillageProfile', 'VillageSearch'],
        dependencies: ['maps', 'geolocation'],
        status: 'active',
        lastUpdated: '2024-01-16',
        category: 'civic'
      },
      {
        id: 'pulse-messenger',
        name: 'Pulse Messenger',
        version: '1.2.0',
        description: 'Secure civic communication platform',
        isEnabled: false,
        isCore: false,
        routes: ['/pulse-messenger'],
        components: ['MessengerInterface', 'SecureChat'],
        dependencies: ['encryption', 'websockets'],
        status: 'inactive',
        lastUpdated: '2024-01-10',
        category: 'utilities'
      }
    ];

    setTimeout(() => {
      setPlugins(mockPlugins);
      setLoading(false);
    }, 1000);
  }, []);

  const handleTogglePlugin = async (pluginId: string, newState: boolean) => {
    const plugin = plugins.find(p => p.id === pluginId);
    
    if (plugin?.isCore && !newState) {
      alert('❌ Core plugins cannot be disabled as they are essential for platform functionality.');
      return;
    }

    // Update the plugin state
    setPlugins(prev => prev.map(p => 
      p.id === pluginId 
        ? { ...p, isEnabled: newState, status: newState ? 'active' : 'inactive' }
        : p
    ));

    // Show success message with plugin name
    const pluginName = plugin?.name || pluginId;
    if (newState) {
      alert(`✅ ${pluginName} has been ENABLED successfully! The feature is now active.`);
    } else {
      alert(`⚠️ ${pluginName} has been DISABLED successfully! The feature is now inactive.`);
    }

    // Here you would call your actual plugin management API
    console.log(`🔧 Plugin ${pluginId} (${pluginName}) ${newState ? 'enabled' : 'disabled'}`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core': return <Shield className="h-4 w-4" />;
      case 'civic': return <Users className="h-4 w-4" />;
      case 'business': return <Database className="h-4 w-4" />;
      case 'entertainment': return <Globe className="h-4 w-4" />;
      case 'utilities': return <Settings className="h-4 w-4" />;
      default: return <Puzzle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-gray-500';
      case 'error': return 'text-red-600';
      case 'loading': return 'text-yellow-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className={`h-4 w-4 ${getStatusColor(status)}`} />;
      case 'inactive': return <XCircle className={`h-4 w-4 ${getStatusColor(status)}`} />;
      case 'error': return <AlertTriangle className={`h-4 w-4 ${getStatusColor(status)}`} />;
      case 'loading': return <RefreshCw className={`h-4 w-4 ${getStatusColor(status)} animate-spin`} />;
      default: return <Info className={`h-4 w-4 ${getStatusColor(status)}`} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading plugins...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Plugin Manager</h2>
          <p className="text-muted-foreground">
            Manage platform plugins, features, and integrations
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Plugins
        </Button>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Warning:</strong> Disabling plugins will remove their routes, components, and features from the platform. 
          Core plugins cannot be disabled.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Plugins</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Plugins</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Puzzle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{plugins.length}</p>
                    <p className="text-sm text-muted-foreground">Total Plugins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{plugins.filter(p => p.isEnabled).length}</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{plugins.filter(p => p.isCore).length}</p>
                    <p className="text-sm text-muted-foreground">Core Plugins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-2xl font-bold">{plugins.filter(p => !p.isEnabled).length}</p>
                    <p className="text-sm text-muted-foreground">Inactive</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plugins.map((plugin) => (
              <Card key={plugin.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(plugin.category)}
                    <CardTitle className="text-lg">{plugin.name}</CardTitle>
                    {plugin.isCore && (
                      <Badge variant="secondary">Core</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(plugin.status)}
                    <Switch
                      checked={plugin.isEnabled}
                      onCheckedChange={(checked) => handleTogglePlugin(plugin.id, checked)}
                      disabled={plugin.isCore && !plugin.isEnabled}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{plugin.description}</p>
                    
                    <div className="flex justify-between text-sm">
                      <span>Version: <Badge variant="outline">{plugin.version}</Badge></span>
                      <span>Updated: {plugin.lastUpdated}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Routes ({plugin.routes.length}):</p>
                      <div className="flex flex-wrap gap-1">
                        {plugin.routes.slice(0, 3).map((route) => (
                          <Badge key={route} variant="outline" className="text-xs">
                            {route}
                          </Badge>
                        ))}
                        {plugin.routes.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{plugin.routes.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedPlugin(plugin)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="space-y-4">
            {plugins.filter(p => p.isEnabled).map((plugin) => (
              <Card key={plugin.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getCategoryIcon(plugin.category)}
                      <div>
                        <h3 className="font-semibold">{plugin.name}</h3>
                        <p className="text-sm text-muted-foreground">{plugin.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(plugin.status)}
                      <Badge>{plugin.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inactive">
          <div className="space-y-4">
            {plugins.filter(p => !p.isEnabled).map((plugin) => (
              <Card key={plugin.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getCategoryIcon(plugin.category)}
                      <div>
                        <h3 className="font-semibold text-muted-foreground">{plugin.name}</h3>
                        <p className="text-sm text-muted-foreground">{plugin.description}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleTogglePlugin(plugin.id, true)}
                      size="sm"
                    >
                      Enable Plugin
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Plugin System Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Plugin system settings and advanced configuration options will be available in a future update.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Plugin Details Modal */}
      {selectedPlugin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  {getCategoryIcon(selectedPlugin.category)}
                  <span>{selectedPlugin.name}</span>
                </CardTitle>
                <Button variant="ghost" onClick={() => setSelectedPlugin(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedPlugin.description}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Routes</h4>
                <div className="space-y-1">
                  {selectedPlugin.routes.map((route) => (
                    <Badge key={route} variant="outline" className="mr-2">
                      {route}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Components</h4>
                <div className="space-y-1">
                  {selectedPlugin.components.map((component) => (
                    <Badge key={component} variant="secondary" className="mr-2">
                      {component}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Dependencies</h4>
                <div className="space-y-1">
                  {selectedPlugin.dependencies.map((dep) => (
                    <Badge key={dep} variant="outline" className="mr-2">
                      {dep}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PluginManager;