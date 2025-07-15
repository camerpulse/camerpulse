import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  AlertTriangle, 
  Vote,
  Eye,
  Clock,
  MapPin,
  TrendingUp,
  Bell,
  Zap,
  Users,
  Globe,
  FileText,
  AlertOctagon,
  Target,
  Network,
  Radio,
  Megaphone,
  Search,
  Calendar
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface ElectionCalendar {
  id: string;
  election_type: string;
  election_date: string;
  campaign_start_date?: string;
  campaign_end_date?: string;
  affected_regions?: string[];
  description?: string;
  status: string;
}

interface InterferenceAlert {
  id: string;
  alert_type: string;
  phase: string;
  title: string;
  description: string;
  severity: string;
  confidence_score?: number;
  affected_regions?: string[];
  source_type: string;
  evidence_urls?: string[];
  threat_indicators?: any;
  sentiment_impact_data?: any;
  escalation_status: string;
  created_at: string;
  election_calendar?: ElectionCalendar;
}

interface ThreatIndex {
  id: string;
  region: string;
  division?: string;
  date_recorded: string;
  overall_threat_score?: number;
  disinformation_score?: number;
  violence_risk_score?: number;
  suppression_risk_score?: number;
  sentiment_volatility_score?: number;
  network_interference_score?: number;
  threat_level: string;
  escalation_triggers?: string[];
  recommended_actions?: string[];
}

interface SuppressionReport {
  id: string;
  report_type: string;
  title: string;
  description: string;
  location_region: string;
  location_city?: string;
  severity_level: string;
  estimated_affected_voters?: number;
  verification_status: string;
  reporter_type: string;
  incident_datetime: string;
  resolution_status: string;
}

interface DisinfoAlert {
  id: string;
  content_text: string;
  platform: string;
  target_candidate?: string;
  target_party?: string;
  disinformation_category: string;
  credibility_score?: number;
  virality_score?: number;
  emotional_manipulation_detected?: boolean;
  fact_check_status: string;
  regions_affected?: string[];
  estimated_reach?: number;
  takedown_status: string;
  created_at: string;
}

interface ElectionPhase {
  phase: 'pre_election' | 'election_week' | 'post_election';
  name: string;
  color: string;
  icon: React.ReactNode;
  description: string;
}

const ELECTION_PHASES: ElectionPhase[] = [
  {
    phase: 'pre_election',
    name: 'Pre-Election',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <Calendar className="w-4 h-4" />,
    description: '3 months before election - Campaign monitoring'
  },
  {
    phase: 'election_week',
    name: 'Election Week',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: <Vote className="w-4 h-4" />,
    description: 'Election period - Maximum security'
  },
  {
    phase: 'post_election',
    name: 'Post-Election',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: <Clock className="w-4 h-4" />,
    description: '1 month after - Results monitoring'
  }
];

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

export const ElectionInterferenceMonitor: React.FC = () => {
  const [activeElections, setActiveElections] = useState<ElectionCalendar[]>([]);
  const [interferenceAlerts, setInterferenceAlerts] = useState<InterferenceAlert[]>([]);
  const [threatIndexData, setThreatIndexData] = useState<ThreatIndex[]>([]);
  const [suppressionReports, setSuppressionReports] = useState<SuppressionReport[]>([]);
  const [disinfoAlerts, setDisinfoAlerts] = useState<DisinfoAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchElectionData();
    const interval = setInterval(fetchElectionData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchElectionData = async () => {
    try {
      setLoading(true);

      // Fetch active elections
      const { data: elections } = await supabase
        .from('election_calendars')
        .select('*')
        .in('status', ['scheduled', 'active'])
        .order('election_date', { ascending: true });

      setActiveElections(elections || []);

      // Fetch interference alerts
      const { data: alerts } = await supabase
        .from('election_interference_alerts')
        .select(`
          *,
          election_calendars!election_calendar_id (
            id,
            election_type,
            election_date,
            status
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      setInterferenceAlerts(alerts || []);

      // Fetch threat index
      const { data: threatIndex } = await supabase
        .from('election_threat_index')
        .select('*')
        .gte('date_recorded', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('overall_threat_score', { ascending: false });

      setThreatIndexData(threatIndex || []);

      // Fetch suppression reports
      const { data: suppressions } = await supabase
        .from('voter_suppression_reports')
        .select('*')
        .gte('incident_datetime', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('incident_datetime', { ascending: false });

      setSuppressionReports(suppressions || []);

      // Fetch disinformation alerts
      const { data: disinfo } = await supabase
        .from('election_disinformation_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      setDisinfoAlerts(disinfo || []);

    } catch (error) {
      console.error('Error fetching election data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données électorales",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPhase = (election: ElectionCalendar): ElectionPhase | null => {
    const now = new Date();
    const electionDate = new Date(election.election_date);
    const campaignStart = election.campaign_start_date ? new Date(election.campaign_start_date) : null;
    
    // Pre-election: from campaign start (or 3 months before) to 1 week before election
    const preElectionStart = campaignStart || new Date(electionDate.getTime() - 90 * 24 * 60 * 60 * 1000);
    const electionWeekStart = new Date(electionDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const postElectionEnd = new Date(electionDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (now >= preElectionStart && now < electionWeekStart) {
      return ELECTION_PHASES.find(p => p.phase === 'pre_election') || null;
    } else if (now >= electionWeekStart && now <= electionDate) {
      return ELECTION_PHASES.find(p => p.phase === 'election_week') || null;
    } else if (now > electionDate && now <= postElectionEnd) {
      return ELECTION_PHASES.find(p => p.phase === 'post_election') || null;
    }
    
    return null;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'disinformation': return <Megaphone className="w-4 h-4" />;
      case 'violence_threat': return <AlertTriangle className="w-4 h-4" />;
      case 'voter_suppression': return <Users className="w-4 h-4" />;
      case 'network_blackout': return <Network className="w-4 h-4" />;
      case 'illegal_influence': return <Target className="w-4 h-4" />;
      case 'ballot_tampering': return <Vote className="w-4 h-4" />;
      case 'intimidation': return <AlertOctagon className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getOverallThreatLevel = () => {
    if (threatIndexData.length === 0) return 'low';
    
    const avgScore = threatIndexData.reduce((sum, item) => sum + (item.overall_threat_score || 0), 0) / threatIndexData.length;
    
    if (avgScore >= 80) return 'critical';
    if (avgScore >= 60) return 'high';
    if (avgScore >= 40) return 'medium';
    return 'low';
  };

  const criticalAlerts = interferenceAlerts.filter(a => a.severity === 'critical').length;
  const activeSuppressionReports = suppressionReports.filter(r => r.resolution_status === 'pending').length;
  const highThreatRegions = threatIndexData.filter(t => ['high', 'critical'].includes(t.threat_level)).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Shield className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
            Election Interference Monitor
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Real-time detection and monitoring of election interference, disinformation campaigns, 
          voter suppression, and threats to democratic processes in Cameroon
        </p>
      </div>

      {/* Alert Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-800">{criticalAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-xs text-red-600 mt-2">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Suppression Reports</p>
                <p className="text-2xl font-bold text-orange-800">{activeSuppressionReports}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-orange-600 mt-2">Active incidents</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">High Threat Regions</p>
                <p className="text-2xl font-bold text-yellow-800">{highThreatRegions}</p>
              </div>
              <MapPin className="h-8 w-8 text-yellow-600" />
            </div>
            <p className="text-xs text-yellow-600 mt-2">Need monitoring</p>
          </CardContent>
        </Card>

        <Card className={`border-2 ${getThreatLevelColor(getOverallThreatLevel())}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Threat Level</p>
                <p className="text-2xl font-bold text-white uppercase">{getOverallThreatLevel()}</p>
              </div>
              <Eye className="h-8 w-8 text-white" />
            </div>
            <p className="text-xs text-white mt-2">National assessment</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Elections */}
      {activeElections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5" />
              Active Elections & Phases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeElections.map((election) => {
                const currentPhase = getCurrentPhase(election);
                return (
                  <div key={election.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{election.election_type} Election</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(election.election_date).toLocaleDateString('fr-FR')}
                      </p>
                      {election.description && (
                        <p className="text-sm text-muted-foreground mt-1">{election.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {currentPhase && (
                        <Badge className={currentPhase.color}>
                          {currentPhase.icon}
                          <span className="ml-1">{currentPhase.name}</span>
                        </Badge>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {election.affected_regions?.length} regions
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="alerts">Interference Alerts</TabsTrigger>
          <TabsTrigger value="threat">Threat Index</TabsTrigger>
          <TabsTrigger value="disinformation">Disinformation</TabsTrigger>
          <TabsTrigger value="suppression">Suppression Reports</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Election Interference Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interferenceAlerts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No interference alerts detected
                  </p>
                ) : (
                  interferenceAlerts.slice(0, 10).map((alert) => (
                    <div key={alert.id} className="p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getAlertIcon(alert.alert_type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <Badge variant="outline">
                                {alert.alert_type.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline">
                                {alert.phase.replace('_', ' ')}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-foreground">{alert.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>📅 {new Date(alert.created_at).toLocaleDateString('fr-FR')}</span>
                              {alert.affected_regions && alert.affected_regions.length > 0 && (
                                <span>📍 {alert.affected_regions.join(', ')}</span>
                              )}
                              {alert.confidence_score && (
                                <span>🎯 {(alert.confidence_score * 100).toFixed(0)}% confidence</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge className={`${alert.escalation_status === 'resolved' ? 'bg-green-100 text-green-800' : 
                                         alert.escalation_status === 'escalated' ? 'bg-red-100 text-red-800' :
                                         'bg-yellow-100 text-yellow-800'}`}>
                          {alert.escalation_status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Regional Threat Index
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CAMEROON_REGIONS.map((region) => {
                  const regionThreat = threatIndexData.find(t => t.region === region);
                  const threatScore = regionThreat?.overall_threat_score || 0;
                  const threatLevel = regionThreat?.threat_level || 'low';
                  
                  return (
                    <Card key={region} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">{region}</h3>
                          <Badge className={getSeverityColor(threatLevel)}>
                            {threatLevel}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Overall Score</span>
                            <span className="font-medium">{threatScore.toFixed(0)}/100</span>
                          </div>
                          <Progress value={threatScore} className="h-2" />
                          
                          {regionThreat && (
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <div className="flex justify-between">
                                <span>Disinformation:</span>
                                <span>{(regionThreat.disinformation_score || 0).toFixed(0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Violence Risk:</span>
                                <span>{(regionThreat.violence_risk_score || 0).toFixed(0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Suppression:</span>
                                <span>{(regionThreat.suppression_risk_score || 0).toFixed(0)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disinformation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Election Disinformation Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {disinfoAlerts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No disinformation alerts detected
                  </p>
                ) : (
                  disinfoAlerts.slice(0, 10).map((alert) => (
                    <div key={alert.id} className="p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{alert.platform}</Badge>
                          <Badge className={getSeverityColor(alert.disinformation_category)}>
                            {alert.disinformation_category.replace('_', ' ')}
                          </Badge>
                          {alert.emotional_manipulation_detected && (
                            <Badge className="bg-purple-100 text-purple-800">
                              Emotional manipulation
                            </Badge>
                          )}
                        </div>
                        <Badge className={
                          alert.fact_check_status === 'verified_false' ? 'bg-red-100 text-red-800' :
                          alert.fact_check_status === 'verified_true' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {alert.fact_check_status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-foreground mb-2 line-clamp-3">
                        {alert.content_text}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {alert.target_candidate && (
                          <span>🎯 Target: {alert.target_candidate}</span>
                        )}
                        {alert.estimated_reach && (
                          <span>👥 Reach: {alert.estimated_reach.toLocaleString()}</span>
                        )}
                        {alert.credibility_score && (
                          <span>🔍 Credibility: {(alert.credibility_score * 100).toFixed(0)}%</span>
                        )}
                        <span>📅 {new Date(alert.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppression" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Voter Suppression Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suppressionReports.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No suppression reports
                  </p>
                ) : (
                  suppressionReports.slice(0, 10).map((report) => (
                    <div key={report.id} className="p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{report.report_type.replace('_', ' ')}</Badge>
                          <Badge className={getSeverityColor(report.severity_level)}>
                            {report.severity_level}
                          </Badge>
                          <Badge variant="outline">{report.verification_status}</Badge>
                        </div>
                        <Badge className={
                          report.resolution_status === 'resolved' ? 'bg-green-100 text-green-800' :
                          report.resolution_status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {report.resolution_status}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-foreground mb-1">{report.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>📍 {report.location_region}</span>
                        {report.location_city && <span>{report.location_city}</span>}
                        {report.estimated_affected_voters && (
                          <span>👥 {report.estimated_affected_voters.toLocaleString()} voters affected</span>
                        )}
                        <span>📅 {new Date(report.incident_datetime).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Election Interference Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Interactive timeline feature coming soon</p>
                <p className="text-sm">Will show chronological interference events and response actions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};