import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Crown, Star, Heart, Vote, Clock, Users,
  TrendingUp, Award, CheckCircle, Calendar, ArrowRight,
  Zap, Target, Medal, ChevronRight, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface Nominee {
  id: string;
  name: string;
  image_url: string;
  category: string;
  points_breakdown: {
    streams: number;
    sales: number;
    external: number;
    voting: number;
    total: number;
  };
  current_votes: number;
  is_leading: boolean;
  nomination_song?: string;
  achievement_highlights: string[];
}

interface AwardCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  voting_open: boolean;
  voting_ends: string;
  total_votes: number;
  nominees: Nominee[];
  winner?: string;
  status: 'voting' | 'closed' | 'announced';
}

const CamerPlayAwards = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [votedCategories, setVotedCategories] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>({});

  // Mock awards data
  const awardCategories: AwardCategory[] = [
    {
      id: 'best_male_artist',
      name: 'Best Male Artist',
      description: 'Outstanding male vocalist of the year',
      icon: Crown,
      voting_open: true,
      voting_ends: '2024-08-31T23:59:59',
      total_votes: 15420,
      status: 'voting',
      nominees: [
        {
          id: 'boy_takunda',
          name: 'Boy Takunda',
          image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
          category: 'best_male_artist',
          points_breakdown: {
            streams: 45,
            sales: 25,
            external: 20,
            voting: 35,
            total: 125
          },
          current_votes: 5420,
          is_leading: true,
          nomination_song: 'Cameroon Rising',
          achievement_highlights: ['100K+ streams', 'Top 3 charts', '50K followers']
        },
        {
          id: 'artist_2',
          name: 'Samuel Eto\'o Jr',
          image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
          category: 'best_male_artist',
          points_breakdown: {
            streams: 40,
            sales: 30,
            external: 25,
            voting: 25,
            total: 120
          },
          current_votes: 4200,
          is_leading: false,
          nomination_song: 'Victory Dance',
          achievement_highlights: ['Sports anthem hit', 'National recognition', '75K followers']
        },
        {
          id: 'artist_3',
          name: 'Manu Dibango',
          image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300',
          category: 'best_male_artist',
          points_breakdown: {
            streams: 35,
            sales: 35,
            external: 30,
            voting: 15,
            total: 115
          },
          current_votes: 3100,
          is_leading: false,
          nomination_song: 'Soul Makossa (Remake)',
          achievement_highlights: ['Legend tribute', 'Jazz fusion', 'International recognition']
        }
      ]
    },
    {
      id: 'best_female_artist',
      name: 'Best Female Artist',
      description: 'Outstanding female vocalist of the year',
      icon: Star,
      voting_open: true,
      voting_ends: '2024-08-31T23:59:59',
      total_votes: 12890,
      status: 'voting',
      nominees: [
        {
          id: 'female_artist_1',
          name: 'Charlotte Dipanda',
          image_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300',
          category: 'best_female_artist',
          points_breakdown: {
            streams: 50,
            sales: 30,
            external: 35,
            voting: 40,
            total: 155
          },
          current_votes: 6200,
          is_leading: true,
          nomination_song: 'African Queen',
          achievement_highlights: ['International tours', 'Grammy nomination', '200K streams']
        },
        {
          id: 'female_artist_2',
          name: 'Dencia',
          image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300',
          category: 'best_female_artist',
          points_breakdown: {
            streams: 35,
            sales: 25,
            external: 20,
            voting: 30,
            total: 110
          },
          current_votes: 3890,
          is_leading: false,
          nomination_song: 'Fashion Week',
          achievement_highlights: ['Fashion icon', 'Celebrity collaborations', '150K followers']
        }
      ]
    },
    {
      id: 'song_of_year',
      name: 'Song of the Year',
      description: 'Most streamed and loved song of 2024',
      icon: Medal,
      voting_open: true,
      voting_ends: '2024-08-31T23:59:59',
      total_votes: 28450,
      status: 'voting',
      nominees: [
        {
          id: 'song_1',
          name: 'Cameroon Rising',
          image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300',
          category: 'song_of_year',
          points_breakdown: {
            streams: 60,
            sales: 40,
            external: 30,
            voting: 45,
            total: 175
          },
          current_votes: 12450,
          is_leading: true,
          nomination_song: 'Boy Takunda',
          achievement_highlights: ['#1 on charts', '500K streams', 'Viral TikTok']
        }
      ]
    },
    {
      id: 'best_event',
      name: 'Best Live Event',
      description: 'Most memorable live performance or concert',
      icon: Target,
      voting_open: false,
      voting_ends: '2024-07-31T23:59:59',
      total_votes: 8920,
      status: 'announced',
      winner: 'Cameroon Unity Concert',
      nominees: []
    }
  ];

  // Calculate time remaining for voting
  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date().getTime();
      const newTimeRemaining: Record<string, string> = {};

      awardCategories.forEach(category => {
        if (category.voting_open) {
          const endTime = new Date(category.voting_ends).getTime();
          const distance = endTime - now;

          if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

            newTimeRemaining[category.id] = `${days}d ${hours}h ${minutes}m`;
          } else {
            newTimeRemaining[category.id] = 'Voting Closed';
          }
        }
      });

      setTimeRemaining(newTimeRemaining);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleVote = (categoryId: string, nomineeId: string) => {
    if (votedCategories.has(categoryId)) {
      toast({
        title: "Already Voted",
        description: "You have already voted in this category",
        variant: "destructive"
      });
      return;
    }

    // Add vote
    setVotedCategories(prev => new Set([...prev, categoryId]));
    
    toast({
      title: "Vote Cast Successfully!",
      description: "Your vote has been recorded and counted",
    });
  };

  const renderNomineeCard = (nominee: Nominee, categoryId: string) => (
    <Card key={nominee.id} className="hover:shadow-lg transition-all group">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarImage src={nominee.image_url} alt={nominee.name} />
              <AvatarFallback>{nominee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {nominee.is_leading && (
              <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1">
                <Crown className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-lg">{nominee.name}</h4>
              {nominee.is_leading && (
                <Badge className="bg-yellow-500 text-black">
                  <Crown className="h-3 w-3 mr-1" />
                  Leading
                </Badge>
              )}
            </div>
            
            {nominee.nomination_song && (
              <p className="text-muted-foreground mb-2">"{nominee.nomination_song}"</p>
            )}
            
            <div className="flex flex-wrap gap-1 mb-3">
              {nominee.achievement_highlights.map((highlight, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {highlight}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Points Breakdown */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>CamerPlay Streams</span>
            <span className="font-medium">{nominee.points_breakdown.streams}%</span>
          </div>
          <Progress value={nominee.points_breakdown.streams} className="h-2" />
          
          <div className="flex justify-between text-sm">
            <span>Sales & Downloads</span>
            <span className="font-medium">{nominee.points_breakdown.sales}%</span>
          </div>
          <Progress value={nominee.points_breakdown.sales} className="h-2" />
          
          <div className="flex justify-between text-sm">
            <span>Public Voting</span>
            <span className="font-medium">{nominee.points_breakdown.voting}%</span>
          </div>
          <Progress value={nominee.points_breakdown.voting} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">Current Votes: </span>
            <span className="font-bold text-primary">{nominee.current_votes.toLocaleString()}</span>
          </div>
          
          <Button
            onClick={() => handleVote(categoryId, nominee.id)}
            disabled={votedCategories.has(categoryId)}
            className={votedCategories.has(categoryId) ? "bg-green-600" : ""}
          >
            {votedCategories.has(categoryId) ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Voted
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2" />
                Vote
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCategorySection = (category: AwardCategory) => (
    <div key={category.id} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <category.icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{category.name}</h3>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
        </div>
        
        <div className="text-right">
          {category.voting_open ? (
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span>Voting ends in</span>
              </div>
              <Badge variant="outline" className="text-lg font-mono">
                {timeRemaining[category.id] || 'Loading...'}
              </Badge>
            </div>
          ) : category.status === 'announced' ? (
            <div>
              <Badge className="bg-green-500 text-white mb-2">
                <Trophy className="h-3 w-3 mr-1" />
                Winner Announced
              </Badge>
              <p className="font-semibold">{category.winner}</p>
            </div>
          ) : (
            <Badge variant="secondary">Voting Closed</Badge>
          )}
        </div>
      </div>

      {category.voting_open && (
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">Total Votes Cast</span>
            </div>
            <span className="font-bold text-lg">{category.total_votes.toLocaleString()}</span>
          </div>
        </div>
      )}

      {category.voting_open ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.nominees.map(nominee => renderNomineeCard(nominee, category.id))}
        </div>
      ) : category.status === 'announced' ? (
        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6 text-center">
            <Trophy className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <h4 className="text-2xl font-bold text-yellow-800 mb-2">{category.winner}</h4>
            <p className="text-yellow-700">Congratulations to the winner!</p>
            <Button variant="outline" className="mt-4">
              <Play className="h-4 w-4 mr-2" />
              View Winning Performance
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );

  const openCategories = awardCategories.filter(cat => cat.voting_open);
  const closedCategories = awardCategories.filter(cat => !cat.voting_open);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="h-12 w-12" />
              <h1 className="text-4xl md:text-6xl font-black">CamerPlay Awards 2024</h1>
            </div>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              Celebrating the best of Cameroonian music and entertainment
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {awardCategories.reduce((sum, cat) => sum + cat.total_votes, 0).toLocaleString()}
                </div>
                <div className="text-sm opacity-80">Total Votes Cast</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {openCategories.length}
                </div>
                <div className="text-sm opacity-80">Categories Open for Voting</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {awardCategories.reduce((sum, cat) => sum + cat.nominees.length, 0)}
                </div>
                <div className="text-sm opacity-80">Total Nominees</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="voting" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="voting" className="flex items-center gap-2">
              <Vote className="h-4 w-4" />
              Active Voting ({openCategories.length})
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Results ({closedCategories.length})
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Live Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voting" className="space-y-12">
            {openCategories.length > 0 ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">Cast Your Votes</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Your vote counts! Support your favorite artists and help decide the winners of the 2024 CamerPlay Awards.
                    Voting combines with streaming data and sales to determine the final results.
                  </p>
                </div>
                
                {openCategories.map(renderCategorySection)}
              </>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">No Active Voting</h3>
                <p className="text-muted-foreground">All voting periods have ended. Check back for next year's awards!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Award Winners</h2>
              <p className="text-muted-foreground">Congratulations to all the winners and nominees!</p>
            </div>
            
            {closedCategories.map(renderCategorySection)}
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Live Leaderboard</h2>
              <p className="text-muted-foreground">Real-time standings across all voting categories</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {openCategories.map(category => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <category.icon className="h-5 w-5" />
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.nominees
                        .sort((a, b) => b.current_votes - a.current_votes)
                        .map((nominee, index) => (
                          <div key={nominee.id} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={nominee.image_url} alt={nominee.name} />
                              <AvatarFallback>{nominee.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{nominee.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {nominee.current_votes.toLocaleString()} votes
                              </p>
                            </div>
                            {index === 0 && (
                              <Crown className="h-5 w-5 text-yellow-500" />
                            )}
                          </div>
                        ))}
                    </div>
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

export default CamerPlayAwards;