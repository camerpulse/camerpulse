import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Eye, Heart, MessageSquare, Share } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EngagementMetrics {
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  totalShares: number;
  avgEngagementRate: number;
  topCategories: Array<{ name: string; count: number; color: string }>;
  dailyActivity: Array<{ date: string; posts: number; engagement: number }>;
  contentPerformance: Array<{ type: string; avgLikes: number; avgComments: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const ContentAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<EngagementMetrics>({
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0,
    totalShares: 0,
    avgEngagementRate: 0,
    topCategories: [],
    dailyActivity: [],
    contentPerformance: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      // Simulate analytics data since we don't have actual engagement tables
      const mockMetrics: EngagementMetrics = {
        totalPosts: 1247,
        totalComments: 3891,
        totalLikes: 8765,
        totalShares: 2134,
        avgEngagementRate: 6.8,
        topCategories: [
          { name: 'Politics', count: 234, color: COLORS[0] },
          { name: 'Community', count: 189, color: COLORS[1] },
          { name: 'Education', count: 156, color: COLORS[2] },
          { name: 'Development', count: 134, color: COLORS[3] },
          { name: 'Culture', count: 98, color: COLORS[4] }
        ],
        dailyActivity: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          posts: Math.floor(Math.random() * 50) + 10,
          engagement: Math.floor(Math.random() * 300) + 100
        })),
        contentPerformance: [
          { type: 'Text Posts', avgLikes: 23, avgComments: 8 },
          { type: 'Images', avgLikes: 45, avgComments: 12 },
          { type: 'Videos', avgLikes: 67, avgComments: 18 },
          { type: 'Polls', avgLikes: 34, avgComments: 15 }
        ]
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEngagementTrend = () => {
    const trend = Math.random() > 0.5 ? 'up' : 'down';
    const percentage = Math.floor(Math.random() * 20) + 1;
    return { trend, percentage };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const engagementTrend = getEngagementTrend();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Content Analytics</h2>
        <p className="text-muted-foreground">Platform engagement and content performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPosts.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLikes.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {engagementTrend.trend === 'up' ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {engagementTrend.trend === 'up' ? '+' : '-'}{engagementTrend.percentage}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalComments.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement Rate</CardTitle>
            <Share className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgEngagementRate}%</div>
            <Progress value={metrics.avgEngagementRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity</CardTitle>
            <CardDescription>Posts and engagement over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).getDate().toString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="posts" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Posts"
                />
                <Line 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Engagement"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>Most popular content categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.topCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {metrics.topCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Content Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Content Performance by Type</CardTitle>
          <CardDescription>Average engagement metrics by content type</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.contentPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgLikes" fill="#8884d8" name="Avg Likes" />
              <Bar dataKey="avgComments" fill="#82ca9d" name="Avg Comments" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
          <CardDescription>Detailed breakdown of content categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topCategories.map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{category.count} posts</Badge>
                  <div className="w-24">
                    <Progress 
                      value={(category.count / Math.max(...metrics.topCategories.map(c => c.count))) * 100}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};