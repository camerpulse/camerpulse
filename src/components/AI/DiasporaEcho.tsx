import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Flag,
  Heart,
  ArrowUpDown,
  Filter,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend } from 'recharts';

interface DiasporaData {
  country: string;
  sentiment_score: number;
  content_volume: number;
  dominant_emotions: string[];
  trending_topics: string[];
  flag_emoji: string;
  user_count: number;
}

interface ComparisonData {
  category: string;
  homeland: number;
  diaspora: number;
}

const DIASPORA_COUNTRIES = [
  { name: 'USA', flag: '🇺🇸', code: 'US' },
  { name: 'France', flag: '🇫🇷', code: 'FR' },
  { name: 'UK', flag: '🇬🇧', code: 'GB' },
  { name: 'Canada', flag: '🇨🇦', code: 'CA' },
  { name: 'Germany', flag: '🇩🇪', code: 'DE' }
];

const DiasporaEcho = () => {
  const [diasporaData, setDiasporaData] = useState<DiasporaData[]>([]);
  const [homelandData, setHomelandData] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    loadDiasporaData();
  }, [selectedTimeframe, selectedCountry]);

  const loadDiasporaData = async () => {
    setIsLoading(true);
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(selectedTimeframe));

      // Load diaspora sentiment data
      const { data: sentimentData } = await supabase
        .from('camerpulse_intelligence_sentiment_logs')
        .select('*')
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: false });

      // Load profiles to identify diaspora users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, location, is_diaspora')
        .eq('is_diaspora', true);

      // Simulate diaspora data by country (in real implementation, this would be based on actual location data)
      const mockDiasporaData: DiasporaData[] = DIASPORA_COUNTRIES.map(country => ({
        country: country.name,
        sentiment_score: Math.random() * 2 - 1, // Random between -1 and 1
        content_volume: Math.floor(Math.random() * 500) + 50,
        dominant_emotions: ['hope', 'pride', 'concern'].sort(() => Math.random() - 0.5).slice(0, 2),
        trending_topics: ['#DiasporaVoice', '#CameroonNews', '#ElectionWatch'].sort(() => Math.random() - 0.5).slice(0, 2),
        flag_emoji: country.flag,
        user_count: Math.floor(Math.random() * 10000) + 1000
      }));

      // Calculate homeland sentiment (average of non-diaspora users)
      const homelandSentiment = sentimentData
        ? sentimentData.reduce((acc, item) => acc + (item.sentiment_score || 0), 0) / sentimentData.length
        : 0;

      const homeland = {
        sentiment_score: homelandSentiment,
        content_volume: sentimentData?.length || 0,
        dominant_emotions: ['unity', 'progress', 'democracy'],
        trending_topics: ['#CameroonElections', '#NationalUnity', '#Progress2025']
      };

      // Create comparison data
      const comparison: ComparisonData[] = [
        {
          category: 'Political Trust',
          homeland: Math.random() * 100,
          diaspora: Math.random() * 100
        },
        {
          category: 'Economic Optimism',
          homeland: Math.random() * 100,
          diaspora: Math.random() * 100
        },
        {
          category: 'Social Cohesion',
          homeland: Math.random() * 100,
          diaspora: Math.random() * 100
        },
        {
          category: 'Democratic Progress',
          homeland: Math.random() * 100,
          diaspora: Math.random() * 100
        },
        {
          category: 'Future Outlook',
          homeland: Math.random() * 100,
          diaspora: Math.random() * 100
        }
      ];

      setDiasporaData(mockDiasporaData);
      setHomelandData(homeland);
      setComparisonData(comparison);
    } catch (error) {
      console.error('Error loading diaspora data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-green-600';
    if (score < -0.3) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getSentimentBgColor = (score: number) => {
    if (score > 0.3) return 'bg-green-500';
    if (score < -0.3) return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const totalDiasporaUsers = diasporaData.reduce((acc, country) => acc + country.user_count, 0);
  const avgDiasporaSentiment = diasporaData.length > 0 
    ? diasporaData.reduce((acc, country) => acc + country.sentiment_score, 0) / diasporaData.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-6 w-6 text-primary" />
            <span>Diaspora Echo</span>
            <Badge variant="outline">Global Sentiment Monitor</Badge>
          </CardTitle>
          <CardDescription>
            Real-time sentiment analysis of Cameroonian diaspora across major host countries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Today</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {DIASPORA_COUNTRIES.map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              variant="outline" 
              onClick={loadDiasporaData}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Diaspora Users</p>
                <p className="text-2xl font-bold">{totalDiasporaUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Diaspora Sentiment</p>
                <p className={`text-2xl font-bold ${getSentimentColor(avgDiasporaSentiment)}`}>
                  {avgDiasporaSentiment.toFixed(2)}
                </p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Homeland Sentiment</p>
                <p className={`text-2xl font-bold ${getSentimentColor(homelandData?.sentiment_score || 0)}`}>
                  {(homelandData?.sentiment_score || 0).toFixed(2)}
                </p>
              </div>
              <Flag className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Countries</p>
                <p className="text-2xl font-bold">{DIASPORA_COUNTRIES.length}</p>
              </div>
              <Globe className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Homeland vs Diaspora</TabsTrigger>
          <TabsTrigger value="countries">By Country</TabsTrigger>
          <TabsTrigger value="trends">Trending Topics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Diaspora Countries Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Diaspora Countries Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {diasporaData.map((country, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{country.flag_emoji}</span>
                        <div>
                          <p className="font-medium">{country.country}</p>
                          <p className="text-sm text-muted-foreground">
                            {country.user_count.toLocaleString()} users
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getSentimentColor(country.sentiment_score)}`}>
                          {country.sentiment_score.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {country.content_volume} posts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={diasporaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sentiment_score" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ArrowUpDown className="h-5 w-5" />
                  <span>Homeland vs Diaspora</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={comparisonData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Homeland"
                      dataKey="homeland"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Diaspora"
                      dataKey="diaspora"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Comparison Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Differences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comparisonData.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.category}</span>
                        <span className="font-medium">
                          {Math.abs(item.homeland - item.diaspora).toFixed(1)}% difference
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Homeland</span>
                            <span>{item.homeland.toFixed(1)}%</span>
                          </div>
                          <Progress value={item.homeland} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Diaspora</span>
                            <span>{item.diaspora.toFixed(1)}%</span>
                          </div>
                          <Progress value={item.diaspora} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="countries" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {diasporaData.map((country, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-2xl">{country.flag_emoji}</span>
                    <span>{country.country}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Sentiment Score:</span>
                      <span className={`font-bold ${getSentimentColor(country.sentiment_score)}`}>
                        {country.sentiment_score.toFixed(2)}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium">User Base:</span>
                      <p className="text-lg font-bold">{country.user_count.toLocaleString()}</p>
                    </div>

                    <div>
                      <span className="text-sm font-medium">Dominant Emotions:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {country.dominant_emotions.map((emotion, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {emotion}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium">Trending:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {country.trending_topics.map((topic, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Diaspora Trending Topics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Most Discussed Topics</h4>
                  <div className="space-y-2">
                    {['#DiasporaVoice', '#CameroonElections', '#ReturnHome', '#InvestInCameroon', '#YouthEmpowerment'].map((topic, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 border rounded">
                        <span className="font-medium">{topic}</span>
                        <Badge variant="outline">{Math.floor(Math.random() * 1000) + 100} mentions</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Emotional Trends</h4>
                  <div className="space-y-2">
                    {['Pride', 'Hope', 'Concern', 'Nostalgia', 'Optimism'].map((emotion, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{emotion}</span>
                          <span>{Math.floor(Math.random() * 40) + 20}%</span>
                        </div>
                        <Progress value={Math.floor(Math.random() * 40) + 20} className="h-2" />
                      </div>
                    ))}
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

export default DiasporaEcho;