import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { BarChart3, TrendingUp, Users, Eye, Heart, Share, MessageSquare, Download } from 'lucide-react';

interface SocialAnalyticsModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const SocialAnalyticsModule: React.FC<SocialAnalyticsModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  // Mock data for demonstration
  const analyticsStats = {
    totalEngagement: stats?.total_engagement || 45623,
    dailyActiveUsers: stats?.daily_active_users || 3241,
    contentReach: stats?.content_reach || 78453,
    interactionRate: stats?.interaction_rate || 8.7
  };

  const engagementMetrics = [
    { metric: 'Total Likes', value: '12,453', change: '+15%', trend: 'up' },
    { metric: 'Total Shares', value: '3,241', change: '+8%', trend: 'up' },
    { metric: 'Total Comments', value: '8,769', change: '+12%', trend: 'up' },
    { metric: 'Post Views', value: '156,789', change: '+6%', trend: 'up' }
  ];

  const topContent = [
    {
      id: 1,
      title: 'Village Development Project Update',
      author: 'Mayor Jean Mballa',
      type: 'post',
      views: 4567,
      likes: 324,
      shares: 89,
      comments: 156,
      engagement: '12.4%'
    },
    {
      id: 2,
      title: 'Youth Employment Initiative Launch',
      author: 'Sarah Nkomo',
      type: 'announcement',
      views: 3892,
      likes: 298,
      shares: 67,
      comments: 134,
      engagement: '11.8%'
    },
    {
      id: 3,
      title: 'Traditional Festival Photo Gallery',
      author: 'Cultural Committee',
      type: 'media',
      views: 3245,
      likes: 234,
      shares: 45,
      comments: 98,
      engagement: '11.2%'
    },
    {
      id: 4,
      title: 'Healthcare Services Announcement',
      author: 'Health Department',
      type: 'announcement',
      views: 2876,
      likes: 187,
      shares: 34,
      comments: 76,
      engagement: '10.3%'
    }
  ];

  const demographicData = [
    { segment: '18-25 years', percentage: 28, color: 'bg-blue-500' },
    { segment: '26-35 years', percentage: 35, color: 'bg-green-500' },
    { segment: '36-45 years', percentage: 22, color: 'bg-purple-500' },
    { segment: '46+ years', percentage: 15, color: 'bg-orange-500' }
  ];

  const regionalEngagement = [
    { region: 'Centre', users: 2156, engagement: '9.2%' },
    { region: 'Littoral', users: 1834, engagement: '8.8%' },
    { region: 'West', users: 1567, engagement: '8.5%' },
    { region: 'Northwest', users: 1234, engagement: '8.1%' },
    { region: 'Southwest', users: 987, engagement: '7.9%' }
  ];

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'post': return 'bg-blue-100 text-blue-800';
      case 'announcement': return 'bg-green-100 text-green-800';
      case 'media': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Social Analytics & Insights"
        description="Comprehensive analytics for community engagement and social interactions"
        icon={BarChart3}
        iconColor="text-violet-600"
        searchPlaceholder="Search metrics, content, users..."
        onSearch={(query) => {
          console.log('Searching analytics:', query);
        }}
        onRefresh={() => {
          logActivity('analytics_refresh', { timestamp: new Date() });
        }}
        actions={(
          <Button onClick={() => logActivity('analytics_export', {})}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        )}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsStats.totalEngagement.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All interactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsStats.dailyActiveUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Reach</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsStats.contentReach.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total impressions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interaction Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsStats.interactionRate}%</div>
            <p className="text-xs text-muted-foreground">Average engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Engagement Metrics
          </CardTitle>
          <CardDescription>
            Detailed breakdown of user interactions and engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {engagementMetrics.map((metric) => (
              <div key={metric.metric} className="text-center p-4 rounded-lg border">
                <h4 className="font-medium text-sm">{metric.metric}</h4>
                <p className="text-2xl font-bold mt-2">{metric.value}</p>
                <p className={`text-sm mt-1 ${getTrendColor(metric.trend)}`}>
                  {metric.change} from last week
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Top Performing Content
            </CardTitle>
            <CardDescription>
              Most engaging posts and content across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topContent.map((content) => (
                <div key={content.id} className="p-3 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{content.title}</h4>
                    <Badge className={getContentTypeColor(content.type)} variant="secondary">
                      {content.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    by {content.author}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {content.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {content.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share className="h-3 w-3" />
                        {content.shares}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {content.comments}
                      </span>
                    </div>
                    <span className="font-medium text-green-600">
                      {content.engagement}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demographics & Regions */}
        <div className="space-y-6">
          {/* Age Demographics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Age Demographics
              </CardTitle>
              <CardDescription>
                User distribution by age groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {demographicData.map((segment) => (
                  <div key={segment.segment} className="flex items-center gap-3">
                    <div className="w-16 text-sm">{segment.segment}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${segment.color}`}
                        style={{ width: `${segment.percentage}%` }}
                      />
                    </div>
                    <div className="w-10 text-sm font-medium">{segment.percentage}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Regional Engagement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Regional Engagement
              </CardTitle>
              <CardDescription>
                User activity by region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {regionalEngagement.map((region) => (
                  <div key={region.region} className="flex items-center justify-between p-2 rounded border">
                    <div>
                      <h4 className="font-medium text-sm">{region.region}</h4>
                      <p className="text-xs text-muted-foreground">
                        {region.users.toLocaleString()} users
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        {region.engagement}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analytics Tools */}
      {hasPermission('analytics:advanced') && (
        <Card>
          <CardHeader>
            <CardTitle>Advanced Analytics Tools</CardTitle>
            <CardDescription>
              Detailed reporting and analysis tools for social data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                onClick={() => logActivity('analytics_detailed', {})}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Detailed Reports
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('analytics_trends', {})}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Trend Analysis
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('analytics_segments', {})}
              >
                <Users className="w-4 h-4 mr-2" />
                User Segments
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('analytics_export_all', {})}
              >
                <Download className="w-4 h-4 mr-2" />
                Export All Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};