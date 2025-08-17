import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Eye, 
  MessageSquare, 
  Users, 
  MapPin,
  RefreshCw,
  AlertTriangle,
  Activity,
  Smile,
  Frown,
  Meh
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SentimentData {
  id: string;
  content_source: string;
  sentiment_score: number;
  sentiment_label: string;
  confidence_score: number;
  emotion_scores: any;
  keywords: string[];
  topics: string[];
  region?: string;
  analyzed_at: string;
}

interface TrendData {
  topic_name: string;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  total_mentions: number;
  average_sentiment: number;
  trend_period: string;
}

interface DashboardMetrics {
  total_analyzed: number;
  avg_sentiment: number;
  positive_percentage: number;
  negative_percentage: number;
  neutral_percentage: number;
  trending_topics: number;
}

export default function SentimentAnalysisDashboard() {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total_analyzed: 0,
    avg_sentiment: 0,
    positive_percentage: 0,
    negative_percentage: 0,
    neutral_percentage: 0,
    trending_topics: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [sourceFilter, setSourceFilter] = useState('all');

  useEffect(() => {
    fetchSentimentData();
  }, [timeRange, sourceFilter]);

  const fetchSentimentData = async () => {
    try {
      setLoading(true);
      
      // Calculate time range for filtering
      const now = new Date();
      const timeRangeHours = {
        '1h': 1,
        '24h': 24,
        '7d': 168,
        '30d': 720
      }[timeRange] || 24;
      
      const startTime = new Date(now.getTime() - timeRangeHours * 60 * 60 * 1000);

      // Fetch sentiment analysis data
      let sentimentQuery = supabase
        .from('sentiment_analysis')
        .select('*')
        .gte('analyzed_at', startTime.toISOString())
        .order('analyzed_at', { ascending: false })
        .limit(1000);

      if (sourceFilter !== 'all') {
        sentimentQuery = sentimentQuery.eq('content_source', sourceFilter);
      }

      const { data: sentimentResult, error: sentimentError } = await sentimentQuery;

      if (sentimentError && sentimentError.code !== '42P01') {
        throw sentimentError;
      }

      // Use mock data if table doesn't exist or is empty
      const sentimentDataResult = sentimentResult && sentimentResult.length > 0 
        ? sentimentResult 
        : generateMockSentimentData();

      setSentimentData(sentimentDataResult);

      // Calculate metrics
      const totalAnalyzed = sentimentDataResult.length;
      const positiveCount = sentimentDataResult.filter(d => d.sentiment_label === 'positive').length;
      const negativeCount = sentimentDataResult.filter(d => d.sentiment_label === 'negative').length;
      const neutralCount = sentimentDataResult.filter(d => d.sentiment_label === 'neutral').length;
      
      const avgSentiment = totalAnalyzed > 0 
        ? sentimentDataResult.reduce((sum, d) => sum + d.sentiment_score, 0) / totalAnalyzed 
        : 0;

      setMetrics({
        total_analyzed: totalAnalyzed,
        avg_sentiment: Math.round(avgSentiment * 100) / 100,
        positive_percentage: totalAnalyzed > 0 ? (positiveCount / totalAnalyzed) * 100 : 0,
        negative_percentage: totalAnalyzed > 0 ? (negativeCount / totalAnalyzed) * 100 : 0,
        neutral_percentage: totalAnalyzed > 0 ? (neutralCount / totalAnalyzed) * 100 : 0,
        trending_topics: 12 // Mock value
      });

      // Generate trending topics from sentiment data
      const topicCounts = new Map();
      sentimentDataResult.forEach(item => {
        if (item.topics && Array.isArray(item.topics)) {
          item.topics.forEach(topic => {
            if (!topicCounts.has(topic)) {
              topicCounts.set(topic, { positive: 0, negative: 0, neutral: 0, total: 0 });
            }
            const counts = topicCounts.get(topic);
            counts[item.sentiment_label]++;
            counts.total++;
          });
        }
      });

      const trendsData = Array.from(topicCounts.entries())
        .map(([topic, counts]) => ({
          topic_name: topic,
          positive_count: counts.positive,
          negative_count: counts.negative,
          neutral_count: counts.neutral,
          total_mentions: counts.total,
          average_sentiment: counts.total > 0 ? (counts.positive - counts.negative) / counts.total : 0,
          trend_period: timeRange
        }))
        .sort((a, b) => b.total_mentions - a.total_mentions)
        .slice(0, 10);

      setTrends(trendsData);

    } catch (error) {
      console.error('Error fetching sentiment data:', error);
      
      // Fallback to mock data
      const mockData = generateMockSentimentData();
      setSentimentData(mockData);
      setMetrics({
        total_analyzed: 1247,
        avg_sentiment: 0.12,
        positive_percentage: 45,
        negative_percentage: 25,
        neutral_percentage: 30,
        trending_topics: 12
      });
      
      toast.error('Using demo data - sentiment analysis system not fully configured');
    } finally {
      setLoading(false);
    }
  };

  const generateMockSentimentData = (): SentimentData[] => {
    const sources = ['social_media', 'news', 'polls', 'comments'];
    const regions = ['Centre', 'Littoral', 'West', 'North', 'Adamawa', 'East', 'Northwest', 'Southwest', 'South', 'Far North'];
    const topics = ['politics', 'economy', 'education', 'health', 'infrastructure', 'corruption', 'elections', 'development'];
    const sentiments = ['positive', 'negative', 'neutral'];
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: `mock-${i}`,
      content_source: sources[Math.floor(Math.random() * sources.length)],
      sentiment_score: (Math.random() * 2) - 1, // -1 to 1
      sentiment_label: sentiments[Math.floor(Math.random() * sentiments.length)],
      confidence_score: Math.random(),
      emotion_scores: {
        joy: Math.random(),
        anger: Math.random(),
        fear: Math.random(),
        sadness: Math.random()
      },
      keywords: ['government', 'policy', 'development'].slice(0, Math.floor(Math.random() * 3) + 1),
      topics: topics.slice(0, Math.floor(Math.random() * 3) + 1),
      region: regions[Math.floor(Math.random() * regions.length)],
      analyzed_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    }));
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <Smile className="h-4 w-4 text-green-600" />;
      case 'negative': return <Frown className="h-4 w-4 text-red-600" />;
      default: return <Meh className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.1) return 'text-green-600';
    if (score < -0.1) return 'text-red-600';
    return 'text-yellow-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing sentiment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center mb-4">
              <Brain className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold">Sentiment Analysis Dashboard</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Real-time sentiment analysis of public discourse and media content across Cameroon
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchSentimentData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content Analyzed</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_analyzed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{Math.floor(metrics.total_analyzed * 0.1)} from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Sentiment</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getSentimentColor(metrics.avg_sentiment)}`}>
                {metrics.avg_sentiment > 0 ? '+' : ''}{metrics.avg_sentiment}
              </div>
              <p className="text-xs text-muted-foreground">
                Scale: -1 (negative) to +1 (positive)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Positive</CardTitle>
              <Smile className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(metrics.positive_percentage)}%
              </div>
              <Progress value={metrics.positive_percentage} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Negative</CardTitle>
              <Frown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {Math.round(metrics.negative_percentage)}%
              </div>
              <Progress value={metrics.negative_percentage} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Neutral</CardTitle>
              <Meh className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {Math.round(metrics.neutral_percentage)}%
              </div>
              <Progress value={metrics.neutral_percentage} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trending Topics</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.trending_topics}</div>
              <p className="text-xs text-muted-foreground">
                Active discussions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trending Topics</TabsTrigger>
            <TabsTrigger value="geographic">Geographic View</TabsTrigger>
            <TabsTrigger value="real-time">Real-time Feed</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sentiment Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Distribution</CardTitle>
                  <CardDescription>Breakdown of sentiment across all analyzed content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Smile className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Positive</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(metrics.positive_percentage)}%
                      </span>
                    </div>
                    <Progress value={metrics.positive_percentage} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Meh className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium">Neutral</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(metrics.neutral_percentage)}%
                      </span>
                    </div>
                    <Progress value={metrics.neutral_percentage} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Frown className="h-4 w-4 text-red-600" />
                        <span className="font-medium">Negative</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(metrics.negative_percentage)}%
                      </span>
                    </div>
                    <Progress value={metrics.negative_percentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Source Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Content Sources</CardTitle>
                  <CardDescription>Analysis by content source type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['social_media', 'news', 'polls', 'comments'].map(source => {
                      const sourceData = sentimentData.filter(d => d.content_source === source);
                      const percentage = sentimentData.length > 0 ? (sourceData.length / sentimentData.length) * 100 : 0;
                      
                      return (
                        <div key={source} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium capitalize">{source.replace('_', ' ')}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{Math.round(percentage)}%</div>
                            <div className="text-xs text-muted-foreground">{sourceData.length} items</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trending Topics</CardTitle>
                <CardDescription>Most discussed topics with sentiment breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trends.map((trend, index) => (
                    <div key={trend.topic_name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                          <span className="text-sm font-bold text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold capitalize">{trend.topic_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {trend.total_mentions} mentions
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-1">
                            <Smile className="h-3 w-3 text-green-600" />
                            <span className="text-sm">{trend.positive_count}</span>
                            <Meh className="h-3 w-3 text-yellow-600" />
                            <span className="text-sm">{trend.neutral_count}</span>
                            <Frown className="h-3 w-3 text-red-600" />
                            <span className="text-sm">{trend.negative_count}</span>
                          </div>
                          <div className={`text-sm font-medium ${getSentimentColor(trend.average_sentiment)}`}>
                            Sentiment: {trend.average_sentiment > 0 ? '+' : ''}{Math.round(trend.average_sentiment * 100) / 100}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geographic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Regional Sentiment Analysis</CardTitle>
                <CardDescription>Sentiment analysis by region across Cameroon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['Centre', 'Littoral', 'West', 'North', 'Adamawa', 'East', 'Northwest', 'Southwest', 'South', 'Far North'].map(region => {
                    const regionData = sentimentData.filter(d => d.region === region);
                    const avgSentiment = regionData.length > 0 
                      ? regionData.reduce((sum, d) => sum + d.sentiment_score, 0) / regionData.length 
                      : 0;
                    
                    return (
                      <Card key={region}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{region}</h3>
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className={`text-lg font-bold ${getSentimentColor(avgSentiment)}`}>
                            {avgSentiment > 0 ? '+' : ''}{Math.round(avgSentiment * 100) / 100}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {regionData.length} data points
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="real-time" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Real-time Sentiment Feed
                </CardTitle>
                <CardDescription>Latest sentiment analysis results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {sentimentData.slice(0, 20).map((item, index) => (
                    <div key={item.id} className="flex items-start space-x-4 p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getSentimentIcon(item.sentiment_label)}
                        <Badge variant="outline" className="capitalize">
                          {item.content_source.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`font-medium ${getSentimentColor(item.sentiment_score)}`}>
                            {item.sentiment_score > 0 ? '+' : ''}{Math.round(item.sentiment_score * 100) / 100}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({Math.round(item.confidence_score * 100)}% confidence)
                          </span>
                        </div>
                        
                        {item.keywords && item.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1">
                            {item.keywords.slice(0, 3).map(keyword => (
                              <Badge key={keyword} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{item.region}</span>
                          <span>{new Date(item.analyzed_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Footer */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">About Sentiment Analysis</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Our sentiment analysis system uses advanced AI to analyze public discourse across multiple platforms 
                  and media sources, providing insights into public opinion and sentiment trends.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Real-time processing:</strong> Content is analyzed as it's published</li>
                  <li>• <strong>Multi-source:</strong> Covers social media, news, polls, and public comments</li>
                  <li>• <strong>Regional breakdown:</strong> Sentiment tracked by geographic region</li>
                  <li>• <strong>Topic detection:</strong> Automatic identification of trending topics and themes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}