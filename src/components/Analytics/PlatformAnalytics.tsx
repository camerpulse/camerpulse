import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsChart } from '@/components/camerpulse';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageSquare, 
  Vote, 
  TrendingUp, 
  Activity,
  UserCheck,
  Building2,
  MapPin
} from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalPolls: number;
  totalPoliticians: number;
  totalCompanies: number;
  totalVillages: number;
  userGrowth: Array<{ date: string; users: number }>;
  engagementData: Array<{ date: string; posts: number; polls: number; messages: number }>;
  regionalData: Array<{ region: string; users: number; activity: number }>;
}

export const PlatformAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setAnalyticsData({
          totalUsers: 15420,
          activeUsers: 8945,
          totalPosts: 32100,
          totalPolls: 1250,
          totalPoliticians: 890,
          totalCompanies: 2340,
          totalVillages: 1580,
          userGrowth: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            users: Math.floor(Math.random() * 500) + 200
          })),
          engagementData: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            posts: Math.floor(Math.random() * 200) + 50,
            polls: Math.floor(Math.random() * 20) + 5,
            messages: Math.floor(Math.random() * 1000) + 200
          })),
          regionalData: [
            { region: 'Centre', users: 4520, activity: 85 },
            { region: 'Littoral', users: 3890, activity: 78 },
            { region: 'West', users: 2340, activity: 72 },
            { region: 'Northwest', users: 1890, activity: 68 },
            { region: 'Southwest', users: 1650, activity: 65 },
            { region: 'East', users: 1130, activity: 58 }
          ]
        });
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading || !analyticsData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const MetricCard = ({ title, value, icon: Icon, trend }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value.toLocaleString()}</p>
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        {trend && (
          <div className="mt-2 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-sm text-green-600">+{trend}% from last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Platform Analytics</h2>
        <p className="text-muted-foreground">
          Real-time insights into CamerPulse platform usage and engagement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={analyticsData.totalUsers}
          icon={Users}
          trend={12.5}
        />
        <MetricCard
          title="Active Users"
          value={analyticsData.activeUsers}
          icon={Activity}
          trend={8.2}
        />
        <MetricCard
          title="Total Posts"
          value={analyticsData.totalPosts}
          icon={MessageSquare}
          trend={15.3}
        />
        <MetricCard
          title="Total Polls"
          value={analyticsData.totalPolls}
          icon={Vote}
          trend={6.7}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Politicians"
          value={analyticsData.totalPoliticians}
          icon={UserCheck}
        />
        <MetricCard
          title="Companies"
          value={analyticsData.totalCompanies}
          icon={Building2}
        />
        <MetricCard
          title="Villages"
          value={analyticsData.totalVillages}
          icon={MapPin}
        />
      </div>

      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="growth">User Growth</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="regional">Regional Data</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Trend</CardTitle>
              <CardDescription>
                Daily new user registrations over the past 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsChart
                data={analyticsData.userGrowth}
                type="line"
                dataKey="users"
                height={300}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Engagement</CardTitle>
              <CardDescription>
                Posts, polls, and messages activity over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsChart
                data={analyticsData.engagementData}
                type="bar"
                dataKey="posts"
                height={300}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regional Distribution</CardTitle>
              <CardDescription>
                User distribution and activity by region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.regionalData.map((region) => (
                  <div key={region.region} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{region.region}</p>
                        <p className="text-sm text-muted-foreground">
                          {region.users.toLocaleString()} users
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {region.activity}% activity
                    </Badge>
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