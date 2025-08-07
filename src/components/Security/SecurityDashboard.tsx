import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { Shield, AlertTriangle, XCircle, CheckCircle, Clock } from 'lucide-react';

/**
 * Security monitoring dashboard for admin users
 */
export const SecurityDashboard: React.FC = () => {
  const {
    alerts,
    metrics,
    clearAlerts,
    resetMetrics,
    checkBrowserSecurity
  } = useSecurityMonitoring();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getAlertVariant = (type: string): "default" | "destructive" => {
    switch (type) {
      case 'critical':
        return 'destructive';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Security Dashboard</h2>
        </div>
        <div className="space-x-2">
          <Button onClick={checkBrowserSecurity} variant="outline" size="sm">
            Run Security Check
          </Button>
          <Button onClick={resetMetrics} variant="outline" size="sm">
            Reset Metrics
          </Button>
          <Button onClick={clearAlerts} variant="outline" size="sm">
            Clear Alerts
          </Button>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.failedLoginAttempts}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activities</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.suspiciousActivities}</div>
            <p className="text-xs text-muted-foreground">Detected patterns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CSP Violations</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cspViolations}</div>
            <p className="text-xs text-muted-foreground">Policy violations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Check</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {new Date(metrics.lastSecurityCheck).toLocaleTimeString()}
            </div>
            <p className="text-xs text-muted-foreground">Security scan</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Alerts</CardTitle>
          <CardDescription>
            Latest security events and warnings ({alerts.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">No security alerts at this time</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {alerts.slice(0, 10).map((alert) => (
                <Alert key={alert.id} variant={getAlertVariant(alert.type)}>
                  <div className="flex items-start space-x-2">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <AlertTitle className="flex items-center justify-between">
                        <span>{alert.message}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
                            {alert.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </AlertTitle>
                      {alert.details && (
                        <AlertDescription className="mt-2">
                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                            {JSON.stringify(alert.details, null, 2)}
                          </pre>
                        </AlertDescription>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};