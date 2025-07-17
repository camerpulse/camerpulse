import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, 
  Trophy, 
  Star, 
  Music, 
  Users, 
  BarChart, 
  Calendar,
  ThumbsUp,
  CheckCircle 
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Types for the Awards System
interface AwardCategory {
  id: string;
  name: string;
  description: string;
  prize_amount: number;
  is_main_category: boolean;
}

interface AwardNomination {
  id: string;
  award_id: string;
  category_id: string;
  artist_id: string;
  artist_name: string;
  artist_photo: string;
  total_calculated_score: number;
  camerplay_score: number;
  external_score: number;
}

interface Award {
  id: string;
  award_year: number;
  award_title: string;
  award_description: string;
  voting_start_date: string;
  voting_end_date: string;
  status: 'upcoming' | 'voting_open' | 'voting_closed' | 'completed';
}

const CamerPlayAwards: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentAward, setCurrentAward] = useState<Award | null>(null);
  const [categories, setCategories] = useState<AwardCategory[]>([]);
  const [nominations, setNominations] = useState<AwardNomination[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingStats, setVotingStats] = useState({
    totalVotes: 0,
    daysRemaining: 0,
    mostVotedCategory: '',
    userParticipation: 0
  });

  // Fetch current active award
  useEffect(() => {
    const fetchCurrentAward = async () => {
      try {
        const { data: awardData, error: awardError } = await supabase
          .from('awards')
          .select('*')
          .eq('is_active', true)
          .single();

        if (awardError) throw awardError;
        if (awardData) {
          const mappedAward: Award = {
            id: awardData.id,
            award_year: awardData.year,
            award_title: awardData.title,
            award_description: awardData.description,
            voting_start_date: awardData.nomination_deadline,
            voting_end_date: awardData.results_date,
            status: 'voting_open'
          };
          setCurrentAward(mappedAward);
          
          // Calculate days remaining
          const endDate = new Date(mappedAward.voting_end_date);
          const today = new Date();
          const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          setVotingStats(prev => ({
            ...prev,
            daysRemaining
          }));

          // Fetch categories for this award
          const { data: categoriesData, error: categoriesError } = await supabase
            .from('award_categories')
            .select('*');

          if (categoriesError) throw categoriesError;
          if (categoriesData) {
            setCategories(categoriesData);
            
            // Set default selected category to first main category
            const mainCategory = categoriesData.find(cat => cat.is_main_category);
            if (mainCategory) setSelectedCategory(mainCategory.id);
            else if (categoriesData.length > 0) setSelectedCategory(categoriesData[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching award data:', error);
        toast({
          title: 'Error',
          description: 'Could not load awards information',
          variant: 'destructive',
        });
      }
    };

    fetchCurrentAward();
  }, [toast]);

  // Fetch nominations for selected category
  useEffect(() => {
    if (!currentAward || !selectedCategory) return;

    const fetchNominations = async () => {
      try {
        setLoading(true);
        
        // Get nominations for this category
        const { data: nominationsData, error: nominationsError } = await supabase
          .from('award_nominations')
          .select(`
            id,
            award_id,
            category_id,
            artist_id,
            camerplay_score,
            external_score,
            total_calculated_score,
            artist_memberships (
              stage_name,
              profile_photo_url
            )
          `)
          .eq('award_id', currentAward.id)
          .eq('category_id', selectedCategory)
          .eq('is_eligible', true);

        if (nominationsError) throw nominationsError;
        
        // Format nominations data
        if (nominationsData) {
          const formattedNominations = nominationsData.map(nom => ({
            id: nom.id,
            award_id: nom.award_id,
            category_id: nom.category_id,
            artist_id: nom.artist_id,
            artist_name: nom.artist_memberships?.stage_name || 'Unknown Artist',
            artist_photo: nom.artist_memberships?.profile_photo_url || '/placeholder-artist.png',
            total_calculated_score: nom.total_calculated_score,
            camerplay_score: nom.camerplay_score,
            external_score: nom.external_score
          }));
          
          setNominations(formattedNominations);
        }

        // Get user's votes if logged in
        if (user) {
          const { data: votesData, error: votesError } = await supabase
            .from('fan_votes')
            .select('nomination_id')
            .eq('user_id', user.id)
            .eq('award_id', currentAward.id);
          
          if (!votesError && votesData) {
            setUserVotes(votesData.map(vote => vote.nomination_id));
          }
        }

        // Get voting stats
        const { data: statsData, error: statsError } = await supabase
          .from('voting_analytics')
          .select(`
            total_fan_votes,
            most_voted_category_id,
            award_categories (
              name
            )
          `)
          .eq('award_id', currentAward.id)
          .single();
          
        if (!statsError && statsData) {
          setVotingStats(prev => ({
            ...prev,
            totalVotes: statsData.total_fan_votes,
            mostVotedCategory: statsData.award_categories?.name || '',
            userParticipation: statsData.total_fan_votes > 1000 ? 
              Math.round((statsData.total_fan_votes / 1000) * 100) : 10
          }));
        }
      } catch (error) {
        console.error('Error fetching nominations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNominations();
  }, [currentAward, selectedCategory, user]);

  // Handle vote submission
  const handleVote = async (nominationId: string) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to vote for your favorite artists',
        variant: 'default',
      });
      navigate('/login');
      return;
    }

    if (!currentAward) return;

    try {
      // Check if user has already voted for this category
      const hasVoted = userVotes.some(voteId => {
        const nomination = nominations.find(nom => nom.id === voteId);
        return nomination && nomination.category_id === selectedCategory;
      });

      if (hasVoted) {
        toast({
          title: 'Already Voted',
          description: 'You have already voted in this category',
          variant: 'default',
        });
        return;
      }

      const nomination = nominations.find(nom => nom.id === nominationId);
      if (!nomination) return;

      // Submit vote
      const { error } = await supabase
        .from('fan_votes')
        .insert({
          user_id: user.id,
          nomination_id: nominationId,
          award_id: currentAward.id,
          category_id: selectedCategory
        });

      if (error) throw error;

      // Update local state
      setUserVotes(prev => [...prev, nominationId]);
      
      toast({
        title: 'Vote Recorded',
        description: 'Thank you for supporting your favorite artist!',
        variant: 'default',
      });

    } catch (error) {
      console.error('Error submitting vote:', error);
      toast({
        title: 'Voting Failed',
        description: 'Could not record your vote. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!currentAward) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Award size={64} className="text-primary mb-4" />
          <h2 className="text-3xl font-bold mb-4">No Active Awards</h2>
          <p className="text-muted-foreground">There are no active award ceremonies at this time. Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            {currentAward.award_title}
          </h1>
          <p className="text-muted-foreground mt-2">{currentAward.award_description}</p>
          <div className="flex items-center gap-2 mt-4">
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {currentAward.award_year}
            </Badge>
            <Badge variant="outline" className="bg-secondary/10 text-secondary">
              ₣100M Prize Pool
            </Badge>
            <Badge variant="outline" className={currentAward.status === 'voting_open' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}>
              {currentAward.status === 'voting_open' ? 'Voting Open' : 'Voting Closed'}
            </Badge>
          </div>
        </div>

        <Card className="w-full md:w-auto">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center">
                <Calendar className="h-5 w-5 text-muted-foreground mb-1" />
                <p className="text-sm text-muted-foreground">Days Left</p>
                <p className="text-2xl font-bold">{votingStats.daysRemaining}</p>
              </div>
              <div className="flex flex-col items-center">
                <ThumbsUp className="h-5 w-5 text-muted-foreground mb-1" />
                <p className="text-sm text-muted-foreground">Total Votes</p>
                <p className="text-2xl font-bold">{votingStats.totalVotes.toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-center">
                <Star className="h-5 w-5 text-muted-foreground mb-1" />
                <p className="text-sm text-muted-foreground">Top Category</p>
                <p className="text-xl font-bold truncate max-w-[100px]">{votingStats.mostVotedCategory || "N/A"}</p>
              </div>
              <div className="flex flex-col items-center">
                <Users className="h-5 w-5 text-muted-foreground mb-1" />
                <p className="text-sm text-muted-foreground">Participation</p>
                <div className="w-full mt-1">
                  <Progress value={votingStats.userParticipation} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories and Nominees */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Selection */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Categories
              </CardTitle>
              <CardDescription>
                Vote in each category below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                    {userVotes.some(voteId => {
                      const nomination = nominations.find(nom => nom.id === voteId);
                      return nomination && nomination.category_id === category.id;
                    }) && (
                      <CheckCircle className="ml-auto h-4 w-4 text-green-500" />
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Voting Formula
              </CardTitle>
              <CardDescription>
                How winners are determined
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>CamerPlay Streams</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2 mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>External Platforms</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <Progress value={25} className="h-2 mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Fan Votes</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <Progress value={20} className="h-2 mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Jury Panel</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <Progress value={10} className="h-2 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nominees Grid */}
        <div className="lg:col-span-9">
          {selectedCategory && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  {categories.find(c => c.id === selectedCategory)?.name || 'Category'}
                </h2>
                <p className="text-muted-foreground">
                  {categories.find(c => c.id === selectedCategory)?.description || 'Vote for your favorite artist in this category'}
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="animate-pulse">
                      <div className="aspect-square bg-muted rounded-t-lg"></div>
                      <CardContent className="py-4">
                        <div className="h-6 bg-muted rounded-full w-3/4 mb-2"></div>
                        <div className="h-4 bg-muted rounded-full w-1/2"></div>
                      </CardContent>
                      <CardFooter>
                        <div className="h-9 bg-muted rounded-md w-full"></div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nominations.length > 0 ? (
                    nominations.map(nominee => {
                      const hasVotedForThis = userVotes.includes(nominee.id);
                      
                      return (
                        <Card key={nominee.id} className="overflow-hidden border-2 hover:border-primary/50 transition-all">
                          <div className="aspect-square bg-muted overflow-hidden">
                            <img 
                              src={nominee.artist_photo || '/placeholder-artist.png'} 
                              alt={nominee.artist_name} 
                              className="w-full h-full object-cover transition-transform hover:scale-105"
                            />
                          </div>
                          <CardContent className="pt-4">
                            <h3 className="text-xl font-bold">{nominee.artist_name}</h3>
                            
                            <div className="mt-4 space-y-2">
                              <div>
                                <div className="flex justify-between text-xs">
                                  <span>CamerPlay Score</span>
                                  <span className="font-medium">{nominee.camerplay_score.toFixed(1)}</span>
                                </div>
                                <Progress value={nominee.camerplay_score} className="h-1 mt-1" />
                              </div>
                              <div>
                                <div className="flex justify-between text-xs">
                                  <span>External Score</span>
                                  <span className="font-medium">{nominee.external_score.toFixed(1)}</span>
                                </div>
                                <Progress value={nominee.external_score} className="h-1 mt-1" />
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              className="w-full"
                              variant={hasVotedForThis ? "secondary" : "default"}
                              disabled={hasVotedForThis || currentAward.status !== 'voting_open'}
                              onClick={() => handleVote(nominee.id)}
                            >
                              {hasVotedForThis ? (
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="h-4 w-4" />
                                  Voted
                                </span>
                              ) : "Vote Now"}
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-xl font-medium mb-2">No nominees found</h3>
                      <p className="text-muted-foreground">There are no nominees in this category yet.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CamerPlayAwards;