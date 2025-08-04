import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertTriangle, 
  Shield, 
  Eye, 
  Bell, 
  MapPin,
  TrendingUp,
  Activity,
  Users,
  Phone,
  MessageSquare,
  Lock,
  FileText,
  Zap,
  Siren,
  Target,
  Clock,
  Download,
  Map as MapIcon
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ThreatLevel {
  level: number;
  status: 'calm' | 'sensitive' | 'unrest_risk' | 'critical';
  color: string;
  regions: RegionThreat[];
  lastUpdate: string;
}

interface RegionThreat {
  region: string;
  threatScore: number;
  primaryEmotions: string[];
  incidents: number;
  coordinates?: { lat: number; lng: number };
}

interface EmergencyAlert {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'critical';
  regions: string[];
  alertType: string;
  evidence: string[];
  triggeredBy: string;
  triggeredAt: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

interface SecurityIncident {
  id: string;
  location: string;
  incidentType: 'protest' | 'violence' | 'disinformation' | 'panic';
  emotionalIntensity: number;
  description: string;
  timeDetected: string;
  coordinates?: { lat: number; lng: number };
}

const RedRoomPanel: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>({
    level: 25,
    status: 'calm',
    color: '#10b981',
    regions: [],
    lastUpdate: new Date().toISOString()
  });
  
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);
  const [securityIncidents, setSecurityIncidents] = useState<SecurityIncident[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Alert creation states
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDescription, setAlertDescription] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'high' | 'critical'>('high');
  const [alertRegions, setAlertRegions] = useState<string[]>([]);
  const [alertEvidence, setAlertEvidence] = useState('');
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  
  // Report generation
  const [reportType, setReportType] = useState<'snapshot' | 'regional' | 'situation'>('snapshot');
  const [reportRegion, setReportRegion] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    if (user) {
      checkAuthorization();
      loadThreatData();
      loadEmergencyAlerts();
      loadSecurityIncidents();
      setupRealTimeUpdates();
    }
  }, [user]);

  const checkAuthorization = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();
      
      if (data) {
        setUserRole(data.role);
        // Red Room access limited to admin only (can be extended later)
        setIsAuthorized(data.role === 'admin');
      }
    } catch (error) {
      console.error('Error checking authorization:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadThreatData = async () => {
    try {
      // Calculate composite threat level from various sources
      const [sentimentData, alertsData, influencerData] = await Promise.all([
        supabase
          .from('camerpulse_intelligence_sentiment_logs')
          .select('*')
          .gte('created_at', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()) // Last 6 hours
          .in('threat_level', ['high', 'critical']),
        
        supabase
          .from('camerpulse_intelligence_alerts')
          .select('*')
          .eq('acknowledged', false)
          .in('severity', ['high', 'critical']),
        
        supabase
          .from('camerpulse_intelligence_influencers')
          .select('*')
          .gte('manipulation_risk', 0.7)
      ]);

      // Calculate regional threat scores
      const regionMap = new Map();
      
      sentimentData.data?.forEach(item => {
        const region = item.region_detected || 'Unknown';
        if (!regionMap.has(region)) {
          regionMap.set(region, {
            region,
            threatScore: 0,
            primaryEmotions: [],
            incidents: 0
          });
        }
        
        const regionData = regionMap.get(region)!;
        regionData.incidents += 1;
        
        // Calculate threat score based on sentiment and emotions
        let score = 0;
        if (item.threat_level === 'critical') score += 30;
        else if (item.threat_level === 'high') score += 20;
        
        if (item.emotional_tone?.includes('anger')) score += 15;
        if (item.emotional_tone?.includes('fear')) score += 15;
        if (item.emotional_tone?.includes('panic')) score += 20;
        
        regionData.threatScore = Math.max(regionData.threatScore, score);
        
        // Track primary emotions
        item.emotional_tone?.forEach((emotion: string) => {
          if (!regionData.primaryEmotions.includes(emotion)) {
            regionData.primaryEmotions.push(emotion);
          }
        });
      });

      // Calculate overall threat level
      const regions: RegionThreat[] = Array.from(regionMap.values());
      const maxRegionalThreat = regions.length > 0 ? Math.max(...regions.map((r: RegionThreat) => r.threatScore), 0) : 0;
      const alertCount = alertsData.data?.length || 0;
      const manipulationRisk = influencerData.data?.length || 0;
      
      const overallThreat = Math.min(100, maxRegionalThreat + (alertCount * 5) + (manipulationRisk * 3));
      
      let status: 'calm' | 'sensitive' | 'unrest_risk' | 'critical';
      let color: string;
      
      if (overallThreat >= 80) {
        status = 'critical';
        color = '#ef4444';
      } else if (overallThreat >= 60) {
        status = 'unrest_risk';
        color = '#f97316';
      } else if (overallThreat >= 40) {
        status = 'sensitive';
        color = '#eab308';
      } else {
        status = 'calm';
        color = '#10b981';
      }

      setThreatLevel({
        level: overallThreat,
        status,
        color,
        regions,
        lastUpdate: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error loading threat data:', error);
    }
  };

  const loadEmergencyAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('camerpulse_intelligence_alerts')
        .select('*')
        .in('severity', ['high', 'critical'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        const alerts: EmergencyAlert[] = data.map(alert => ({
          id: alert.id,
          title: alert.title,
          description: alert.description || '',
          severity: alert.severity as 'high' | 'critical',
          regions: alert.affected_regions || [],
          alertType: alert.alert_type,
          evidence: [],
          triggeredBy: alert.acknowledged_by || 'System',
          triggeredAt: alert.created_at,
          status: alert.acknowledged ? 'acknowledged' : 'active'
        }));
        
        setEmergencyAlerts(alerts);
      }
    } catch (error) {
      console.error('Error loading emergency alerts:', error);
    }
  };

  const loadSecurityIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('camerpulse_intelligence_sentiment_logs')
        .select('*')
        .contains('keywords_detected', ['protest', 'violence', 'attack', 'unrest'])
        .gte('created_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()) // Last 12 hours
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        const incidents: SecurityIncident[] = data.map(item => ({
          id: item.id,
          location: `${item.city_detected || 'Unknown'}, ${item.region_detected || 'Unknown'}`,
          incidentType: determineIncidentType(item.keywords_detected || [], item.emotional_tone || []),
          emotionalIntensity: Math.abs(item.sentiment_score || 0) * 100,
          description: item.content_text?.substring(0, 200) + '...' || '',
          timeDetected: item.created_at,
          coordinates: item.coordinates ? JSON.parse(item.coordinates as string) : undefined
        }));
        
        setSecurityIncidents(incidents);
      }
    } catch (error) {
      console.error('Error loading security incidents:', error);
    }
  };

  const determineIncidentType = (keywords: string[], emotions: string[]): SecurityIncident['incidentType'] => {
    if (keywords.some(k => ['violence', 'attack', 'fight'].includes(k.toLowerCase()))) return 'violence';
    if (keywords.some(k => ['protest', 'march', 'demonstration'].includes(k.toLowerCase()))) return 'protest';
    if (emotions.includes('panic') || emotions.includes('fear')) return 'panic';
    return 'disinformation';
  };

  const setupRealTimeUpdates = () => {
    const channel = supabase
      .channel('red-room-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'camerpulse_intelligence_alerts',
          filter: `severity=in.(high,critical)`
        },
        () => {
          loadThreatData();
          loadEmergencyAlerts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'camerpulse_intelligence_sentiment_logs'
        },
        () => {
          loadThreatData();
          loadSecurityIncidents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const triggerEmergencyAlert = async () => {
    if (!alertTitle || !alertDescription) {
      toast({
        title: "Required Fields",
        description: "Please fill in title and description",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create alert in database
      const { error } = await supabase
        .from('camerpulse_intelligence_alerts')
        .insert({
          alert_type: 'emergency_command',
          severity: alertSeverity,
          title: alertTitle,
          description: alertDescription,
          affected_regions: alertRegions,
          auto_generated: false,
          sentiment_data: {
            triggered_by: user?.email,
            evidence: alertEvidence,
            command_level: 'red_room'
          }
        });

      if (error) throw error;

      // Trigger WhatsApp/SMS notifications
      await supabase.functions.invoke('civic-alert-bot', {
        body: {
          action: 'emergency_broadcast',
          alert: {
            title: alertTitle,
            description: alertDescription,
            severity: alertSeverity,
            regions: alertRegions
          }
        }
      });

      // Reset form
      setAlertTitle('');
      setAlertDescription('');
      setAlertRegions([]);
      setAlertEvidence('');
      setShowCreateAlert(false);

      toast({
        title: "🚨 EMERGENCY ALERT TRIGGERED",
        description: "National response teams have been notified",
        variant: "destructive"
      });

      // Reload data
      loadEmergencyAlerts();

    } catch (error) {
      console.error('Error triggering emergency alert:', error);
      toast({
        title: "Error",
        description: "Failed to trigger emergency alert",
        variant: "destructive"
      });
    }
  };

  const generateCrisisReport = async () => {
    setGeneratingReport(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('daily-report-generator', {
        body: {
          action: 'crisis_report',
          report_type: reportType,
          region: reportRegion || null,
          timeframe: '6h'
        }
      });

      if (error) throw error;

      // Download report as PDF
      const blob = new Blob([data.pdf_content], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crisis-report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Report Generated",
        description: "Crisis report has been downloaded"
      });

    } catch (error) {
      console.error('Error generating crisis report:', error);
      toast({
        title: "Error",
        description: "Failed to generate crisis report",
        variant: "destructive"
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const getThreatStatusIcon = () => {
    switch (threatLevel.status) {
      case 'critical': return <AlertTriangle className="h-8 w-8 text-red-500" />;
      case 'unrest_risk': return <Shield className="h-8 w-8 text-orange-500" />;
      case 'sensitive': return <Eye className="h-8 w-8 text-yellow-500" />;
      default: return <Bell className="h-8 w-8 text-green-500" />;
    }
  };

  const getThreatStatusLabel = () => {
    switch (threatLevel.status) {
      case 'critical': return 'CRITICAL THREAT';
      case 'unrest_risk': return 'UNREST RISK';
      case 'sensitive': return 'SENSITIVE';
      default: return 'CALM';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">🔴 RED ROOM ACCESS DENIED</h3>
          <p className="text-muted-foreground">
            This command interface is restricted to authorized national security personnel only.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Red Room Header */}
      <Card className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Siren className="h-10 w-10" />
              <div>
                <h1 className="text-2xl font-bold">🔴 RED ROOM COMMAND CENTER</h1>
                <p className="text-red-100">National Civic Threat Response Interface</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-red-200">Security Clearance: {userRole?.toUpperCase()}</div>
              <div className="text-xs text-red-300">Last Update: {new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Threat Level Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`border-4 ${threatLevel.status === 'critical' ? 'border-red-500 bg-red-50' : threatLevel.status === 'unrest_risk' ? 'border-orange-500 bg-orange-50' : threatLevel.status === 'sensitive' ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'}`}>
          <CardContent className="p-6 text-center">
            {getThreatStatusIcon()}
            <h3 className="text-2xl font-bold mt-2" style={{ color: threatLevel.color }}>
              {getThreatStatusLabel()}
            </h3>
            <div className="text-4xl font-mono font-bold mt-2" style={{ color: threatLevel.color }}>
              {threatLevel.level}/100
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Composite Threat Score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 mx-auto text-orange-500" />
            <h3 className="text-lg font-semibold mt-2">Active Alerts</h3>
            <div className="text-3xl font-bold text-orange-500 mt-2">
              {emergencyAlerts.filter(a => a.status === 'active').length}
            </div>
            <p className="text-sm text-muted-foreground">
              Requiring Response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="h-8 w-8 mx-auto text-blue-500" />
            <h3 className="text-lg font-semibold mt-2">Security Incidents</h3>
            <div className="text-3xl font-bold text-blue-500 mt-2">
              {securityIncidents.length}
            </div>
            <p className="text-sm text-muted-foreground">
              Last 12 Hours
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
          <TabsTrigger value="alerts">🚨 Emergency Alerts</TabsTrigger>
          <TabsTrigger value="incidents">🗺️ Incident Map</TabsTrigger>
          <TabsTrigger value="reports">📄 Crisis Reports</TabsTrigger>
          <TabsTrigger value="command">⚡ Command Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Regional Threat Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {threatLevel.regions.map((region, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{region.region}</h4>
                          <div className="flex gap-1 mt-1">
                            {region.primaryEmotions.slice(0, 3).map((emotion, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {emotion}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${region.threatScore >= 60 ? 'text-red-500' : region.threatScore >= 40 ? 'text-orange-500' : 'text-green-500'}`}>
                            {region.threatScore}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {region.incidents} incidents
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Emergency Alert Management</h3>
              <Dialog open={showCreateAlert} onOpenChange={setShowCreateAlert}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Siren className="h-4 w-4 mr-2" />
                    TRIGGER EMERGENCY ALERT
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>🚨 Create Emergency Alert</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Alert Title"
                      value={alertTitle}
                      onChange={(e) => setAlertTitle(e.target.value)}
                    />
                    <Textarea
                      placeholder="Alert Description"
                      value={alertDescription}
                      onChange={(e) => setAlertDescription(e.target.value)}
                    />
                    <Select value={alertSeverity} onValueChange={(value: 'high' | 'critical') => setAlertSeverity(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">🟠 High Priority</SelectItem>
                        <SelectItem value="critical">🔴 Critical Threat</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder="Evidence/Intelligence Links"
                      value={alertEvidence}
                      onChange={(e) => setAlertEvidence(e.target.value)}
                    />
                    <Button onClick={triggerEmergencyAlert} className="w-full" variant="destructive">
                      TRIGGER NATIONAL ALERT
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-3">
                {emergencyAlerts.map((alert) => (
                  <Card key={alert.id} className={`border-l-4 ${alert.severity === 'critical' ? 'border-red-500' : 'border-orange-500'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={alert.severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{alert.alertType}</Badge>
                            <Badge variant={alert.status === 'active' ? 'destructive' : 'default'}>
                              {alert.status.toUpperCase()}
                            </Badge>
                          </div>
                          <h4 className="font-semibold mb-1">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(alert.triggeredAt).toLocaleString()}
                            <span>• By: {alert.triggeredBy}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="incidents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapIcon className="h-5 w-5" />
                Security Incident Heat Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {securityIncidents.map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant={
                              incident.incidentType === 'violence' ? 'destructive' :
                              incident.incidentType === 'protest' ? 'default' :
                              incident.incidentType === 'panic' ? 'secondary' : 'outline'
                            }
                          >
                            {incident.incidentType.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium">{incident.location}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{incident.description}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(incident.timeDetected).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${incident.emotionalIntensity >= 70 ? 'text-red-500' : incident.emotionalIntensity >= 50 ? 'text-orange-500' : 'text-yellow-500'}`}>
                          {incident.emotionalIntensity.toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Intensity</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Crisis Report Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={reportType} onValueChange={(value: 'snapshot' | 'regional' | 'situation') => setReportType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="snapshot">📊 Civic Unrest Snapshot (6hrs)</SelectItem>
                    <SelectItem value="regional">🗺️ Regional Threat Analysis</SelectItem>
                    <SelectItem value="situation">📋 Situation Room Log</SelectItem>
                  </SelectContent>
                </Select>
                
                {reportType === 'regional' && (
                  <Input
                    placeholder="Specify Region"
                    value={reportRegion}
                    onChange={(e) => setReportRegion(e.target.value)}
                  />
                )}
              </div>
              
              <Button 
                onClick={generateCrisisReport}
                disabled={generatingReport}
                className="w-full"
                variant="destructive"
              >
                <Download className="h-4 w-4 mr-2" />
                {generatingReport ? 'Generating Report...' : 'GENERATE CRISIS REPORT'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="command">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Emergency Communications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Activate WhatsApp Bridge
                </Button>
                <Button variant="outline" className="w-full">
                  <Bell className="h-4 w-4 mr-2" />
                  Deploy Civic Voice Agent
                </Button>
                <Button variant="destructive" className="w-full">
                  <Siren className="h-4 w-4 mr-2" />
                  National Emergency Broadcast
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Response Coordination
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Alert Security Forces
                </Button>
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Contact Intelligence Agencies
                </Button>
                <Button variant="outline" className="w-full">
                  <Activity className="h-4 w-4 mr-2" />
                  Activate Crisis Response Team
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RedRoomPanel;