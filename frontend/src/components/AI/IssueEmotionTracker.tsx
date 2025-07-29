import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  MapPin, 
  Calendar, 
  Hash, 
  AlertTriangle, 
  Heart,
  Flame,
  Frown,
  Smile,
  Target,
  Filter,
  Clock,
  Eye,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Define civic topics and their keywords
const CIVIC_TOPICS = {
  fuel: {
    name: 'Fuel & Energy',
    keywords: ['fuel', 'petrol', 'gas', 'energy', 'electricity', 'power', 'eneo', 'carburant', 'essence'],
    icon: '⛽',
    color: '#f97316'
  },
  education: {
    name: 'Education',
    keywords: ['education', 'school', 'university', 'student', 'teacher', 'exam', 'ecole', 'universite', 'etudiant'],
    icon: '📚',
    color: '#3b82f6'
  },
  security: {
    name: 'Security & Conflict',
    keywords: ['security', 'police', 'military', 'conflict', 'violence', 'army', 'crisis', 'securite', 'militaire'],
    icon: '🛡️',
    color: '#dc2626'
  },
  healthcare: {
    name: 'Healthcare',
    keywords: ['health', 'hospital', 'doctor', 'medical', 'medicine', 'clinic', 'sante', 'hopital', 'medecin'],
    icon: '🏥',
    color: '#059669'
  },
  corruption: {
    name: 'Corruption & Governance',
    keywords: ['corruption', 'government', 'minister', 'scandal', 'embezzlement', 'gouvernement', 'ministre', 'scandale'],
    icon: '⚖️',
    color: '#7c2d12'
  },
  anglophone: {
    name: 'Anglophone Crisis',
    keywords: ['anglophone', 'separatist', 'ambazonia', 'northwest', 'southwest', 'bamenda', 'buea', 'nw', 'sw'],
    icon: '🏴',
    color: '#881337'
  },
  youth_employment: {
    name: 'Youth & Employment',
    keywords: ['youth', 'employment', 'job', 'unemployment', 'work', 'jeune', 'emploi', 'travail', 'chomage'],
    icon: '👥',
    color: '#7c3aed'
  },
  elections: {
    name: 'Elections & Politics',
    keywords: ['election', 'vote', 'campaign', 'candidate', 'elecam', 'ballot', 'politique', 'candidat'],
    icon: '🗳️',
    color: '#0891b2'
  }
};

// Emotion types with colors and icons
const EMOTION_TYPES = {
  anger: { name: 'Anger', icon: '😡', color: '#dc2626' },
  fear: { name: 'Fear', icon: '😨', color: '#f59e0b' },
  hope: { name: 'Hope', icon: '🙏', color: '#10b981' },
  sadness: { name: 'Sadness', icon: '😢', color: '#6366f1' },
  sarcasm: { name: 'Sarcasm', icon: '🎭', color: '#8b5cf6' },
  joy: { name: 'Joy', icon: '😄', color: '#06b6d4' }
};

const CAMEROON_REGIONS = [
  'All Regions',
  'Centre',
  'Littoral', 
  'West',
  'Northwest',
  'Southwest',
  'North',
  'Far North',
  'East',
  'South',
  'Adamawa'
];

interface TopicEmotionData {
  topic: string;
  date: string;
  emotion: string;
  intensity: number;
  volume: number;
  region: string;
  keywords: string[];
  hashtags: string[];
}

interface EmotionAlert {
  id: string;
  topic: string;
  emotion: string;
  region: string;
  intensity: number;
  duration_days: number;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
}

interface KeywordTrend {
  keyword: string;
  frequency: number;
  sentiment_score: number;
  peak_date: string;
  topic: string;
}

const IssueEmotionTracker = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('fuel');
  const [selectedRegion, setSelectedRegion] = useState<string>('All Regions');
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [emotionData, setEmotionData] = useState<TopicEmotionData[]>([]);
  const [alerts, setAlerts] = useState<EmotionAlert[]>([]);
  const [keywordTrends, setKeywordTrends] = useState<KeywordTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<string>('timeline');

  useEffect(() => {
    loadIssueEmotionData();
    const interval = setInterval(loadIssueEmotionData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [selectedTopic, selectedRegion, timeRange]);

  const loadIssueEmotionData = async () => {
    try {
      setIsLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Load sentiment data for analysis
      let query = supabase
        .from('camerpulse_intelligence_sentiment_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (selectedRegion !== 'All Regions') {
        query = query.eq('region_detected', selectedRegion);
      }

      const { data: sentimentData } = await query.limit(1000);

      if (sentimentData) {
        const analysisResults = analyzeTopicEmotions(sentimentData);
        setEmotionData(analysisResults.emotionData);
        setAlerts(analysisResults.alerts);
        setKeywordTrends(analysisResults.keywordTrends);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading issue emotion data:', error);
      setIsLoading(false);
    }
  };

  const analyzeTopicEmotions = (sentimentData: any[]): {
    emotionData: TopicEmotionData[];
    alerts: EmotionAlert[];
    keywordTrends: KeywordTrend[];
  } => {
    const emotionData: TopicEmotionData[] = [];
    const alerts: EmotionAlert[] = [];
    const keywordTrends: KeywordTrend[] = [];
    const topicKeywords = CIVIC_TOPICS[selectedTopic as keyof typeof CIVIC_TOPICS]?.keywords || [];

    // Filter data by selected topic
    const topicData = sentimentData.filter(item => {
      const contentText = item.content_text?.toLowerCase() || '';
      const keywords = item.keywords_detected || [];
      const hashtags = item.hashtags || [];
      
      return topicKeywords.some(keyword => 
        contentText.includes(keyword.toLowerCase()) ||
        keywords.some((k: string) => k.toLowerCase().includes(keyword.toLowerCase())) ||
        hashtags.some((h: string) => h.toLowerCase().includes(keyword.toLowerCase()))
      );
    });

    // Group by date and analyze emotions
    const dateGroups: Record<string, any[]> = {};
    topicData.forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      if (!dateGroups[date]) dateGroups[date] = [];
      dateGroups[date].push(item);
    });

    // Generate emotion timeline data
    Object.entries(dateGroups).forEach(([date, items]) => {
      const emotions = analyzeEmotionsForDate(items);
      
      Object.entries(emotions).forEach(([emotion, data]) => {
        emotionData.push({
          topic: selectedTopic,
          date,
          emotion,
          intensity: data.intensity,
          volume: data.volume,
          region: selectedRegion,
          keywords: data.keywords,
          hashtags: data.hashtags
        });
      });
    });

    // Generate alerts for sustained high emotions
    const emotionAlerts = generateEmotionAlerts(emotionData);
    alerts.push(...emotionAlerts);

    // Analyze keyword trends
    const trends = analyzeKeywordTrends(topicData);
    keywordTrends.push(...trends);

    return { emotionData, alerts, keywordTrends };
  };

  const analyzeEmotionsForDate = (items: any[]) => {
    const emotions: Record<string, { intensity: number; volume: number; keywords: string[]; hashtags: string[] }> = {};
    
    Object.keys(EMOTION_TYPES).forEach(emotion => {
      emotions[emotion] = { intensity: 0, volume: 0, keywords: [], hashtags: [] };
    });

    items.forEach(item => {
      const sentimentScore = item.sentiment_score || 0;
      const emotionalTone = item.emotional_tone || [];
      const keywords = item.keywords_detected || [];
      const hashtags = item.hashtags || [];

      // Map emotional tones to our emotion types
      if (emotionalTone.includes('anger') || sentimentScore < -0.7) {
        emotions.anger.intensity += Math.abs(sentimentScore);
        emotions.anger.volume += 1;
        emotions.anger.keywords.push(...keywords);
        emotions.anger.hashtags.push(...hashtags);
      }
      
      if (emotionalTone.includes('fear') || item.threat_level === 'high') {
        emotions.fear.intensity += 0.8;
        emotions.fear.volume += 1;
        emotions.fear.keywords.push(...keywords);
        emotions.fear.hashtags.push(...hashtags);
      }
      
      if (emotionalTone.includes('hope') || sentimentScore > 0.5) {
        emotions.hope.intensity += sentimentScore;
        emotions.hope.volume += 1;
        emotions.hope.keywords.push(...keywords);
        emotions.hope.hashtags.push(...hashtags);
      }
      
      if (emotionalTone.includes('sadness') || (sentimentScore < -0.3 && sentimentScore > -0.7)) {
        emotions.sadness.intensity += Math.abs(sentimentScore);
        emotions.sadness.volume += 1;
        emotions.sadness.keywords.push(...keywords);
        emotions.sadness.hashtags.push(...hashtags);
      }

      // Detect sarcasm through specific patterns
      const contentText = item.content_text?.toLowerCase() || '';
      if (contentText.includes('obviously') || contentText.includes('brilliant') || contentText.includes('genius')) {
        emotions.sarcasm.intensity += 0.6;
        emotions.sarcasm.volume += 1;
        emotions.sarcasm.keywords.push(...keywords);
        emotions.sarcasm.hashtags.push(...hashtags);
      }
      
      if (emotionalTone.includes('joy') || sentimentScore > 0.7) {
        emotions.joy.intensity += sentimentScore;
        emotions.joy.volume += 1;
        emotions.joy.keywords.push(...keywords);
        emotions.joy.hashtags.push(...hashtags);
      }
    });

    // Normalize intensities
    Object.keys(emotions).forEach(emotion => {
      if (emotions[emotion].volume > 0) {
        emotions[emotion].intensity = emotions[emotion].intensity / emotions[emotion].volume;
        emotions[emotion].keywords = [...new Set(emotions[emotion].keywords)].slice(0, 5);
        emotions[emotion].hashtags = [...new Set(emotions[emotion].hashtags)].slice(0, 5);
      }
    });

    return emotions;
  };

  const generateEmotionAlerts = (data: TopicEmotionData[]): EmotionAlert[] => {
    const alerts: EmotionAlert[] = [];
    
    // Group by emotion and check for sustained high levels
    const emotionGroups: Record<string, TopicEmotionData[]> = {};
    data.forEach(item => {
      if (!emotionGroups[item.emotion]) emotionGroups[item.emotion] = [];
      emotionGroups[item.emotion].push(item);
    });

    Object.entries(emotionGroups).forEach(([emotion, items]) => {
      // Sort by date
      items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Check for sustained high intensity (3+ consecutive days above 0.6)
      let consecutiveDays = 0;
      let maxIntensity = 0;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].intensity > 0.6) {
          consecutiveDays++;
          maxIntensity = Math.max(maxIntensity, items[i].intensity);
        } else {
          if (consecutiveDays >= 3) {
            alerts.push({
              id: `alert_${emotion}_${Date.now()}`,
              topic: selectedTopic,
              emotion,
              region: selectedRegion,
              intensity: maxIntensity,
              duration_days: consecutiveDays,
              description: `Sustained ${emotion} detected for ${consecutiveDays} days`,
              severity: maxIntensity > 0.8 ? 'critical' : maxIntensity > 0.7 ? 'high' : 'medium',
              created_at: new Date().toISOString()
            });
          }
          consecutiveDays = 0;
          maxIntensity = 0;
        }
      }
    });

    return alerts;
  };

  const analyzeKeywordTrends = (data: any[]): KeywordTrend[] => {
    const keywordStats: Record<string, { frequency: number; sentiment_total: number; dates: string[] }> = {};
    
    data.forEach(item => {
      const keywords = item.keywords_detected || [];
      const hashtags = item.hashtags || [];
      const allKeywords = [...keywords, ...hashtags.map((h: string) => `#${h}`)];
      const sentiment = item.sentiment_score || 0;
      const date = item.created_at;

      allKeywords.forEach((keyword: string) => {
        if (!keywordStats[keyword]) {
          keywordStats[keyword] = { frequency: 0, sentiment_total: 0, dates: [] };
        }
        keywordStats[keyword].frequency += 1;
        keywordStats[keyword].sentiment_total += sentiment;
        keywordStats[keyword].dates.push(date);
      });
    });

    return Object.entries(keywordStats)
      .filter(([_, stats]) => stats.frequency >= 3) // Minimum 3 mentions
      .map(([keyword, stats]) => ({
        keyword,
        frequency: stats.frequency,
        sentiment_score: stats.sentiment_total / stats.frequency,
        peak_date: stats.dates.sort().reverse()[0],
        topic: selectedTopic
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20);
  };

  const getTimelineData = () => {
    const timelineData: Record<string, Record<string, number>> = {};
    
    emotionData.forEach(item => {
      if (!timelineData[item.date]) {
        timelineData[item.date] = {};
      }
      timelineData[item.date][item.emotion] = item.intensity;
    });

    return Object.entries(timelineData)
      .map(([date, emotions]) => ({
        date: new Date(date).toLocaleDateString(),
        ...emotions
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getEmotionDistribution = () => {
    const distribution: Record<string, number> = {};
    
    emotionData.forEach(item => {
      if (!distribution[item.emotion]) distribution[item.emotion] = 0;
      distribution[item.emotion] += item.volume;
    });

    return Object.entries(distribution).map(([emotion, volume]) => ({
      name: EMOTION_TYPES[emotion as keyof typeof EMOTION_TYPES]?.name || emotion,
      value: volume,
      color: EMOTION_TYPES[emotion as keyof typeof EMOTION_TYPES]?.color || '#6b7280'
    }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-red-400';
      case 'medium': return 'bg-yellow-400';
      case 'low': return 'bg-blue-400';
      default: return 'bg-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <TrendingUp className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Analyzing emotional evolution for civic issues...</p>
        </div>
      </div>
    );
  }

  const timelineData = getTimelineData();
  const distributionData = getEmotionDistribution();
  const topicInfo = CIVIC_TOPICS[selectedTopic as keyof typeof CIVIC_TOPICS];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span>Issue Emotion Tracker</span>
          </CardTitle>
          <CardDescription>
            Track emotional evolution over time for specific civic topics and issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Select Topic" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CIVIC_TOPICS).map(([key, topic]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center space-x-2">
                      <span>{topic.icon}</span>
                      <span>{topic.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                {CAMEROON_REGIONS.map(region => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 3 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={loadIssueEmotionData} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Refresh Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Topic Overview */}
      {topicInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">{topicInfo.icon}</span>
              <span>{topicInfo.name} Analysis</span>
            </CardTitle>
            <CardDescription>
              Emotional timeline and patterns for {topicInfo.name.toLowerCase()} in {selectedRegion}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{emotionData.length}</div>
                <div className="text-sm text-muted-foreground">Data Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{keywordTrends.length}</div>
                <div className="text-sm text-muted-foreground">Trending Keywords</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{alerts.length}</div>
                <div className="text-sm text-muted-foreground">Active Alerts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{timeRange}</div>
                <div className="text-sm text-muted-foreground">Analysis Period</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Analysis Dashboard */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Emotional Timeline</TabsTrigger>
          <TabsTrigger value="distribution">Emotion Distribution</TabsTrigger>
          <TabsTrigger value="keywords">Keyword Evolution</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emotional Evolution Timeline</CardTitle>
              <CardDescription>
                Track how emotions change over time for {topicInfo?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    {Object.entries(EMOTION_TYPES).map(([emotion, config]) => (
                      <Line
                        key={emotion}
                        type="monotone"
                        dataKey={emotion}
                        stroke={config.color}
                        strokeWidth={2}
                        name={config.name}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No emotional timeline data available for the selected criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Emotion Distribution</CardTitle>
                <CardDescription>
                  Overall emotional breakdown for {topicInfo?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {distributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No emotion distribution data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emotion Intensity Levels</CardTitle>
                <CardDescription>
                  Average intensity by emotion type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(EMOTION_TYPES).map(([emotion, config]) => {
                    const avgIntensity = emotionData
                      .filter(d => d.emotion === emotion)
                      .reduce((sum, d) => sum + d.intensity, 0) / 
                      (emotionData.filter(d => d.emotion === emotion).length || 1);

                    return (
                      <div key={emotion} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{config.icon}</span>
                          <span className="font-medium">{config.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${avgIntensity * 100}%`,
                                backgroundColor: config.color
                              }}
                            />
                          </div>
                          <Badge variant="outline">
                            {(avgIntensity * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Hash className="h-5 w-5" />
                <span>Keyword Evolution</span>
              </CardTitle>
              <CardDescription>
                Trending keywords and hashtags during emotional spikes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Top Trending Keywords</h4>
                  <div className="space-y-2">
                    {keywordTrends.slice(0, 10).map((trend, index) => (
                      <div key={trend.keyword} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                          <span className="font-medium">{trend.keyword}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {trend.frequency} mentions
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              trend.sentiment_score > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {trend.sentiment_score > 0 ? '+' : ''}{trend.sentiment_score.toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Keyword Frequency Chart</h4>
                  {keywordTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={keywordTrends.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="keyword" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="frequency" fill={topicInfo?.color || '#3b82f6'} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Hash className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No keyword trends available</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Emotional Alerts & Patterns</span>
              </CardTitle>
              <CardDescription>
                Sustained emotional spikes and pattern warnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <Alert key={alert.id}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div>
                            <strong>{EMOTION_TYPES[alert.emotion as keyof typeof EMOTION_TYPES]?.name || alert.emotion}</strong> 
                            {' '}sustained for <strong>{alert.duration_days} days</strong> on {topicInfo?.name}
                            <div className="text-sm text-muted-foreground mt-1">
                              Peak intensity: {(alert.intensity * 100).toFixed(0)}% | Region: {alert.region}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {alert.duration_days}d
                            </Badge>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sustained emotional patterns detected</p>
                  <p className="text-sm">Alerts appear when emotions stay elevated for 3+ days</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IssueEmotionTracker;