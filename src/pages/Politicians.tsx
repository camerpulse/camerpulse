import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Layout/Header';
import { 
  Star, 
  MapPin, 
  Users, 
  TrendingUp,
  Award,
  Heart,
  MessageCircle,
  UserCheck
} from 'lucide-react';

interface Politician {
  id: string;
  name: string;
  bio?: string;
  region?: string;
  role_title?: string;
  party?: string;
  profile_image_url?: string;
  civic_score: number;
  verified: boolean;
  average_rating?: number;
  total_ratings?: number;
  user_rating?: number;
}

const Politicians = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoliticians();
  }, []);

  const fetchPoliticians = async () => {
    try {
      const { data, error } = await supabase
        .from('politicians')
        .select(`
          *,
          approval_ratings(rating, user_id)
        `)
        .order('civic_score', { ascending: false });

      if (error) throw error;

      const politiciansWithRatings = data?.map(politician => {
        const ratings = politician.approval_ratings || [];
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0 
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
          : 0;
        
        const userRating = user 
          ? ratings.find(r => r.user_id === user.id)?.rating 
          : undefined;

        return {
          ...politician,
          average_rating: averageRating,
          total_ratings: totalRatings,
          user_rating: userRating,
          approval_ratings: undefined // Remove from final object
        };
      }) || [];

      setPoliticians(politiciansWithRatings);
    } catch (error) {
      console.error('Error fetching politicians:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les politiciens",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const ratePolitician = async (politicianId: string, rating: number) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour noter un politicien",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('approval_ratings')
        .upsert({
          politician_id: politicianId,
          user_id: user.id,
          rating: rating
        });

      if (error) throw error;

      fetchPoliticians(); // Refresh the list
      toast({
        title: "Évaluation enregistrée",
        description: "Votre note a été prise en compte"
      });
    } catch (error) {
      console.error('Error rating politician:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre évaluation",
        variant: "destructive"
      });
    }
  };

  const getCivicScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCivicScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-500' };
    if (score >= 60) return { label: 'Bon', color: 'bg-yellow-500' };
    if (score >= 40) return { label: 'Moyen', color: 'bg-orange-500' };
    return { label: 'Faible', color: 'bg-red-500' };
  };

  const RatingStars = ({ politicianId, currentRating, averageRating, totalRatings = 0, readOnly = false }) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => !readOnly && ratePolitician(politicianId, star)}
              disabled={readOnly || !user}
              className={`w-6 h-6 ${
                star <= (currentRating || 0)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              } ${!readOnly && user ? 'hover:text-yellow-400 cursor-pointer' : 'cursor-default'}`}
            >
              <Star className="w-full h-full" />
            </button>
          ))}
        </div>
        {averageRating > 0 && (
          <p className="text-sm text-gray-600">
            Moyenne: {averageRating.toFixed(1)}/5 ({totalRatings} évaluations)
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-cameroon-primary mb-2">Politiciens & Leaders</h1>
            <p className="text-gray-600">Suivez et évaluez vos représentants politiques</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="w-24 h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-4 bg-gray-200 rounded"></div>
                      <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : politicians.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun politicien enregistré</h3>
                <p className="text-gray-600">Les profils des leaders politiques apparaîtront ici</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {politicians.map((politician) => {
                const civicBadge = getCivicScoreBadge(politician.civic_score);
                
                return (
                  <Card key={politician.id} className="border-cameroon-yellow/20 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={politician.profile_image_url} />
                          <AvatarFallback className="bg-cameroon-yellow text-cameroon-primary text-lg">
                            {politician.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg">{politician.name}</h3>
                            {politician.verified && (
                              <Badge variant="outline" className="border-blue-500 text-blue-600">
                                <UserCheck className="w-3 h-3 mr-1" />
                                Vérifié
                              </Badge>
                            )}
                          </div>
                          {politician.role_title && (
                            <p className="text-sm font-medium text-cameroon-primary">
                              {politician.role_title}
                            </p>
                          )}
                          {politician.party && (
                            <p className="text-sm text-gray-600">{politician.party}</p>
                          )}
                          {politician.region && (
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                              <MapPin className="w-3 h-3" />
                              {politician.region}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {politician.bio && (
                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{politician.bio}</p>
                      )}

                      {/* Civic Score */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Score Civique</span>
                          <Badge className={`${civicBadge.color} text-white`}>
                            {civicBadge.label}
                          </Badge>
                        </div>
                        <Progress 
                          value={politician.civic_score} 
                          className="h-2 mb-1"
                        />
                        <span className={`text-sm font-bold ${getCivicScoreColor(politician.civic_score)}`}>
                          {politician.civic_score}/100
                        </span>
                      </div>

                      {/* Rating System */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Votre évaluation</h4>
                        <RatingStars 
                          politicianId={politician.id}
                          currentRating={politician.user_rating}
                          averageRating={politician.average_rating}
                          totalRatings={politician.total_ratings}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 border-cameroon-primary text-cameroon-primary hover:bg-cameroon-primary hover:text-white"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Contacter
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-cameroon-yellow text-cameroon-yellow hover:bg-cameroon-yellow hover:text-white"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>

                      {politician.average_rating > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Appréciation publique</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="font-medium">
                                {politician.average_rating.toFixed(1)}/5
                              </span>
                              <span className="text-gray-500">
                                ({politician.total_ratings})
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Politicians;