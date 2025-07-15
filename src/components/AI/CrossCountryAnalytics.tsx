import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  BarChart3, 
  TrendingUp, 
  ArrowUpDown,
  Flag,
  Users,
  MapPin,
  Activity,
  Eye,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface CountryMetrics {
  country_code: string;
  country_name: string;
  flag_emoji: string;
  sentiment_score: number;
  threat_level: string;
  volume: number;
  top_issues: string[];
  regional_breakdown: any;
  last_updated: string;
}

interface CrossCountryInsight {
  insight_type: string;
  title: string;
  description: string;
  affected_countries: string[];
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

const COLORS = ['#00A651', '#FF6B35', '#F7931E', '#8B5CF6', '#06B6D4', '#EF4444'];

const CrossCountryAnalytics = () => {
  const [countryMetrics, setCountryMetrics] = useState<CountryMetrics[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['CM', 'NG', 'GH']);
  const [insights, setInsights] = useState<CrossCountryInsight[]>([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCrossCountryData();
  }, [selectedCountries, timeRange]);

  const loadCrossCountryData = async () => {
    setIsLoading(true);
    try {
      // Load enabled countries
      const { data: countries } = await supabase
        .from('pan_africa_countries')
        .select('*')
        .in('country_code', selectedCountries)
        .eq('is_active', true);

      // Generate mock metrics for demonstration
      const mockMetrics: CountryMetrics[] = (countries || []).map(country => ({
        country_code: country.country_code,
        country_name: country.country_name,
        flag_emoji: country.flag_emoji,
        sentiment_score: Math.random() * 2 - 1, // -1 to 1
        threat_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        volume: Math.floor(Math.random() * 5000) + 500,
        top_issues: generateTopIssues(country.country_code),
        regional_breakdown: generateRegionalData(),
        last_updated: new Date().toISOString()
      }));

      setCountryMetrics(mockMetrics);

      // Generate cross-country insights
      const crossInsights = generateCrossCountryInsights(mockMetrics);
      setInsights(crossInsights);

    } catch (error) {
      console.error('Error loading cross-country data:', error);
      toast({
        title: "Data Loading Error",
        description: "Failed to load cross-country analytics.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateTopIssues = (countryCode: string): string[] => {
    const issueBank = {
      'CM': ['Anglophone Crisis', 'Fuel Shortage', 'Education', 'Healthcare', 'Separatist Tensions'],
      'NG': ['Fuel Subsidy', 'Security', 'Elections', 'Terrorism', 'Economy', 'Kidnapping'],
      'GH': ['Dumsor', 'Economy', 'Education', 'Galamsey', 'Unemployment'],
      'KE': ['Al-Shabaab', 'Elections', 'Drought', 'Healthcare', 'Corruption'],
      'ZA': ['Loadshedding', 'Crime', 'Unemployment', 'Xenophobia', 'Economy'],
      'EG': ['Economy', 'Infrastructure', 'Security', 'Tourism', 'Suez Canal']
    };
    
    const issues = issueBank[countryCode as keyof typeof issueBank] || ['Economy', 'Security', 'Healthcare'];
    return issues.slice(0, 3);
  };

  const generateRegionalData = () => {
    return {
      north: Math.random() * 2 - 1,
      south: Math.random() * 2 - 1,
      east: Math.random() * 2 - 1,
      west: Math.random() * 2 - 1,
      central: Math.random() * 2 - 1
    };
  };

  const generateCrossCountryInsights = (metrics: CountryMetrics[]): CrossCountryInsight[] => {
    const insights: CrossCountryInsight[] = [];

    // Find countries with negative sentiment
    const negativeCountries = metrics.filter(m => m.sentiment_score < -0.3);
    if (negativeCountries.length > 1) {
      insights.push({
        insight_type: 'sentiment_correlation',
        title: 'Multi-Country Negative Sentiment Pattern',
        description: `${negativeCountries.length} countries are experiencing sustained negative sentiment`,
        affected_countries: negativeCountries.map(c => c.country_code),
        severity: 'medium',
        recommendation: 'Monitor for regional disinformation campaigns or shared economic factors'
      });
    }

    // Find high-volume countries
    const highVolumeCountries = metrics.filter(m => m.volume > 3000);
    if (highVolumeCountries.length > 0) {
      insights.push({
        insight_type: 'volume_spike',
        title: 'Elevated Civic Engagement',
        description: `High volume of civic discussions detected in ${highVolumeCountries.length} countries`,
        affected_countries: highVolumeCountries.map(c => c.country_code),
        severity: 'low',
        recommendation: 'Potential election periods or major policy announcements driving engagement'
      });
    }

    // Find common issues across countries
    const allIssues = metrics.flatMap(m => m.top_issues);
    const issueFreq = allIssues.reduce((acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonIssues = Object.entries(issueFreq)
      .filter(([_, count]) => count > 1)
      .map(([issue, _]) => issue);

    if (commonIssues.length > 0) {
      insights.push({
        insight_type: 'cross_border_issues',
        title: 'Shared Regional Concerns',
        description: `${commonIssues.length} issues are trending across multiple countries`,
        affected_countries: metrics.map(m => m.country_code),
        severity: 'medium',
        recommendation: `Focus on regional solutions for: ${commonIssues.join(', ')}`
      });
    }

    return insights;
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.2) return 'text-green-600';
    if (score > -0.2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.2) return 'Positive';
    if (score > -0.2) return 'Neutral';
    return 'Negative';
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'high': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'border-green-200 bg-green-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'high': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getComparisonChartData = () => {
    return countryMetrics.map(country => ({
      name: country.flag_emoji + ' ' + country.country_name,
      sentiment: country.sentiment_score,
      volume: country.volume / 100, // Scale for chart
      threat_score: country.threat_level === 'high' ? 3 : country.threat_level === 'medium' ? 2 : 1
    }));
  };

  const getSentimentDistribution = () => {
    const positive = countryMetrics.filter(c => c.sentiment_score > 0.2).length;
    const neutral = countryMetrics.filter(c => c.sentiment_score >= -0.2 && c.sentiment_score <= 0.2).length;
    const negative = countryMetrics.filter(c => c.sentiment_score < -0.2).length;

    return [
      { name: 'Positive', value: positive, color: '#10B981' },
      { name: 'Neutral', value: neutral, color: '#F59E0B' },
      { name: 'Negative', value: negative, color: '#EF4444' }
    ];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <Activity className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading cross-country analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Africa Civic Overview</h1>
              <p className="text-purple-100">Cross-border sentiment & issue analysis</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
            <Zap className="h-3 w-3 mr-1" />
            Real-time Comparison
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center space-x-2">
          <Flag className="h-4 w-4" />
          <span className="text-sm font-medium">Countries:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {countryMetrics.map(country => (
            <Badge key={country.country_code} variant="secondary">
              {country.flag_emoji} {country.country_name}
            </Badge>
          ))}
        </div>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24 Hours</SelectItem>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={loadCrossCountryData} variant="outline" size="sm">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Users className="h-5 w-5" />
              <span>Countries Monitored</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{countryMetrics.length}</div>
            <p className="text-sm text-muted-foreground">Active intelligence feeds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              <span>Total Volume</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {countryMetrics.reduce((acc, c) => acc + c.volume, 0).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Civic reports today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              <span>Avg Sentiment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getSentimentColor(
              countryMetrics.reduce((acc, c) => acc + c.sentiment_score, 0) / countryMetrics.length
            )}`}>
              {getSentimentLabel(
                countryMetrics.reduce((acc, c) => acc + c.sentiment_score, 0) / countryMetrics.length
              )}
            </div>
            <p className="text-sm text-muted-foreground">Continental average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <AlertTriangle className="h-5 w-5" />
              <span>High Risk</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {countryMetrics.filter(c => c.threat_level === 'high').length}
            </div>
            <p className="text-sm text-muted-foreground">Countries requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comparison">Country Comparison</TabsTrigger>
          <TabsTrigger value="insights">Cross-Border Insights</TabsTrigger>
          <TabsTrigger value="charts">Visual Analytics</TabsTrigger>
          <TabsTrigger value="heatmap">Regional Heatmap</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowUpDown className="h-5 w-5" />
                <span>Side-by-Side Country Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {countryMetrics.map((country) => (
                  <div key={country.country_code} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{country.flag_emoji}</span>
                        <div>
                          <h3 className="font-bold text-lg">{country.country_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Last updated: {new Date(country.last_updated).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getThreatColor(country.threat_level)}>
                          {country.threat_level.charAt(0).toUpperCase() + country.threat_level.slice(1)} Risk
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Sentiment</p>
                        <div className={`text-2xl font-bold ${getSentimentColor(country.sentiment_score)}`}>
                          {getSentimentLabel(country.sentiment_score)}
                        </div>
                        <Progress value={(country.sentiment_score + 1) * 50} className="mt-2 h-2" />
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Volume</p>
                        <div className="text-2xl font-bold text-primary">{country.volume.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">reports today</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Top Issues</p>
                        <div className="flex flex-wrap gap-1">
                          {country.top_issues.map((issue, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {issue}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Cross-Border Intelligence Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight, idx) => (
                  <Alert key={idx} className={getSeverityColor(insight.severity)}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {insight.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm">{insight.description}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium">Affected:</span>
                          {insight.affected_countries.map(code => {
                            const country = countryMetrics.find(c => c.country_code === code);
                            return country ? (
                              <span key={code} className="text-lg">{country.flag_emoji}</span>
                            ) : null;
                          })}
                        </div>
                        <div className="bg-white/50 p-2 rounded text-xs">
                          <strong>Recommendation:</strong> {insight.recommendation}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}

                {insights.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No cross-border patterns detected at this time.</p>
                    <p className="text-sm">Analysis will update as new data becomes available.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cross-Country Sentiment Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getComparisonChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sentiment" fill="#00A651" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Continental Sentiment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getSentimentDistribution()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getSentimentDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Africa Civic Intelligence Heatmap</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {countryMetrics.map((country) => (
                  <div key={country.country_code} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{country.flag_emoji}</span>
                        <h3 className="font-semibold">{country.country_name}</h3>
                      </div>
                      <div className={`w-4 h-4 rounded-full ${
                        country.threat_level === 'high' ? 'bg-red-500' :
                        country.threat_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sentiment:</span>
                        <span className={`font-medium ${getSentimentColor(country.sentiment_score)}`}>
                          {getSentimentLabel(country.sentiment_score)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Volume:</span>
                        <span className="font-medium">{country.volume.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Risk Level:</span>
                        <Badge className={getThreatColor(country.threat_level)}>
                          {country.threat_level}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium mb-1">Top Issues:</p>
                      <div className="flex flex-wrap gap-1">
                        {country.top_issues.map((issue, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrossCountryAnalytics;