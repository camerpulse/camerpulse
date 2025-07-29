import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle, Eye, Lock, Activity, TrendingUp, Users, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  highEvents: number;
  mediumEvents: number;
  lowEvents: number;
  todayEvents: number;
  activeThreats: number;
  resolvedThreats: number;
  securityScore: number;
}

interface SecurityEvent {
  id: string;
  action_type: string;
  resource_type: string;
  severity: string;
  timestamp: string;
  details: any;
  user_id?: string;
}

interface ThreatDetection {
  type: string;
  count: number;
  lastDetected: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function SecurityMonitor() {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    highEvents: 0,
    mediumEvents: 0,
    lowEvents: 0,
    todayEvents: 0,
    activeThreats: 0,
    resolvedThreats: 0,
    securityScore: 85
  });
  
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [threatDetections, setThreatDetections] = useState<ThreatDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      // Load security audit logs
      const { data: events, error: eventsError } = await supabase
        .from('security_audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (eventsError) throw eventsError;

      // Calculate metrics
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const calculatedMetrics: SecurityMetrics = {
        totalEvents: events?.length || 0,
        criticalEvents: events?.filter(e => e.severity === 'critical').length || 0,
        highEvents: events?.filter(e => e.severity === 'high').length || 0,
        mediumEvents: events?.filter(e => e.severity === 'medium').length || 0,
        lowEvents: events?.filter(e => e.severity === 'low').length || 0,
        todayEvents: events?.filter(e => new Date(e.timestamp) >= today).length || 0,
        activeThreats: events?.filter(e => 
          ['critical', 'high'].includes(e.severity) && 
          new Date(e.timestamp) > new Date(now.getTime() - 24 * 60 * 60 * 1000)
        ).length || 0,
        resolvedThreats: 0, // This would be calculated based on resolved status
        securityScore: calculateSecurityScore(events || [])
      };

      setMetrics(calculatedMetrics);
      setRecentEvents(events || []);

      // Analyze threat patterns
      const threats = analyzeThreatPatterns(events || []);
      setThreatDetections(threats);

    } catch (error) {
      console.error('Error loading security data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load security data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSecurityScore = (events: SecurityEvent[]): number => {
    if (events.length === 0) return 100;
    
    const recentEvents = events.filter(e => 
      new Date(e.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    const severityWeights = { critical: 20, high: 10, medium: 5, low: 1 };
    const totalPenalty = recentEvents.reduce((sum, event) => {
      return sum + (severityWeights[event.severity as keyof typeof severityWeights] || 0);
    }, 0);
    
    return Math.max(0, 100 - Math.min(totalPenalty, 100));
  };

  const analyzeThreatPatterns = (events: SecurityEvent[]): ThreatDetection[] => {
    const patterns: { [key: string]: ThreatDetection } = {};
    
    events.forEach(event => {
      const threatType = event.action_type;
      if (!patterns[threatType]) {
        patterns[threatType] = {
          type: threatType,
          count: 0,
          lastDetected: event.timestamp,
          severity: event.severity as any
        };
      }
      patterns[threatType].count++;
      if (new Date(event.timestamp) > new Date(patterns[threatType].lastDetected)) {
        patterns[threatType].lastDetected = event.timestamp;
        patterns[threatType].severity = event.severity as any;
      }
    });
    
    return Object.values(patterns).sort((a, b) => b.count - a.count);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Security Monitor</h1>
          <p className="text-muted-foreground">Real-time security monitoring and threat detection</p>
        </div>
        <Button onClick={loadSecurityData} className="gap-2">
          <Activity className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Security Score Alert */}
      {metrics.securityScore < 70 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Security Alert</AlertTitle>
          <AlertDescription>
            Your security score is below the recommended threshold. Please review recent security events.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSecurityScoreColor(metrics.securityScore)}`}>
              {metrics.securityScore}%
            </div>
            <Progress value={metrics.securityScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Based on recent security events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.activeThreats}</div>
            <p className="text-xs text-muted-foreground">
              Critical and high severity events in the last 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.todayEvents}</div>
            <p className="text-xs text-muted-foreground">
              Security events detected today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.criticalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Security Data */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
          <TabsTrigger value="threats">Threat Patterns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>
                Latest security events detected in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No security events detected
                  </p>
                ) : (
                  recentEvents.slice(0, 20).map((event) => (
                    <div key={event.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                          <span className="font-medium">{event.action_type}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {event.resource_type}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {event.details && Object.keys(event.details).length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(event.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threat Detection Patterns</CardTitle>
              <CardDescription>
                Analysis of detected threat patterns and frequencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatDetections.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No threat patterns detected
                  </p>
                ) : (
                  threatDetections.map((threat, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(threat.severity)}>
                            {threat.severity}
                          </Badge>
                          <span className="font-medium">{threat.type}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{threat.count}</div>
                          <div className="text-xs text-muted-foreground">occurrences</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Last detected: {new Date(threat.lastDetected).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Events by Severity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Critical</span>
                    <span className="text-sm font-medium">{metrics.criticalEvents}</span>
                  </div>
                  <Progress value={(metrics.criticalEvents / Math.max(metrics.totalEvents, 1)) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">High</span>
                    <span className="text-sm font-medium">{metrics.highEvents}</span>
                  </div>
                  <Progress value={(metrics.highEvents / Math.max(metrics.totalEvents, 1)) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Medium</span>
                    <span className="text-sm font-medium">{metrics.mediumEvents}</span>
                  </div>
                  <Progress value={(metrics.mediumEvents / Math.max(metrics.totalEvents, 1)) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Low</span>
                    <span className="text-sm font-medium">{metrics.lowEvents}</span>
                  </div>
                  <Progress value={(metrics.lowEvents / Math.max(metrics.totalEvents, 1)) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {metrics.criticalEvents > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Address {metrics.criticalEvents} critical security events immediately
                      </AlertDescription>
                    </Alert>
                  )}
                  {metrics.securityScore < 80 && (
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Security score is below 80%. Review recent events and strengthen security measures.
                      </AlertDescription>
                    </Alert>
                  )}
                  {metrics.activeThreats > 5 && (
                    <Alert>
                      <Lock className="h-4 w-4" />
                      <AlertDescription>
                        High number of active threats detected. Consider implementing additional security controls.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}