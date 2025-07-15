import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Vote, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  Target,
  Users,
  Heart,
  Angry,
  Smile,
  Meh,
  AlertTriangle,
  Search,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Area, AreaChart } from 'recharts';

interface ElectionSentimentData {
  id: string;
  content_text: string;
  sentiment_polarity: string;
  sentiment_score: number;
  emotional_tone: string[];
  keywords_detected: string[];
  mentions: string[];
  region_detected: string;
  platform: string;
  created_at: string;
  threat_level: string;
}

interface CandidateSentiment {
  name: string;
  positive: number;
  negative: number;
  neutral: number;
  overall_score: number;
  mention_count: number;
  trending_score: number;
}

interface RegionData {
  region: string;
  sentiment_score: number;
  volume: number;
  dominant_emotion: string;
  threat_level: string;
}

const EMOTION_COLORS = {
  anger: '#ef4444',
  trust: '#10b981',
  hope: '#3b82f6',
  fear: '#f59e0b',
  joy: '#8b5cf6',
  sadness: '#6b7280',
  surprise: '#f97316',
  disgust: '#84cc16'
};

const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

export const ElectionSentimentTracker = () => {
  const [sentimentData, setSentimentData] = useState<ElectionSentimentData[]>([]);
  const [candidateData, setCandidateData] = useState<CandidateSentiment[]>([]);
  const [regionData, setRegionData] = useState<RegionData[]>([]);
  const [filteredData, setFilteredData] = useState<ElectionSentimentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7d');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadElectionData();
    const interval = setInterval(loadElectionData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sentimentData, selectedRegion, selectedEmotion, selectedCandidate, dateRange, searchTerm]);

  const loadElectionData = async () => {
    try {
      setIsLoading(true);
      
      // Calculate date filter
      const now = new Date();
      const daysBack = dateRange === '24h' ? 1 : dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

      // Load sentiment data with election-related keywords
      const { data: sentiments } = await supabase
        .from('camerpulse_intelligence_sentiment_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .or('content_category.cs.{political,election},keywords_detected.cs.{election,vote,candidate,party,campaign}')
        .order('created_at', { ascending: false })
        .limit(1000);

      setSentimentData(sentiments || []);
      
      // Process candidate sentiment data
      const candidates = extractCandidateData(sentiments || []);
      setCandidateData(candidates);
      
      // Process regional data
      const regions = processRegionalData(sentiments || []);
      setRegionData(regions);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading election data:', error);
      setIsLoading(false);
    }
  };

  const extractCandidateData = (data: ElectionSentimentData[]): CandidateSentiment[] => {
    const candidateMap = new Map();
    
    // Common political figures and candidates
    const knownCandidates = [
      'Paul Biya', 'Maurice Kamto', 'Cabral Libii', 'Akere Muna',
      'Serge Espoir Matomba', 'Garga Haman Adji'
    ];
    
    data.forEach(item => {
      const mentions = item.mentions || [];
      const content = item.content_text.toLowerCase();
      
      // Find candidate mentions
      knownCandidates.forEach(candidate => {
        const isNamed = mentions.some(mention => 
          mention.toLowerCase().includes(candidate.toLowerCase())
        ) || content.includes(candidate.toLowerCase());
        
        if (isNamed) {
          if (!candidateMap.has(candidate)) {
            candidateMap.set(candidate, {
              name: candidate,
              positive: 0,
              negative: 0,
              neutral: 0,
              overall_score: 0,
              mention_count: 0,
              trending_score: 0
            });
          }
          
          const candidateData = candidateMap.get(candidate);
          candidateData.mention_count++;
          
          if (item.sentiment_polarity === 'positive') {
            candidateData.positive++;
          } else if (item.sentiment_polarity === 'negative') {
            candidateData.negative++;
          } else {
            candidateData.neutral++;
          }
          
          candidateData.overall_score += item.sentiment_score || 0;
        }
      });
    });
    
    // Calculate averages and sort by relevance
    return Array.from(candidateMap.values())
      .map(candidate => ({
        ...candidate,
        overall_score: candidate.mention_count > 0 ? candidate.overall_score / candidate.mention_count : 0,
        trending_score: candidate.mention_count * (1 + candidate.positive - candidate.negative)
      }))
      .sort((a, b) => b.trending_score - a.trending_score);
  };

  const processRegionalData = (data: ElectionSentimentData[]): RegionData[] => {
    const regionMap = new Map();
    
    CAMEROON_REGIONS.forEach(region => {
      regionMap.set(region, {
        region,
        sentiment_score: 0,
        volume: 0,
        dominant_emotion: 'neutral',
        threat_level: 'none'
      });
    });
    
    data.forEach(item => {
      const region = item.region_detected;
      if (region && regionMap.has(region)) {
        const regionData = regionMap.get(region);
        regionData.volume++;
        regionData.sentiment_score += item.sentiment_score || 0;
        
        // Update threat level based on content
        if (item.threat_level && item.threat_level !== 'none') {
          if (regionData.threat_level === 'none' || 
              (item.threat_level === 'high' && regionData.threat_level !== 'critical') ||
              item.threat_level === 'critical') {
            regionData.threat_level = item.threat_level;
          }
        }
      }
    });
    
    return Array.from(regionMap.values())
      .map(region => ({
        ...region,
        sentiment_score: region.volume > 0 ? region.sentiment_score / region.volume : 0
      }))
      .sort((a, b) => b.volume - a.volume);
  };

  const applyFilters = () => {
    let filtered = [...sentimentData];
    
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(item => item.region_detected === selectedRegion);
    }
    
    if (selectedEmotion !== 'all') {
      filtered = filtered.filter(item => 
        item.emotional_tone?.includes(selectedEmotion)
      );
    }
    
    if (selectedCandidate !== 'all') {
      filtered = filtered.filter(item => 
        item.mentions?.some(mention => 
          mention.toLowerCase().includes(selectedCandidate.toLowerCase())
        ) || item.content_text.toLowerCase().includes(selectedCandidate.toLowerCase())
      );
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.content_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.keywords_detected?.some(keyword => 
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    setFilteredData(filtered);
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

  // Chart data preparation
  const sentimentTrendData = sentimentData
    .slice(-30)
    .map((item, index) => ({
      time: new Date(item.created_at).toLocaleDateString(),
      sentiment: item.sentiment_score,
      volume: 1
    }))
    .reduce((acc, curr) => {
      const existing = acc.find(item => item.time === curr.time);
      if (existing) {
        existing.sentiment = (existing.sentiment + curr.sentiment) / 2;
        existing.volume += curr.volume;
      } else {
        acc.push(curr);
      }
      return acc;
    }, [] as any[]);

  const emotionDistribution = Object.keys(EMOTION_COLORS).map(emotion => ({
    name: emotion,
    value: filteredData.filter(item => 
      item.emotional_tone?.includes(emotion)
    ).length,
    color: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS]
  })).filter(item => item.value > 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Vote className="h-12 w-12 mx-auto animate-pulse text-primary" />
          <p>Loading Election Sentiment Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Vote className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Election Sentiment Tracker
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Real-time sentiment analysis for political parties, candidates, and election issues across Cameroon
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {CAMEROON_REGIONS.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Emotion</label>
              <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select emotion" />
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts Analyzed</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.length.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Filtered results</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Sentiment</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSentimentColor(
              filteredData.length > 0 
                ? filteredData.reduce((acc, item) => acc + (item.sentiment_score || 0), 0) / filteredData.length
                : 0
            )}`}>
              {filteredData.length > 0 
                ? (filteredData.reduce((acc, item) => acc + (item.sentiment_score || 0), 0) / filteredData.length).toFixed(2)
                : '0.00'
              }
            </div>
            <p className="text-xs text-muted-foreground">-1 (negative) to +1 (positive)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidateData.length}</div>
            <p className="text-xs text-muted-foreground">Being tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Alert Regions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {regionData.filter(r => r.threat_level === 'high' || r.threat_level === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">Requires monitoring</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="candidates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="regions">Regional Map</TabsTrigger>
          <TabsTrigger value="emotions">Emotions</TabsTrigger>
          <TabsTrigger value="feed">Live Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="candidates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Candidate Sentiment Comparison</span>
              </CardTitle>
              <CardDescription>
                Real-time sentiment analysis for political candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {candidateData.map((candidate, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{candidate.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {candidate.mention_count} mentions
                        </Badge>
                        <span className={`font-bold ${getSentimentColor(candidate.overall_score)}`}>
                          {candidate.overall_score.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-green-600 font-bold text-xl">{candidate.positive}</div>
                        <div className="text-sm text-muted-foreground">Positive</div>
                      </div>
                      <div className="text-center">
                        <div className="text-yellow-600 font-bold text-xl">{candidate.neutral}</div>
                        <div className="text-sm text-muted-foreground">Neutral</div>
                      </div>
                      <div className="text-center">
                        <div className="text-red-600 font-bold text-xl">{candidate.negative}</div>
                        <div className="text-sm text-muted-foreground">Negative</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Positive</span>
                        <span>{((candidate.positive / candidate.mention_count) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(candidate.positive / candidate.mention_count) * 100} className="h-2" />
                    </div>
                  </div>
                ))}
                
                {candidateData.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No candidate mentions found in the selected timeframe.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Trend Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={sentimentTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[-1, 1]} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="sentiment" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Volume Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sentimentTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="volume" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Regional Sentiment Heatmap</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regionData.map((region, idx) => (
                  <Card key={idx} className="border-l-4" style={{ 
                    borderLeftColor: region.sentiment_score > 0.3 ? '#10b981' : 
                                   region.sentiment_score < -0.3 ? '#ef4444' : '#f59e0b' 
                  }}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{region.region}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Sentiment:</span>
                          <span className={`font-bold ${getSentimentColor(region.sentiment_score)}`}>
                            {region.sentiment_score.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Volume:</span>
                          <span className="font-medium">{region.volume} posts</span>
                        </div>
                        {region.threat_level !== 'none' && (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Alert:</strong> {region.threat_level} threat level detected
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emotions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Emotion Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip />
                    <RechartsPieChart data={emotionDistribution}>
                      {emotionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emotion Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emotionDistribution.map((emotion, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: emotion.color }}
                        />
                        <span className="capitalize">{emotion.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{emotion.value}</span>
                        <span className="text-sm text-muted-foreground">
                          ({((emotion.value / filteredData.length) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feed" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Live Election Sentiment Feed</CardTitle>
                <CardDescription>
                  Real-time posts and reactions from across all platforms
                </CardDescription>
              </div>
              <Button size="sm" onClick={loadElectionData}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredData.slice(0, 20).map((item) => (
                  <div key={item.id} className="border-l-4 border-primary pl-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{item.platform}</Badge>
                        <Badge variant={
                          item.sentiment_polarity === 'positive' ? 'default' : 
                          item.sentiment_polarity === 'negative' ? 'destructive' : 'secondary'
                        }>
                          {item.sentiment_polarity}
                        </Badge>
                        {item.threat_level !== 'none' && (
                          <Badge className={getThreatLevelColor(item.threat_level)}>
                            {item.threat_level}
                          </Badge>
                        )}
                      </div>
                      <span className={`font-semibold ${getSentimentColor(item.sentiment_score)}`}>
                        {item.sentiment_score?.toFixed(2)}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-2 line-clamp-3">{item.content_text}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.emotional_tone?.slice(0, 3).map((emotion, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {emotion}
                        </Badge>
                      ))}
                      {item.mentions?.slice(0, 2).map((mention, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          @{mention}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(item.created_at).toLocaleString()}</span>
                      {item.region_detected && (
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {item.region_detected}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {filteredData.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Vote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No election-related content found with current filters.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};