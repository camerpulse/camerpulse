import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, 
  Zap, 
  Radio, 
  MapPin, 
  Eye, 
  Hash, 
  Calendar,
  Filter,
  Search,
  Globe,
  Users,
  BarChart3,
  Target,
  Flame,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line, 
  Legend,
  ScatterChart,
  Scatter,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface TrendData {
  id: string;
  topic_text: string;
  volume_score: number;
  growth_rate: number;
  sentiment_score: number;
  trend_status: string;
  category: string;
  platform_breakdown: any;
  regional_breakdown: any;
  related_hashtags: string[];
  influencer_mentions: string[];
  first_detected_at: string;
  last_updated_at: string;
  threat_indicators: boolean;
  emotional_breakdown: any;
}

interface RadarData {
  trend: string;
  intensity: number;
  reach: number;
  growth: number;
  sentiment: number;
  platform: string;
  region: string;
}

interface PlatformStats {
  platform: string;
  count: number;
  growth: number;
  icon: React.ReactNode;
  color: string;
}

const PLATFORMS = {
  tiktok: { name: 'TikTok', icon: <Activity className="h-4 w-4" />, color: '#ff0050' },
  twitter: { name: 'Twitter', icon: <Hash className="h-4 w-4" />, color: '#1da1f2' },
  facebook: { name: 'Facebook', icon: <Users className="h-4 w-4" />, color: '#4267b2' },
  instagram: { name: 'Instagram', icon: <Eye className="h-4 w-4" />, color: '#e4405f' },
  youtube: { name: 'YouTube', icon: <Radio className="h-4 w-4" />, color: '#ff0000' }
};

const TREND_CATEGORIES = {
  political: { name: 'Political', color: '#ef4444', icon: <Target className="h-4 w-4" /> },
  social: { name: 'Social', color: '#3b82f6', icon: <Users className="h-4 w-4" /> },
  economic: { name: 'Economic', color: '#10b981', icon: <TrendingUp className="h-4 w-4" /> },
  cultural: { name: 'Cultural', color: '#8b5cf6', icon: <Globe className="h-4 w-4" /> },
  viral: { name: 'Viral', color: '#f59e0b', icon: <Flame className="h-4 w-4" /> }
};

const TrendRadar = () => {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('radar');

  useEffect(() => {
    loadTrendData();
  }, [selectedTimeframe, selectedPlatform, selectedCategory, selectedRegion]);

  const loadTrendData = async () => {
    setIsLoading(true);
    try {
      const hoursAgo = new Date();
      hoursAgo.setHours(hoursAgo.getHours() - parseInt(selectedTimeframe));

      const { data } = await supabase
        .from('camerpulse_intelligence_trending_topics')
        .select('*')
        .gte('last_updated_at', hoursAgo.toISOString())
        .order('volume_score', { ascending: false })
        .limit(100);

      // Simulate enhanced data structure for demonstration
      const enhancedData: TrendData[] = (data || []).map(item => ({
        ...item,
        platform_breakdown: item.platform_breakdown || {
          tiktok: Math.floor(Math.random() * 50),
          twitter: Math.floor(Math.random() * 40),
          facebook: Math.floor(Math.random() * 30),
          instagram: Math.floor(Math.random() * 25),
          youtube: Math.floor(Math.random() * 20)
        },
        regional_breakdown: item.regional_breakdown || {
          Centre: Math.floor(Math.random() * 30),
          Littoral: Math.floor(Math.random() * 25),
          Northwest: Math.floor(Math.random() * 20),
          Southwest: Math.floor(Math.random() * 15),
          West: Math.floor(Math.random() * 10)
        },
        growth_rate: item.growth_rate || (Math.random() * 200 - 100), // -100 to +100
        category: item.category || Object.keys(TREND_CATEGORIES)[Math.floor(Math.random() * Object.keys(TREND_CATEGORIES).length)],
        related_hashtags: item.related_hashtags || [`#${item.topic_text.replace(/\s+/g, '')}`, '#CameroonTrends', '#Viral'],
        influencer_mentions: item.influencer_mentions || [`@influencer${Math.floor(Math.random() * 100)}`],
        emotional_breakdown: item.emotional_breakdown || {
          joy: Math.floor(Math.random() * 40),
          anger: Math.floor(Math.random() * 30),
          fear: Math.floor(Math.random() * 20),
          sadness: Math.floor(Math.random() * 15),
          hope: Math.floor(Math.random() * 35)
        }
      }));

      setTrendData(enhancedData);
    } catch (error) {
      console.error('Error loading trend data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTrends = trendData.filter(trend => {
    if (selectedPlatform !== 'all' && !trend.platform_breakdown?.[selectedPlatform]) return false;
    if (selectedCategory !== 'all' && trend.category !== selectedCategory) return false;
    if (selectedRegion !== 'all' && !trend.regional_breakdown?.[selectedRegion]) return false;
    if (searchTerm && !trend.topic_text.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getRadarData = (): RadarData[] => {
    return filteredTrends.slice(0, 6).map(trend => {
      const platformValues = Object.values(trend.platform_breakdown || {}) as number[];
      const reach = platformValues.reduce((total, value) => total + value, 0);

      return {
        trend: trend.topic_text.substring(0, 15) + '...',
        intensity: Math.min(trend.volume_score || 0, 100),
        reach: Math.max(0, reach),
        growth: Math.max(0, Math.min(100, (trend.growth_rate || 0) + 50)),
        sentiment: Math.max(0, Math.min(100, ((trend.sentiment_score || 0) + 1) * 50)),
        platform: Object.entries(trend.platform_breakdown || {})
          .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'unknown',
        region: Object.entries(trend.regional_breakdown || {})
          .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'unknown'
      };
    });
  };

  const getPlatformStats = (): PlatformStats[] => {
    return Object.entries(PLATFORMS).map(([key, platform]) => {
      const platformTrends = filteredTrends.filter(trend => 
        trend.platform_breakdown?.[key] > 0
      );
      const avgGrowth = platformTrends.length > 0
        ? platformTrends.reduce((acc, trend) => acc + (trend.growth_rate || 0), 0) / platformTrends.length
        : 0;

      return {
        platform: platform.name,
        count: platformTrends.length,
        growth: avgGrowth,
        icon: platform.icon,
        color: platform.color
      };
    });
  };

  const getTrendStatus = (trend: TrendData) => {
    const growth = trend.growth_rate || 0;
    if (growth > 50) return { label: 'Viral', color: 'bg-red-500', icon: <Flame className="h-3 w-3" /> };
    if (growth > 20) return { label: 'Rising', color: 'bg-orange-500', icon: <ArrowUp className="h-3 w-3" /> };
    if (growth > -20) return { label: 'Stable', color: 'bg-blue-500', icon: <Activity className="h-3 w-3" /> };
    return { label: 'Declining', color: 'bg-gray-500', icon: <ArrowDown className="h-3 w-3" /> };
  };

  const getOriginRegion = (trend: TrendData) => {
    if (!trend.regional_breakdown) return 'Unknown';
    return Object.entries(trend.regional_breakdown)
      .sort(([,a]: any, [,b]: any) => b - a)[0]?.[0] || 'Unknown';
  };

  const radarData = getRadarData();
  const platformStats = getPlatformStats();
  const totalTrends = filteredTrends.length;
  const viralTrends = filteredTrends.filter(t => (t.growth_rate || 0) > 50).length;
  const avgGrowth = filteredTrends.length > 0 
    ? filteredTrends.reduce((acc, t) => acc + (t.growth_rate || 0), 0) / filteredTrends.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Radio className="h-6 w-6 text-primary animate-pulse" />
            <span>Trend Radar</span>
            <Badge variant="outline" className="animate-bounce">Live Detection</Badge>
          </CardTitle>
          <CardDescription>
            Real-time viral content detection across platforms with movement and intensity analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last Hour</SelectItem>
                  <SelectItem value="6">Last 6 Hours</SelectItem>
                  <SelectItem value="24">Last 24 Hours</SelectItem>
                  <SelectItem value="72">Last 3 Days</SelectItem>
                  <SelectItem value="168">Last Week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {Object.entries(PLATFORMS).map(([key, platform]) => (
                    <SelectItem key={key} value={key}>{platform.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(TREND_CATEGORIES).map(([key, category]) => (
                    <SelectItem key={key} value={key}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="Centre">Centre</SelectItem>
                  <SelectItem value="Littoral">Littoral</SelectItem>
                  <SelectItem value="Northwest">Northwest</SelectItem>
                  <SelectItem value="Southwest">Southwest</SelectItem>
                  <SelectItem value="West">West</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search trends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Trends</p>
                <p className="text-2xl font-bold">{totalTrends}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Viral Content</p>
                <p className="text-2xl font-bold text-red-500">{viralTrends}</p>
              </div>
              <Flame className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Growth Rate</p>
                <p className={`text-2xl font-bold ${avgGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {avgGrowth.toFixed(1)}%
                </p>
              </div>
              {avgGrowth > 0 ? <ArrowUp className="h-8 w-8 text-green-500" /> : <ArrowDown className="h-8 w-8 text-red-500" />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Platforms Active</p>
                <p className="text-2xl font-bold">{platformStats.filter(p => p.count > 0).length}</p>
              </div>
              <Globe className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="radar">Radar View</TabsTrigger>
          <TabsTrigger value="platforms">Platform Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trending Content</TabsTrigger>
          <TabsTrigger value="origins">Origin Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="radar" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Radio className="h-5 w-5" />
                  <span>Trend Movement Radar</span>
                </CardTitle>
                <CardDescription>
                  Multi-dimensional analysis of trend intensity and reach
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="trend" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Intensity"
                      dataKey="intensity"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Reach"
                      dataKey="reach"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Growth"
                      dataKey="growth"
                      stroke="#ffc658"
                      fill="#ffc658"
                      fillOpacity={0.3}
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Trend Intensity Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Live Trend Intensity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {filteredTrends.slice(0, 8).map((trend, idx) => {
                    const status = getTrendStatus(trend);
                    const intensity = Math.min(trend.volume_score || 0, 100);
                    
                    return (
                      <div key={idx} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${status.color} animate-pulse`} />
                            <span className="text-sm font-medium">{trend.topic_text.substring(0, 20)}...</span>
                          </div>
                          {status.icon}
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Intensity</span>
                            <span>{intensity}%</span>
                          </div>
                          <Progress value={intensity} className="h-1" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Origin: {getOriginRegion(trend)}</span>
                            <span>{status.label}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={platformStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Platform Details */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {platformStats.map((platform, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div style={{ color: platform.color }}>
                          {platform.icon}
                        </div>
                        <div>
                          <p className="font-medium">{platform.platform}</p>
                          <p className="text-sm text-muted-foreground">
                            {platform.count} active trends
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${platform.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {platform.growth > 0 ? '+' : ''}{platform.growth.toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Growth</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrends.map((trend, idx) => {
              const status = getTrendStatus(trend);
              const category = TREND_CATEGORIES[trend.category as keyof typeof TREND_CATEGORIES];
              
              return (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>{trend.topic_text}</span>
                      <Badge className={status.color + ' text-white'}>
                        {status.label}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      {category?.icon}
                      <span>{category?.name}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Volume Score:</span>
                        <span className="font-medium">{trend.volume_score}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Growth Rate:</span>
                        <span className={`font-medium ${(trend.growth_rate || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(trend.growth_rate || 0) > 0 ? '+' : ''}{(trend.growth_rate || 0).toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Origin:</span>
                        <span className="font-medium">{getOriginRegion(trend)}</span>
                      </div>

                      <div>
                        <span className="text-sm font-medium">Related Hashtags:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {trend.related_hashtags?.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-sm font-medium">Top Platform:</span>
                        <div className="mt-1">
                          {Object.entries(trend.platform_breakdown || {})
                            .sort(([,a]: any, [,b]: any) => b - a)
                            .slice(0, 1)
                            .map(([platform, score]: any) => (
                              <Badge key={platform} variant="secondary" className="text-xs">
                                {PLATFORMS[platform as keyof typeof PLATFORMS]?.name || platform}: {score}%
                              </Badge>
                            ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="origins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Trend Origin Tracking</span>
              </CardTitle>
              <CardDescription>
                Track where viral content originates and spreads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Interactive origin map coming soon...</p>
                <p className="text-sm">This will show geographical spread of trends</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrendRadar;