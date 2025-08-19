import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, 
  Users, 
  MapPin, 
  Heart, 
  AlertTriangle, 
  Mic, 
  Image as ImageIcon,
  Languages,
  Shield,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppReport {
  id: string;
  content_text: string;
  sentiment_polarity: string;
  sentiment_score: number;
  emotional_tone: string[];
  region_detected: string;
  media_type: string;
  language_detected: string;
  created_at: string;
  threat_level: string;
  flagged_for_review: boolean;
}

interface RegionalStats {
  region: string;
  message_count: number;
  avg_sentiment: number;
  dominant_emotion: string;
  threat_level: string;
}

const CivicWhatsAppBridge = () => {
  const [whatsappReports, setWhatsappReports] = useState<WhatsAppReport[]>([]);
  const [regionalStats, setRegionalStats] = useState<RegionalStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [totalReports, setTotalReports] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState(0);

  useEffect(() => {
    loadWhatsAppData();
    checkConnectionStatus();
    const interval = setInterval(loadWhatsAppData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadWhatsAppData = async () => {
    try {
      // Load WhatsApp reports from sentiment logs
      const { data: reports } = await supabase
        .from('camerpulse_intelligence_sentiment_logs')
        .select('*')
        .eq('platform', 'whatsapp')
        .order('created_at', { ascending: false })
        .limit(100);

      // Calculate regional statistics
      const regionMap = new Map<string, any>();
      
      reports?.forEach(report => {
        const region = report.region_detected || 'Unknown';
        if (!regionMap.has(region)) {
          regionMap.set(region, {
            region,
            message_count: 0,
            sentiment_sum: 0,
            emotions: new Map<string, number>(),
            threat_levels: []
          });
        }
        
        const stats = regionMap.get(region);
        stats.message_count++;
        stats.sentiment_sum += report.sentiment_score || 0;
        stats.threat_levels.push(report.threat_level);
        
        report.emotional_tone?.forEach((emotion: string) => {
          stats.emotions.set(emotion, (stats.emotions.get(emotion) || 0) + 1);
        });
      });

      const regionalData = Array.from(regionMap.values()).map(stats => ({
        region: stats.region,
        message_count: stats.message_count,
        avg_sentiment: stats.message_count > 0 ? stats.sentiment_sum / stats.message_count : 0,
        dominant_emotion: stats.emotions.size > 0 ? 
          Array.from(stats.emotions.entries()).sort((a, b) => b[1] - a[1])[0][0] : 'neutral',
        threat_level: stats.threat_levels.filter((t: string) => t !== 'none').length > stats.message_count * 0.3 ? 'high' : 'low'
      }));

      setWhatsappReports(reports || []);
      setRegionalStats(regionalData);
      setTotalReports(reports?.length || 0);
      setActiveAlerts(reports?.filter(r => r.flagged_for_review).length || 0);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading WhatsApp data:', error);
      setIsLoading(false);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const response = await supabase.functions.invoke('whatsapp-civic-bridge', {
        body: { action: 'status' }
      });
      
      if (response.data?.connected) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      setConnectionStatus('error');
    }
  };

  const testWhatsAppConnection = async () => {
    try {
      const response = await supabase.functions.invoke('whatsapp-civic-bridge', {
        body: { action: 'test_webhook' }
      });
      
      if (response.data?.success) {
        setConnectionStatus('connected');
      }
    } catch (error) {
      console.error('WhatsApp connection test failed:', error);
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-green-600';
    if (score < -0.3) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-400';
      case 'medium': return 'bg-yellow-400';
      case 'low': return 'bg-blue-400';
      default: return 'bg-gray-400';
    }
  };

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'audio': return <Mic className="h-3 w-3" />;
      case 'image': return <ImageIcon className="h-3 w-3" />;
      default: return <MessageSquare className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-green-600" />
            <span>WhatsApp Civic Reports Bridge</span>
            <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
              {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Real-time civic sentiment monitoring via WhatsApp Business API - Connecting citizens across all regions of Cameroon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalReports}</div>
              <div className="text-sm text-muted-foreground">Total Reports</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{regionalStats.length}</div>
              <div className="text-sm text-muted-foreground">Active Regions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{activeAlerts}</div>
              <div className="text-sm text-muted-foreground">Flagged Reports</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">3</div>
              <div className="text-sm text-muted-foreground">Languages</div>
            </div>
          </div>
          
          {connectionStatus !== 'connected' && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>WhatsApp Business API not connected. Configure webhook to start receiving reports.</span>
                <Button onClick={testWhatsAppConnection} size="sm">
                  Test Connection
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports">Live Reports</TabsTrigger>
          <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
          <TabsTrigger value="languages">Language Insights</TabsTrigger>
          <TabsTrigger value="settings">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Live WhatsApp Civic Reports</span>
              </CardTitle>
              <CardDescription>
                Real-time stream of citizen reports with emotion analysis and threat assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading WhatsApp reports...</p>
                  </div>
                ) : whatsappReports.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">No WhatsApp reports yet</p>
                    <p className="text-sm text-muted-foreground">
                      Citizens can send reports to our WhatsApp number to appear here
                    </p>
                  </div>
                ) : (
                  whatsappReports.map((report) => (
                    <div key={report.id} className="border-l-4 border-green-500 pl-4 py-3 bg-card rounded-r-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            WhatsApp
                          </Badge>
                          {getMediaIcon(report.media_type)}
                          <Badge variant={report.sentiment_polarity === 'positive' ? 'default' : 
                                        report.sentiment_polarity === 'negative' ? 'destructive' : 'secondary'}>
                            {report.sentiment_polarity}
                          </Badge>
                          {report.threat_level !== 'none' && (
                            <Badge className={getThreatLevelColor(report.threat_level)}>
                              {report.threat_level}
                            </Badge>
                          )}
                          {report.flagged_for_review && (
                            <Badge variant="destructive">
                              <Shield className="h-3 w-3 mr-1" />
                              Flagged
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-semibold ${getSentimentColor(report.sentiment_score)}`}>
                            {report.sentiment_score?.toFixed(2)}
                          </span>
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(report.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm mb-2 line-clamp-3">
                        {report.content_text}
                      </p>
                      
                      <div className="flex items-center space-x-2">
                        {report.emotional_tone?.map((emotion, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <Heart className="h-3 w-3 mr-1" />
                            {emotion}
                          </Badge>
                        ))}
                        {report.region_detected && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {report.region_detected}
                          </Badge>
                        )}
                        {report.language_detected && (
                          <Badge variant="outline" className="text-xs">
                            <Languages className="h-3 w-3 mr-1" />
                            {report.language_detected}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Regional WhatsApp Activity</span>
              </CardTitle>
              <CardDescription>
                Breakdown of WhatsApp civic reports by region with sentiment analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regionalStats.map((region, idx) => (
                  <Card key={idx} className="border-l-4 border-blue-400">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{region.region}</span>
                        <Badge className={getThreatLevelColor(region.threat_level)}>
                          {region.threat_level}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Reports:</span>
                          <span className="font-semibold">{region.message_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Sentiment:</span>
                          <span className={`font-semibold ${getSentimentColor(region.avg_sentiment)}`}>
                            {region.avg_sentiment.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Dominant Emotion:</span>
                          <Badge variant="outline" className="text-xs">
                            {region.dominant_emotion}
                          </Badge>
                        </div>
                        <Progress 
                          value={(region.avg_sentiment + 1) * 50} 
                          className="mt-2" 
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Languages className="h-5 w-5" />
                <span>Multi-Language Analysis</span>
              </CardTitle>
              <CardDescription>
                Language distribution and sentiment analysis across English and Pidgin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-green-400">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">English</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Reports:</span>
                        <span className="font-semibold">
                          {whatsappReports.filter(r => r.language_detected === 'en').length}
                        </span>
                      </div>
                      <Progress value={45} className="mt-2" />
                      <p className="text-xs text-muted-foreground">Most used in urban areas</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-yellow-400">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Pidgin English</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Reports:</span>
                        <span className="font-semibold">
                          {whatsappReports.filter(r => r.language_detected === 'pidgin').length}
                        </span>
                      </div>
                      <Progress value={25} className="mt-2" />
                      <p className="text-xs text-muted-foreground">Popular in NW/SW regions</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-yellow-400">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Pidgin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Reports:</span>
                        <span className="font-semibold">
                          {whatsappReports.filter(r => r.language_detected === 'pidgin').length}
                        </span>
                      </div>
                      <Progress value={20} className="mt-2" />
                      <p className="text-xs text-muted-foreground">Growing in rural communities</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>WhatsApp Bridge Configuration</span>
              </CardTitle>
              <CardDescription>
                Manage WhatsApp Business API settings and privacy controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Privacy Protection:</strong> All phone numbers and sender identities are automatically removed. 
                    Only message content and regional data are analyzed for civic sentiment monitoring.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">API Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>WhatsApp Business:</span>
                          <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
                            {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Webhook Status:</span>
                          <Badge variant="default">Active</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Message Processing:</span>
                          <Badge variant="default">Real-time</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Alert Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Negative Threshold:</span>
                          <span className="text-sm">10+ messages/30min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Auto-flag Abuse:</span>
                          <Badge variant="default">Enabled</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Admin Responses:</span>
                          <Badge variant="default">Automated</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex space-x-4">
                  <Button onClick={testWhatsAppConnection}>
                    Test WhatsApp Connection
                  </Button>
                  <Button variant="outline">
                    Configure Webhook
                  </Button>
                  <Button variant="outline">
                    View Privacy Policy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CivicWhatsAppBridge;