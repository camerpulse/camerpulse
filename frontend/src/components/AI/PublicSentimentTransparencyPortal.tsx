import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  MapPin, 
  TrendingUp, 
  Heart, 
  Angry, 
  Smile, 
  Frown, 
  Meh,
  Eye,
  EyeOff,
  Filter,
  Users,
  BarChart3,
  Globe,
  Calendar,
  Hash,
  ThumbsUp,
  ThumbsDown,
  Settings
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface SentimentData {
  region: string;
  emotion: string;
  score: number;
  trending_topics: string[];
  trust_level: number;
  population_mood: string;
  approval_ratings: Record<string, number>;
}

interface TrendingItem {
  keyword: string;
  volume: number;
  sentiment: number;
  emotion: string;
  hashtags: string[];
}

const cameroonRegions = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
  'North', 'Northwest', 'South', 'Southwest', 'West'
];

const emotions = {
  joy: { icon: Smile, color: 'text-green-500', label: 'Joy' },
  anger: { icon: Angry, color: 'text-red-500', label: 'Anger' },
  fear: { icon: Frown, color: 'text-purple-500', label: 'Fear' },
  sadness: { icon: Frown, color: 'text-blue-500', label: 'Sadness' },
  hope: { icon: Heart, color: 'text-pink-500', label: 'Hope' },
  pride: { icon: ThumbsUp, color: 'text-yellow-500', label: 'Pride' },
  sarcasm: { icon: Meh, color: 'text-gray-500', label: 'Sarcasm' }
};

const topics = [
  'Fuel Price', 'Power Cuts', 'Education', 'Jobs', 'Corruption', 
  'Roads', 'Healthcare', 'Security', 'Elections', 'Economy'
];

const PublicSentimentTransparencyPortal = () => {
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [trendingData, setTrendingData] = useState<TrendingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedEmotion, setSelectedEmotion] = useState('all');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Admin controls
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showRegionalStats, setShowRegionalStats] = useState(true);
  const [showEmotionFilters, setShowEmotionFilters] = useState(true);
  const [showApprovalData, setShowApprovalData] = useState(true);
  const [emergencyHide, setEmergencyHide] = useState(false);

  useEffect(() => {
    loadSentimentData();
    loadTrendingData();
    const interval = setInterval(() => {
      loadSentimentData();
      loadTrendingData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSentimentData = async () => {
    try {
      // Generate sample data for demonstration
      const mockData: SentimentData[] = cameroonRegions.map(region => ({
        region,
        emotion: Object.keys(emotions)[Math.floor(Math.random() * Object.keys(emotions).length)],
        score: Math.random() * 2 - 1, // -1 to 1
        trending_topics: topics.slice(0, 3 + Math.floor(Math.random() * 3)),
        trust_level: Math.random() * 100,
        population_mood: ['Optimistic', 'Concerned', 'Frustrated', 'Hopeful'][Math.floor(Math.random() * 4)],
        approval_ratings: {
          'Paul Biya': Math.random() * 100,
          'RDPC': Math.random() * 100,
          'SDF': Math.random() * 100,
          'UNDP': Math.random() * 100
        }
      }));
      
      setSentimentData(mockData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading sentiment data:', error);
      setIsLoading(false);
    }
  };

  const loadTrendingData = async () => {
    try {
      const mockTrending: TrendingItem[] = [
        { keyword: 'Fuel Crisis', volume: 15420, sentiment: -0.7, emotion: 'anger', hashtags: ['#FuelShortage', '#CameroonCrisis'] },
        { keyword: 'AFCON Victory', volume: 12800, sentiment: 0.8, emotion: 'joy', hashtags: ['#AFCON2024', '#LionsIndomitable'] },
        { keyword: 'School Fees', volume: 9650, sentiment: -0.4, emotion: 'sadness', hashtags: ['#EducationCrisis', '#SchoolFees'] },
        { keyword: 'Road Construction', volume: 7200, sentiment: 0.3, emotion: 'hope', hashtags: ['#Infrastructure', '#Development'] },
        { keyword: 'Power Outages', volume: 8900, sentiment: -0.6, emotion: 'anger', hashtags: ['#PowerCuts', '#ENEO'] }
      ];
      
      setTrendingData(mockTrending);
    } catch (error) {
      console.error('Error loading trending data:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Simulate search results
      const mockResults = [
        {
          keyword: searchQuery,
          sentiment: Math.random() * 2 - 1,
          emotion: Object.keys(emotions)[Math.floor(Math.random() * Object.keys(emotions).length)],
          trust_level: Math.random() * 100,
          volume: Math.floor(Math.random() * 10000),
          trend_data: Array.from({length: 7}, () => Math.random() * 100),
          hashtags: [`#${searchQuery.replace(/\s+/g, '')}`, '#Cameroon', '#PublicOpinion']
        }
      ];
      
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getEmotionColor = (emotion: string) => {
    return emotions[emotion as keyof typeof emotions]?.color || 'text-gray-500';
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-green-500';
    if (score < -0.3) return 'text-red-500';
    return 'text-yellow-500';
  };

  const filteredData = sentimentData.filter(item => {
    if (selectedRegion !== 'all' && item.region !== selectedRegion) return false;
    if (selectedEmotion !== 'all' && item.emotion !== selectedEmotion) return false;
    if (selectedTopic !== 'all' && !item.trending_topics.includes(selectedTopic)) return false;
    return true;
  });

  if (emergencyHide) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Public Sentiment Dashboard Temporarily Unavailable
            </CardTitle>
            <CardDescription className="text-center">
              This service is currently under maintenance. Please check back later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-6 w-6 text-primary" />
            <span>Public Sentiment Transparency Portal</span>
          </CardTitle>
          <CardDescription>
            Real-time pulse of Cameroon - What the nation is feeling and saying
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="dashboard">📊 Live Dashboard</TabsTrigger>
          <TabsTrigger value="heatmap">🗺️ Mood Map</TabsTrigger>
          <TabsTrigger value="search">🔍 Sentiment Search</TabsTrigger>
          <TabsTrigger value="admin">⚙️ Admin Controls</TabsTrigger>
        </TabsList>

        {/* Live Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">National Mood</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {sentimentData.length > 0 
                    ? (sentimentData.reduce((acc, item) => acc + item.score, 0) / sentimentData.length).toFixed(2)
                    : '0.00'
                  }
                </div>
                <p className="text-xs text-muted-foreground">Overall sentiment score</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Active Discussions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {trendingData.reduce((acc, item) => acc + item.volume, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Conversations today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Trending Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trendingData.length}</div>
                <p className="text-xs text-muted-foreground">Hot discussions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Public Trust</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {sentimentData.length > 0 
                    ? Math.round(sentimentData.reduce((acc, item) => acc + item.trust_level, 0) / sentimentData.length)
                    : 0
                  }%
                </div>
                <p className="text-xs text-muted-foreground">Average trust index</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          {showEmotionFilters && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Filter by Region, Topic & Emotion</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {cameroonRegions.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      {topics.map(topic => (
                        <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select emotion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Emotions</SelectItem>
                      {Object.entries(emotions).map(([key, emotion]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center space-x-2">
                            <emotion.icon className={`h-4 w-4 ${emotion.color}`} />
                            <span>{emotion.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trending Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>What Cameroon is Talking About</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendingData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-muted-foreground">#{index + 1}</div>
                      <div>
                        <div className="font-semibold">{item.keyword}</div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Users className="h-4 w-4" />
                          <span>{item.volume.toLocaleString()} discussions</span>
                          <div className="flex space-x-1">
                            {item.hashtags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`text-lg ${getSentimentColor(item.sentiment)}`}>
                        {item.sentiment > 0 ? <ThumbsUp className="h-5 w-5" /> : <ThumbsDown className="h-5 w-5" />}
                      </div>
                      <div className={`${getEmotionColor(item.emotion)}`}>
                        {React.createElement(emotions[item.emotion as keyof typeof emotions]?.icon || Meh, { className: 'h-5 w-5' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mood Map */}
        <TabsContent value="heatmap" className="space-y-6">
          {showHeatmap && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Cameroon Emotional Heat Map</span>
                </CardTitle>
                <CardDescription>
                  Click on any region to see detailed sentiment breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredData.map((region, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span>{region.region}</span>
                          <div className={`${getEmotionColor(region.emotion)}`}>
                            {React.createElement(emotions[region.emotion as keyof typeof emotions]?.icon || Meh, { className: 'h-5 w-5' })}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Sentiment Score</span>
                            <span className={getSentimentColor(region.score)}>
                              {region.score.toFixed(2)}
                            </span>
                          </div>
                          <Progress value={(region.score + 1) * 50} className="mt-1" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Trust Level</span>
                            <span>{Math.round(region.trust_level)}%</span>
                          </div>
                          <Progress value={region.trust_level} className="mt-1" />
                        </div>

                        <div>
                          <div className="text-sm font-medium mb-1">Population Mood</div>
                          <Badge variant="secondary">{region.population_mood}</Badge>
                        </div>

                        <div>
                          <div className="text-sm font-medium mb-2">Top Topics</div>
                          <div className="flex flex-wrap gap-1">
                            {region.trending_topics.slice(0, 3).map(topic => (
                              <Badge key={topic} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {showApprovalData && (
                          <div>
                            <div className="text-sm font-medium mb-2">Political Approval</div>
                            <div className="space-y-1">
                              {Object.entries(region.approval_ratings).slice(0, 2).map(([entity, rating]) => (
                                <div key={entity} className="flex justify-between text-xs">
                                  <span>{entity}</span>
                                  <span>{Math.round(rating)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Sentiment Search */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Public Sentiment Search</span>
              </CardTitle>
              <CardDescription>
                "What is Cameroon saying about X?" - Search any keyword, person, or topic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  placeholder="e.g., Fuel price, Paul Biya, RDPC, War in NW/SW..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-6 space-y-4">
                  {searchResults.map((result, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Results for "{result.keyword}"</span>
                          <Badge variant={result.sentiment > 0 ? 'default' : 'destructive'}>
                            {result.sentiment > 0 ? 'Positive' : 'Negative'} Sentiment
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm font-medium">Public Tone</div>
                            <div className={`text-lg font-bold ${getSentimentColor(result.sentiment)}`}>
                              {result.sentiment.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Trust Level</div>
                            <div className="text-lg font-bold">{Math.round(result.trust_level)}%</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Discussion Volume</div>
                            <div className="text-lg font-bold">{result.volume.toLocaleString()}</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium mb-2">Emotion Analysis</div>
                          <div className="flex items-center space-x-2">
                            <div className={`${getEmotionColor(result.emotion)}`}>
                              {React.createElement(emotions[result.emotion as keyof typeof emotions]?.icon || Meh, { className: 'h-5 w-5' })}
                            </div>
                            <span className="capitalize">{result.emotion}</span>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium mb-2">Trending Hashtags</div>
                          <div className="flex flex-wrap gap-2">
                            {result.hashtags.map((tag: string) => (
                              <Badge key={tag} variant="outline">
                                <Hash className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium mb-2">7-Day Trend</div>
                          <div className="flex items-end space-x-1 h-16">
                            {result.trend_data.map((value: number, i: number) => (
                              <div
                                key={i}
                                className="bg-primary rounded-t"
                                style={{ height: `${value}%`, width: '12px' }}
                              />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Controls */}
        <TabsContent value="admin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Portal Administration</span>
              </CardTitle>
              <CardDescription>
                Control public visibility and emergency overrides
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Visibility Controls</h3>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Public Heatmap</label>
                    <Switch checked={showHeatmap} onCheckedChange={setShowHeatmap} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Regional Statistics</label>
                    <Switch checked={showRegionalStats} onCheckedChange={setShowRegionalStats} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Emotion Filters</label>
                    <Switch checked={showEmotionFilters} onCheckedChange={setShowEmotionFilters} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Political Approval Data</label>
                    <Switch checked={showApprovalData} onCheckedChange={setShowApprovalData} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Emergency Controls</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Hide Dashboard During Crisis</label>
                      <p className="text-xs text-muted-foreground">Emergency override to hide all public data</p>
                    </div>
                    <Switch 
                      checked={emergencyHide} 
                      onCheckedChange={setEmergencyHide}
                      className="data-[state=checked]:bg-red-600"
                    />
                  </div>

                  {emergencyHide && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-red-800">
                        <EyeOff className="h-5 w-5" />
                        <span className="font-medium">Dashboard Hidden</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">
                        Public sentiment portal is currently not visible to citizens.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-4">Portal Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">✓</div>
                    <div className="text-sm">Data Sync</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">🔄</div>
                    <div className="text-sm">Live Updates</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">📱</div>
                    <div className="text-sm">Mobile Ready</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">🌐</div>
                    <div className="text-sm">Multi-Language</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PublicSentimentTransparencyPortal;