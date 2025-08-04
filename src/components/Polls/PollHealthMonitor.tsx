import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  TrendingDown,
  Settings,
  Users
} from 'lucide-react';

interface HealthCheck {
  poll_id: string;
  poll_title: string;
  health_status: 'healthy' | 'warning' | 'critical';
  issues_found: string[];
  recommendations: string[];
}

interface PollHealthMonitorProps {
  pollId?: string;
  showAllPolls?: boolean;
}

export const PollHealthMonitor: React.FC<PollHealthMonitorProps> = ({
  pollId,
  showAllPolls = false
}) => {
  const { toast } = useToast();
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    runHealthCheck();
  }, [pollId, showAllPolls]);

  const runHealthCheck = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('run_poll_health_checks');

      if (error) throw error;

      let filteredData = (data || []).map((check: any) => ({
        ...check,
        health_status: check.health_status as 'healthy' | 'warning' | 'critical'
      }));
      
      // Filter by specific poll if pollId is provided
      if (pollId && !showAllPolls) {
        filteredData = filteredData.filter((check) => check.poll_id === pollId);
      }

      setHealthChecks(filteredData);
    } catch (error) {
      console.error('Error running health check:', error);
      toast({
        title: "Error",
        description: "Failed to run poll health check",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshHealthCheck = async () => {
    setRefreshing(true);
    await runHealthCheck();
    setRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Healthy</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Warning</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getIssueIcon = (issue: string) => {
    if (issue.toLowerCase().includes('engagement')) {
      return <TrendingDown className="w-4 h-4 text-orange-500" />;
    }
    if (issue.toLowerCase().includes('fraud')) {
      return <Shield className="w-4 h-4 text-red-500" />;
    }
    if (issue.toLowerCase().includes('settings')) {
      return <Settings className="w-4 h-4 text-blue-500" />;
    }
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Poll Health Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-2 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (healthChecks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Poll Health Monitor
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshHealthCheck}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Polls Healthy</h3>
            <p className="text-muted-foreground">
              No active polls require attention at this time
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary stats
  const healthyCount = healthChecks.filter(check => check.health_status === 'healthy').length;
  const warningCount = healthChecks.filter(check => check.health_status === 'warning').length;
  const criticalCount = healthChecks.filter(check => check.health_status === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Poll Health Monitor
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshHealthCheck}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAllPolls && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{healthyCount}</div>
                <div className="text-sm text-muted-foreground">Healthy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
                <div className="text-sm text-muted-foreground">Warning</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
                <div className="text-sm text-muted-foreground">Critical</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Check Results */}
      <div className="space-y-4">
        {healthChecks.map((check) => (
          <Card key={check.poll_id} className="border-l-4 border-l-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.health_status)}
                  <div>
                    <h3 className="font-semibold">{check.poll_title}</h3>
                    <p className="text-sm text-muted-foreground">Poll ID: {check.poll_id.slice(0, 8)}...</p>
                  </div>
                </div>
                {getStatusBadge(check.health_status)}
              </div>
            </CardHeader>
            
            {(check.issues_found.length > 0 || check.recommendations.length > 0) && (
              <CardContent className="pt-0">
                {/* Issues Found */}
                {check.issues_found.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      Issues Detected
                    </h4>
                    <div className="space-y-2">
                      {check.issues_found.map((issue, index) => (
                        <Alert key={index} className="border-l-4 border-l-red-500">
                          <div className="flex items-start gap-2">
                            {getIssueIcon(issue)}
                            <AlertDescription className="text-sm">
                              {issue}
                            </AlertDescription>
                          </div>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {check.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Recommended Actions
                    </h4>
                    <div className="space-y-2">
                      {check.recommendations.map((recommendation, index) => (
                        <Alert key={index} className="border-l-4 border-l-blue-500">
                          <AlertDescription className="text-sm">
                            {recommendation}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Action Buttons for Critical Issues */}
      {criticalCount > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 mb-2">
                  Critical Issues Require Immediate Attention
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  {criticalCount} poll{criticalCount > 1 ? 's have' : ' has'} critical issues that may affect voting integrity.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive">
                    View Detailed Report
                  </Button>
                  <Button size="sm" variant="outline">
                    Configure Fraud Protection
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};