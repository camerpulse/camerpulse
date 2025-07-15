import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  RefreshCw,
  Database,
  Brain,
  Cloud,
  Shield,
  Monitor,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Trash2,
  Settings,
  Activity,
  BarChart3,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CacheConfig {
  id: string;
  cache_layer: string;
  is_active: boolean;
  auto_flush_enabled: boolean;
  auto_flush_interval_hours: number;
  max_size_mb: number;
  retention_hours: number;
  flush_priority: number;
  config_metadata: any;
}

interface FlushOperation {
  id: string;
  operation_type: string;
  cache_layers: string[];
  status: string;
  started_at: string;
  completed_at?: string;
  success_details: any;
  error_details: any;
}

interface CacheLayerResult {
  layer: string;
  status: 'success' | 'error' | 'running' | 'pending';
  items_cleared: number;
  size_cleared_mb: number;
  error_message?: string;
  duration_ms: number;
}

const CACHE_LAYER_ICONS = {
  component_cache: Monitor,
  ai_memory_cache: Brain,
  api_cache: Cloud,
  cdn_asset_cache: Database,
  security_role_cache: Shield
};

const CACHE_LAYER_COLORS = {
  component_cache: 'bg-blue-500',
  ai_memory_cache: 'bg-purple-500',
  api_cache: 'bg-green-500',
  cdn_asset_cache: 'bg-orange-500',
  security_role_cache: 'bg-red-500'
};

export const CacheManagementDashboard = () => {
  const [cacheConfigs, setCacheConfigs] = useState<CacheConfig[]>([]);
  const [recentOperations, setRecentOperations] = useState<FlushOperation[]>([]);
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [isFlushingAll, setIsFlushingAll] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<any>(null);
  const [operationResults, setOperationResults] = useState<CacheLayerResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCacheConfigs();
    fetchRecentOperations();
  }, []);

  const fetchCacheConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('system_cache_config')
        .select('*')
        .order('flush_priority');

      if (error) throw error;
      setCacheConfigs(data || []);
    } catch (error) {
      console.error('Error fetching cache configs:', error);
      toast.error('Failed to load cache configurations');
    }
  };

  const fetchRecentOperations = async () => {
    try {
      const { data, error } = await supabase
        .from('cache_flush_operations')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentOperations(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching operations:', error);
      setLoading(false);
    }
  };

  const handleFlushAll = async () => {
    setIsFlushingAll(true);
    setOperationResults([]);
    
    try {
      const response = await fetch('/functions/v1/system-cache-flush', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          cache_layers: cacheConfigs.map(c => c.cache_layer),
          operation_type: 'manual',
          force: true
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Flush operation failed');
      }

      setCurrentOperation(result);
      setOperationResults(result.results || []);
      
      toast.success(`Cache flush ${result.status}: ${result.total_items_cleared} items cleared (${result.total_size_cleared_mb}MB)`);
      
      // Refresh data
      await fetchRecentOperations();
      
    } catch (error) {
      console.error('Flush all error:', error);
      toast.error(`Failed to flush caches: ${error.message}`);
    } finally {
      setIsFlushingAll(false);
    }
  };

  const handleFlushSelected = async () => {
    if (selectedLayers.length === 0) {
      toast.error('Please select at least one cache layer to flush');
      return;
    }

    setIsFlushingAll(true);
    setOperationResults([]);
    
    try {
      const response = await fetch('/functions/v1/system-cache-flush', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          cache_layers: selectedLayers,
          operation_type: 'manual',
          force: false
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Flush operation failed');
      }

      setCurrentOperation(result);
      setOperationResults(result.results || []);
      
      toast.success(`Selected caches flushed: ${result.total_items_cleared} items cleared`);
      
      // Refresh data
      await fetchRecentOperations();
      
    } catch (error) {
      console.error('Flush selected error:', error);
      toast.error(`Failed to flush selected caches: ${error.message}`);
    } finally {
      setIsFlushingAll(false);
    }
  };

  const toggleLayerSelection = (layer: string) => {
    setSelectedLayers(prev => 
      prev.includes(layer) 
        ? prev.filter(l => l !== layer)
        : [...prev, layer]
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-500',
      running: 'bg-blue-500',
      failed: 'bg-red-500',
      partial: 'bg-yellow-500',
      pending: 'bg-gray-500'
    };
    
    return (
      <Badge className={`${variants[status as keyof typeof variants] || 'bg-gray-500'} text-white`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getResultIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading cache management...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Cache Management</h1>
          <p className="text-muted-foreground">
            Manage and flush system-level caches across CamerPulse
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleFlushSelected}
            disabled={selectedLayers.length === 0 || isFlushingAll}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Flush Selected ({selectedLayers.length})
          </Button>
          <Button
            onClick={handleFlushAll}
            disabled={isFlushingAll}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
          >
            {isFlushingAll ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Flush All Caches
          </Button>
        </div>
      </div>

      {/* Current Operation Status */}
      {currentOperation && (
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                Last operation: {getStatusBadge(currentOperation.status)} 
                - {currentOperation.total_items_cleared} items cleared ({currentOperation.total_size_cleared_mb}MB)
              </span>
              <span className="text-sm text-muted-foreground">
                Operation ID: {currentOperation.operation_id}
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="cache-layers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cache-layers">Cache Layers</TabsTrigger>
          <TabsTrigger value="recent-operations">Recent Operations</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="cache-layers" className="space-y-4">
          {/* Cache Layer Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cacheConfigs.map((config) => {
              const IconComponent = CACHE_LAYER_ICONS[config.cache_layer as keyof typeof CACHE_LAYER_ICONS] || Database;
              const isSelected = selectedLayers.includes(config.cache_layer);
              const result = operationResults.find(r => r.layer === config.cache_layer);
              
              return (
                <Card 
                  key={config.id} 
                  className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''} ${!config.is_active ? 'opacity-50' : ''}`}
                  onClick={() => config.is_active && toggleLayerSelection(config.cache_layer)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${CACHE_LAYER_COLORS[config.cache_layer as keyof typeof CACHE_LAYER_COLORS]} text-white`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-sm font-medium">
                          {config.cache_layer.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </CardTitle>
                      </div>
                      {result && getResultIcon(result.status)}
                    </div>
                    <CardDescription className="text-xs">
                      {config.config_metadata?.description || 'No description available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Max Size:</span>
                        <span>{config.max_size_mb}MB</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Retention:</span>
                        <span>{config.retention_hours}h</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Priority:</span>
                        <span>{config.flush_priority}</span>
                      </div>
                      {result && (
                        <div className="pt-2 border-t">
                          <div className="flex justify-between text-xs">
                            <span>Items Cleared:</span>
                            <span>{result.items_cleared}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Size Cleared:</span>
                            <span>{result.size_cleared_mb}MB</span>
                          </div>
                          {result.duration_ms && (
                            <div className="flex justify-between text-xs">
                              <span>Duration:</span>
                              <span>{result.duration_ms}ms</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="recent-operations">
          <Card>
            <CardHeader>
              <CardTitle>Recent Flush Operations</CardTitle>
              <CardDescription>
                History of cache flush operations and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {recentOperations.map((operation) => (
                    <div key={operation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(operation.status)}
                          <span className="font-medium">{operation.operation_type.toUpperCase()}</span>
                          <span className="text-sm text-muted-foreground">
                            {operation.cache_layers.length} layer(s)
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Started: {new Date(operation.started_at).toLocaleString()}
                          {operation.completed_at && (
                            <span> • Completed: {new Date(operation.completed_at).toLocaleString()}</span>
                          )}
                        </div>
                        <div className="text-xs">
                          Layers: {operation.cache_layers.join(', ')}
                        </div>
                      </div>
                      <div className="text-right">
                        {operation.success_details?.results && (
                          <div className="text-sm">
                            <div>✅ {operation.success_details.results.length} successful</div>
                          </div>
                        )}
                        {operation.error_details?.results && (
                          <div className="text-sm text-red-600">
                            <div>❌ {operation.error_details.results.length} failed</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration">
          <div className="grid gap-4">
            {cacheConfigs.map((config) => (
              <Card key={config.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{config.cache_layer.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <Switch 
                      checked={config.is_active}
                      onCheckedChange={(checked) => {
                        // Update configuration
                        console.log(`Toggle ${config.cache_layer}: ${checked}`);
                      }}
                    />
                  </CardTitle>
                  <CardDescription>
                    Configure settings for this cache layer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium">Auto Flush</label>
                      <Switch 
                        checked={config.auto_flush_enabled}
                        onCheckedChange={(checked) => {
                          console.log(`Auto flush ${config.cache_layer}: ${checked}`);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Interval (hours)</label>
                      <div className="text-sm">{config.auto_flush_interval_hours}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Max Size (MB)</label>
                      <div className="text-sm">{config.max_size_mb}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Retention (hours)</label>
                      <div className="text-sm">{config.retention_hours}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};