import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { Users, UserPlus, Heart, Share, TrendingUp, Eye, Settings, Shield } from 'lucide-react';

interface SocialNetworkingModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const SocialNetworkingModule: React.FC<SocialNetworkingModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  // Mock data for demonstration
  const socialStats = {
    totalUsers: stats?.total_social_users || 8934,
    activeConnections: stats?.active_connections || 12453,
    dailyInteractions: stats?.daily_interactions || 2847,
    totalPosts: stats?.total_social_posts || 5612
  };

  const topInfluencers = [
    { id: 1, name: 'Marie Mballa', followers: 2341, posts: 156, engagement: '94%', status: 'verified' },
    { id: 2, name: 'Jean Nkomo', followers: 1987, posts: 234, engagement: '89%', status: 'active' },
    { id: 3, name: 'Sarah Njoya', followers: 1654, posts: 189, engagement: '92%', status: 'verified' },
    { id: 4, name: 'Paul Biya Jr.', followers: 1432, posts: 98, engagement: '87%', status: 'flagged' }
  ];

  const recentActivities = [
    { id: 1, type: 'follow', user: 'John Doe', target: 'Community Leaders', time: '2 min ago' },
    { id: 2, type: 'post', user: 'Jane Smith', content: 'Village development update...', likes: 23, time: '15 min ago' },
    { id: 3, type: 'share', user: 'Mike Johnson', content: 'Election announcement', shares: 12, time: '1 hour ago' },
    { id: 4, type: 'comment', user: 'Sarah Wilson', content: 'Great initiative for youth...', time: '2 hours ago' }
  ];

  const networkMetrics = [
    { name: 'Connection Rate', value: '76%', trend: '+5%', color: 'text-green-600' },
    { name: 'Engagement Score', value: '8.4/10', trend: '+0.3', color: 'text-blue-600' },
    { name: 'Content Quality', value: '92%', trend: '+2%', color: 'text-purple-600' },
    { name: 'Safety Index', value: '96%', trend: '+1%', color: 'text-green-600' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-blue-600';
      case 'active': return 'text-green-600';
      case 'flagged': return 'text-red-600';
      case 'inactive': return 'text-gray-600';
      default: return 'text-muted-foreground';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'follow': return UserPlus;
      case 'post': return TrendingUp;
      case 'share': return Share;
      case 'comment': return Heart;
      default: return Eye;
    }
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Social Networking Management"
        description="Manage user connections, social interactions, and network analytics"
        icon={Users}
        iconColor="text-cyan-600"
        searchPlaceholder="Search users, posts, connections..."
        onSearch={(query) => {
          console.log('Searching social network:', query);
        }}
        onRefresh={() => {
          logActivity('social_refresh', { timestamp: new Date() });
        }}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Social Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{socialStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active social profiles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{socialStats.activeConnections.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active relationships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Interactions</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{socialStats.dailyInteractions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Likes, shares, comments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{socialStats.totalPosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Community content</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Influencers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Influencers
            </CardTitle>
            <CardDescription>
              Most influential users in the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topInfluencers.map((influencer) => (
                <div key={influencer.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-medium">{influencer.name}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{influencer.followers} followers</span>
                      <span>{influencer.posts} posts</span>
                      <span>{influencer.engagement} engagement</span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(influencer.status)}>
                    {influencer.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View All Influencers
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>
              Latest social interactions and user activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{activity.user}</span>
                        <span className="text-sm text-muted-foreground">{activity.type}</span>
                        {activity.target && (
                          <span className="text-sm">{activity.target}</span>
                        )}
                      </div>
                      {activity.content && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {activity.content}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{activity.time}</span>
                        {activity.likes && <span>{activity.likes} likes</span>}
                        {activity.shares && <span>{activity.shares} shares</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View All Activities
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Network Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Network Health Metrics
          </CardTitle>
          <CardDescription>
            Key performance indicators for social networking features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {networkMetrics.map((metric) => (
              <div key={metric.name} className="text-center p-4 rounded-lg border">
                <h4 className="font-medium">{metric.name}</h4>
                <p className="text-2xl font-bold mt-2">{metric.value}</p>
                <p className={`text-sm ${metric.color} mt-1`}>
                  {metric.trend} from last week
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Social Management Tools */}
      {hasPermission('social:admin') && (
        <Card>
          <CardHeader>
            <CardTitle>Social Network Administration</CardTitle>
            <CardDescription>
              Tools for managing social features and user interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                onClick={() => logActivity('social_moderate', {})}
              >
                <Shield className="w-4 h-4 mr-2" />
                Moderate Content
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('social_analytics', {})}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Network Analytics
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('social_connections', {})}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Connections
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('social_settings', {})}
              >
                <Settings className="w-4 h-4 mr-2" />
                Social Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};