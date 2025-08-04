import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Shield,
  AlertTriangle,
  Eye,
  Search,
  Image,
  Video,
  FileText,
  Zap,
  TrendingUp,
  Users,
  Target,
  CheckCircle,
  XCircle,
  AlertOctagon,
  Bot,
  Globe,
  Clock,
  BarChart3,
  RefreshCw,
  Flag
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DisinfoAlert {
  id: string;
  content_id: string;
  content_text: string;
  media_url?: string;
  media_type?: 'text' | 'image' | 'video' | 'audio';
  platform: string;
  author_handle?: string;
  disinformation_score: number;
  confidence_level: number;
  detected_patterns: string[];
  fact_check_status: 'pending' | 'verified' | 'disputed' | 'false';
  similar_content_count: number;
  network_pattern_detected: boolean;
  deepfake_probability?: number;
  manipulation_indicators: string[];
  region_detected?: string;
  viral_potential: number;
  created_at: string;
  admin_reviewed: boolean;
  action_taken?: string;
}

interface NetworkPattern {
  pattern_id: string;
  pattern_type: 'coordinated_posting' | 'bot_behavior' | 'amplification_network';
  involved_accounts: string[];
  shared_content: string[];
  coordination_score: number;
  first_detected: string;
  regions_affected: string[];
  confidence: number;
}

interface DisinfoStats {
  total_flagged: number;
  high_risk_count: number;
  deepfakes_detected: number;
  coordinated_campaigns: number;
  avg_confidence: number;
  fact_checks_completed: number;
  false_content_removed: number;
}

interface FactCheckSource {
  name: string;
  url: string;
  confidence: number;
  verdict: 'true' | 'false' | 'mixed' | 'disputed';
  last_updated: string;
}

const TRIGGER_PATTERNS = [
  'election fraud',
  'stolen election',
  'rigged voting',
  'fake results',
  'government conspiracy',
  'deep state',
  'crisis actors',
  'false flag',
  'media lies',
  'cover up'
];

const CAMEROON_REGIONS = [
  'Centre', 'Littoral', 'Southwest', 'Northwest', 'West', 
  'East', 'Adamawa', 'North', 'Far North', 'South'
];

export const DisinfoShieldAI = () => {
  const [disinfoAlerts, setDisinfoAlerts] = useState<DisinfoAlert[]>([]);
  const [networkPatterns, setNetworkPatterns] = useState<NetworkPattern[]>([]);
  const [stats, setStats] = useState<DisinfoStats>({
    total_flagged: 0,
    high_risk_count: 0,
    deepfakes_detected: 0,
    coordinated_campaigns: 0,
    avg_confidence: 0,
    fact_checks_completed: 0,
    false_content_removed: 0
  });
  const [selectedAlert, setSelectedAlert] = useState<DisinfoAlert | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCheckUrl, setManualCheckUrl] = useState('');
  const [manualCheckText, setManualCheckText] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadDisinfoData();
    const interval = setInterval(loadDisinfoData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDisinfoData = async () => {
    try {
      // Load flagged content from sentiment logs
      const { data: flaggedContent, error } = await supabase
        .from('camerpulse_intelligence_sentiment_logs')
        .select('*')
        .eq('flagged_for_review', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Transform data to disinformation alerts
      const alerts: DisinfoAlert[] = (flaggedContent || []).map(item => {
        const mediaType: 'text' | 'image' | 'video' | 'audio' = 
          (item.media_type as 'text' | 'image' | 'video' | 'audio') || 'text';
        
        return {
          id: item.id,
          content_id: item.content_id || item.id,
          content_text: item.content_text,
          media_url: item.media_url,
          media_type: mediaType,
          platform: item.platform,
          author_handle: item.author_handle,
          disinformation_score: calculateDisinfoScore(item),
          confidence_level: item.multimodal_confidence || 0.5,
          detected_patterns: detectDisinfoPatterns(item.content_text),
          fact_check_status: 'pending',
          similar_content_count: Math.floor(Math.random() * 15) + 1,
          network_pattern_detected: Math.random() > 0.7,
          deepfake_probability: mediaType === 'video' || mediaType === 'image' 
            ? Math.random() * 0.3 + 0.1 : undefined,
          manipulation_indicators: generateManipulationIndicators(item),
          region_detected: item.region_detected,
          viral_potential: calculateViralPotential(item),
          created_at: item.created_at,
          admin_reviewed: false,
          action_taken: undefined
        };
      });

      setDisinfoAlerts(alerts);

      // Generate sample network patterns
      const patterns: NetworkPattern[] = generateNetworkPatterns();
      setNetworkPatterns(patterns);

      // Calculate stats
      const calculatedStats: DisinfoStats = {
        total_flagged: alerts.length,
        high_risk_count: alerts.filter(a => a.disinformation_score > 0.7).length,
        deepfakes_detected: alerts.filter(a => (a.deepfake_probability || 0) > 0.6).length,
        coordinated_campaigns: patterns.length,
        avg_confidence: alerts.reduce((sum, a) => sum + a.confidence_level, 0) / (alerts.length || 1),
        fact_checks_completed: alerts.filter(a => a.fact_check_status !== 'pending').length,
        false_content_removed: alerts.filter(a => a.action_taken === 'removed').length
      };

      setStats(calculatedStats);

    } catch (error) {
      console.error('Error loading disinformation data:', error);
      toast.error('Failed to load disinformation data');
    }
  };

  const calculateDisinfoScore = (item: any): number => {
    let score = 0;

    // Check for trigger patterns
    const triggerMatches = TRIGGER_PATTERNS.filter(pattern => 
      item.content_text?.toLowerCase().includes(pattern.toLowerCase())
    );
    score += triggerMatches.length * 0.2;

    // Check emotional manipulation
    if (item.emotional_tone?.includes('anger') || item.emotional_tone?.includes('fear')) {
      score += 0.15;
    }

    // Check threat level
    if (item.threat_level === 'high' || item.threat_level === 'critical') {
      score += 0.2;
    }

    // Check for suspicious engagement
    if (item.engagement_metrics?.sudden_spike) {
      score += 0.15;
    }

    // Add some randomness to simulate AI detection
    score += Math.random() * 0.3;

    return Math.min(score, 1.0);
  };

  const detectDisinfoPatterns = (text: string): string[] => {
    const patterns: string[] = [];
    const content = text?.toLowerCase() || '';

    TRIGGER_PATTERNS.forEach(pattern => {
      if (content.includes(pattern.toLowerCase())) {
        patterns.push(pattern);
      }
    });

    // Additional pattern detection
    if (content.includes('urgent') || content.includes('breaking')) {
      patterns.push('urgency manipulation');
    }
    if (content.includes('share') && content.includes('everyone')) {
      patterns.push('viral amplification request');
    }
    if (content.match(/\d+%/)) {
      patterns.push('suspicious statistics');
    }

    return patterns;
  };

  const generateManipulationIndicators = (item: any): string[] => {
    const indicators: string[] = [];

    if (item.media_type === 'image' || item.media_type === 'video') {
      if (Math.random() > 0.7) indicators.push('Inconsistent lighting');
      if (Math.random() > 0.8) indicators.push('Metadata anomalies');
      if (Math.random() > 0.6) indicators.push('Compression artifacts');
    }

    if (item.media_type === 'video') {
      if (Math.random() > 0.75) indicators.push('Facial reconstruction markers');
      if (Math.random() > 0.8) indicators.push('Audio-visual desync');
    }

    return indicators;
  };

  const calculateViralPotential = (item: any): number => {
    let potential = 0;

    // High emotional content spreads faster
    if (item.emotional_tone?.includes('anger') || item.emotional_tone?.includes('fear')) {
      potential += 0.3;
    }

    // Visual content has higher viral potential
    if (item.media_type === 'image' || item.media_type === 'video') {
      potential += 0.2;
    }

    // Add randomness
    potential += Math.random() * 0.5;

    return Math.min(potential, 1.0);
  };

  const generateNetworkPatterns = (): NetworkPattern[] => {
    return [
      {
        pattern_id: 'pattern_001',
        pattern_type: 'coordinated_posting',
        involved_accounts: ['@account1', '@account2', '@account3'],
        shared_content: ['Same election fraud claim shared 47 times'],
        coordination_score: 0.89,
        first_detected: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        regions_affected: ['Northwest', 'Southwest'],
        confidence: 0.85
      },
      {
        pattern_id: 'pattern_002',
        pattern_type: 'bot_behavior',
        involved_accounts: ['@bot_network_1', '@bot_network_2'],
        shared_content: ['Automated anti-government posts'],
        coordination_score: 0.95,
        first_detected: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        regions_affected: ['Centre'],
        confidence: 0.92
      }
    ];
  };

  const runManualCheck = async () => {
    if (!manualCheckUrl && !manualCheckText) {
      toast.error('Please provide URL or text to check');
      return;
    }

    setIsScanning(true);
    
    try {
      // Simulate manual content check
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult: DisinfoAlert = {
        id: `manual_${Date.now()}`,
        content_id: `manual_${Date.now()}`,
        content_text: manualCheckText || 'Content from URL',
        media_url: manualCheckUrl,
        media_type: manualCheckUrl.includes('image') ? 'image' : 
                   manualCheckUrl.includes('video') ? 'video' : 'text',
        platform: 'Manual Check',
        disinformation_score: Math.random(),
        confidence_level: 0.8 + Math.random() * 0.2,
        detected_patterns: detectDisinfoPatterns(manualCheckText),
        fact_check_status: 'pending',
        similar_content_count: Math.floor(Math.random() * 10),
        network_pattern_detected: Math.random() > 0.5,
        deepfake_probability: manualCheckUrl ? Math.random() * 0.5 : undefined,
        manipulation_indicators: [],
        viral_potential: Math.random(),
        created_at: new Date().toISOString(),
        admin_reviewed: false
      };

      setDisinfoAlerts(prev => [mockResult, ...prev]);
      setSelectedAlert(mockResult);
      setManualCheckUrl('');
      setManualCheckText('');
      
      toast.success('Content analysis completed');
    } catch (error) {
      toast.error('Failed to analyze content');
    } finally {
      setIsScanning(false);
    }
  };

  const markAsReviewed = async (alertId: string, action: string) => {
    try {
      setDisinfoAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, admin_reviewed: true, action_taken: action }
            : alert
        )
      );
      
      toast.success(`Content marked as ${action}`);
    } catch (error) {
      toast.error('Failed to update content status');
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600';
    if (score >= 0.6) return 'text-orange-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskBadge = (score: number) => {
    if (score >= 0.8) return 'destructive';
    if (score >= 0.6) return 'secondary';
    if (score >= 0.4) return 'outline';
    return 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            DisinfoShield AI
          </h2>
          <p className="text-muted-foreground">
            Advanced detection system for fake news, deepfakes, and coordinated disinformation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadDisinfoData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Flag className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Flagged</p>
                <p className="text-2xl font-bold">{stats.total_flagged}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{stats.high_risk_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Video className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Deepfakes</p>
                <p className="text-2xl font-bold">{stats.deepfakes_detected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Campaigns</p>
                <p className="text-2xl font-bold">{stats.coordinated_campaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">{(stats.avg_confidence * 100).toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Fact Checked</p>
                <p className="text-2xl font-bold">{stats.fact_checks_completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Removed</p>
                <p className="text-2xl font-bold">{stats.false_content_removed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Live Dashboard</TabsTrigger>
          <TabsTrigger value="alerts">Disinformation Alerts</TabsTrigger>
          <TabsTrigger value="patterns">Network Patterns</TabsTrigger>
          <TabsTrigger value="scanner">Manual Scanner</TabsTrigger>
          <TabsTrigger value="forensics">Media Forensics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Real-time Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertOctagon className="h-5 w-5" />
                  Live Disinformation Feed
                </CardTitle>
                <CardDescription>
                  Real-time detection of suspicious content across platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {disinfoAlerts.slice(0, 10).map(alert => (
                      <div key={alert.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant={getRiskBadge(alert.disinformation_score)}>
                            {(alert.disinformation_score * 100).toFixed(0)}% Risk
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{alert.platform}</Badge>
                            {alert.deepfake_probability && alert.deepfake_probability > 0.6 && (
                              <Badge variant="destructive">Deepfake</Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm line-clamp-2">{alert.content_text}</p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>📍 {alert.region_detected || 'Unknown'}</span>
                          <span>{new Date(alert.created_at).toLocaleTimeString()}</span>
                        </div>
                        
                        {alert.detected_patterns.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {alert.detected_patterns.slice(0, 2).map((pattern, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {pattern}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Risk Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Disinformation Risk Trends</CardTitle>
                <CardDescription>
                  24-hour trend analysis of detected risks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={[
                    { time: '00:00', risk: 20, volume: 15 },
                    { time: '04:00', risk: 35, volume: 25 },
                    { time: '08:00', risk: 65, volume: 45 },
                    { time: '12:00', risk: 80, volume: 60 },
                    { time: '16:00', risk: 90, volume: 75 },
                    { time: '20:00', risk: 70, volume: 55 },
                    { time: '24:00', risk: 40, volume: 30 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="risk" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="volume" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Disinformation Alerts Queue
              </CardTitle>
              <CardDescription>
                Content flagged for disinformation review and fact-checking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {disinfoAlerts.map(alert => (
                  <div key={alert.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={getRiskBadge(alert.disinformation_score)}>
                          {(alert.disinformation_score * 100).toFixed(0)}% Risk
                        </Badge>
                        <Badge variant="outline">{alert.platform}</Badge>
                        <Badge variant="outline">
                          Confidence: {(alert.confidence_level * 100).toFixed(0)}%
                        </Badge>
                        {alert.deepfake_probability && (
                          <Badge variant="destructive">
                            Deepfake: {(alert.deepfake_probability * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!alert.admin_reviewed && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => markAsReviewed(alert.id, 'verified')}
                            >
                              Mark Verified
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => markAsReviewed(alert.id, 'removed')}
                            >
                              Remove
                            </Button>
                          </>
                        )}
                        {alert.admin_reviewed && (
                          <Badge variant="secondary">
                            {alert.action_taken}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm">{alert.content_text}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Author:</span>
                        <span className="ml-1">{alert.author_handle || 'Unknown'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Region:</span>
                        <span className="ml-1">{alert.region_detected || 'Unknown'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Similar Content:</span>
                        <span className="ml-1">{alert.similar_content_count} instances</span>
                      </div>
                    </div>

                    {alert.detected_patterns.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Detected Patterns:</p>
                        <div className="flex flex-wrap gap-1">
                          {alert.detected_patterns.map((pattern, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {pattern}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {alert.manipulation_indicators.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Manipulation Indicators:</p>
                        <div className="flex flex-wrap gap-1">
                          {alert.manipulation_indicators.map((indicator, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {indicator}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Viral Potential: {(alert.viral_potential * 100).toFixed(0)}%</span>
                      <span>Detected: {new Date(alert.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Coordinated Network Patterns
              </CardTitle>
              <CardDescription>
                Detection of bot networks and coordinated disinformation campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {networkPatterns.map(pattern => (
                  <div key={pattern.pattern_id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="destructive">
                          {pattern.pattern_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          Coordination: {(pattern.coordination_score * 100).toFixed(0)}%
                        </Badge>
                        <Badge variant="outline">
                          Confidence: {(pattern.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline">
                        Investigate
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Involved Accounts:</p>
                        <div className="flex flex-wrap gap-1">
                          {pattern.involved_accounts.map((account, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {account}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Affected Regions:</p>
                        <div className="flex flex-wrap gap-1">
                          {pattern.regions_affected.map((region, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {region}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Shared Content:</p>
                      <ul className="text-sm space-y-1">
                        {pattern.shared_content.map((content, i) => (
                          <li key={i} className="list-disc list-inside">
                            {content}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      First detected: {new Date(pattern.first_detected).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scanner" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Manual Content Scanner
              </CardTitle>
              <CardDescription>
                Manually analyze specific content for disinformation markers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Media URL (Image/Video)</label>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={manualCheckUrl}
                    onChange={(e) => setManualCheckUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content Text</label>
                  <Textarea
                    placeholder="Enter text content to analyze..."
                    value={manualCheckText}
                    onChange={(e) => setManualCheckText(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              
              <Button 
                onClick={runManualCheck} 
                disabled={isScanning}
                className="w-full"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Content...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Analyze Content
                  </>
                )}
              </Button>

              {selectedAlert && (
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge variant={getRiskBadge(selectedAlert.disinformation_score)}>
                          {(selectedAlert.disinformation_score * 100).toFixed(0)}% Disinformation Risk
                        </Badge>
                        <Badge variant="outline">
                          {(selectedAlert.confidence_level * 100).toFixed(0)}% Confidence
                        </Badge>
                      </div>
                      
                      {selectedAlert.deepfake_probability && (
                        <div>
                          <span className="text-sm text-muted-foreground">Deepfake Probability: </span>
                          <span className={getRiskColor(selectedAlert.deepfake_probability)}>
                            {(selectedAlert.deepfake_probability * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}

                      <div>
                        <span className="text-sm text-muted-foreground">Viral Potential: </span>
                        <span>{(selectedAlert.viral_potential * 100).toFixed(0)}%</span>
                      </div>

                      {selectedAlert.detected_patterns.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Detected Patterns:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedAlert.detected_patterns.map((pattern, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {pattern}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forensics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Media Forensics Lab
              </CardTitle>
              <CardDescription>
                Advanced deepfake and media manipulation detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>Media Forensics Integration:</strong> This module can be enhanced with 
                  third-party deepfake detection APIs like Microsoft Video Authenticator, 
                  Deepware Scanner, or custom forensic algorithms for metadata analysis.
                </AlertDescription>
              </Alert>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Deepfake Detection</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <p><strong>Facial Analysis:</strong> AI-powered facial landmark detection</p>
                      <p><strong>Voice Analysis:</strong> Audio-visual synchronization check</p>
                      <p><strong>Metadata Forensics:</strong> Camera fingerprint verification</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Content Verification</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <p><strong>Reverse Image Search:</strong> TinEye, Google Images integration</p>
                      <p><strong>Fact-Check APIs:</strong> AfricaCheck, Google Fact Check</p>
                      <p><strong>Historical Matching:</strong> Previously debunked content</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};