import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Target, Plus, Search, BarChart3, TrendingUp, Users, 
  Clock, CheckCircle, AlertTriangle, Settings, Eye, Edit3 
} from 'lucide-react';

interface PollsSystemManagerProps {
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, details: any) => void;
  stats?: any;
}

export const PollsSystemManager: React.FC<PollsSystemManagerProps> = ({
  hasPermission,
  logActivity,
  stats
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch polls data
  const { data: polls, isLoading } = useQuery({
    queryKey: ['admin_polls', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('polls')
        .select(`
          id,
          title,
          description,
          poll_type,
          status,
          created_at,
          expires_at,
          total_votes,
          is_featured,
          visibility_level
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data;
    },
    enabled: hasPermission('polls'),
  });

  // Fetch poll analytics
  const { data: analytics } = useQuery({
    queryKey: ['poll_analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('polls')
        .select('id, total_votes, poll_type, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const totalPolls = data.length;
      const totalVotes = data.reduce((sum, poll) => sum + (poll.total_votes || 0), 0);
      const avgVotesPerPoll = totalPolls > 0 ? totalVotes / totalPolls : 0;

      return {
        totalPolls,
        totalVotes,
        avgVotesPerPoll: Math.round(avgVotesPerPoll),
        politicalPolls: data.filter(p => p.poll_type === 'political').length,
        civicPolls: data.filter(p => p.poll_type === 'civic').length,
      };
    },
    enabled: hasPermission('polls'),
  });

  const handlePollAction = async (pollId: string, action: string) => {
    try {
      let updateData: any = {};
      
      switch (action) {
        case 'feature':
          updateData = { is_featured: true };
          break;
        case 'unfeature':
          updateData = { is_featured: false };
          break;
        case 'activate':
          updateData = { status: 'active' };
          break;
        case 'deactivate':
          updateData = { status: 'inactive' };
          break;
      }

      const { error } = await supabase
        .from('polls')
        .update(updateData)
        .eq('id', pollId);

      if (error) throw error;

      logActivity(`poll_${action}`, { pollId });
    } catch (error) {
      console.error(`Error performing ${action} on poll:`, error);
    }
  };

  if (!hasPermission('polls')) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p>You don't have permission to manage polls.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Target className="h-6 w-6 mr-2 text-purple-600" />
            Polls System Management
          </h2>
          <p className="text-muted-foreground">Manage polls, voting, and civic engagement</p>
        </div>
        <Button variant="cm-green" className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Create Poll
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Polls</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-purple-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Polls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalPolls || 0}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-cm-green">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Votes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalVotes?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">High engagement</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-cm-red">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Political Polls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.politicalPolls || 0}</div>
                <p className="text-xs text-muted-foreground">Active discussions</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-cm-yellow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Avg Votes/Poll</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.avgVotesPerPoll || 0}</div>
                <p className="text-xs text-muted-foreground">Participation rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common poll management tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Plus className="h-6 w-6 mb-2" />
                  Create Poll
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Settings className="h-6 w-6 mb-2" />
                  Poll Settings
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Featured Polls
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search polls by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Polls List */}
          <Card>
            <CardHeader>
              <CardTitle>Active Polls</CardTitle>
              <CardDescription>Manage individual polls and their settings</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading polls...</div>
              ) : (
                <div className="space-y-4">
                  {polls?.map((poll: any) => (
                    <div key={poll.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{poll.title}</h3>
                            {poll.is_featured && (
                              <Badge variant="default" className="bg-cm-yellow text-black">Featured</Badge>
                            )}
                            <Badge variant="outline">{poll.poll_type}</Badge>
                            <Badge 
                              variant={poll.status === 'active' ? 'default' : 'secondary'}
                              className={poll.status === 'active' ? 'bg-cm-green' : ''}
                            >
                              {poll.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {poll.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {poll.total_votes || 0} votes
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Created {new Date(poll.created_at).toLocaleDateString()}
                            </span>
                            {poll.expires_at && (
                              <span className="flex items-center">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Expires {new Date(poll.expires_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant={poll.is_featured ? "secondary" : "outline"} 
                            size="sm"
                            onClick={() => handlePollAction(poll.id, poll.is_featured ? 'unfeature' : 'feature')}
                          >
                            {poll.is_featured ? 'Unfeature' : 'Feature'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Poll Analytics Dashboard
              </CardTitle>
              <CardDescription>Comprehensive voting and engagement analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Detailed voting patterns, engagement metrics, and demographic breakdowns
                </p>
                <Button variant="outline">Configure Analytics</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Poll System Settings
              </CardTitle>
              <CardDescription>Configure global poll behavior and moderation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">System Configuration</h3>
                <p className="text-muted-foreground mb-4">
                  Voting rules, moderation settings, and automated poll management
                </p>
                <Button variant="outline">Open Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};