import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, TrendingUp, Users, Vote, History, Bookmark } from 'lucide-react';

interface UserPollActivity {
  id: string;
  poll_id: string;
  option_index: number;
  created_at: string;
  poll_title: string;
  poll_description: string;
  poll_ends_at: string;
  poll_votes_count: number;
}

interface PollStats {
  totalVotes: number;
  activePollsParticipated: number;
  completedPolls: number;
  averageEngagement: number;
}

const PollUserDashboard: React.FC = () => {
  const [userVotes, setUserVotes] = useState<UserPollActivity[]>([]);
  const [stats, setStats] = useState<PollStats>({
    totalVotes: 0,
    activePollsParticipated: 0,
    completedPolls: 0,
    averageEngagement: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserActivity();
    }
  }, [user]);

  const fetchUserActivity = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch user's vote history with poll details
      const { data: votes, error: votesError } = await supabase
        .from('poll_votes')
        .select(`
          id,
          poll_id,
          option_index,
          created_at,
          polls!inner(
            title,
            description,
            ends_at,
            votes_count
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (votesError) throw votesError;

      // Transform the data
      const userVoteActivity: UserPollActivity[] = votes?.map((vote: any) => ({
        id: vote.id,
        poll_id: vote.poll_id,
        option_index: vote.option_index,
        created_at: vote.created_at,
        poll_title: vote.polls.title,
        poll_description: vote.polls.description,
        poll_ends_at: vote.polls.ends_at,
        poll_votes_count: vote.polls.votes_count
      })) || [];

      setUserVotes(userVoteActivity);

      // Calculate stats
      const now = new Date();
      const activePollsCount = userVoteActivity.filter(vote => 
        new Date(vote.poll_ends_at) > now
      ).length;
      const completedPollsCount = userVoteActivity.filter(vote => 
        new Date(vote.poll_ends_at) <= now
      ).length;

      setStats({
        totalVotes: userVoteActivity.length,
        activePollsParticipated: activePollsCount,
        completedPolls: completedPollsCount,
        averageEngagement: userVoteActivity.length > 0 ? 
          userVoteActivity.reduce((sum, vote) => sum + vote.poll_votes_count, 0) / userVoteActivity.length : 0
      });

    } catch (error: any) {
      console.error('Error fetching user activity:', error);
      toast({
        title: "Error",
        description: "Failed to load your poll activity.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (endDate: string) => new Date() > new Date(endDate);

  const getEngagementLevel = (totalVotes: number) => {
    if (totalVotes >= 20) return { level: 'High', color: 'bg-green-500' };
    if (totalVotes >= 10) return { level: 'Medium', color: 'bg-yellow-500' };
    if (totalVotes >= 5) return { level: 'Low', color: 'bg-blue-500' };
    return { level: 'New', color: 'bg-gray-500' };
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to view your poll dashboard and activity.
            </p>
            <Button onClick={() => navigateToAuth()}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const engagementInfo = getEngagementLevel(stats.totalVotes);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Poll Dashboard</h1>
        <p className="text-muted-foreground">
          Track your voting activity and engagement across polls
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVotes}</div>
            <p className="text-xs text-muted-foreground">
              Across all polls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePollsParticipated}</div>
            <p className="text-xs text-muted-foreground">
              Still accepting votes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedPolls}</div>
            <p className="text-xs text-muted-foreground">
              Polls you've participated in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${engagementInfo.color}`}></div>
              <div className="text-2xl font-bold">{engagementInfo.level}</div>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on participation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Tabs */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="active">Active Polls</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Voting Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : userVotes.length === 0 ? (
                <div className="text-center py-8">
                  <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No voting activity yet.</p>
                  <Button className="mt-4" onClick={() => navigateTo('/polls')}>
                    Explore Polls
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userVotes.slice(0, 10).map((vote) => (
                    <div key={vote.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium line-clamp-1">{vote.poll_title}</h3>
                          {vote.poll_description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {vote.poll_description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Voted: {formatDate(vote.created_at)}</span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {vote.poll_votes_count} votes
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isExpired(vote.poll_ends_at) ? (
                            <Badge variant="secondary">Completed</Badge>
                          ) : (
                            <Badge variant="default">Active</Badge>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigateTo(`/polls/${vote.poll_id}`)}
                          >
                            View
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

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Polls You've Voted On</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userVotes.filter(vote => !isExpired(vote.poll_ends_at)).map((vote) => (
                  <div key={vote.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{vote.poll_title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Ends: {formatDate(vote.poll_ends_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {vote.poll_votes_count} votes
                          </span>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => navigateTo(`/polls/${vote.poll_id}`)}
                      >
                        View Results
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Polls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userVotes.filter(vote => isExpired(vote.poll_ends_at)).map((vote) => (
                  <div key={vote.id} className="border rounded-lg p-4 opacity-75">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{vote.poll_title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Ended: {formatDate(vote.poll_ends_at)}</span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {vote.poll_votes_count} total votes
                          </span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigateTo(`/polls/${vote.poll_id}`)}
                      >
                        View Results
                      </Button>
                    </div>
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

export default PollUserDashboard;