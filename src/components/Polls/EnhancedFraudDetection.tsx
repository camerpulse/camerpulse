import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Monitor,
  Globe,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';

interface FraudAlert {
  id: string;
  poll_id: string;
  alert_type: string;
  alert_severity: string;
  alert_message: string;
  vote_count: number;
  time_window: string;
  detected_at: string;
  acknowledged: boolean;
}

interface FraudPattern {
  fraud_type: string;
  severity: string;
  confidence_score: number;
  evidence_count: number;
  description: string;
}

interface EnhancedFraudDetectionProps {
  pollId: string;
  pollTitle: string;
  isCreator: boolean;
}

export const EnhancedFraudDetection: React.FC<EnhancedFraudDetectionProps> = ({
  pollId,
  pollTitle,
  isCreator
}) => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [patterns, setPatterns] = useState<FraudPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchFraudData();
  }, [pollId]);

  const fetchFraudData = async () => {
    try {
      setLoading(true);

      // Fetch fraud alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('poll_fraud_alerts')
        .select('*')
        .eq('poll_id', pollId)
        .order('detected_at', { ascending: false });

      if (alertsError) throw alertsError;

      // Fetch fraud patterns
      const { data: patternsData, error: patternsError } = await supabase
        .rpc('detect_advanced_fraud_patterns', { p_poll_id: pollId });

      if (patternsError) throw patternsError;

      setAlerts(alertsData || []);
      setPatterns(patternsData || []);
    } catch (error) {
      console.error('Error fetching fraud data:', error);
      toast({
        title: "Error",
        description: "Failed to load fraud detection data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runFraudScan = async () => {
    try {
      setScanning(true);

      const { data, error } = await supabase
        .rpc('detect_advanced_fraud_patterns', { p_poll_id: pollId });

      if (error) throw error;

      setPatterns(data || []);
      
      toast({
        title: "Fraud Scan Complete",
        description: `Found ${data?.length || 0} potential patterns`,
      });

      // Refresh alerts after scan
      await fetchFraudData();
    } catch (error) {
      console.error('Error running fraud scan:', error);
      toast({
        title: "Scan Failed",
        description: "Failed to run fraud detection scan",
        variant: "destructive"
      });
    } finally {
      setScanning(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('poll_fraud_alerts')
        .update({ acknowledged: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));

      toast({
        title: "Alert Acknowledged",
        description: "Fraud alert has been marked as reviewed"
      });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast({
        title: "Error",
        description: "Failed to acknowledge alert",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Eye className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPatternIcon = (patternType: string) => {
    switch (patternType) {
      case 'rapid_voting':
        return <TrendingUp className="w-4 h-4" />;
      case 'device_spoofing':
        return <Monitor className="w-4 h-4" />;
      case 'burst_voting':
        return <Clock className="w-4 h-4" />;
      case 'suspicious_user_agent':
        return <Globe className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const criticalAlerts = alerts.filter(alert => alert.alert_severity === 'critical');
  const highConfidencePatterns = patterns.filter(pattern => pattern.confidence_score >= 0.8);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Fraud Detection System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
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

  return (
    <div className="space-y-6">
      {/* Header with Quick Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Enhanced Fraud Detection
            </CardTitle>
            <Button
              onClick={runFraudScan}
              disabled={scanning || !isCreator}
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
              {scanning ? 'Scanning...' : 'Run Scan'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Real-time fraud detection for "{pollTitle}"
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{unacknowledgedAlerts.length}</div>
              <div className="text-sm text-muted-foreground">Active Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{criticalAlerts.length}</div>
              <div className="text-sm text-muted-foreground">Critical Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{patterns.length}</div>
              <div className="text-sm text-muted-foreground">Patterns Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{highConfidencePatterns.length}</div>
              <div className="text-sm text-muted-foreground">High Confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-800">
            <strong>Critical fraud alerts detected!</strong> {criticalAlerts.length} high-severity issue{criticalAlerts.length > 1 ? 's require' : ' requires'} immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">
            Fraud Alerts ({unacknowledgedAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="patterns">
            Detected Patterns ({patterns.length})
          </TabsTrigger>
          <TabsTrigger value="settings">
            Protection Settings
          </TabsTrigger>
        </TabsList>

        {/* Fraud Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Fraud Alerts</h3>
                <p className="text-muted-foreground">
                  All voting activity appears normal for this poll
                </p>
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert) => (
              <Card key={alert.id} className={alert.acknowledged ? 'opacity-60' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(alert.alert_severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getSeverityColor(alert.alert_severity)}>
                            {alert.alert_severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {alert.alert_type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {alert.acknowledged && (
                            <Badge variant="secondary">ACKNOWLEDGED</Badge>
                          )}
                        </div>
                        <p className="font-medium mb-1">{alert.alert_message}</p>
                        <p className="text-sm text-muted-foreground">
                          Detected {new Date(alert.detected_at).toLocaleString()} • 
                          {alert.vote_count} votes affected • 
                          Time window: {alert.time_window}
                        </p>
                      </div>
                    </div>
                    {!alert.acknowledged && isCreator && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Detected Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          {patterns.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Suspicious Patterns</h3>
                <p className="text-muted-foreground">
                  Advanced analysis found no concerning voting patterns
                </p>
              </CardContent>
            </Card>
          ) : (
            patterns.map((pattern, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    {getPatternIcon(pattern.fraud_type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityColor(pattern.severity)}>
                          {pattern.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {pattern.fraud_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="font-medium mb-2">{pattern.description}</p>
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Confidence Score</span>
                            <span>{(pattern.confidence_score * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={pattern.confidence_score * 100} className="h-2" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Evidence count: {pattern.evidence_count} instances
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Protection Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Fraud Protection Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Advanced fraud protection settings are managed through the main poll settings. 
                This includes rate limiting, CAPTCHA requirements, and device fingerprinting.
              </p>
              <Button variant="outline" className="w-full">
                Configure Protection Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};