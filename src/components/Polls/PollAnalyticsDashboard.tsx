import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, Users, Eye, Calendar, Star, Trophy, AlertTriangle, Download } from 'lucide-react';

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
    regions: Array<{ name: string; votes: number; percentage: number }>;
    timeDistribution: Array<{ hour: string; votes: number }>;
  };
  performance: {
    fraudRisk: number;
    healthStatus: string;
    responseTime: number;
  };
  trends: Array<{ date: string; votes: number; views: number }>;
  rankingData?: Array<{ option: string; avgRank: number; firstChoice: number }>;
  ratingDistribution?: Array<{ rating: number; count: number }>;
}

export const PollAnalyticsDashboard: React.FC<PollAnalyticsProps> = ({ pollId }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

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

      // Mock analytics data (in real app, this would be calculated)
      const mockAnalytics: AnalyticsData = {
        overview: {
          totalVotes: performanceData?.[0]?.total_votes || 0,
          uniqueVoters: performanceData?.[0]?.unique_voters || 0,
          viewCount: pollData?.view_count || 0,
          engagementRate: performanceData?.[0]?.engagement_rate || 0,
          averageRating: 4.2
        },
        demographics: {
          regions: [
            { name: 'Centre', votes: 45, percentage: 35 },
            { name: 'Littoral', votes: 38, percentage: 30 },
            { name: 'West', votes: 25, percentage: 20 },
            { name: 'Northwest', votes: 19, percentage: 15 }
          ],
          timeDistribution: Array.from({ length: 24 }, (_, i) => ({
            hour: `${i}:00`,
            votes: Math.floor(Math.random() * 10) + 1
          }))
        },
        performance: {
          fraudRisk: performanceData?.[0]?.fraud_risk_score || 0,
          healthStatus: fraudData?.length > 0 ? 'warning' : 'healthy',
          responseTime: 1.2
        },
        trends: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          votes: Math.floor(Math.random() * 20) + 5,
          views: Math.floor(Math.random() * 50) + 20
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

  const exportData = () => {
    if (!analytics) return;

    const dataToExport = {
      overview: analytics.overview,
      demographics: analytics.demographics,
      performance: analytics.performance,
      exportedAt: new Date().toISOString()
    };

    if (exportFormat === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(dataToExport);
      downloadFile(csv, `poll-analytics-${pollId}.csv`, 'text/csv');
    } else {
      // Export as JSON
      const json = JSON.stringify(dataToExport, null, 2);
      downloadFile(json, `poll-analytics-${pollId}.json`, 'application/json');
    }
  };

  const convertToCSV = (data: any): string => {
    // Simple CSV conversion for overview data
    const headers = Object.keys(data.overview);
    const values = Object.values(data.overview);
    return `${headers.join(',')}\n${values.join(',')}`;
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Poll Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights and performance metrics</p>
        </div>
        <Button onClick={exportData} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
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
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          {analytics.rankingData && <TabsTrigger value="rankings">Rankings</TabsTrigger>}
          {analytics.ratingDistribution && <TabsTrigger value="ratings">Ratings</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Regional Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.demographics.regions}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="votes"
                      label={({name, percentage}) => `${name} (${percentage}%)`}
                    >
                      {analytics.demographics.regions.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Voting by Time of Day</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.demographics.timeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="votes" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Regional Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.demographics.regions.map((region, index) => (
                  <div key={region.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{region.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress value={region.percentage} className="w-32" />
                      <Badge variant="secondary">{region.votes} votes</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vote & View Trends</CardTitle>
              <CardDescription>Daily activity over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="votes" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="views" stroke="hsl(var(--secondary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
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