import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PlatformConfig {
  platform: string;
  health_status: 'healthy' | 'degraded' | 'failing' | 'disabled';
  is_active: boolean;
  current_interval_minutes: number;
  consecutive_failures: number;
  last_success: string;
  rate_limit_remaining: number;
  adaptive_multiplier: number;
}

interface RefreshEngineStatus {
  engine_status: string;
  platforms: PlatformConfig[];
  recent_activity: any[];
  summary: {
    total_platforms: number;
    healthy_platforms: number;
    degraded_platforms: number;
    failing_platforms: number;
    average_interval: number;
  };
}

export const AutonomousRefreshEngine: React.FC = () => {
  const [status, setStatus] = useState<RefreshEngineStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecutingCycle, setIsExecutingCycle] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { toast } = useToast();

  // Load refresh engine status
  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('autonomous-refresh-engine', {
        body: { action: 'get_status' }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setStatus(response.data.status);
    } catch (error: any) {
      toast({
        title: 'Failed to Load Status',
        description: error.message || 'Could not fetch refresh engine status',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Execute manual refresh cycle
  const executeRefreshCycle = async () => {
    setIsExecutingCycle(true);
    try {
      const response = await supabase.functions.invoke('autonomous-refresh-engine', {
        body: { action: 'execute_refresh_cycle' }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const session = response.data.session;
      
      toast({
        title: 'Refresh Cycle Completed',
        description: `Processed ${session.platforms_succeeded.length}/${session.platforms_attempted.length} platforms successfully`
      });

      // Reload status after cycle
      await loadStatus();
    } catch (error: any) {
      toast({
        title: 'Refresh Cycle Failed',
        description: error.message || 'Failed to execute refresh cycle',
        variant: 'destructive'
      });
    } finally {
      setIsExecutingCycle(false);
    }
  };

  // Reset platform health
  const resetPlatformHealth = async (platform: string) => {
    try {
      const response = await supabase.functions.invoke('autonomous-refresh-engine', {
        body: { action: 'reset_platform', platform }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: 'Platform Reset',
        description: `${platform} health status has been reset`
      });

      await loadStatus();
    } catch (error: any) {
      toast({
        title: 'Reset Failed',
        description: error.message || `Failed to reset ${platform}`,
        variant: 'destructive'
      });
    }
  };

  // Load status on component mount and set up auto-refresh
  useEffect(() => {
    loadStatus();
    
    if (autoRefresh) {
      const interval = setInterval(loadStatus, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'degraded': return 'secondary';
      case 'failing': return 'destructive';
      case 'disabled': return 'outline';
      default: return 'outline';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'failing': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'disabled': return <Pause className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading && !status) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8" />
          <span className="ml-2">Loading refresh engine status...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Autonomous Refresh Engine
          </h2>
          <p className="text-muted-foreground">
            Real-time data collection from social media platforms
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">Auto-refresh</span>
            <Switch 
              checked={autoRefresh} 
              onCheckedChange={setAutoRefresh}
            />
          </div>
          <Button variant="outline" onClick={loadStatus} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={executeRefreshCycle} 
            disabled={isExecutingCycle}
          >
            {isExecutingCycle ? (
              <>
                <Loader2 className="h-4 w-4 mr-2" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Cycle
              </>
            )}
          </Button>
        </div>
      </div>

      {status && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engine Status</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {status.engine_status.toUpperCase()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Autonomous operation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Healthy Platforms</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {status.summary.healthy_platforms}/{status.summary.total_platforms}
                </div>
                <p className="text-xs text-muted-foreground">
                  Platforms operational
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Interval</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(status.summary.average_interval)}m
                </div>
                <p className="text-xs text-muted-foreground">
                  Refresh frequency
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Platforms</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {status.summary.failing_platforms}
                </div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Health Alerts */}
          {status.summary.failing_platforms > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {status.summary.failing_platforms} platform(s) are experiencing issues and may need manual intervention.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="platforms" className="space-y-4">
            <TabsList>
              <TabsTrigger value="platforms">Platform Status</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Platform Status Tab */}
            <TabsContent value="platforms">
              <div className="grid gap-4">
                {status.platforms.map((platform) => (
                  <Card key={platform.platform}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getHealthIcon(platform.health_status)}
                          <div>
                            <CardTitle className="capitalize">{platform.platform}</CardTitle>
                            <CardDescription>
                              Last success: {formatTimestamp(platform.last_success)}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getHealthColor(platform.health_status)}>
                            {platform.health_status}
                          </Badge>
                          {platform.health_status === 'failing' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => resetPlatformHealth(platform.platform)}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Reset
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Refresh Interval</span>
                            <span className="font-medium">{platform.current_interval_minutes}m</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Consecutive Failures</span>
                            <span className="font-medium">{platform.consecutive_failures}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Adaptive Multiplier</span>
                            <span className="font-medium">{platform.adaptive_multiplier.toFixed(2)}x</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Rate Limit Remaining</span>
                            <span className="font-medium">{platform.rate_limit_remaining}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Rate Limit Usage</span>
                              <span className="text-xs text-muted-foreground">
                                {Math.round(((300 - platform.rate_limit_remaining) / 300) * 100)}%
                              </span>
                            </div>
                            <Progress 
                              value={((300 - platform.rate_limit_remaining) / 300) * 100} 
                              className="h-2" 
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Status</span>
                            <Badge variant={platform.is_active ? 'default' : 'outline'}>
                              {platform.is_active ? 'Active' : 'Disabled'}
                            </Badge>
                          </div>
                          {platform.consecutive_failures > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Platform experiencing issues. Next interval increased to {platform.current_interval_minutes}m.
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Recent Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Refresh Activity</CardTitle>
                  <CardDescription>
                    Latest refresh attempts and system logs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {status.recent_activity.slice(0, 10).map((activity, index) => (
                      <div key={activity.id || index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{activity.learning_type}</Badge>
                            <span className="text-sm font-medium">
                              {activity.pattern_identified}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(activity.created_at)}
                          </span>
                        </div>
                        
                        {activity.input_data && (
                          <div className="text-sm text-muted-foreground">
                            {activity.learning_type === 'refresh_session' ? (
                              <div>
                                Session: {activity.input_data.platforms_succeeded?.length || 0} succeeded, 
                                {activity.input_data.platforms_failed?.length || 0} failed
                              </div>
                            ) : (
                              <div>
                                Platform: {activity.input_data.platform} - {activity.input_data.status}
                                {activity.input_data.data_count && ` (${activity.input_data.data_count} items)`}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {activity.confidence_improvement && (
                          <div className="mt-2">
                            <Badge variant={activity.confidence_improvement > 0 ? 'default' : 'destructive'}>
                              {activity.confidence_improvement > 0 ? '+' : ''}{(activity.confidence_improvement * 100).toFixed(1)}% confidence
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {status.recent_activity.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No recent activity found. Run a refresh cycle to see activity logs.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Refresh Engine Configuration</CardTitle>
                  <CardDescription>
                    Autonomous data collection settings and controls
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <h4 className="font-medium">Automatic Scheduling</h4>
                        <p className="text-sm text-muted-foreground">
                          The refresh engine runs automatically every 3 minutes via cron job.
                          Each platform adapts its frequency based on performance and rate limits.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Adaptive Intelligence</h4>
                        <p className="text-sm text-muted-foreground">
                          Intervals automatically adjust based on data volume, API response times,
                          and failure rates to optimize data collection.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Rate Limit Management</h4>
                        <p className="text-sm text-muted-foreground">
                          Built-in rate limit tracking prevents API quota exhaustion and
                          automatically slows down when limits are approached.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Health Monitoring</h4>
                        <p className="text-sm text-muted-foreground">
                          Continuous health checks with automatic alerts when platforms
                          fail. Failed platforms are temporarily disabled to prevent cascade failures.
                        </p>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 bg-muted/50">
                      <h4 className="font-medium mb-2">Platform Coverage</h4>
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="text-sm">
                          <strong>Twitter:</strong> Real-time tweets, hashtags, mentions
                        </div>
                        <div className="text-sm">
                          <strong>Facebook:</strong> Public posts and engagement metrics
                        </div>
                        <div className="text-sm">
                          <strong>TikTok:</strong> Trending content and viral videos
                        </div>
                        <div className="text-sm">
                          <strong>Google Trends:</strong> Search volume and trending topics
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};