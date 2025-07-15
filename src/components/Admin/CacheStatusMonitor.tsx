import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  RefreshCw,
  Database,
  Brain,
  Cloud,
  Shield,
  Monitor,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CacheLayerStatus {
  layer: string;
  current_size_mb: number;
  max_size_mb: number;
  items_count: number;
  last_flush: string;
  status: 'healthy' | 'warning' | 'critical';
  hit_rate: number;
  miss_rate: number;
}

interface SystemCacheStats {
  total_cache_size_mb: number;
  total_items: number;
  overall_hit_rate: number;
  last_global_flush: string;
  active_operations: number;
}

const CACHE_LAYER_ICONS = {
  component_cache: Monitor,
  ai_memory_cache: Brain,
  api_cache: Cloud,
  cdn_asset_cache: Database,
  security_role_cache: Shield
};

export const CacheStatusMonitor = () => {
  const [cacheStatus, setCacheStatus] = useState<CacheLayerStatus[]>([]);
  const [systemStats, setSystemStats] = useState<SystemCacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchCacheStatus();
    const interval = setInterval(fetchCacheStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCacheStatus = async () => {
    try {
      // Simulate fetching cache status data
      // In real implementation, this would call an edge function that checks cache metrics
      const mockCacheStatus: CacheLayerStatus[] = [
        {
          layer: 'component_cache',
          current_size_mb: 245,
          max_size_mb: 500,
          items_count: 1250,
          last_flush: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'healthy',
          hit_rate: 87.5,
          miss_rate: 12.5
        },
        {
          layer: 'ai_memory_cache',
          current_size_mb: 890,
          max_size_mb: 1000,
          items_count: 450,
          last_flush: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          status: 'warning',
          hit_rate: 92.1,
          miss_rate: 7.9
        },
        {
          layer: 'api_cache',
          current_size_mb: 1450,
          max_size_mb: 2000,
          items_count: 1450,
          last_flush: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: 'healthy',
          hit_rate: 76.3,
          miss_rate: 23.7
        },
        {
          layer: 'cdn_asset_cache',
          current_size_mb: 4200,
          max_size_mb: 5000,
          items_count: 840,
          last_flush: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          status: 'warning',
          hit_rate: 94.8,
          miss_rate: 5.2
        },
        {
          layer: 'security_role_cache',
          current_size_mb: 45,
          max_size_mb: 100,
          items_count: 450,
          last_flush: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: 'healthy',
          hit_rate: 98.2,
          miss_rate: 1.8
        }
      ];

      const mockSystemStats: SystemCacheStats = {
        total_cache_size_mb: mockCacheStatus.reduce((sum, cache) => sum + cache.current_size_mb, 0),
        total_items: mockCacheStatus.reduce((sum, cache) => sum + cache.items_count, 0),
        overall_hit_rate: mockCacheStatus.reduce((sum, cache) => sum + cache.hit_rate, 0) / mockCacheStatus.length,
        last_global_flush: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        active_operations: 0
      };

      setCacheStatus(mockCacheStatus);
      setSystemStats(mockSystemStats);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cache status:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className={`h-4 w-4 ${getStatusColor(status)}`} />;
      case 'warning': return <AlertTriangle className={`h-4 w-4 ${getStatusColor(status)}`} />;
      case 'critical': return <XCircle className={`h-4 w-4 ${getStatusColor(status)}`} />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getUsagePercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else {
      return `${diffHours}h ago`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading cache status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Cache Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.total_cache_size_mb.toFixed(1)}MB</div>
              <p className="text-xs text-muted-foreground">Across all layers</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.total_items.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Cached objects</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Hit Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{systemStats.overall_hit_rate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Cache efficiency</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Last Global Flush</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTimeAgo(systemStats.last_global_flush)}</div>
              <p className="text-xs text-muted-foreground">All caches cleared</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Real-time Status */}
      <Alert>
        <Activity className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>Cache monitoring active - Last updated: {lastUpdate.toLocaleTimeString()}</span>
            <Badge variant="outline" className="text-green-600">
              Live
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      {/* Cache Layer Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {cacheStatus.map((cache) => {
          const IconComponent = CACHE_LAYER_ICONS[cache.layer as keyof typeof CACHE_LAYER_ICONS] || Database;
          const usagePercentage = getUsagePercentage(cache.current_size_mb, cache.max_size_mb);
          
          return (
            <Card key={cache.layer}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5" />
                    <CardTitle className="text-lg">
                      {cache.layer.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(cache.status)}
                    <Badge variant="outline" className={getStatusColor(cache.status)}>
                      {cache.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Usage Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Storage Usage</span>
                      <span>{cache.current_size_mb}MB / {cache.max_size_mb}MB</span>
                    </div>
                    <Progress 
                      value={usagePercentage} 
                      className={`h-2 ${usagePercentage > 80 ? 'bg-red-200' : usagePercentage > 60 ? 'bg-yellow-200' : 'bg-green-200'}`}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {usagePercentage}% utilized
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">Items Cached</div>
                      <div className="text-lg font-bold">{cache.items_count.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Last Flush</div>
                      <div className="text-lg font-bold">{formatTimeAgo(cache.last_flush)}</div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="text-xs text-muted-foreground">Hit Rate</div>
                        <div className="font-semibold text-green-600">{cache.hit_rate}%</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <div>
                        <div className="text-xs text-muted-foreground">Miss Rate</div>
                        <div className="font-semibold text-red-600">{cache.miss_rate}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};