import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { MessageCircle, Users, TrendingUp, Flag, Eye, Clock } from 'lucide-react';

interface CommunityForumsModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const CommunityForumsModule: React.FC<CommunityForumsModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  // Mock data for demonstration
  const forumStats = {
    totalForums: stats?.total_forums || 12,
    totalPosts: stats?.total_posts || 1534,
    totalUsers: stats?.active_forum_users || 892,
    moderatedPosts: stats?.moderated_posts || 23
  };

  const activeForums = [
    { id: 1, name: 'Village Development', posts: 342, members: 156, status: 'active' },
    { id: 2, name: 'Local Politics', posts: 289, members: 203, status: 'active' },
    { id: 3, name: 'Community Events', posts: 187, members: 134, status: 'active' },
    { id: 4, name: 'Youth Discussions', posts: 156, members: 89, status: 'moderated' }
  ];

  const recentPosts = [
    { id: 1, title: 'Road Infrastructure Proposal', author: 'John Doe', replies: 23, status: 'approved' },
    { id: 2, title: 'Community Health Initiative', author: 'Jane Smith', replies: 15, status: 'pending' },
    { id: 3, title: 'Education Committee Update', author: 'Mike Johnson', replies: 8, status: 'flagged' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'approved': return 'text-green-600';
      case 'moderated': return 'text-yellow-600';
      case 'pending': return 'text-blue-600';
      case 'flagged': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Community Forums Management"
        description="Manage community discussions, forums, and social interactions"
        icon={MessageCircle}
        iconColor="text-purple-600"
        searchPlaceholder="Search forums, posts, users..."
        onSearch={(query) => {
          console.log('Searching forums:', query);
        }}
        onRefresh={() => {
          logActivity('forums_refresh', { timestamp: new Date() });
        }}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forums</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forumStats.totalForums}</div>
            <p className="text-xs text-muted-foreground">Active community spaces</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forumStats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">Community discussions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forumStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Engaged community members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moderated Posts</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forumStats.moderatedPosts}</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Forums */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Active Forums
            </CardTitle>
            <CardDescription>
              Overview of community forum activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeForums.map((forum) => (
                <div key={forum.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <h4 className="font-medium">{forum.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {forum.posts} posts • {forum.members} members
                    </p>
                  </div>
                  <Badge className={getStatusColor(forum.status)}>
                    {forum.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View All Forums
            </Button>
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Posts
            </CardTitle>
            <CardDescription>
              Latest community discussions requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <h4 className="font-medium">{post.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      by {post.author} • {post.replies} replies
                    </p>
                  </div>
                  <Badge className={getStatusColor(post.status)}>
                    {post.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View All Posts
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Actions */}
      {hasPermission('forums:moderate') && (
        <Card>
          <CardHeader>
            <CardTitle>Moderation Tools</CardTitle>
            <CardDescription>
              Tools for managing community content and behavior
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                onClick={() => logActivity('forums_moderate_posts', {})}
              >
                <Flag className="w-4 h-4 mr-2" />
                Review Flagged Posts
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('forums_manage_users', {})}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage User Roles
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('forums_analytics', {})}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};