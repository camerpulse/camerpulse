import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Vote, Trophy, Clock, CheckCircle, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface VotingEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'ended' | 'upcoming';
  end_date: string;
  max_votes_per_user: number;
  show_live_results: boolean;
  candidates: VotingCandidate[];
}

interface VotingCandidate {
  id: string;
  name: string;
  description: string;
  image_url: string;
  vote_count: number;
  percentage: number;
}

interface UserVote {
  id: string;
  award_category: string;
  voted_for_id: string;
  voted_for_name: string;
  created_at: string;
  vote_weight: number;
}

export const FanVoting: React.FC = () => {
  const { user } = useAuth();
  const [votingEvents, setVotingEvents] = useState<VotingEvent[]>([]);
  const [userVotes, setUserVotes] = useState<UserVote[]>([]);
  const [fanProfile, setFanProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<VotingEvent | null>(null);
  const [votingInProgress, setVotingInProgress] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchFanProfile();
      fetchVotingEvents();
      fetchUserVotes();
    }
  }, [user]);

  const fetchFanProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('fan_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching fan profile:', error);
        return;
      }

      if (data) {
        setFanProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchVotingEvents = async () => {
    try {
      // Mock data for voting events - in real implementation, this would come from database
      const mockEvents: VotingEvent[] = [
        {
          id: '1',
          title: 'Artist of the Year 2024',
          description: 'Vote for your favorite Cameroonian artist of 2024',
          category: 'artist_of_year',
          status: 'active',
          end_date: '2024-12-31T23:59:59Z',
          max_votes_per_user: 1,
          show_live_results: true,
          candidates: [
            {
              id: 'artist1',
              name: 'Charlotte Dipanda',
              description: 'International breakthrough artist',
              image_url: '/placeholder-artist.jpg',
              vote_count: 1245,
              percentage: 35.2
            },
            {
              id: 'artist2',
              name: 'Stanley Enow',
              description: 'Hip-hop pioneer',
              image_url: '/placeholder-artist.jpg',
              vote_count: 987,
              percentage: 27.9
            },
            {
              id: 'artist3',
              name: 'Locko',
              description: 'Afrobeat sensation',
              image_url: '/placeholder-artist.jpg',
              vote_count: 756,
              percentage: 21.4
            },
            {
              id: 'artist4',
              name: 'Daphne',
              description: 'Rising R&B star',
              image_url: '/placeholder-artist.jpg',
              vote_count: 543,
              percentage: 15.5
            }
          ]
        },
        {
          id: '2',
          title: 'Best Collaboration 2024',
          description: 'Vote for the best musical collaboration this year',
          category: 'best_collaboration',
          status: 'active',
          end_date: '2024-11-30T23:59:59Z',
          max_votes_per_user: 1,
          show_live_results: false,
          candidates: [
            {
              id: 'collab1',
              name: 'Charlotte Dipanda x Stanley Enow - "Unity"',
              description: 'Cross-genre collaboration',
              image_url: '/placeholder-collab.jpg',
              vote_count: 0,
              percentage: 0
            },
            {
              id: 'collab2',
              name: 'Locko x Daphne - "Together"',
              description: 'Afrobeat meets R&B',
              image_url: '/placeholder-collab.jpg',
              vote_count: 0,
              percentage: 0
            }
          ]
        }
      ];

      setVotingEvents(mockEvents);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching voting events:', error);
      setLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    if (!fanProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('fan_voting')
        .select('*')
        .eq('fan_id', fanProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserVotes(data || []);
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  };

  const castVote = async (eventId: string, candidateId: string, candidateName: string) => {
    if (!fanProfile?.id) {
      toast.error('Please create a fan profile first');
      return;
    }

    setVotingInProgress(candidateId);

    try {
      // Check if user already voted in this category
      const existingVote = userVotes.find(vote => vote.award_category === selectedEvent?.category);
      if (existingVote) {
        toast.error('You have already voted in this category');
        return;
      }

      // Cast vote
      const { error } = await supabase
        .from('fan_voting')
        .insert({
          fan_id: fanProfile.id,
          award_category: selectedEvent?.category,
          voted_for_id: candidateId,
          voted_for_name: candidateName,
          vote_weight: 1,
          ip_address: null // Would be set server-side in real implementation
        });

      if (error) throw error;

      // Award points for voting
      try {
        await supabase.rpc('award_fan_points', {
          p_fan_id: fanProfile.id,
          p_activity_type: 'vote',
          p_reference_id: candidateId,
          p_reference_name: candidateName
        });
      } catch (pointsError) {
        console.warn('Error awarding points:', pointsError);
      }

      toast.success(`Vote cast for ${candidateName}!`);
      
      // Refresh votes
      await fetchUserVotes();
      
      // Update local state
      setUserVotes(prev => [...prev, {
        id: 'temp',
        award_category: selectedEvent?.category || '',
        voted_for_id: candidateId,
        voted_for_name: candidateName,
        created_at: new Date().toISOString(),
        vote_weight: 1
      }]);

    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error('Failed to cast vote. Please try again.');
    } finally {
      setVotingInProgress(null);
    }
  };

  const hasVotedInCategory = (category: string) => {
    return userVotes.some(vote => vote.award_category === category);
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} days left`;
    if (hours > 0) return `${hours} hours left`;
    return 'Ending soon';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'ended': return 'secondary';
      case 'upcoming': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Vote className="h-8 w-8 text-primary" />
              Fan Voting Center
            </h1>
            <p className="text-muted-foreground">Cast your votes and support your favorite artists</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-1">
              <Trophy className="h-3 w-3" />
              {userVotes.length} Votes Cast
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Voting</TabsTrigger>
            <TabsTrigger value="history">My Votes</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {votingEvents.filter(event => event.status === 'active').map((event) => (
                <Card key={event.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                        <p className="text-muted-foreground mt-1">{event.description}</p>
                      </div>
                      <Badge variant={getStatusColor(event.status) as any} className="ml-2">
                        {event.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {getTimeRemaining(event.end_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.candidates.reduce((sum, c) => sum + c.vote_count, 0)} total votes
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {event.candidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30"
                        >
                          <div className="w-16 h-16 rounded-full bg-gradient-civic flex items-center justify-center text-white font-bold">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{candidate.name}</h4>
                            <p className="text-sm text-muted-foreground">{candidate.description}</p>
                            {event.show_live_results && (
                              <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>{candidate.vote_count} votes</span>
                                  <span>{candidate.percentage}%</span>
                                </div>
                                <Progress value={candidate.percentage} className="h-2" />
                              </div>
                            )}
                          </div>
                          <div>
                            {hasVotedInCategory(event.category) ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-5 w-5" />
                                <span className="text-sm font-medium">Voted</span>
                              </div>
                            ) : (
                              <Button
                                onClick={() => {
                                  setSelectedEvent(event);
                                  castVote(event.id, candidate.id, candidate.name);
                                }}
                                disabled={votingInProgress === candidate.id}
                                className="min-w-[80px]"
                              >
                                {votingInProgress === candidate.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  'Vote'
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {votingEvents.filter(event => event.status === 'active').length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Vote className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Active Voting</h3>
                  <p className="text-muted-foreground">Check back later for new voting opportunities!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Your Voting History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userVotes.length > 0 ? (
                  <div className="space-y-4">
                    {userVotes.map((vote) => (
                      <div key={vote.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div className="flex-1">
                          <h4 className="font-medium">{vote.voted_for_name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            {vote.award_category?.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Voted on {new Date(vote.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">Weight: {vote.vote_weight}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No votes cast yet</p>
                    <p className="text-sm text-muted-foreground">Participate in active voting to see your history here!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {votingEvents.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{event.title}</span>
                      <Badge variant={getStatusColor(event.status) as any}>
                        {event.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {event.show_live_results || event.status === 'ended' ? (
                      <div className="space-y-4">
                        {event.candidates
                          .sort((a, b) => b.vote_count - a.vote_count)
                          .map((candidate, index) => (
                          <div key={candidate.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                                <span className="font-medium">{candidate.name}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {candidate.vote_count} votes ({candidate.percentage}%)
                              </span>
                            </div>
                            <Progress value={candidate.percentage} className="h-3" />
                          </div>
                        ))}
                        <div className="pt-4 border-t">
                          <p className="text-sm text-muted-foreground text-center">
                            Total Votes: {event.candidates.reduce((sum, c) => sum + c.vote_count, 0)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Results will be shown after voting ends</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};