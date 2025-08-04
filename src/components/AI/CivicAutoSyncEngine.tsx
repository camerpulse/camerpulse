import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RotateCcw,
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Settings,
  Play,
  Pause,
  RotateCcw as ResetIcon,
  Loader2,
  Users,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SyncConfig {
  source: 'MINAT' | 'SENAT' | 'ASSNAT' | 'PRC';
  entity_type: 'political_parties' | 'senators' | 'mps' | 'ministers';
  last_synced: string;
  is_active: boolean;
  sync_frequency_hours: number;
  fallback_enabled: boolean;
  auto_fallback: boolean;
  sync_status: 'healthy' | 'degraded' | 'failing' | 'disabled';
  consecutive_failures: number;
  entities_found: number;
  entities_updated: number;
  entities_with_fallback: number;
}

interface EngineStatus {
  engine_status: 'active' | 'paused' | 'maintenance';
  sync_sources: SyncConfig[];
  transparency_settings: {
    show_fallback_to_public: boolean;
    require_admin_approval: boolean;
    auto_verify_threshold: number;
  };
  recent_activity: any[];
  summary: {
    total_officials: number;
    verified_officials: number;
    fallback_officials: number;
    missing_data_officials: number;
    last_full_sync: string;
  };
}

export const CivicAutoSyncEngine: React.FC = () => {
  const [status, setStatus] = useState<EngineStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecutingSync, setIsExecutingSync] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [transparencyToggle, setTransparencyToggle] = useState(false);

  const { toast } = useToast();

  // Load sync engine status
  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('civic-auto-sync-engine', {
        body: { action: 'get_status' }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setStatus(response.data.status);
      setTransparencyToggle(response.data.status.transparency_settings.show_fallback_to_public);
    } catch (error: any) {
      toast({
        title: 'Failed to Load Status',
        description: error.message || 'Could not fetch sync engine status',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Execute manual sync cycle
  const executeSync = async () => {
    setIsExecutingSync(true);
    try {
      const response = await supabase.functions.invoke('civic-auto-sync-engine', {
        body: { action: 'execute_sync_cycle' }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const session = response.data.session;
      
      toast({
        title: 'Sync Cycle Completed',
        description: `Updated ${session.entities_updated} officials from ${session.sources_synced.length} sources`
      });

      // Reload status after cycle
      await loadStatus();
    } catch (error: any) {
      toast({
        title: 'Sync Cycle Failed',
        description: error.message || 'Failed to execute sync cycle',
        variant: 'destructive'
      });
    } finally {
      setIsExecutingSync(false);
    }
  };

  // Update transparency settings
  const updateTransparencySettings = async (showFallback: boolean) => {
    try {
      const response = await supabase.functions.invoke('civic-auto-sync-engine', {
        body: { 
          action: 'update_transparency', 
          show_fallback_to_public: showFallback 
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setTransparencyToggle(showFallback);
      
      toast({
        title: 'Transparency Settings Updated',
        description: showFallback 
          ? 'Fallback data is now visible to the public'
          : 'Fallback data is hidden from public view'
      });

      await loadStatus();
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update transparency settings',
        variant: 'destructive'
      });
    }
  };

  // Reset source sync status
  const resetSourceSync = async (source: string) => {
    try {
      const response = await supabase.functions.invoke('civic-auto-sync-engine', {
        body: { action: 'reset_source', source }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: 'Source Reset',
        description: `${source} sync status has been reset`
      });

      await loadStatus();
    } catch (error: any) {
      toast({
        title: 'Reset Failed',
        description: error.message || `Failed to reset ${source}`,
        variant: 'destructive'
      });
    }
  };

  // Load status on component mount and set up auto-refresh
  useEffect(() => {
    loadStatus();
    
    if (autoRefresh) {
      const interval = setInterval(loadStatus, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'degraded': return 'secondary';
      case 'failing': return 'destructive';
      case 'disabled': return 'outline';
      default: return 'outline';
    }
  };

  const getSyncStatusIcon = (status: string) => {
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
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading sync engine status...</span>
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
            <RotateCcw className="h-6 w-6" />
            Civic Auto-Sync Engine
          </h2>
          <p className="text-muted-foreground">
            Automated synchronization with government data sources
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
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={executeSync} 
            disabled={isExecutingSync}
          >
            {isExecutingSync ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Sync
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
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {status.engine_status}
                </div>
                <p className="text-xs text-muted-foreground">
                  Automatic operation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified Officials</CardTitle>
                <Shield className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {status.summary.verified_officials}/{status.summary.total_officials}
                </div>
                <p className="text-xs text-muted-foreground">
                  Fully verified profiles
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fallback Data</CardTitle>
                <Users className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {status.summary.fallback_officials}
                </div>
                <p className="text-xs text-muted-foreground">
                  Using fallback defaults
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Missing Data</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {status.summary.missing_data_officials}
                </div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Transparency Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {transparencyToggle ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                Public Transparency Control
              </CardTitle>
              <CardDescription>
                Control whether fallback data is visible to the public
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show fallback data to public</p>
                  <p className="text-sm text-muted-foreground">
                    When enabled, fallback data is visible. When disabled, shows verification message.
                  </p>
                </div>
                <Switch 
                  checked={transparencyToggle}
                  onCheckedChange={updateTransparencySettings}
                />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="sources" className="space-y-4">
            <TabsList>
              <TabsTrigger value="sources">Sync Sources</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Sync Sources Tab */}
            <TabsContent value="sources">
              <div className="grid gap-4">
                {status.sync_sources.map((source) => (
                  <Card key={source.source}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getSyncStatusIcon(source.sync_status)}
                          <div>
                            <CardTitle className="capitalize">{source.source}</CardTitle>
                            <CardDescription>
                              {source.entity_type.replace('_', ' ')} • Last sync: {formatTimestamp(source.last_synced)}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getSyncStatusColor(source.sync_status)}>
                            {source.sync_status}
                          </Badge>
                          {source.sync_status === 'failing' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => resetSourceSync(source.source)}
                            >
                              <ResetIcon className="h-4 w-4 mr-2" />
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
                            <span>Sync Frequency</span>
                            <span className="font-medium">{source.sync_frequency_hours}h</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Consecutive Failures</span>
                            <span className="font-medium">{source.consecutive_failures}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Auto Fallback</span>
                            <Badge variant={source.auto_fallback ? 'default' : 'outline'}>
                              {source.auto_fallback ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Entities Found</span>
                            <span className="font-medium">{source.entities_found}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Updated</span>
                            <span className="font-medium">{source.entities_updated}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>With Fallback</span>
                            <span className="font-medium">{source.entities_with_fallback}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Status</span>
                            <Badge variant={source.is_active ? 'default' : 'outline'}>
                              {source.is_active ? 'Active' : 'Disabled'}
                            </Badge>
                          </div>
                          {source.consecutive_failures > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Source experiencing issues. Next sync in {source.sync_frequency_hours * (source.consecutive_failures + 1)}h.
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
                  <CardTitle>Recent Sync Activity</CardTitle>
                  <CardDescription>
                    Latest synchronization attempts and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {status.recent_activity.slice(0, 10).map((activity, index) => (
                      <div key={activity.id || index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{activity.sync_type}</Badge>
                            <span className="text-sm font-medium">
                              {activity.source} - {activity.action}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(activity.created_at)}
                          </span>
                        </div>
                        
                        {activity.metadata && (
                          <div className="text-sm text-muted-foreground">
                            {activity.action === 'sync_completed' ? (
                              <div>
                                Found: {activity.metadata.entities_found}, 
                                Updated: {activity.metadata.entities_updated},
                                Fallbacks: {activity.metadata.fallbacks_applied}
                              </div>
                            ) : (
                              <div>
                                Status: {activity.metadata.status}
                                {activity.metadata.error && ` - ${activity.metadata.error}`}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {status.recent_activity.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No recent activity found. Run a sync cycle to see activity logs.
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
                  <CardTitle>Sync Engine Configuration</CardTitle>
                  <CardDescription>
                    Government data source settings and fallback controls
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="font-medium">Automatic Scheduling</h4>
                      <p className="text-sm text-muted-foreground">
                        The sync engine runs automatically every week via cron job.
                        Individual sources have adaptive intervals based on success rate.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Fallback Data Handling</h4>
                      <p className="text-sm text-muted-foreground">
                        When official data is missing or broken, the system automatically applies
                        fallback defaults. This ensures no profiles appear empty to users.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Verification Status</h4>
                      <p className="text-sm text-muted-foreground">
                        All officials receive verification flags indicating data source reliability.
                        High-confidence matches are auto-verified; others require admin review.
                      </p>
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