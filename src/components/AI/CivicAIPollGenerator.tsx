import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, 
  Settings, 
  Play,
  Clock, 
  TrendingUp,
  CheckCircle,
  XCircle,
  BarChart3,
  Globe,
  Hash,
  AlertTriangle,
  Timer,
  Calendar
} from 'lucide-react';

interface GenerationLog {
  id: string;
  topic: string;
  source: string;
  sentiment_score: number;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  keywords: string[];
  region?: string;
  generated_at: string;
  poll_created: boolean;
  ai_reasoning: any;
}

interface SocialTrend {
  platform: string;
  hashtag: string;
  mention_count: number;
  sentiment_score: number;
  trend_strength: number;
  detected_at: string;
  region?: string;
}

export const CivicAIPollGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(false);
  const [frequency, setFrequency] = useState<'6_hours' | 'daily' | 'manual'>('daily');
  const [socialMonitoring, setSocialMonitoring] = useState(false);
  const [generationLogs, setGenerationLogs] = useState<GenerationLog[]>([]);
  const [socialTrends, setSocialTrends] = useState<SocialTrend[]>([]);
  const [nextScanTime, setNextScanTime] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchConfiguration();
    fetchGenerationLogs();
    fetchSocialTrends();
    calculateNextScan();
  }, []);

  const fetchConfiguration = async () => {
    try {
      const { data } = await supabase
        .from('autonomous_poll_config')
        .select('*')
        .eq('is_enabled', true);

      const config = data?.reduce((acc, item) => {
        acc[item.config_key] = item.config_value;
        return acc;
      }, {} as Record<string, any>) || {};

      setIsEnabled(config.system_enabled?.enabled || false);
      setFrequency(config.generation_schedule?.frequency || 'daily');
      setSocialMonitoring(config.social_monitoring?.enabled || false);
    } catch (error) {
      console.error('Failed to fetch configuration:', error);
    }
  };

  const fetchGenerationLogs = async () => {
    try {
      // This would fetch from a generation logs table
      const { data } = await supabase
        .from('sentiment_trends')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(10);

      if (data) {
        const logs: GenerationLog[] = data.map(trend => ({
          id: trend.id,
          topic: trend.topic,
          source: trend.platform,
          sentiment_score: trend.sentiment_score,
          urgency_level: trend.trend_strength > 0.8 ? 'critical' : 
                        trend.trend_strength > 0.6 ? 'high' : 
                        trend.trend_strength > 0.4 ? 'medium' : 'low',
          keywords: trend.keywords || [],
          region: trend.region,
          generated_at: trend.detected_at,
          poll_created: false, // Would check if poll was created from this trend
          ai_reasoning: trend.metadata
        }));
        setGenerationLogs(logs);
      }
    } catch (error) {
      console.error('Failed to fetch generation logs:', error);
    }
  };

  const fetchSocialTrends = async () => {
    // Mock social trends data - in real implementation, this would come from social media APIs
    const mockTrends: SocialTrend[] = [
      {
        platform: 'twitter',
        hashtag: '#CameroonDevelopment',
        mention_count: 1250,
        sentiment_score: 0.7,
        trend_strength: 0.8,
        detected_at: new Date().toISOString(),
        region: 'Centre'
      },
      {
        platform: 'facebook',
        hashtag: '#FuelScarcity',
        mention_count: 890,
        sentiment_score: -0.5,
        trend_strength: 0.9,
        detected_at: new Date().toISOString(),
        region: 'Littoral'
      }
    ];
    setSocialTrends(mockTrends);
  };

  const calculateNextScan = () => {
    const now = new Date();
    let nextScan = new Date();
    
    switch (frequency) {
      case '6_hours':
        nextScan.setHours(now.getHours() + 6);
        break;
      case 'daily':
        nextScan.setDate(now.getDate() + 1);
        nextScan.setHours(9, 0, 0, 0); // 9 AM next day
        break;
      default:
        nextScan = now; // Manual mode
    }
    
    setNextScanTime(nextScan.toLocaleString());
  };

  const updateConfiguration = async (key: string, value: any) => {
    try {
      await supabase
        .from('autonomous_poll_config')
        .upsert({
          config_key: key,
          config_value: value,
          updated_by: user?.id
        });

      toast({
        title: "Configuration Updated",
        description: `${key} settings have been saved`
      });
    } catch (error) {
      toast({
        title: "Update Failed", 
        description: "Failed to save configuration",
        variant: "destructive"
      });
    }
  };

  const triggerImmediateGeneration = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('camerpulse-intelligence-core');
      
      if (error) throw error;

      toast({
        title: "CivicAIPollGenerator Activated! 🧠",
        description: data.success 
          ? `New poll created: "${data.poll.title.substring(0, 40)}..."`
          : data.message || "Scan completed"
      });

      fetchGenerationLogs();
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate poll",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 via-background to-blue-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Brain className="w-8 h-8 text-purple-600 animate-pulse" />
            CivicAIPollGenerator
            <Badge variant={isEnabled ? "default" : "secondary"}>
              {isEnabled ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Real-time AI poll generation based on trending civic topics, social media sentiment, and regional concerns
          </p>
        </CardHeader>
      </Card>

      {/* Controls Panel */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              AI Generator Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable AI Poll Generation</p>
                <p className="text-sm text-muted-foreground">Automatically create polls from trending topics</p>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={(checked) => {
                  setIsEnabled(checked);
                  updateConfiguration('system_enabled', { 
                    enabled: checked, 
                    description: "CivicAIPollGenerator master switch" 
                  });
                }}
              />
            </div>

            <div className="space-y-2">
              <p className="font-medium">Generation Frequency</p>
              <select 
                className="w-full px-3 py-2 border rounded-md"
                value={frequency}
                onChange={(e) => {
                  const newFreq = e.target.value as any;
                  setFrequency(newFreq);
                  updateConfiguration('generation_schedule', {
                    frequency: newFreq,
                    max_per_week: 3,
                    min_confidence: 0.7
                  });
                  calculateNextScan();
                }}
              >
                <option value="6_hours">Every 6 hours</option>
                <option value="daily">Daily</option>
                <option value="manual">Manual only</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Social Media Monitoring</p>
                <p className="text-sm text-muted-foreground">Track Twitter, Facebook trends</p>
              </div>
              <Switch
                checked={socialMonitoring}
                onCheckedChange={(checked) => {
                  setSocialMonitoring(checked);
                  updateConfiguration('social_monitoring', {
                    enabled: checked,
                    platforms: ['twitter', 'facebook'],
                    hashtag_threshold: 100
                  });
                }}
              />
            </div>

            {frequency !== 'manual' && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Next scan:</span>
                  <span className="text-blue-600">{nextScanTime}</span>
                </div>
              </div>
            )}

            <Button 
              onClick={triggerImmediateGeneration}
              disabled={!isEnabled || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  AI is analyzing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Generate Poll Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Live Trends Monitor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Live Social Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {socialTrends.map((trend, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{trend.hashtag}</span>
                    <Badge variant="outline" className="text-xs">
                      {trend.platform}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {trend.mention_count} mentions
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${trend.trend_strength * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">
                    {(trend.trend_strength * 100).toFixed(0)}%
                  </span>
                </div>
                {trend.region && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    📍 {trend.region}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Generation Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            AI Generation Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {generationLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                No generation activity yet
              </div>
            ) : (
              generationLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{log.topic}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {log.source}
                        </Badge>
                        <Badge className={`text-xs ${getUrgencyColor(log.urgency_level)}`}>
                          {log.urgency_level} urgency
                        </Badge>
                        {log.region && (
                          <Badge variant="outline" className="text-xs">
                            📍 {log.region}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {log.poll_created ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Poll Created
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <XCircle className="w-3 h-3 mr-1" />
                          No Poll
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {log.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {log.keywords.slice(0, 5).map((keyword, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-xs rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Detected {new Date(log.generated_at).toLocaleString()} • 
                    Sentiment: {log.sentiment_score > 0 ? 'Positive' : log.sentiment_score < 0 ? 'Negative' : 'Neutral'}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};