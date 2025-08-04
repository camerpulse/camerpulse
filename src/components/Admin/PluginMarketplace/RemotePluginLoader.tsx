import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Globe, 
  Download, 
  Play, 
  Pause,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Monitor,
  Clock,
  Server,
  Shield,
  Zap,
  Code
} from 'lucide-react';
import { toast } from 'sonner';

interface RemotePlugin {
  id: string;
  name: string;
  url: string;
  version: string;
  status: 'cached' | 'loading' | 'error' | 'active';
  lastLoaded: string;
  size: number;
  manifest?: any;
}

interface LoadedModule {
  id: string;
  name: string;
  exports: any;
  loadTime: number;
  memoryUsage: number;
}

export const RemotePluginLoader: React.FC = () => {
  const [remoteUrl, setRemoteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadedPlugins, setLoadedPlugins] = useState<RemotePlugin[]>([]);
  const [activeModules, setActiveModules] = useState<LoadedModule[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [sandboxMode, setSandboxMode] = useState(true);

  // Mock data for demo
  useEffect(() => {
    setLoadedPlugins([
      {
        id: 'demo-analytics',
        name: 'Analytics Dashboard',
        url: 'https://cdn.example.com/analytics-plugin.js',
        version: '1.2.0',
        status: 'active',
        lastLoaded: new Date(Date.now() - 3600000).toISOString(),
        size: 45000,
        manifest: {
          name: 'Analytics Dashboard',
          permissions: ['data.read', 'ui.render']
        }
      },
      {
        id: 'demo-charts',
        name: 'Chart Library',
        url: 'https://cdn.example.com/charts-plugin.js',
        version: '2.1.3',
        status: 'cached',
        lastLoaded: new Date(Date.now() - 7200000).toISOString(),
        size: 120000
      }
    ]);

    setActiveModules([
      {
        id: 'demo-analytics',
        name: 'Analytics Dashboard',
        exports: { render: () => {}, getData: () => {} },
        loadTime: 150,
        memoryUsage: 2.4
      }
    ]);
  }, []);

  const loadRemotePlugin = async (url: string) => {
    setIsLoading(true);
    setLoadProgress(0);

    try {
      // Simulate loading progress
      const progressInterval = setInterval(() => {
        setLoadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Mock plugin loading
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      clearInterval(progressInterval);
      setLoadProgress(100);

      // Simulate successful load
      const newPlugin: RemotePlugin = {
        id: `plugin-${Date.now()}`,
        name: url.split('/').pop()?.replace('.js', '') || 'Unknown Plugin',
        url,
        version: '1.0.0',
        status: 'active',
        lastLoaded: new Date().toISOString(),
        size: Math.floor(Math.random() * 100000) + 10000
      };

      setLoadedPlugins(prev => [...prev, newPlugin]);
      
      // Add to active modules
      const newModule: LoadedModule = {
        id: newPlugin.id,
        name: newPlugin.name,
        exports: { init: () => {}, render: () => {} },
        loadTime: Math.floor(Math.random() * 200) + 50,
        memoryUsage: Math.random() * 5 + 1
      };

      setActiveModules(prev => [...prev, newModule]);
      
      toast.success(`Plugin "${newPlugin.name}" loaded successfully`);
      setRemoteUrl('');
    } catch (error) {
      toast.error('Failed to load remote plugin');
    } finally {
      setIsLoading(false);
      setLoadProgress(0);
    }
  };

  const unloadPlugin = (pluginId: string) => {
    setLoadedPlugins(prev => 
      prev.map(p => p.id === pluginId ? { ...p, status: 'cached' as const } : p)
    );
    setActiveModules(prev => prev.filter(m => m.id !== pluginId));
    toast.success('Plugin unloaded');
  };

  const reloadPlugin = async (plugin: RemotePlugin) => {
    unloadPlugin(plugin.id);
    await new Promise(resolve => setTimeout(resolve, 500));
    await loadRemotePlugin(plugin.url);
  };

  const clearCache = () => {
    setLoadedPlugins(prev => prev.filter(p => p.status === 'active'));
    toast.success('Plugin cache cleared');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><Play className="h-3 w-3 mr-1" />Active</Badge>;
      case 'cached':
        return <Badge variant="secondary"><Monitor className="h-3 w-3 mr-1" />Cached</Badge>;
      case 'loading':
        return <Badge className="bg-blue-100 text-blue-800"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Loading</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatSize = (bytes: number) => {
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  const formatMemory = (mb: number) => {
    return mb.toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Globe className="h-8 w-8 mr-3" />
            Remote Plugin Loader
          </h1>
          <p className="text-muted-foreground">
            Load and manage plugins from remote sources
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{loadedPlugins.length} Plugins</Badge>
          <Badge variant="outline">{activeModules.length} Active</Badge>
        </div>
      </div>

      {/* Load New Plugin */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Load Remote Plugin
          </CardTitle>
          <CardDescription>Load plugins from remote URLs or CDNs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="https://cdn.example.com/my-plugin.js"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              onClick={() => loadRemotePlugin(remoteUrl)}
              disabled={!remoteUrl.trim() || isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
          </div>

          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Loading plugin...</span>
                <span>{loadProgress}%</span>
              </div>
              <Progress value={loadProgress} className="h-2" />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sandbox"
              checked={sandboxMode}
              onChange={(e) => setSandboxMode(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="sandbox" className="text-sm flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              Load in sandbox mode (recommended)
            </label>
          </div>

          {sandboxMode && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Sandbox mode provides additional security by isolating plugin execution.
                Plugins will have limited access to browser APIs and CamerPulse internals.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="loaded" className="space-y-6">
        <TabsList>
          <TabsTrigger value="loaded">Loaded Plugins</TabsTrigger>
          <TabsTrigger value="active">Active Modules</TabsTrigger>
          <TabsTrigger value="cache">Cache Management</TabsTrigger>
          <TabsTrigger value="monitor">Performance Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="loaded" className="space-y-4">
          {loadedPlugins.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No plugins loaded</h3>
                <p className="text-muted-foreground">Load your first remote plugin using the form above</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {loadedPlugins.map((plugin) => (
                <Card key={plugin.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          {plugin.name}
                          <span className="text-sm font-normal text-muted-foreground ml-2">
                            v{plugin.version}
                          </span>
                        </CardTitle>
                        <CardDescription>{plugin.url}</CardDescription>
                      </div>
                      {getStatusBadge(plugin.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center">
                        <Server className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Size: {formatSize(plugin.size)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Loaded: {new Date(plugin.lastLoaded).toLocaleTimeString()}</span>
                      </div>
                      {plugin.manifest && (
                        <>
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{plugin.manifest.permissions?.length || 0} permissions</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {plugin.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => unloadPlugin(plugin.id)}
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Unload
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadRemotePlugin(plugin.url)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Load
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => reloadPlugin(plugin)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reload
                        </Button>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Code className="h-4 w-4 mr-2" />
                            Inspect
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Plugin Details: {plugin.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Basic Information</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><strong>Name:</strong> {plugin.name}</div>
                                <div><strong>Version:</strong> {plugin.version}</div>
                                <div><strong>Status:</strong> {plugin.status}</div>
                                <div><strong>Size:</strong> {formatSize(plugin.size)}</div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Source</h4>
                              <p className="text-sm break-all bg-muted p-2 rounded">{plugin.url}</p>
                            </div>

                            {plugin.manifest && (
                              <div>
                                <h4 className="font-medium mb-2">Manifest</h4>
                                <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                                  {JSON.stringify(plugin.manifest, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {activeModules.map((module) => (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{module.name}</CardTitle>
                      <CardDescription>Runtime module information</CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <Zap className="h-3 w-3 mr-1" />
                      Running
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Load Time:</span>
                      <span className="ml-1">{module.loadTime}ms</span>
                    </div>
                    <div>
                      <span className="font-medium">Memory Usage:</span>
                      <span className="ml-1">{formatMemory(module.memoryUsage)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Exports:</span>
                      <span className="ml-1">{Object.keys(module.exports).length} functions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Management</CardTitle>
              <CardDescription>Manage cached plugin data and storage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">{loadedPlugins.filter(p => p.status === 'cached').length}</div>
                    <div className="text-sm text-muted-foreground">Cached Plugins</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">
                      {formatSize(loadedPlugins.reduce((sum, p) => sum + p.size, 0))}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Cache Size</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">
                      {formatMemory(activeModules.reduce((sum, m) => sum + m.memoryUsage, 0))}
                    </div>
                    <div className="text-sm text-muted-foreground">Memory Usage</div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={clearCache}>
                  Clear Cache
                </Button>
                <Button variant="outline">
                  Optimize Storage
                </Button>
                <Button variant="outline">
                  Export Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Monitor</CardTitle>
              <CardDescription>Real-time performance metrics for loaded plugins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">CPU Usage</h4>
                    <Progress value={Math.random() * 30 + 10} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {(Math.random() * 30 + 10).toFixed(1)}% average load
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Memory Usage</h4>
                    <Progress value={Math.random() * 40 + 20} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatMemory(activeModules.reduce((sum, m) => sum + m.memoryUsage, 0))} used
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Plugin Performance</h4>
                  <div className="space-y-2">
                    {activeModules.map((module) => (
                      <div key={module.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{module.name}</span>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{module.loadTime}ms load</span>
                          <span>{formatMemory(module.memoryUsage)} memory</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};