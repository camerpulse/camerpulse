import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  RefreshCw, 
  Settings,
  TrendingUp,
  Users,
  Zap,
  Calendar,
  ExternalLink
} from "lucide-react";

interface ChangeLog {
  id: string;
  change_type: string;
  official_name: string;
  change_description: string;
  source_type: string;
  source_url?: string;
  detected_at: string;
  processed: boolean;
  admin_reviewed: boolean;
  admin_notes?: string;
  previous_data?: any;
  new_data?: any;
}

interface MonitoringSource {
  id: string;
  source_name: string;
  source_type: string;
  base_url: string;
  is_active: boolean;
  check_frequency_hours: number;
  last_check_at?: string;
  last_successful_check_at?: string;
  total_checks: number;
  successful_checks: number;
  monitoring_rules: any;
}

export const GovChangeTracker: React.FC = () => {
  const [changes, setChanges] = useState<ChangeLog[]>([]);
  const [sources, setSources] = useState<MonitoringSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedChange, setSelectedChange] = useState<ChangeLog | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadChangeLog();
    loadMonitoringSources();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadChangeLog();
        loadMonitoringSources();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadChangeLog = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('gov-change-tracker', {
        body: { action: 'get_change_log' }
      });

      if (error) throw error;

      if (data?.success) {
        setChanges(data.changes);
      }
    } catch (error) {
      console.error('Error loading change log:', error);
      toast({
        title: "Error",
        description: "Failed to load change log",
        variant: "destructive"
      });
    }
  };

  const loadMonitoringSources = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('gov-change-tracker', {
        body: { action: 'get_monitoring_status' }
      });

      if (error) throw error;

      if (data?.success) {
        setSources(data.sources);
      }
    } catch (error) {
      console.error('Error loading monitoring sources:', error);
    }
  };

  const runMonitoring = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gov-change-tracker', {
        body: { action: 'monitor_changes' }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Monitoring Complete",
          description: `Detected ${data.changes_detected} changes from ${data.sources_checked} sources`,
        });
        loadChangeLog();
        loadMonitoringSources();
      }
    } catch (error) {
      console.error('Error running monitoring:', error);
      toast({
        title: "Error",
        description: "Failed to run monitoring",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processChange = async (changeId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('gov-change-tracker', {
        body: { 
          action: 'process_change',
          change_id: changeId,
          admin_notes: adminNotes
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Success",
          description: "Change processed successfully",
        });
        setSelectedChange(null);
        setAdminNotes('');
        loadChangeLog();
      }
    } catch (error) {
      console.error('Error processing change:', error);
      toast({
        title: "Error",
        description: "Failed to process change",
        variant: "destructive"
      });
    }
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'new_official': return <Users className="h-4 w-4 text-green-500" />;
      case 'removed_official': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'role_switch': return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'party_change': return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case 'deceased_status': return <Activity className="h-4 w-4 text-gray-500" />;
      case 'data_update': return <Zap className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getChangeTypeBadge = (type: string) => {
    const variants: any = {
      new_official: 'default',
      removed_official: 'destructive',
      role_switch: 'secondary',
      party_change: 'outline',
      deceased_status: 'secondary',
      data_update: 'default'
    };
    return variants[type] || 'default';
  };

  const getSourceBadge = (source: string) => {
    const colors: any = {
      MINAT: 'bg-blue-100 text-blue-800',
      PRC: 'bg-purple-100 text-purple-800',
      Senate: 'bg-green-100 text-green-800',
      AssNat: 'bg-orange-100 text-orange-800',
      Admin: 'bg-gray-100 text-gray-800',
      Auto: 'bg-yellow-100 text-yellow-800'
    };
    return colors[source] || 'bg-gray-100 text-gray-800';
  };

  const recentChanges = changes.slice(0, 5);
  const unprocessedChanges = changes.filter(c => !c.processed);
  const processingRate = changes.length > 0 ? (changes.filter(c => c.processed).length / changes.length) * 100 : 0;
  const activeSources = sources.filter(s => s.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Government Change Tracker</h2>
          <p className="text-muted-foreground">
            Real-time monitoring of appointments, elections, removals, and government changes
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh">Auto Refresh</Label>
          </div>
          <Button onClick={runMonitoring} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Monitoring...
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Run Monitor
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Changes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{changes.length}</div>
            <p className="text-xs text-muted-foreground">
              {recentChanges.length} in last check
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unprocessedChanges.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting admin review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSources.length}</div>
            <p className="text-xs text-muted-foreground">
              of {sources.length} total sources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Changes processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="changes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="changes">Recent Changes</TabsTrigger>
          <TabsTrigger value="sources">Monitoring Sources</TabsTrigger>
          <TabsTrigger value="review">Admin Review</TabsTrigger>
        </TabsList>

        <TabsContent value="changes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Latest Government Changes</CardTitle>
              <CardDescription>
                Real-time tracking of appointments, elections, and removals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {changes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No changes detected yet. Run monitoring to check for updates.
                </div>
              ) : (
                <div className="space-y-4">
                  {changes.map((change) => (
                    <div
                      key={change.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        {getChangeTypeIcon(change.change_type)}
                        <div>
                          <div className="font-medium">{change.official_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {change.change_description}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge 
                              variant={getChangeTypeBadge(change.change_type)}
                              className="text-xs"
                            >
                              {change.change_type.replace('_', ' ')}
                            </Badge>
                            <Badge 
                              className={`text-xs ${getSourceBadge(change.source_type)}`}
                            >
                              {change.source_type}
                            </Badge>
                            {change.source_url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={change.source_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {new Date(change.detected_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(change.detected_at).toLocaleTimeString()}
                        </div>
                        {change.processed ? (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Processed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs mt-1">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Sources</CardTitle>
              <CardDescription>
                Government websites and sources being monitored for changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{source.source_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {source.base_url}
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>Checks every {source.check_frequency_hours}h</span>
                        <span>
                          Success rate: {source.total_checks > 0 
                            ? Math.round((source.successful_checks / source.total_checks) * 100)
                            : 0}%
                        </span>
                        {source.last_check_at && (
                          <span>
                            Last check: {new Date(source.last_check_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={source.is_active ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {source.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge 
                        className={`text-xs ${getSourceBadge(source.source_type)}`}
                      >
                        {source.source_type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Review Panel</CardTitle>
              <CardDescription>
                Review and process pending government changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unprocessedChanges.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending changes to review.
                </div>
              ) : (
                <div className="space-y-4">
                  {unprocessedChanges.map((change) => (
                    <div
                      key={change.id}
                      className="p-4 border rounded-lg space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getChangeTypeIcon(change.change_type)}
                          <span className="font-medium">{change.official_name}</span>
                          <Badge 
                            variant={getChangeTypeBadge(change.change_type)}
                            className="text-xs"
                          >
                            {change.change_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <Badge 
                          className={`text-xs ${getSourceBadge(change.source_type)}`}
                        >
                          {change.source_type}
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {change.change_description}
                      </div>

                      {(change.previous_data || change.new_data) && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {change.previous_data && (
                            <div>
                              <div className="font-medium text-red-600">Previous:</div>
                              <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                                {JSON.stringify(change.previous_data, null, 2)}
                              </pre>
                            </div>
                          )}
                          {change.new_data && (
                            <div>
                              <div className="font-medium text-green-600">New:</div>
                              <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                                {JSON.stringify(change.new_data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor={`notes-${change.id}`}>Admin Notes</Label>
                        <Textarea
                          id={`notes-${change.id}`}
                          value={selectedChange?.id === change.id ? adminNotes : ''}
                          onChange={(e) => {
                            setSelectedChange(change);
                            setAdminNotes(e.target.value);
                          }}
                          placeholder="Add review notes..."
                          rows={2}
                        />
                      </div>

                      <Button 
                        onClick={() => processChange(change.id)}
                        className="w-full"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Processed
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};