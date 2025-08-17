import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Bug, Zap, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ErrorMonitoringManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

interface ErrorEvent {
  id: string;
  error_type: string;
  error_message: string;
  stack_trace: string;
  user_id?: string;
  url: string;
  user_agent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved';
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

interface AlertRule {
  id: string;
  rule_name: string;
  error_type: string;
  threshold_count: number;
  time_window: string;
  severity: string;
  is_active: boolean;
  last_triggered?: string;
}

export const ErrorMonitoringManager: React.FC<ErrorMonitoringManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [errors, setErrors] = useState<ErrorEvent[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<ErrorEvent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (hasPermission('admin:error_monitoring')) {
      fetchErrors();
      fetchAlertRules();
    }
  }, [hasPermission]);

  const fetchErrors = async () => {
    try {
      const { data, error } = await supabase
        .from('system_error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setErrors(data || []);
    } catch (error) {
      console.error('Error fetching errors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch error logs",
        variant: "destructive"
      });
    }
  };

  const fetchAlertRules = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_alert_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlertRules(data || []);
    } catch (error) {
      console.error('Error fetching alert rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveError = async (errorId: string) => {
    try {
      const { error } = await supabase
        .from('system_error_logs')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', errorId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Error marked as resolved"
      });

      logActivity('error_resolved', { error_id: errorId });
      fetchErrors();
    } catch (error) {
      console.error('Error resolving error:', error);
      toast({
        title: "Error",
        description: "Failed to resolve error",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'investigating': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const errorStats = {
    total: errors.length,
    critical: errors.filter(e => e.severity === 'critical').length,
    unresolved: errors.filter(e => e.status !== 'resolved').length,
    resolved: errors.filter(e => e.status === 'resolved').length
  };

  if (!hasPermission('admin:error_monitoring')) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            You don't have permission to access error monitoring.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center">
          <Bug className="h-6 w-6 mr-2 text-red-600" />
          Error Monitoring & Alerting
        </h2>
        <p className="text-muted-foreground">Monitor system errors and configure alerting rules</p>
      </div>

      {/* Error Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Errors</p>
                <p className="text-2xl font-bold">{errorStats.total}</p>
              </div>
              <Bug className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{errorStats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unresolved</p>
                <p className="text-2xl font-bold text-yellow-600">{errorStats.unresolved}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{errorStats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="errors" className="w-full">
        <TabsList>
          <TabsTrigger value="errors">Error Logs</TabsTrigger>
          <TabsTrigger value="alerts">Alert Rules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
              <CardDescription>Latest system errors and exceptions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading errors...</div>
              ) : errors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No errors found. System running smoothly!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {errors.map((error) => (
                    <div
                      key={error.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedError(error)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(error.status)}
                            <Badge className={getSeverityColor(error.severity)}>
                              {error.severity}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {error.error_type}
                            </span>
                          </div>
                          <p className="font-medium mb-1">{error.error_message}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(error.created_at).toLocaleString()} • {error.url}
                          </p>
                        </div>
                        {error.status !== 'resolved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              resolveError(error.id);
                            }}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Rules</CardTitle>
              <CardDescription>Configure automated error alerting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Zap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Alert Rules</h3>
                <p className="text-muted-foreground">
                  Configure thresholds and notification rules for error monitoring
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Analytics</CardTitle>
              <CardDescription>Error trends and patterns analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Analytics</h3>
                <p className="text-muted-foreground">
                  Visualize error trends, patterns, and resolution metrics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Error Detail Modal */}
      {selectedError && (
        <Card className="fixed inset-4 z-50 overflow-auto bg-background border shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Error Details</CardTitle>
              <CardDescription>
                {new Date(selectedError.created_at).toLocaleString()}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedError(null)}
            >
              Close
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Error Type</label>
                <p className="text-sm text-muted-foreground">{selectedError.error_type}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Severity</label>
                <Badge className={getSeverityColor(selectedError.severity)}>
                  {selectedError.severity}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedError.status)}
                  <span className="text-sm">{selectedError.status}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">URL</label>
                <p className="text-sm text-muted-foreground">{selectedError.url}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Error Message</label>
              <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                {selectedError.error_message}
              </div>
            </div>

            {selectedError.stack_trace && (
              <div>
                <label className="text-sm font-medium">Stack Trace</label>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm font-mono overflow-auto max-h-64">
                  <pre>{selectedError.stack_trace}</pre>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">User Agent</label>
              <p className="text-sm text-muted-foreground">{selectedError.user_agent}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};