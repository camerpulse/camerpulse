import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Users, 
  Star, 
  BarChart3,
  Activity,
  Award
} from 'lucide-react';
import { Senator } from '@/hooks/useSenators';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface SenatorAnalyticsDashboardProps {
  senator: Senator;
}

export const SenatorAnalyticsDashboard: React.FC<SenatorAnalyticsDashboardProps> = ({
  senator
}) => {
  // Mock analytics data - in real app, this would come from the database
  const viewsData = [
    { month: 'Jan', views: 45, followers: 12 },
    { month: 'Feb', views: 67, followers: 18 },
    { month: 'Mar', views: 89, followers: 25 },
    { month: 'Apr', views: 123, followers: 34 },
    { month: 'May', views: 156, followers: 42 },
    { month: 'Jun', views: 189, followers: 58 },
  ];

  const ratingsData = [
    { month: 'Jan', rating: 3.2 },
    { month: 'Feb', rating: 3.4 },
    { month: 'Mar', rating: 3.6 },
    { month: 'Apr', rating: 3.8 },
    { month: 'May', rating: 4.1 },
    { month: 'Jun', rating: 4.3 },
  ];

  const performanceMetrics = [
    { metric: 'Bills Proposed', value: senator.bills_proposed_count || 0, target: 10, color: 'bg-blue-500' },
    { metric: 'Bills Passed', value: senator.bills_passed_count || 0, target: 5, color: 'bg-green-500' },
    { metric: 'Performance Score', value: senator.performance_score || 0, target: 100, color: 'bg-purple-500' },
    { metric: 'Transparency Score', value: senator.transparency_score || 0, target: 100, color: 'bg-orange-500' },
  ];

  const engagementMetrics = {
    totalViews: 1247,
    monthlyGrowth: 15.3,
    followerCount: 58,
    followerGrowth: 22.1,
    avgRating: senator.average_rating,
    ratingTrend: 12.5
  };

  return (
    <div className="space-y-6">
      {/* Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{engagementMetrics.totalViews.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+{engagementMetrics.monthlyGrowth}%</span>
                </div>
              </div>
              <Eye className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Followers</p>
                <p className="text-2xl font-bold">{engagementMetrics.followerCount}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+{engagementMetrics.followerGrowth}%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{engagementMetrics.avgRating.toFixed(1)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">+{engagementMetrics.ratingTrend}%</span>
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Engagement</p>
                <p className="text-2xl font-bold">High</p>
                <div className="flex items-center mt-1">
                  <Activity className="h-3 w-3 text-blue-500 mr-1" />
                  <span className="text-xs text-blue-500">Active</span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{metric.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {metric.value} / {metric.target}
                        </span>
                        <Badge variant="outline">
                          {((metric.value / metric.target) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={(metric.value / metric.target) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Legislative Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {senator.bills_proposed_count || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Bills Proposed</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {senator.bills_passed_count || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Bills Passed</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {senator.bills_passed_count && senator.bills_proposed_count ? 
                      ((senator.bills_passed_count / senator.bills_proposed_count) * 100).toFixed(0) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Views & Followers</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#8884d8" 
                    name="Profile Views"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="followers" 
                    stroke="#82ca9d" 
                    name="New Followers"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rating Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ratingsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[1, 5]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="rating" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    name="Average Rating"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Public Approval</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Rising
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Media Coverage</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Positive
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Committee Activity</span>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                      Active
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Rate</span>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700">
                      Improving
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Transparency</span>
                    <Badge variant="outline" className="bg-cyan-50 text-cyan-700">
                      High
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Civic Engagement</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Excellent
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparisons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regional Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Performance compared to other senators from {senator.region}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Performance Score</span>
                    <div className="flex items-center gap-2">
                      <Progress value={75} className="w-24 h-2" />
                      <span className="text-sm font-medium">Top 25%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Legislative Activity</span>
                    <div className="flex items-center gap-2">
                      <Progress value={60} className="w-24 h-2" />
                      <span className="text-sm font-medium">Top 40%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Citizen Ratings</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-24 h-2" />
                      <span className="text-sm font-medium">Top 15%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievements & Recognition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {senator.badges?.map((badge, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="font-medium text-sm capitalize">
                        {badge.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Achievement badge
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-6 text-muted-foreground">
                    <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No badges earned yet</p>
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