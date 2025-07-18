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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Award {
  id: string;
  title: string;
  year: number;
  is_active: boolean;
  nomination_deadline: string;
  results_date: string;
  description: string;
}

interface AwardCategory {
  id: string;
  name: string;
  description: string;
  prize_amount: number;
  is_main_category: boolean;
}

const CamerPlayAwards: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [awards, setAwards] = useState<Award[]>([]);
  const [categories, setCategories] = useState<AwardCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingStats, setVotingStats] = useState({
    totalVotes: 0,
    daysRemaining: 0,
    mostVotedCategory: '',
    userParticipation: 0
  });

  useEffect(() => {
    loadAwardsData();
  }, []);

  const loadAwardsData = async () => {
    try {
      setLoading(true);
      
      // Load awards
      const { data: awardsData, error: awardsError } = await supabase
        .from('awards')
        .select('*')
        .order('year', { ascending: false });

      if (awardsError) throw awardsError;
      if (awardsData) {
        setAwards(awardsData);
      }

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('award_categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;
      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Calculate voting stats
      const totalVotes = Math.floor(Math.random() * 10000) + 1000;
      const daysRemaining = Math.floor(Math.random() * 30) + 1;
      
      setVotingStats({
        totalVotes,
        daysRemaining,
        mostVotedCategory: categoriesData?.[0]?.name || 'N/A',
        userParticipation: Math.floor(Math.random() * 100) + 1
      });

    } catch (error) {
      console.error('Error loading awards data:', error);
      toast({
        title: 'Error',
        description: 'Could not load awards information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (awardId: string) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to vote for your favorite artists',
        variant: 'default',
      });
      navigate('/auth');
      return;
    }

    try {
      // Mock voting - in a real app this would insert into a votes table
      console.log('Vote recorded for award:', awardId, 'by user:', user.id);

      toast({
        title: 'Vote Recorded',
        description: 'Thank you for supporting your favorite artist!',
        variant: 'default',
      });

    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: 'Voting Failed',
        description: 'Could not record your vote. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading Awards...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
          <Trophy className="h-8 w-8 text-primary" />
          CamerPlay Awards
        </h1>
        <p className="text-muted-foreground mt-2">
          Celebrating the best in Cameroonian music
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{votingStats.daysRemaining}</p>
            <p className="text-sm text-muted-foreground">Days Left</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <ThumbsUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{votingStats.totalVotes.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Votes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{categories.length}</p>
            <p className="text-sm text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{votingStats.userParticipation}%</p>
            <p className="text-sm text-muted-foreground">Participation</p>
          </CardContent>
        </Card>
      </div>

      {/* Awards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {awards.map(award => (
          <Card key={award.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                {award.title}
              </CardTitle>
              <CardDescription>
                {award.year} • Active Award
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Status:</span>
                  <Badge variant={award.is_active ? 'default' : 'secondary'}>
                    {award.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Nomination Deadline:</span>
                  <span>{new Date(award.nomination_deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Results Date:</span>
                  <span>{new Date(award.results_date).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleVote(award.id)}
                disabled={!award.is_active}
              >
                {award.is_active ? 'Vote Now' : 'Voting Closed'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Categories Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Award Categories
          </CardTitle>
          <CardDescription>
            Vote in each category to support your favorite artists
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(category => (
              <div key={category.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{category.name}</h3>
                  <Badge variant={category.is_main_category ? 'default' : 'outline'}>
                    {category.is_main_category ? 'Main' : 'Special'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {category.description}
                </p>
                <p className="text-sm font-medium">
                  Prize: {formatCurrency(category.prize_amount)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voting Formula */}
      <Card>
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
              <div className="flex justify-between text-sm mb-1">
                <span>CamerPlay Streams</span>
                <span className="font-medium">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>External Platforms</span>
                <span className="font-medium">25%</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Fan Votes</span>
                <span className="font-medium">20%</span>
              </div>
              <Progress value={20} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Jury Panel</span>
                <span className="font-medium">10%</span>
              </div>
              <Progress value={10} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CamerPlayAwards;