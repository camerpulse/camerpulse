import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Eye, 
  Plus, 
  Play, 
  AlertTriangle, 
  Shield, 
  Activity,
  TrendingUp,
  Globe,
  Radio,
  Youtube,
  FileText,
  Settings,
  ExternalLink,
  Trash2,
  Edit
} from "lucide-react";

interface MediaSource {
  id: string;
  source_name: string;
  source_url: string;
  source_type: string;
  is_active: boolean;
  bias_threshold: number;
  trust_threshold: number;
  threat_threshold: string;
  last_monitored_at: string | null;
  public_display: boolean;
}

interface ContentAnalysis {
  id: string;
  title: string;
  content_url: string;
  bias_score: number;
  bias_level: string;
  trust_score: number;
  threat_level: string;
  tone: string;
  agenda_detected: string;
  politicians_mentioned: string[];
  parties_mentioned: string[];
  regions_mentioned: string[];
  content_summary: string;
  analysis_timestamp: string;
  ai_confidence: number;
}

interface MediaAlert {
  id: string;
  alert_type: string;
  alert_title: string;
  alert_description: string;
  alert_severity: string;
  status: string;
  entities_affected: string[];
  created_at: string;
}

const CivicMediaWatch = () => {
  const [mediaSources, setMediaSources] = useState<MediaSource[]>([]);
  const [contentAnalysis, setContentAnalysis] = useState<ContentAnalysis[]>([]);
  const [alerts, setAlerts] = useState<MediaAlert[]>([]);
  const [stats, setStats] = useState({
    total_analysis: 0,
    avg_bias_score: 0,
    avg_trust_score: 0,
    high_threat_count: 0,
    active_alerts: 0,
    active_sources: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");

  // Form states
  const [newSource, setNewSource] = useState({
    source_name: '',
    source_url: '',
    source_type: 'news_website' as const,
    bias_threshold: 70,
    trust_threshold: 50,
    threat_threshold: 'medium' as const,
    public_display: false
  });

  const [manualAnalysis, setManualAnalysis] = useState({
    source_id: '',
    content_url: '',
    title: '',
    content_text: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadMediaSources(),
        loadContentAnalysis(),
        loadAlerts(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load civic media watch data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMediaSources = async () => {
    const { data, error } = await supabase
      .from('media_sources')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setMediaSources(data || []);
  };

  const loadContentAnalysis = async () => {
    const { data, error } = await supabase
      .from('media_content_analysis')
      .select('*')
      .order('analysis_timestamp', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    setContentAnalysis(data || []);
  };

  const loadAlerts = async () => {
    const { data, error } = await supabase
      .from('media_alerts')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    setAlerts(data || []);
  };

  const loadStats = async () => {
    try {
      const { data } = await supabase.functions.invoke('civic-media-watch', {
        body: { action: 'get_analysis_stats' }
      });
      if (data?.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const createMediaSource = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('media_sources')
        .insert([{
          ...newSource,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Media source created successfully"
      });

      setNewSource({
        source_name: '',
        source_url: '',
        source_type: 'news_website',
        bias_threshold: 70,
        trust_threshold: 50,
        threat_threshold: 'medium',
        public_display: false
      });

      await loadMediaSources();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeContent = async (sourceId?: string) => {
    try {
      setLoading(true);
      const analysisData = sourceId ? 
        { source_id: sourceId, url: mediaSources.find(s => s.id === sourceId)?.source_url } :
        manualAnalysis;

      const { data } = await supabase.functions.invoke('civic-media-watch', {
        body: {
          action: sourceId ? 'scrape_source' : 'analyze_content',
          ...analysisData
        }
      });

      if (data?.success) {
        toast({
          title: "Success",
          description: data.message || "Content analyzed successfully"
        });
        await Promise.all([loadContentAnalysis(), loadAlerts(), loadStats()]);
        
        if (!sourceId) {
          setManualAnalysis({
            source_id: '',
            content_url: '',
            title: '',
            content_text: ''
          });
        }
      } else {
        throw new Error(data?.error || 'Analysis failed');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'news_website': return <Globe className="w-4 h-4" />;
      case 'youtube_channel': return <Youtube className="w-4 h-4" />;
      case 'podcast': return <Radio className="w-4 h-4" />;
      case 'blog': return <FileText className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getBiasColor = (score: number) => {
    if (score >= 80) return "text-destructive";
    if (score >= 60) return "text-orange-500";
    if (score >= 30) return "text-yellow-500";
    return "text-green-500";
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'critical': return "text-destructive";
      case 'high': return "text-orange-500";
      case 'medium': return "text-yellow-500";
      default: return "text-green-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">AI-Powered Civic Media Watch</h2>
          <p className="text-muted-foreground">Monitor political content for disinformation, bias, and civic threats</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          Disinformation Firewall Active
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.total_analysis}</div>
            <div className="text-xs text-muted-foreground">Analysis (7d)</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getBiasColor(stats.avg_bias_score)}`}>
              {stats.avg_bias_score}%
            </div>
            <div className="text-xs text-muted-foreground">Avg Bias</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{stats.avg_trust_score}%</div>
            <div className="text-xs text-muted-foreground">Avg Trust</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{stats.high_threat_count}</div>
            <div className="text-xs text-muted-foreground">High Threats</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{stats.active_alerts}</div>
            <div className="text-xs text-muted-foreground">Active Alerts</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.active_sources}</div>
            <div className="text-xs text-muted-foreground">Sources</div>
          </div>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {contentAnalysis.slice(0, 5).map((analysis) => (
                      <div key={analysis.id} className="border-l-2 border-primary/20 pl-3 py-2">
                        <div className="font-medium text-sm truncate">{analysis.title}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className={getBiasColor(analysis.bias_score)}>
                            Bias: {analysis.bias_score}%
                          </Badge>
                          <Badge variant="outline" className="text-green-500">
                            Trust: {analysis.trust_score}%
                          </Badge>
                          <Badge variant="outline" className={getThreatColor(analysis.threat_level)}>
                            {analysis.threat_level}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Active Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="border-l-2 border-destructive/20 pl-3 py-2">
                        <div className="font-medium text-sm">{alert.alert_title}</div>
                        <div className="text-xs text-muted-foreground mb-1">{alert.alert_description}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="text-xs">
                            {alert.alert_severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(alert.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Manual Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Content Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Source</Label>
                  <Select value={manualAnalysis.source_id} onValueChange={(value) => 
                    setManualAnalysis(prev => ({ ...prev, source_id: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {mediaSources.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.source_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Content URL</Label>
                  <Input
                    value={manualAnalysis.content_url}
                    onChange={(e) => setManualAnalysis(prev => ({ ...prev, content_url: e.target.value }))}
                    placeholder="https://example.com/article"
                  />
                </div>
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={manualAnalysis.title}
                  onChange={(e) => setManualAnalysis(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Article title"
                />
              </div>
              <div>
                <Label>Content Text</Label>
                <Textarea
                  value={manualAnalysis.content_text}
                  onChange={(e) => setManualAnalysis(prev => ({ ...prev, content_text: e.target.value }))}
                  placeholder="Paste content text here..."
                  rows={4}
                />
              </div>
              <Button 
                onClick={() => analyzeContent()} 
                disabled={loading || !manualAnalysis.source_id}
                className="w-full"
              >
                <Activity className="w-4 h-4 mr-2" />
                Analyze Content
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Media Sources</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Source
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Media Source</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Source Name</Label>
                      <Input
                        value={newSource.source_name}
                        onChange={(e) => setNewSource(prev => ({ ...prev, source_name: e.target.value }))}
                        placeholder="CRTV News"
                      />
                    </div>
                    <div>
                      <Label>Source URL</Label>
                      <Input
                        value={newSource.source_url}
                        onChange={(e) => setNewSource(prev => ({ ...prev, source_url: e.target.value }))}
                        placeholder="https://crtv.cm/politics"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Source Type</Label>
                    <Select value={newSource.source_type} onValueChange={(value: any) => 
                      setNewSource(prev => ({ ...prev, source_type: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="news_website">News Website</SelectItem>
                        <SelectItem value="youtube_channel">YouTube Channel</SelectItem>
                        <SelectItem value="podcast">Podcast</SelectItem>
                        <SelectItem value="radio_stream">Radio Stream</SelectItem>
                        <SelectItem value="blog">Blog</SelectItem>
                        <SelectItem value="social_feed">Social Feed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Bias Threshold (%)</Label>
                      <Input
                        type="number"
                        value={newSource.bias_threshold}
                        onChange={(e) => setNewSource(prev => ({ ...prev, bias_threshold: parseInt(e.target.value) }))}
                        min={0}
                        max={100}
                      />
                    </div>
                    <div>
                      <Label>Trust Threshold (%)</Label>
                      <Input
                        type="number"
                        value={newSource.trust_threshold}
                        onChange={(e) => setNewSource(prev => ({ ...prev, trust_threshold: parseInt(e.target.value) }))}
                        min={0}
                        max={100}
                      />
                    </div>
                    <div>
                      <Label>Threat Threshold</Label>
                      <Select value={newSource.threat_threshold} onValueChange={(value: any) => 
                        setNewSource(prev => ({ ...prev, threat_threshold: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={createMediaSource} disabled={loading} className="w-full">
                    Create Source
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {mediaSources.map((source) => (
              <Card key={source.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getSourceTypeIcon(source.source_type)}
                      <div>
                        <div className="font-medium">{source.source_name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          {source.source_url}
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={source.is_active ? "default" : "secondary"}>
                        {source.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => analyzeContent(source.id)}
                        disabled={loading}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Bias: ≥{source.bias_threshold}%</span>
                    <span>Trust: ≤{source.trust_threshold}%</span>
                    <span>Threat: ≥{source.threat_threshold}</span>
                    {source.last_monitored_at && (
                      <span>Last: {new Date(source.last_monitored_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid gap-4">
            {contentAnalysis.map((analysis) => (
              <Card key={analysis.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium mb-2">{analysis.title}</div>
                      <div className="text-sm text-muted-foreground mb-3">{analysis.content_summary}</div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="text-center">
                          <div className={`text-lg font-bold ${getBiasColor(analysis.bias_score)}`}>
                            {analysis.bias_score}%
                          </div>
                          <div className="text-xs text-muted-foreground">Bias Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-500">{analysis.trust_score}%</div>
                          <div className="text-xs text-muted-foreground">Trust Score</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-bold ${getThreatColor(analysis.threat_level)}`}>
                            {analysis.threat_level}
                          </div>
                          <div className="text-xs text-muted-foreground">Threat Level</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline">{analysis.tone}</Badge>
                        <Badge variant="outline">{analysis.agenda_detected}</Badge>
                        {analysis.politicians_mentioned?.map(politician => (
                          <Badge key={politician} variant="secondary">{politician}</Badge>
                        ))}
                        {analysis.parties_mentioned?.map(party => (
                          <Badge key={party} variant="secondary">{party}</Badge>
                        ))}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Analyzed: {new Date(analysis.analysis_timestamp).toLocaleString()} | 
                        Confidence: {Math.round((analysis.ai_confidence || 0) * 100)}%
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <Button size="sm" variant="outline" asChild>
                        <a href={analysis.content_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-destructive">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <span className="font-medium">{alert.alert_title}</span>
                        <Badge variant="destructive">{alert.alert_severity}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">{alert.alert_description}</div>
                      {alert.entities_affected?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {alert.entities_affected.map(entity => (
                            <Badge key={entity} variant="outline" className="text-xs">{entity}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CivicMediaWatch;