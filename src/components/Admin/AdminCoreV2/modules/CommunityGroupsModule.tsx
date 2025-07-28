import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminModuleHeader } from '../components/AdminModuleHeader';
import { Users, Plus, Crown, Shield, TrendingUp, Eye, Settings, MapPin } from 'lucide-react';

interface CommunityGroupsModuleProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const CommunityGroupsModule: React.FC<CommunityGroupsModuleProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  // Mock data for demonstration
  const groupStats = {
    totalGroups: stats?.total_groups || 234,
    activeGroups: stats?.active_groups || 189,
    totalMembers: stats?.total_group_members || 5678,
    weeklyPosts: stats?.weekly_group_posts || 1234
  };

  const popularGroups = [
    { 
      id: 1, 
      name: 'Cameroon Youth Development', 
      members: 1245, 
      posts: 342, 
      category: 'Youth',
      region: 'National',
      status: 'active',
      privacy: 'public'
    },
    { 
      id: 2, 
      name: 'Douala Business Network', 
      members: 987, 
      posts: 234, 
      category: 'Business',
      region: 'Littoral',
      status: 'active',
      privacy: 'private'
    },
    { 
      id: 3, 
      name: 'Traditional Arts & Culture', 
      members: 756, 
      posts: 189, 
      category: 'Culture',
      region: 'West',
      status: 'active',
      privacy: 'public'
    },
    { 
      id: 4, 
      name: 'Women Entrepreneurs Forum', 
      members: 623, 
      posts: 156, 
      category: 'Business',
      region: 'Centre',
      status: 'moderated',
      privacy: 'closed'
    }
  ];

  const groupCategories = [
    { name: 'Youth & Education', count: 45, color: 'bg-blue-100 text-blue-800' },
    { name: 'Business & Trade', count: 38, color: 'bg-green-100 text-green-800' },
    { name: 'Culture & Arts', count: 32, color: 'bg-purple-100 text-purple-800' },
    { name: 'Politics & Governance', count: 28, color: 'bg-red-100 text-red-800' },
    { name: 'Health & Wellness', count: 25, color: 'bg-orange-100 text-orange-800' },
    { name: 'Technology & Innovation', count: 22, color: 'bg-cyan-100 text-cyan-800' },
    { name: 'Agriculture & Environment', count: 20, color: 'bg-emerald-100 text-emerald-800' },
    { name: 'Sports & Recreation', count: 24, color: 'bg-yellow-100 text-yellow-800' }
  ];

  const recentGroupActions = [
    { id: 1, action: 'created', group: 'Startup Incubator Yaoundé', user: 'Marie Nkomo', time: '2 hours ago' },
    { id: 2, action: 'joined', group: 'Women in Tech Cameroon', user: 'Sarah Mballa', time: '4 hours ago' },
    { id: 3, action: 'posted', group: 'Village Development Initiative', user: 'Jean Doe', time: '6 hours ago' },
    { id: 4, action: 'moderated', group: 'Political Discussions', user: 'Admin', time: '8 hours ago' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'moderated': return 'text-yellow-600';
      case 'inactive': return 'text-gray-600';
      case 'suspended': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getPrivacyColor = (privacy: string) => {
    switch (privacy) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'private': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <AdminModuleHeader
        title="Community Groups Management"
        description="Manage community groups, memberships, and group activities"
        icon={Users}
        iconColor="text-emerald-600"
        searchPlaceholder="Search groups, members, categories..."
        onSearch={(query) => {
          console.log('Searching groups:', query);
        }}
        onRefresh={() => {
          logActivity('groups_refresh', { timestamp: new Date() });
        }}
        actions={(
          <Button onClick={() => logActivity('groups_create', {})}>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        )}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupStats.totalGroups}</div>
            <p className="text-xs text-muted-foreground">All community groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupStats.activeGroups}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupStats.totalMembers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Posts</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupStats.weeklyPosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Group activity</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Groups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Most Active Groups
            </CardTitle>
            <CardDescription>
              Groups with highest member engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularGroups.map((group) => (
                <div key={group.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{group.name}</h4>
                      <Badge className={getPrivacyColor(group.privacy)} variant="secondary">
                        {group.privacy}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {group.members} members
                      </span>
                      <span>{group.posts} posts</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {group.region}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Category: {group.category}
                    </p>
                  </div>
                  <Badge className={getStatusColor(group.status)}>
                    {group.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View All Groups
            </Button>
          </CardContent>
        </Card>

        {/* Recent Group Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Group Activity
            </CardTitle>
            <CardDescription>
              Latest actions and updates across groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentGroupActions.map((action) => (
                <div key={action.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{action.user}</span>
                      <span className="text-sm text-muted-foreground">{action.action}</span>
                    </div>
                    <p className="text-sm font-medium mt-1">{action.group}</p>
                    <p className="text-xs text-muted-foreground">{action.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Group Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Group Categories
          </CardTitle>
          <CardDescription>
            Distribution of groups by category and interest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {groupCategories.map((category) => (
              <div key={category.name} className="text-center p-4 rounded-lg border">
                <Badge className={category.color} variant="secondary">
                  {category.count}
                </Badge>
                <h4 className="font-medium mt-2 text-sm">{category.name}</h4>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Group Management Tools */}
      {hasPermission('groups:admin') && (
        <Card>
          <CardHeader>
            <CardTitle>Group Management Tools</CardTitle>
            <CardDescription>
              Administrative tools for managing community groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                onClick={() => logActivity('groups_moderate', {})}
              >
                <Shield className="w-4 h-4 mr-2" />
                Moderate Groups
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('groups_analytics', {})}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Group Analytics
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('groups_members', {})}
              >
                <Crown className="w-4 h-4 mr-2" />
                Manage Members
              </Button>
              <Button 
                variant="outline"
                onClick={() => logActivity('groups_settings', {})}
              >
                <Settings className="w-4 h-4 mr-2" />
                Group Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};