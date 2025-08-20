import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Shield, Clock, Ban, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RateLimit {
  id: string;
  identifier_type: string;
  identifier_value: string;
  action_type: string;
  request_count: number;
  window_start: string;
  blocked_until: string | null;
  created_at: string;
  updated_at: string;
}

interface RateLimitStats {
  totalLimits: number;
  activeBlocks: number;
  topActions: Array<{ action: string; count: number }>;
  topIdentifiers: Array<{ identifier: string; count: number }>;
}

export const RateLimitMonitor: React.FC = () => {
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [stats, setStats] = useState<RateLimitStats>({
    totalLimits: 0,
    activeBlocks: 0,
    topActions: [],
    topIdentifiers: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRateLimitData();
    const interval = setInterval(loadRateLimitData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadRateLimitData = async () => {
    try {
      const { data: rateLimitData, error } = await supabase
        .from('rate_limits')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setRateLimits(rateLimitData || []);

      // Calculate stats
      const totalLimits = rateLimitData?.length || 0;
      const activeBlocks = rateLimitData?.filter(rl => 
        rl.blocked_until && new Date(rl.blocked_until) > new Date()
      ).length || 0;

      // Top actions
      const actionCounts: Record<string, number> = {};
      rateLimitData?.forEach(rl => {
        actionCounts[rl.action_type] = (actionCounts[rl.action_type] || 0) + rl.request_count;
      });
      const topActions = Object.entries(actionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([action, count]) => ({ action, count }));

      // Top identifiers
      const identifierCounts: Record<string, number> = {};
      rateLimitData?.forEach(rl => {
        const key = `${rl.identifier_type}:${rl.identifier_value}`;
        identifierCounts[key] = (identifierCounts[key] || 0) + rl.request_count;
      });
      const topIdentifiers = Object.entries(identifierCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([identifier, count]) => ({ identifier, count }));

      setStats({
        totalLimits,
        activeBlocks,
        topActions,
        topIdentifiers
      });

    } catch (error) {
      console.error('Failed to load rate limit data:', error);
      toast({
        title: "Error",
        description: "Failed to load rate limit data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearRateLimit = async (rateLimitId: string) => {
    try {
      const { error } = await supabase
        .from('rate_limits')
        .update({ blocked_until: null })
        .eq('id', rateLimitId);

      if (error) throw error;

      await loadRateLimitData();
      toast({
        title: "Success",
        description: "Rate limit cleared successfully"
      });
    } catch (error) {
      console.error('Failed to clear rate limit:', error);
      toast({
        title: "Error",
        description: "Failed to clear rate limit",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (rateLimit: RateLimit) => {
    if (rateLimit.blocked_until && new Date(rateLimit.blocked_until) > new Date()) {
      return 'destructive';
    }
    if (rateLimit.request_count > 50) {
      return 'secondary';
    }
    return 'outline';
  };

  const getProgressValue = (requestCount: number, limit: number = 100) => {
    return Math.min((requestCount / limit) * 100, 100);
  };

  const isBlocked = (rateLimit: RateLimit) => {
    return rateLimit.blocked_until && new Date(rateLimit.blocked_until) > new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rate Limit Monitor</h2>
          <p className="text-muted-foreground">Monitor API usage and rate limiting</p>
        </div>
        <Button onClick={loadRateLimitData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rate Limits</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLimits}</div>
            <p className="text-xs text-muted-foreground">Active tracking entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Blocks</CardTitle>
            <Ban className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.activeBlocks}</div>
            <p className="text-xs text-muted-foreground">Currently blocked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected Actions</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.topActions.length}</div>
            <p className="text-xs text-muted-foreground">Types monitored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <AlertTriangle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Healthy</div>
            <p className="text-xs text-muted-foreground">Rate limiting active</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Actions and Identifiers */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Actions</CardTitle>
            <CardDescription>Most frequently rate-limited actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topActions.map((action, index) => (
                <div key={action.action} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">#{index + 1}</span>
                    <span className="text-sm">{action.action}</span>
                  </div>
                  <Badge variant="outline">{action.count} requests</Badge>
                </div>
              ))}
              {stats.topActions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No rate-limited actions yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Identifiers</CardTitle>
            <CardDescription>Most active users/IPs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topIdentifiers.map((identifier, index) => (
                <div key={identifier.identifier} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">#{index + 1}</span>
                    <span className="text-sm font-mono text-xs">
                      {identifier.identifier.substring(0, 20)}...
                    </span>
                  </div>
                  <Badge variant="outline">{identifier.count} requests</Badge>
                </div>
              ))}
              {stats.topIdentifiers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tracked identifiers yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rate Limits List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Rate Limits</CardTitle>
          <CardDescription>Active rate limiting entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rateLimits.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-semibold">No rate limits active</p>
                <p className="text-muted-foreground">System is running smoothly</p>
              </div>
            ) : (
              rateLimits.slice(0, 20).map((rateLimit) => (
                <div key={rateLimit.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{rateLimit.action_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {rateLimit.identifier_type}: {rateLimit.identifier_value}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(rateLimit)}>
                        {isBlocked(rateLimit) ? 'Blocked' : 'Active'}
                      </Badge>
                      {isBlocked(rateLimit) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => clearRateLimit(rateLimit.id)}
                        >
                          Clear Block
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Requests: {rateLimit.request_count}/100</span>
                      <span>
                        Window: {new Date(rateLimit.window_start).toLocaleTimeString()}
                      </span>
                    </div>
                    <Progress 
                      value={getProgressValue(rateLimit.request_count)} 
                      className="h-2"
                    />
                  </div>

                  {isBlocked(rateLimit) && (
                    <div className="text-sm text-red-600">
                      Blocked until: {new Date(rateLimit.blocked_until!).toLocaleString()}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};