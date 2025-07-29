import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Database,
  History,
  TrendingUp,
  TrendingDown,
  CalendarIcon,
  MapPin,
  Filter,
  BarChart3,
  LineChart,
  Clock3,
  Play,
  Pause,
  RotateCcw,
  Zap,
  AlertTriangle,
  Heart,
  Users,
  Hash,
  Eye
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
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

interface HistoricalSentiment {
  date: string;
  region?: string;
  overall_sentiment: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  total_entries: number;
  dominant_emotions: string[];
  top_keywords: string[];
  threat_level_avg: number;
}

interface EmotionalMemory {
  emotion: string;
  historical_trend: Array<{ date: string; intensity: number; events: string[] }>;
  peak_periods: Array<{ date: string; intensity: number; trigger: string }>;
  baseline_level: number;
  volatility_score: number;
}

interface CivicEvent {
  date: string;
  event_type: 'election' | 'crisis' | 'campaign' | 'policy' | 'incident';
  title: string;
  description: string;
  sentiment_impact: number;
  affected_regions: string[];
  emotional_signature: { [key: string]: number };
}

interface MemoryStats {
  total_data_points: number;
  earliest_record: string;
  latest_record: string;
  unique_regions: number;
  total_emotions_tracked: number;
  archived_events: number;
}

const CAMEROON_REGIONS = [
  'Centre', 'Littoral', 'Southwest', 'Northwest', 'West', 
  'East', 'Adamawa', 'North', 'Far North', 'South'
];

const EMOTION_COLORS = {
  anger: '#ef4444',
  joy: '#22c55e', 
  fear: '#8b5cf6',
  sadness: '#3b82f6',
  hope: '#f59e0b',
  frustration: '#f97316',
  pride: '#10b981',
  anxiety: '#6366f1'
};

export const CivicMemoryEngine = () => {
  const [historicalData, setHistoricalData] = useState<HistoricalSentiment[]>([]);
  const [emotionalMemories, setEmotionalMemories] = useState<EmotionalMemory[]>([]);
  const [civicEvents, setCivicEvents] = useState<CivicEvent[]>([]);
  const [memoryStats, setMemoryStats] = useState<MemoryStats>({
    total_data_points: 0,
    earliest_record: '',
    latest_record: '',
    unique_regions: 0,
    total_emotions_tracked: 0,
    archived_events: 0
  });
  
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('30d');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('all');
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayDate, setReplayDate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMemoryData();
    const interval = setInterval(loadMemoryData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [selectedRegion, selectedTimeRange]);

  const loadMemoryData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadHistoricalSentiment(),
        loadEmotionalMemories(),
        loadCivicEvents(),
        loadMemoryStats()
      ]);
    } catch (error) {
      console.error('Error loading memory data:', error);
      toast.error('Failed to load civic memory data');
    } finally {
      setLoading(false);
    }
  };

  const loadHistoricalSentiment = async () => {
    const daysBack = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 
                     selectedTimeRange === '90d' ? 90 : selectedTimeRange === '1y' ? 365 : 30;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    let query = supabase
      .from('camerpulse_intelligence_sentiment_logs')
      .select(`
        created_at,
        region_detected,
        sentiment_score,
        sentiment_polarity,
        emotional_tone,
        keywords_detected,
        threat_level
      `)
      .gte('created_at', startDate.toISOString())
      .order('created_at');

    if (selectedRegion !== 'all') {
      query = query.eq('region_detected', selectedRegion);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Aggregate data by date
    const aggregated = new Map<string, any>();
    
    data?.forEach(entry => {
      const date = new Date(entry.created_at).toISOString().split('T')[0];
      const key = selectedRegion === 'all' ? date : `${date}-${entry.region_detected}`;
      
      if (!aggregated.has(key)) {
        aggregated.set(key, {
          date,
          region: entry.region_detected,
          sentiment_scores: [],
          emotions: [],
          keywords: [],
          threat_levels: [],
          polarities: { positive: 0, negative: 0, neutral: 0 }
        });
      }
      
      const item = aggregated.get(key)!;
      item.sentiment_scores.push(entry.sentiment_score || 0);
      if (entry.emotional_tone) item.emotions.push(...entry.emotional_tone);
      if (entry.keywords_detected) item.keywords.push(...entry.keywords_detected);
      if (entry.threat_level) item.threat_levels.push(entry.threat_level);
      item.polarities[entry.sentiment_polarity as keyof typeof item.polarities]++;
    });

    const processed: HistoricalSentiment[] = Array.from(aggregated.values()).map(item => ({
      date: item.date,
      region: item.region,
      overall_sentiment: item.sentiment_scores.reduce((a: number, b: number) => a + b, 0) / item.sentiment_scores.length || 0,
      positive_count: item.polarities.positive,
      negative_count: item.polarities.negative,
      neutral_count: item.polarities.neutral,
      total_entries: item.sentiment_scores.length,
      dominant_emotions: [...new Set(item.emotions.filter((e: any) => typeof e === 'string'))].slice(0, 3) as string[],
      top_keywords: [...new Set(item.keywords.filter((k: any) => typeof k === 'string'))].slice(0, 5) as string[],
      threat_level_avg: item.threat_levels.filter((t: string) => t !== 'none').length / item.threat_levels.length || 0
    }));

    setHistoricalData(processed.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const loadEmotionalMemories = async () => {
    // Create emotional memory patterns from historical data
    const emotions = ['anger', 'joy', 'fear', 'sadness', 'hope', 'frustration', 'pride', 'anxiety'];
    const memories: EmotionalMemory[] = [];

    for (const emotion of emotions) {
      const { data, error } = await supabase
        .from('camerpulse_intelligence_sentiment_logs')
        .select('created_at, emotional_tone, sentiment_score')
        .contains('emotional_tone', [emotion])
        .order('created_at');

      if (error) continue;

      // Aggregate by week
      const weeklyData = new Map<string, number[]>();
      data?.forEach(entry => {
        const date = new Date(entry.created_at);
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyData.has(weekKey)) {
          weeklyData.set(weekKey, []);
        }
        weeklyData.get(weekKey)!.push(Math.abs(entry.sentiment_score || 0));
      });

      const historical_trend = Array.from(weeklyData.entries())
        .map(([date, scores]) => ({
          date,
          intensity: scores.reduce((a, b) => a + b, 0) / scores.length || 0,
          events: [] // Could be populated with significant events
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const intensities = historical_trend.map(t => t.intensity);
      const baseline_level = intensities.reduce((a, b) => a + b, 0) / intensities.length || 0;
      
      memories.push({
        emotion,
        historical_trend,
        peak_periods: historical_trend
          .filter(t => t.intensity > baseline_level * 1.5)
          .map(t => ({ ...t, trigger: 'Unknown trigger' }))
          .slice(0, 5),
        baseline_level,
        volatility_score: Math.sqrt(intensities.reduce((acc, val) => acc + Math.pow(val - baseline_level, 2), 0) / intensities.length)
      });
    }

    setEmotionalMemories(memories);
  };

  const loadCivicEvents = async () => {
    // Generate sample events - in production, this would come from a dedicated events table
    const sampleEvents: CivicEvent[] = [
      {
        date: '2024-01-15',
        event_type: 'election',
        title: 'Regional Elections Announced',
        description: 'Government announces upcoming regional elections',
        sentiment_impact: 0.3,
        affected_regions: ['Centre', 'Littoral'],
        emotional_signature: { hope: 0.4, anxiety: 0.3, excitement: 0.3 }
      },
      {
        date: '2024-02-20',
        event_type: 'crisis',
        title: 'Security Incident in Northwest',
        description: 'Security incident reported in Northwest region',
        sentiment_impact: -0.7,
        affected_regions: ['Northwest'],
        emotional_signature: { fear: 0.5, anger: 0.3, sadness: 0.2 }
      },
      {
        date: '2024-03-10',
        event_type: 'policy',
        title: 'New Education Policy',
        description: 'Government announces new education reforms',
        sentiment_impact: 0.2,
        affected_regions: CAMEROON_REGIONS,
        emotional_signature: { hope: 0.4, skepticism: 0.3, optimism: 0.3 }
      }
    ];

    setCivicEvents(sampleEvents);
  };

  const loadMemoryStats = async () => {
    try {
      const [logsResult, regionsResult] = await Promise.all([
        supabase
          .from('camerpulse_intelligence_sentiment_logs')
          .select('created_at, region_detected, emotional_tone', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(1),
        supabase
          .from('camerpulse_intelligence_sentiment_logs')
          .select('region_detected')
          .not('region_detected', 'is', null)
      ]);

      const { count: totalLogs } = logsResult;
      const uniqueRegions = new Set(regionsResult.data?.map(r => r.region_detected).filter(Boolean)).size;

      // Get date range
      const { data: dateRange } = await supabase
        .from('camerpulse_intelligence_sentiment_logs')
        .select('created_at')
        .order('created_at', { ascending: true })
        .limit(1);

      setMemoryStats({
        total_data_points: totalLogs || 0,
        earliest_record: dateRange?.[0]?.created_at || '',
        latest_record: logsResult.data?.[0]?.created_at || '',
        unique_regions: uniqueRegions,
        total_emotions_tracked: Object.keys(EMOTION_COLORS).length,
        archived_events: civicEvents.length
      });
    } catch (error) {
      console.error('Error loading memory stats:', error);
    }
  };

  const startReplay = async (date: string) => {
    setIsReplaying(true);
    setReplayDate(date);
    
    try {
      const { data, error } = await supabase
        .from('camerpulse_intelligence_sentiment_logs')
        .select('*')
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`)
        .order('created_at');

      if (error) throw error;

      toast.success(`Replaying ${data?.length || 0} civic events from ${date}`);
      
      // Simulate replay with setTimeout
      setTimeout(() => {
        setIsReplaying(false);
        toast.info('Historical replay completed');
      }, 3000);
    } catch (error) {
      console.error('Error starting replay:', error);
      toast.error('Failed to start historical replay');
      setIsReplaying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatMemoryPeriod = (earliest: string, latest: string) => {
    if (!earliest || !latest) return 'No data';
    
    const start = new Date(earliest);
    const end = new Date(latest);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6" />
            Civic Memory Engine
          </h2>
          <p className="text-muted-foreground">
            Long-term memory of civic trends, emotions, and sentiment shifts
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isReplaying && (
            <Badge variant="secondary" className="animate-pulse">
              <Play className="h-3 w-3 mr-1" />
              Replaying {replayDate}
            </Badge>
          )}
          <Button onClick={loadMemoryData} disabled={loading} variant="outline">
            <RotateCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Memory
          </Button>
        </div>
      </div>

      {/* Memory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Data Points</p>
                <p className="text-2xl font-bold">{memoryStats.total_data_points.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock3 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Memory Span</p>
                <p className="text-2xl font-bold">
                  {formatMemoryPeriod(memoryStats.earliest_record, memoryStats.latest_record)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Regions</p>
                <p className="text-2xl font-bold">{memoryStats.unique_regions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <div>
                <p className="text-sm text-muted-foreground">Emotions</p>
                <p className="text-2xl font-bold">{memoryStats.total_emotions_tracked}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Events</p>
                <p className="text-2xl font-bold">{memoryStats.archived_events}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <History className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="text-sm text-muted-foreground">Since</p>
                <p className="text-lg font-bold">
                  {memoryStats.earliest_record ? formatDate(memoryStats.earliest_record) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {CAMEROON_REGIONS.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Emotion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Emotions</SelectItem>
                {Object.keys(EMOTION_COLORS).map(emotion => (
                  <SelectItem key={emotion} value={emotion}>
                    {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Historical Trends</TabsTrigger>
          <TabsTrigger value="emotions">Emotional Memory</TabsTrigger>
          <TabsTrigger value="events">Civic Events</TabsTrigger>
          <TabsTrigger value="replay">Historical Replay</TabsTrigger>
          <TabsTrigger value="analysis">Comparative Analysis</TabsTrigger>
        </TabsList>

        {/* Historical Trends */}
        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Over Time</CardTitle>
                <CardDescription>Daily sentiment trends for selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="overall_sentiment" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
                <CardDescription>Positive vs Negative vs Neutral over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="positive_count" fill="#22c55e" name="Positive" />
                    <Bar dataKey="negative_count" fill="#ef4444" name="Negative" />
                    <Bar dataKey="neutral_count" fill="#6b7280" name="Neutral" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Threat Level Trends</CardTitle>
                <CardDescription>Security threat indicators over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="threat_level_avg" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Historical Summary</CardTitle>
                <CardDescription>Key insights from the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {historicalData.slice(0, 5).map((day, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{formatDate(day.date)}</span>
                        <Badge variant={day.overall_sentiment > 0 ? 'default' : 'destructive'}>
                          {day.overall_sentiment.toFixed(2)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {day.total_entries} entries • {day.region || 'All regions'}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {day.dominant_emotions.map((emotion, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {emotion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Emotional Memory */}
        <TabsContent value="emotions">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {emotionalMemories
              .filter(memory => selectedEmotion === 'all' || memory.emotion === selectedEmotion)
              .map((memory, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: EMOTION_COLORS[memory.emotion as keyof typeof EMOTION_COLORS] }}
                    />
                    {memory.emotion.charAt(0).toUpperCase() + memory.emotion.slice(1)} Memory
                  </CardTitle>
                  <CardDescription>
                    Baseline: {memory.baseline_level.toFixed(2)} • 
                    Volatility: {memory.volatility_score.toFixed(2)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Historical Trend</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsLineChart data={memory.historical_trend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="intensity" 
                            stroke={EMOTION_COLORS[memory.emotion as keyof typeof EMOTION_COLORS]}
                            strokeWidth={2}
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Peak Periods</h4>
                      <div className="space-y-2">
                        {memory.peak_periods.slice(0, 3).map((peak, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span>{formatDate(peak.date)}</span>
                            <Badge variant="outline">
                              {peak.intensity.toFixed(2)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Civic Events */}
        <TabsContent value="events">
          <div className="space-y-4">
            {civicEvents.map((event, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={event.event_type === 'crisis' ? 'destructive' : 'default'}>
                          {event.event_type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(event.date)}
                        </span>
                        <Badge variant={event.sentiment_impact > 0 ? 'default' : 'destructive'}>
                          {event.sentiment_impact > 0 ? '+' : ''}{event.sentiment_impact.toFixed(2)}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <p className="text-muted-foreground mt-1">{event.description}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="text-sm">
                            {event.affected_regions.length > 3 
                              ? `${event.affected_regions.slice(0, 2).join(', ')} +${event.affected_regions.length - 2} more`
                              : event.affected_regions.join(', ')
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => startReplay(event.date)}
                      disabled={isReplaying}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Replay
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Emotional Signature</h4>
                    <div className="flex gap-2">
                      {Object.entries(event.emotional_signature).map(([emotion, intensity]) => (
                        <div key={emotion} className="flex items-center gap-1">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] || '#6b7280' }}
                          />
                          <span className="text-sm capitalize">{emotion}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(intensity * 100).toFixed(0)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Historical Replay */}
        <TabsContent value="replay">
          <Card>
            <CardHeader>
              <CardTitle>Historical Event Replay</CardTitle>
              <CardDescription>
                Experience past civic events through the sentiment lens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <input 
                  type="date" 
                  value={replayDate}
                  onChange={(e) => setReplayDate(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                />
                <Button 
                  onClick={() => startReplay(replayDate)}
                  disabled={!replayDate || isReplaying}
                >
                  {isReplaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Replaying...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Replay
                    </>
                  )}
                </Button>
              </div>
              
              {isReplaying && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock3 className="h-4 w-4 animate-spin" />
                    <span className="font-medium">Replaying events from {replayDate}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Simulating real-time sentiment flow and emotional patterns...
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Eye className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <h4 className="font-medium">Visual Replay</h4>
                    <p className="text-sm text-muted-foreground">
                      Watch sentiment unfold on maps
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <h4 className="font-medium">Data Replay</h4>
                    <p className="text-sm text-muted-foreground">
                      See metrics change over time
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Hash className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <h4 className="font-medium">Timeline Events</h4>
                    <p className="text-sm text-muted-foreground">
                      Follow key moments chronologically
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparative Analysis */}
        <TabsContent value="analysis">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Comparative Sentiment Analysis</CardTitle>
                <CardDescription>
                  Compare emotional patterns across different time periods, regions, or events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Advanced Analysis Coming Soon</p>
                  <p className="text-muted-foreground">
                    Comparative analysis tools for elections, crises, and campaigns will be available soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};