import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Award, Trophy, Star, Vote, Calendar, Users, Crown, Banknote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Award {
  id: string;
  year: number;
  title: string;
  description: string;
  total_prize_pool: number;
  status: string;
  nomination_deadline: string | null;
  voting_deadline: string | null;
  results_date: string | null;
}

interface AwardCategory {
  id: string;
  name: string;
  description: string;
  prize_amount: number;
  is_main_category: boolean;
  category_order: number;
}

interface AwardScore {
  nomination_id: string;
  camerplay_score: number;
  external_score: number;
  jury_score: number;
  public_score: number;
  total_score: number;
  rank_position: number | null;
}

const CamerPulseAwards = () => {
  const [awards, setAwards] = useState<Award[]>([]);
  const [categories, setCategories] = useState<AwardCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAwardsData();
  }, []);

  const loadAwardsData = async () => {
    try {
      // Load awards
      const { data: awardsData, error: awardsError } = await supabase
        .from('awards')
        .select('*')
        .eq('is_active', true)
        .order('year', { ascending: false });

      if (awardsError) throw awardsError;

      // Load categories for the latest award
      if (awardsData && awardsData.length > 0) {
        const latestAward = awardsData[0];
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('award_categories')
          .select('*')
          .eq('award_id', latestAward.id)
          .order('category_order');

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
      }

      setAwards(awardsData || []);
    } catch (error) {
      console.error('Error loading awards data:', error);
      toast({
        title: "Error",
        description: "Failed to load awards data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount / 100); // Convert from centimes
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { label: 'Draft', variant: 'secondary' as const },
      nomination_open: { label: 'Nominations Open', variant: 'default' as const },
      voting_open: { label: 'Voting Open', variant: 'default' as const },
      voting_closed: { label: 'Voting Closed', variant: 'outline' as const },
      results_published: { label: 'Results Published', variant: 'default' as const },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const currentAward = awards[0];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading CamerPulse Awards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="h-12 w-12 text-yellow-500" />
          <Trophy className="h-16 w-16 text-gold" />
          <Crown className="h-12 w-12 text-yellow-500" />
        </div>
        <h1 className="text-4xl font-bold gradient-text">CamerPulse Awards</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Celebrating excellence in Cameroonian music with ₣100M in prizes and pure gold trophies
        </p>
      </div>

      {/* Current Award Info */}
      {currentAward && (
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-gold/20">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Award className="h-6 w-6" />
              {currentAward.title}
            </CardTitle>
            <CardDescription className="text-lg">
              {currentAward.description}
            </CardDescription>
            {getStatusBadge(currentAward.status)}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <Banknote className="h-8 w-8 mx-auto text-green-500" />
                <h3 className="font-semibold">Total Prize Pool</h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(currentAward.total_prize_pool)}
                </p>
              </div>
              <div className="space-y-2">
                <Calendar className="h-8 w-8 mx-auto text-blue-500" />
                <h3 className="font-semibold">Voting Deadline</h3>
                <p className="text-lg">
                  {currentAward.voting_deadline 
                    ? new Date(currentAward.voting_deadline).toLocaleDateString()
                    : 'TBA'
                  }
                </p>
              </div>
              <div className="space-y-2">
                <Users className="h-8 w-8 mx-auto text-purple-500" />
                <h3 className="font-semibold">Categories</h3>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scoring Formula */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Scoring Formula
          </CardTitle>
          <CardDescription>
            How winners are determined using our transparent weighted system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-600">45%</div>
              <h4 className="font-semibold">CamerPlay</h4>
              <p className="text-sm text-muted-foreground">Internal sales & streams</p>
              <Progress value={45} className="h-2" />
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">25%</div>
              <h4 className="font-semibold">External Platforms</h4>
              <p className="text-sm text-muted-foreground">Spotify, YouTube, etc.</p>
              <Progress value={25} className="h-2" />
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-purple-600">10%</div>
              <h4 className="font-semibold">Jury Panel</h4>
              <p className="text-sm text-muted-foreground">Expert reviewers</p>
              <Progress value={10} className="h-2" />
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-orange-600">20%</div>
              <h4 className="font-semibold">Public Voting</h4>
              <p className="text-sm text-muted-foreground">Fan votes</p>
              <Progress value={20} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Award Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Award Categories</CardTitle>
          <CardDescription>
            {categories.length} categories with prizes totaling {formatCurrency(currentAward?.total_prize_pool || 0)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="main" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="main">Main Categories</TabsTrigger>
              <TabsTrigger value="special">Special Categories</TabsTrigger>
            </TabsList>
            
            <TabsContent value="main" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories
                  .filter(cat => cat.is_main_category || cat.name === 'Artist of the Year')
                  .map((category) => (
                    <Card key={category.id} className="relative overflow-hidden">
                      {category.name === 'Artist of the Year' && (
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500 to-yellow-600 text-white px-3 py-1 text-xs font-bold">
                          GRAND PRIZE
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-yellow-500" />
                          {category.name}
                        </CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(category.prize_amount)}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            + Pure Gold Trophy
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="special" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories
                  .filter(cat => !cat.is_main_category && cat.name !== 'Artist of the Year')
                  .map((category) => (
                    <Card key={category.id}>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Award className="h-5 w-5 text-blue-500" />
                          {category.name}
                        </CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600">
                            {formatCurrency(category.prize_amount)}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            + Pure Gold Trophy
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="text-center space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="gap-2">
            <Vote className="h-5 w-5" />
            Vote Now
          </Button>
          <Button variant="outline" size="lg" className="gap-2">
            <Award className="h-5 w-5" />
            Submit Nomination
          </Button>
          <Button variant="outline" size="lg" className="gap-2">
            <Star className="h-5 w-5" />
            View Results
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Only verified artists can be nominated. Public voting requires account verification.
        </p>
      </div>
    </div>
  );
};

export default CamerPulseAwards;