import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, Users, Eye, Calendar, Star, Trophy, AlertTriangle, Download, FileText, FileSpreadsheet, Filter, Calendar as CalendarIcon } from 'lucide-react';

interface PollAnalyticsProps {
  pollId: string;
}

interface AnalyticsData {
  overview: {
    totalVotes: number;
    uniqueVoters: number;
    viewCount: number;
    engagementRate: number;
    averageRating?: number;
  };
  demographics: {
    regions: Array<{ name: string; votes: number; percentage: number; growth: number }>;
    ageGroups: Array<{ group: string; votes: number; percentage: number }>;
    timeDistribution: Array<{ hour: string; votes: number; day: string }>;
    deviceTypes: Array<{ type: string; count: number; percentage: number }>;
    referralSources: Array<{ source: string; visits: number; conversions: number }>;
  };
  performance: {
    fraudRisk: number;
    healthStatus: string;
    responseTime: number;
    uptime: number;
    apiCalls: number;
  };
  trends: Array<{ 
    date: string; 
    votes: number; 
    views: number; 
    engagement: number;
    completionRate: number;
  }>;
  rankingData?: Array<{ option: string; avgRank: number; firstChoice: number }>;
  ratingDistribution?: Array<{ rating: number; count: number }>;
}

export const PollAnalyticsDashboard: React.FC<PollAnalyticsProps> = ({ pollId }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf' | 'excel'>('csv');
  const [dateRange, setDateRange] = useState<{from: Date; to: Date}>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  useEffect(() => {
    fetchAnalytics();
  }, [pollId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch performance metrics
      const { data: performanceData } = await supabase.rpc('calculate_poll_performance_metrics', {
        p_poll_id: pollId
      });

      // Fetch poll data
      const { data: pollData } = await supabase
        .from('polls')
        .select('*')
        .eq('id', pollId)
        .single();

      // Fetch vote distribution
      const { data: voteData } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('poll_id', pollId);

      // Fetch fraud alerts
      const { data: fraudData } = await supabase
        .from('poll_fraud_alerts')
        .select('*')
        .eq('poll_id', pollId)
        .eq('acknowledged', false);

      // Enhanced mock analytics data
      const mockAnalytics: AnalyticsData = {
        overview: {
          totalVotes: performanceData?.[0]?.total_votes || 245,
          uniqueVoters: performanceData?.[0]?.unique_voters || 198,
          viewCount: pollData?.view_count || 1250,
          engagementRate: performanceData?.[0]?.engagement_rate || 19.6,
          averageRating: 4.2
        },
        demographics: {
          regions: [
            { name: 'Centre', votes: 85, percentage: 35, growth: 12 },
            { name: 'Littoral', votes: 73, percentage: 30, growth: 8 },
            { name: 'West', votes: 49, percentage: 20, growth: -3 },
            { name: 'Northwest', votes: 38, percentage: 15, growth: 15 }
          ],
          ageGroups: [
            { group: '18-24', votes: 89, percentage: 36 },
            { group: '25-34', votes: 78, percentage: 32 },
            { group: '35-44', votes: 52, percentage: 21 },
            { group: '45-54', votes: 18, percentage: 7 },
            { group: '55+', votes: 8, percentage: 3 }
          ],
          timeDistribution: Array.from({ length: 168 }, (_, i) => ({
            hour: `${i % 24}:00`,
            day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][Math.floor(i / 24)],
            votes: Math.floor(Math.random() * 15) + 1
          })),
          deviceTypes: [
            { type: 'Mobile', count: 156, percentage: 64 },
            { type: 'Desktop', count: 67, percentage: 27 },
            { type: 'Tablet', count: 22, percentage: 9 }
          ],
          referralSources: [
            { source: 'Direct', visits: 450, conversions: 89 },
            { source: 'Social Media', visits: 320, conversions: 67 },
            { source: 'Email', visits: 180, conversions: 45 },
            { source: 'Search', visits: 120, conversions: 23 }
          ]
        },
        performance: {
          fraudRisk: performanceData?.[0]?.fraud_risk_score || 5,
          healthStatus: fraudData?.length > 0 ? 'warning' : 'healthy',
          responseTime: 1.2,
          uptime: 99.8,
          apiCalls: 1456
        },
        trends: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          votes: Math.floor(Math.random() * 25) + 5,
          views: Math.floor(Math.random() * 80) + 20,
          engagement: Math.floor(Math.random() * 30) + 10,
          completionRate: Math.floor(Math.random() * 40) + 60
        })),
        rankingData: [
          { option: 'Option A', avgRank: 1.8, firstChoice: 45 },
          { option: 'Option B', avgRank: 2.2, firstChoice: 35 },
          { option: 'Option C', avgRank: 2.8, firstChoice: 20 }
        ],
        ratingDistribution: [
          { rating: 1, count: 5 },
          { rating: 2, count: 8 },
          { rating: 3, count: 15 },
          { rating: 4, count: 25 },
          { rating: 5, count: 30 }
        ]
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    if (!analytics) return;

    const dataToExport = {
      pollId,
      overview: analytics.overview,
      demographics: analytics.demographics,
      performance: analytics.performance,
      trends: analytics.trends.filter(trend => {
        const trendDate = new Date(trend.date);
        return trendDate >= dateRange.from && trendDate <= dateRange.to;
      }),
      exportedAt: new Date().toISOString(),
      dateRange: {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString()
      }
    };

    try {
      // Call edge function for advanced export
      const { data, error } = await supabase.functions.invoke('poll-analytics-export', {
        body: {
          pollId,
          format: exportFormat,
          data: dataToExport,
          options: {
            includeCharts: true,
            includeDemographics: true,
            dateRange
          }
        }
      });

      if (error) throw error;

      if (exportFormat === 'pdf' || exportFormat === 'excel') {
        // Handle binary data download
        const blob = new Blob([data], { 
          type: exportFormat === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        downloadFile(blob, `poll-analytics-${pollId}.${exportFormat}`, blob.type);
      } else {
        // Handle text-based formats
        const content = exportFormat === 'csv' ? convertToCSV(dataToExport) : JSON.stringify(dataToExport, null, 2);
        downloadFile(content, `poll-analytics-${pollId}.${exportFormat}`, 
          exportFormat === 'csv' ? 'text/csv' : 'application/json');
      }
    } catch (error) {
      console.error('Export failed:', error);
      // Fallback to client-side export
      const content = exportFormat === 'csv' ? convertToCSV(dataToExport) : JSON.stringify(dataToExport, null, 2);
      downloadFile(content, `poll-analytics-${pollId}.${exportFormat}`, 
        exportFormat === 'csv' ? 'text/csv' : 'application/json');
    }
  };

  const convertToCSV = (data: any): string => {
    const flatten = (obj: any, prefix = ''): any => {
      let flattened: any = {};
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, flatten(obj[key], `${prefix}${key}_`));
        } else if (Array.isArray(obj[key])) {
          flattened[`${prefix}${key}_count`] = obj[key].length;
        } else {
          flattened[`${prefix}${key}`] = obj[key];
        }
      }
      return flattened;
    };
    
    const flatData = flatten(data);
    const headers = Object.keys(flatData);
    const values = Object.values(flatData);
    return `${headers.join(',')}\n${values.join(',')}`;
  };

  const downloadFile = (content: string | Blob, filename: string, contentType: string) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Advanced Poll Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights, demographics, and performance metrics</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="centre">Centre</SelectItem>
              <SelectItem value="littoral">Littoral</SelectItem>
              <SelectItem value="west">West</SelectItem>
              <SelectItem value="northwest">Northwest</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalVotes}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview.uniqueVoters} unique voters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.viewCount}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview.engagementRate}% engagement rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performance.apiCalls}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.performance.uptime}% uptime
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${
              analytics.performance.healthStatus === 'healthy' 
                ? 'text-green-500' 
                : 'text-yellow-500'
            }`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {analytics.performance.healthStatus}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.performance.fraudRisk}% fraud risk
            </p>
          </CardContent>
        </Card>

        {analytics.overview.averageRating && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.averageRating}</div>
              <p className="text-xs text-muted-foreground">out of 5 stars</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="trends">Time Series</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          {analytics.rankingData && <TabsTrigger value="rankings">Rankings</TabsTrigger>}
          {analytics.ratingDistribution && <TabsTrigger value="ratings">Ratings</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Regional Distribution & Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.demographics.regions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="votes" fill="hsl(var(--primary))" />
                    <Bar dataKey="growth" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device & Age Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Device Types</h4>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie
                          data={analytics.demographics.deviceTypes}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          fill="hsl(var(--primary))"
                          dataKey="count"
                          label={({type, percentage}) => `${type} ${percentage}%`}
                        >
                          {analytics.demographics.deviceTypes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Age Groups</h4>
                    <div className="space-y-2">
                      {analytics.demographics.ageGroups.map((group, index) => (
                        <div key={group.group} className="flex justify-between items-center">
                          <span className="text-sm">{group.group}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={group.percentage} className="w-16" />
                            <span className="text-xs text-muted-foreground">{group.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Regional Performance & Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.demographics.regions.map((region, index) => (
                    <div key={region.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <span className="font-medium">{region.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={region.growth > 0 ? "default" : "destructive"}>
                              {region.growth > 0 ? '+' : ''}{region.growth}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Progress value={region.percentage} className="w-24" />
                        <Badge variant="secondary">{region.votes} votes</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources & Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.demographics.referralSources.map((source, index) => (
                    <div key={source.source} className="flex justify-between items-center p-2 border rounded">
                      <span className="font-medium">{source.source}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{source.visits} visits</Badge>
                        <Badge variant="secondary">
                          {Math.round((source.conversions / source.visits) * 100)}% conv.
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>30-Day Time Series Analysis</CardTitle>
              <CardDescription>Comprehensive engagement metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="votes" stroke="hsl(var(--primary))" strokeWidth={2} name="Votes" />
                  <Line type="monotone" dataKey="views" stroke="hsl(var(--secondary))" strokeWidth={2} name="Views" />
                  <Line type="monotone" dataKey="engagement" stroke="hsl(var(--accent))" strokeWidth={2} name="Engagement" />
                  <Line type="monotone" dataKey="completionRate" stroke="hsl(var(--muted-foreground))" strokeWidth={2} name="Completion Rate" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Response Time</span>
                    <Badge variant="outline">{analytics.performance.responseTime}ms</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Uptime</span>
                    <Badge variant="default">{analytics.performance.uptime}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>API Calls</span>
                    <Badge variant="secondary">{analytics.performance.apiCalls.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Fraud Risk</span>
                    <Badge variant={analytics.performance.fraudRisk < 10 ? "default" : "destructive"}>
                      {analytics.performance.fraudRisk}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Usage Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={analytics.trends.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="engagement" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {analytics.rankingData && (
          <TabsContent value="rankings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ranked Choice Analysis</CardTitle>
                <CardDescription>Average ranking and first-choice votes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analytics.rankingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="option" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgRank" fill="hsl(var(--primary))" />
                    <Bar dataKey="firstChoice" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {analytics.ratingDistribution && (
          <TabsContent value="ratings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>How users rated this poll</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analytics.ratingDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};