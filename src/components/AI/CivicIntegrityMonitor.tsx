import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Eye, EyeOff, Scan, AlertTriangle, Clock, CheckCircle, XCircle, FileText, Users } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface IntegrityAlert {
  id: string;
  alert_type: string;
  alert_title: string;
  alert_description: string;
  target_entity_type: string;
  target_entity_name: string;
  severity_level: string;
  risk_score: number;
  status: string;
  is_public_visible: boolean;
  created_at: string;
  source_data: any;
  civil_implications?: string;
}

interface IntegrityStats {
  active_alerts: number;
  high_risk_alerts: number;
  pending_review: number;
  public_visible: number;
  recent_alerts: number;
  scan_sources_count: number;
}

export function CivicIntegrityMonitor() {
  const [stats, setStats] = useState<IntegrityStats | null>(null);
  const [alerts, setAlerts] = useState<IntegrityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<IntegrityAlert | null>(null);
  const [reviewAction, setReviewAction] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadStats(), loadAlerts()]);
    } catch (error) {
      console.error('Error loading integrity monitor data:', error);
      toast({
        title: "Error",
        description: "Failed to load integrity monitor data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    const { data, error } = await supabase.functions.invoke('civic-integrity-monitor', {
      body: { action: 'get_stats' }
    });

    if (error) throw error;
    setStats(data);
  };

  const loadAlerts = async () => {
    const { data, error } = await supabase.functions.invoke('civic-integrity-monitor', {
      body: { action: 'get_alerts' }
    });

    if (error) throw error;
    setAlerts(data.alerts || []);
  };

  const runScan = async (scanType?: string) => {
    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('civic-integrity-monitor', {
        body: { action: 'scan', scanType }
      });

      if (error) throw error;

      toast({
        title: "Scan Completed",
        description: `Generated ${data.alertsGenerated} new alerts from ${data.scannedSources.length} sources`,
      });

      await loadData();
    } catch (error) {
      console.error('Error running scan:', error);
      toast({
        title: "Scan Failed",
        description: "Failed to run integrity scan",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const reviewAlert = async () => {
    if (!selectedAlert || !reviewAction) return;

    try {
      const { error } = await supabase.functions.invoke('civic-integrity-monitor', {
        body: {
          action: 'review_alert',
          alertId: selectedAlert.id,
          reviewAction,
          reviewNotes
        }
      });

      if (error) throw error;

      toast({
        title: "Alert Reviewed",
        description: `Alert ${reviewAction === 'approve_public' ? 'approved for public display' : reviewAction}`,
      });

      setSelectedAlert(null);
      setReviewAction('');
      setReviewNotes('');
      await loadData();
    } catch (error) {
      console.error('Error reviewing alert:', error);
      toast({
        title: "Review Failed",
        description: "Failed to review alert",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-orange-500/10 text-orange-700 border-orange-200';
      case 'critical': return 'bg-red-500/10 text-red-700 border-red-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'behavioral_inconsistency': return <Users className="h-4 w-4" />;
      case 'spending_red_flag': return <FileText className="h-4 w-4" />;
      case 'broken_promise': return <XCircle className="h-4 w-4" />;
      case 'power_shift': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const formatAlertType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>Loading Civic Integrity Monitor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Civic Integrity Monitor
          </h2>
          <p className="text-muted-foreground">
            Internal monitoring system for corruption patterns and integrity violations
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-red-500/10 text-red-700 border-red-200">
            <EyeOff className="h-3 w-3 mr-1" />
            Internal Only
          </Badge>
          <Button
            onClick={() => runScan()}
            disabled={isScanning}
            className="flex items-center gap-2"
          >
            <Scan className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Run Scan'}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_alerts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.recent_alerts} new this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.high_risk_alerts}</div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending_review}</div>
              <p className="text-xs text-muted-foreground">
                {stats.public_visible} public visible
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Recent Alerts</TabsTrigger>
          <TabsTrigger value="scanning">Scan Sources</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Integrity Alerts</h3>
                  <p className="text-muted-foreground mb-4">
                    No integrity violations have been detected yet. Run a scan to check for issues.
                  </p>
                  <Button onClick={() => runScan()} disabled={isScanning}>
                    <Scan className="h-4 w-4 mr-2" />
                    Run First Scan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getAlertTypeIcon(alert.alert_type)}
                        <CardTitle className="text-lg">{alert.alert_title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(alert.severity_level)}>
                          {alert.severity_level.toUpperCase()}
                        </Badge>
                        <Badge variant={alert.is_public_visible ? "default" : "secondary"}>
                          {alert.is_public_visible ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                          {alert.is_public_visible ? 'Public' : 'Internal'}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{formatAlertType(alert.alert_type)}</span>
                        <span>•</span>
                        <span>{alert.target_entity_name}</span>
                        <span>•</span>
                        <span>Risk: {alert.risk_score}/100</span>
                        <span>•</span>
                        <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{alert.alert_description}</p>
                    
                    {alert.civil_implications && (
                      <Alert className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Civil Implications</AlertTitle>
                        <AlertDescription>{alert.civil_implications}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedAlert(alert)}
                          >
                            Review Alert
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Review Integrity Alert</DialogTitle>
                            <DialogDescription>
                              Decide how to handle this integrity alert
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Review Action</label>
                              <Select value={reviewAction} onValueChange={setReviewAction}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select action" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="approve_public">Approve for Public Display</SelectItem>
                                  <SelectItem value="dismiss">Dismiss Alert</SelectItem>
                                  <SelectItem value="escalate">Escalate for Investigation</SelectItem>
                                  <SelectItem value="investigate">Mark for Internal Investigation</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="text-sm font-medium">Review Notes</label>
                              <Textarea
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder="Add notes about your review decision..."
                                className="mt-1"
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                                Cancel
                              </Button>
                              <Button onClick={reviewAlert} disabled={!reviewAction}>
                                Submit Review
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Badge variant={
                        alert.status === 'pending' ? 'secondary' :
                        alert.status === 'under_review' ? 'default' :
                        alert.status === 'resolved' ? 'outline' : 'destructive'
                      }>
                        <Clock className="h-3 w-3 mr-1" />
                        {alert.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="scanning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scan Sources</CardTitle>
              <CardDescription>
                Data sources being monitored for integrity violations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Promise Tracker
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Monitors broken political promises and timeline violations
                  </p>
                  <Button size="sm" className="mt-2" onClick={() => runScan('promise_tracker')}>
                    Scan Now
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Budget Database
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Analyzes spending patterns and budget variances
                  </p>
                  <Button size="sm" className="mt-2" onClick={() => runScan('budget_database')}>
                    Scan Now
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Voting Records
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Detects contradictory voting patterns and statements
                  </p>
                  <Button size="sm" className="mt-2" onClick={() => runScan('politician_votes')}>
                    Scan Now
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Appointment Records
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Monitors sudden leadership changes and power shifts
                  </p>
                  <Button size="sm" className="mt-2" onClick={() => runScan('appointment_records')}>
                    Scan Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure the civic integrity monitoring system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Security Notice</AlertTitle>
                <AlertDescription>
                  This system is designed for internal use only. All alerts remain private unless explicitly approved for public display by authorized administrators.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-green-700">✓ Encrypted Storage</h4>
                  <p className="text-sm text-muted-foreground">All integrity data is encrypted at rest</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-green-700">✓ Admin-Only Access</h4>
                  <p className="text-sm text-muted-foreground">Restricted to authorized administrators</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-green-700">✓ Audit Trail</h4>
                  <p className="text-sm text-muted-foreground">All actions are logged and traceable</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-green-700">✓ No Public API</h4>
                  <p className="text-sm text-muted-foreground">No external access or submission vectors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}