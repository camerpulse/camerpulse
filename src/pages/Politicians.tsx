import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/Layout/AppLayout';
import { PoliticianDetailModal } from '@/components/Politicians/PoliticianDetailModal';
import { PoliticianComparisonModal } from '@/components/Politicians/PoliticianComparisonModal';
import { ClaimProfileButton } from '@/components/Politics/ClaimProfileButton';
import { 
  Star, 
  MapPin, 
  Users, 
  TrendingUp,
  Award,
  Heart,
  MessageCircle,
  UserCheck,
  Search,
  Filter,
  ExternalLink,
  Phone,
  Globe,
  UserPlus,
  UserMinus,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  Building
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
  level_of_office?: string;
  constituency?: string;
  contact_office?: string;
  contact_website?: string;
  contact_phone?: string;
  integrity_rating?: number;
  development_impact_rating?: number;
  transparency_rating?: number;
  follower_count?: number;
  gender?: string;
  birth_date?: string;
  education?: string;
  career_background?: string;
  political_party?: {
    id: string;
    name: string;
    acronym: string;
    logo_url?: string;
  };
  is_following?: boolean;
  promises_summary?: {
    fulfilled: number;
    unfulfilled: number;
    in_progress: number;
    total: number;
  };
  is_claimed?: boolean;
  is_claimable?: boolean;
  auto_imported?: boolean;
}

interface Promise {
  id: string;
  promise_text: string;
  status: 'fulfilled' | 'unfulfilled' | 'in_progress';
  date_made?: string;
  evidence_url?: string;
  description?: string;
}

const Politicians = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [filteredPoliticians, setFilteredPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [partyFilter, setPartyFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('civic_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPoliticianId, setSelectedPoliticianId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [comparedPoliticians, setComparedPoliticians] = useState<Politician[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  useEffect(() => {
    fetchPoliticians();
  }, []);

  useEffect(() => {
    filterAndSortPoliticians();
  }, [politicians, searchTerm, levelFilter, partyFilter, regionFilter, sortBy, sortOrder]);

  const fetchPoliticians = async () => {
    try {
      const { data, error } = await supabase
        .from('politicians')
        .select(`
          *,
          political_parties!political_party_id (
            id,
            name,
            acronym,
            logo_url
          ),
          approval_ratings(rating, user_id),
          politician_detailed_ratings(
            integrity_rating,
            development_impact_rating,
            transparency_rating,
            user_id
          ),
          politician_follows!politician_id(user_id)
        `)
        .eq('is_archived', false)
        .order('civic_score', { ascending: false });

      if (error) throw error;

      const politiciansWithData = await Promise.all(
        (data || []).map(async (politician) => {
          const ratings = politician.approval_ratings || [];
          const totalRatings = ratings.length;
          const averageRating = totalRatings > 0 
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
            : 0;
          
          const userRating = user 
            ? ratings.find(r => r.user_id === user.id)?.rating 
            : undefined;

          const detailedRatings = politician.politician_detailed_ratings || [];
          const avgIntegrity = detailedRatings.length > 0
            ? detailedRatings.reduce((sum, r) => sum + (r.integrity_rating || 0), 0) / detailedRatings.length
            : 0;
          const avgDevelopment = detailedRatings.length > 0
            ? detailedRatings.reduce((sum, r) => sum + (r.development_impact_rating || 0), 0) / detailedRatings.length
            : 0;
          const avgTransparency = detailedRatings.length > 0
            ? detailedRatings.reduce((sum, r) => sum + (r.transparency_rating || 0), 0) / detailedRatings.length
            : 0;

          const isFollowing = user 
            ? politician.politician_follows?.some(f => f.user_id === user.id) || false
            : false;

          // Fetch promises summary
          const { data: promisesData } = await supabase
            .from('politician_promises')
            .select('status')
            .eq('politician_id', politician.id);

          const promisesSummary = {
            fulfilled: promisesData?.filter(p => p.status === 'fulfilled').length || 0,
            unfulfilled: promisesData?.filter(p => p.status === 'unfulfilled').length || 0,
            in_progress: promisesData?.filter(p => p.status === 'in_progress').length || 0,
            total: promisesData?.length || 0
          };

          return {
            ...politician,
            average_rating: averageRating,
            total_ratings: totalRatings,
            user_rating: userRating,
            integrity_rating: avgIntegrity,
            development_impact_rating: avgDevelopment,
            transparency_rating: avgTransparency,
            is_following: isFollowing,
            promises_summary: promisesSummary,
            political_party: politician.political_parties,
            approval_ratings: undefined,
            politician_detailed_ratings: undefined,
            politician_follows: undefined,
            political_parties: undefined
          };
        })
      );

      setPoliticians(politiciansWithData);
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

  const filterAndSortPoliticians = () => {
    let filtered = politicians.filter(politician => {
      const matchesSearch = politician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           politician.party?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           politician.region?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = levelFilter === 'all' || politician.level_of_office === levelFilter;
      const matchesParty = partyFilter === 'all' || politician.party === partyFilter;
      const matchesRegion = regionFilter === 'all' || politician.region === regionFilter;

      return matchesSearch && matchesLevel && matchesParty && matchesRegion;
    });

    // Sort politicians
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || 0;
      let bValue = b[sortBy] || 0;

      if (sortBy === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    setFilteredPoliticians(filtered);
  };

  const followPolitician = async (politicianId: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour suivre un politicien",
        variant: "destructive"
      });
      return;
    }

    try {
      const politician = politicians.find(p => p.id === politicianId);
      if (politician?.is_following) {
        // Unfollow
        const { error } = await supabase
          .from('politician_follows')
          .delete()
          .eq('politician_id', politicianId)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Désabonnement réussi",
          description: `Vous ne suivez plus ${politician.name}`
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('politician_follows')
          .insert({
            politician_id: politicianId,
            user_id: user.id
          });

        if (error) throw error;

        toast({
          title: "Abonnement réussi",
          description: `Vous suivez maintenant ${politician?.name}`
        });
      }

      fetchPoliticians(); // Refresh data
    } catch (error) {
      console.error('Error following politician:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le suivi",
        variant: "destructive"
      });
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

  const addToComparison = (politician: Politician) => {
    if (comparedPoliticians.length < 2 && !comparedPoliticians.find(p => p.id === politician.id)) {
      setComparedPoliticians([...comparedPoliticians, politician]);
    }
  };

  const removeFromComparison = (politicianId: string) => {
    setComparedPoliticians(comparedPoliticians.filter(p => p.id !== politicianId));
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

  const getPromiseStatusIcon = (status: string) => {
    switch (status) {
      case 'fulfilled': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'unfulfilled': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return null;
    }
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
              className={`w-5 h-5 ${
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
          <p className="text-xs text-gray-600">
            Moyenne: {averageRating.toFixed(1)}/5 ({totalRatings} évaluations)
          </p>
        )}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="responsive-heading font-bold text-foreground mb-2">Politicians of Cameroon</h1>
            <p className="responsive-text text-muted-foreground">Discover, follow and evaluate your political representatives</p>
            
            {/* Navigation Links */}
            <div className="flex gap-3 mt-4">
              <Button asChild variant="outline" size="sm">
                <a href="/senators">
                  <Users className="h-4 w-4 mr-2" />
                  Senators
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="/mps">
                  <Users className="h-4 w-4 mr-2" />
                  MPs
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="/ministers">
                  <Building className="h-4 w-4 mr-2" />
                  Ministers
                </a>
              </Button>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par nom, parti, région..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Niveau de fonction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous niveaux</SelectItem>
                    <SelectItem value="National">National</SelectItem>
                    <SelectItem value="Regional">Régional</SelectItem>
                    <SelectItem value="Local">Local</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Région" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes régions</SelectItem>
                    <SelectItem value="Centre">Centre</SelectItem>
                    <SelectItem value="Littoral">Littoral</SelectItem>
                    <SelectItem value="Northwest">Nord-Ouest</SelectItem>
                    <SelectItem value="Southwest">Sud-Ouest</SelectItem>
                    <SelectItem value="North">Nord</SelectItem>
                    <SelectItem value="Far North">Extrême-Nord</SelectItem>
                    <SelectItem value="Adamawa">Adamaoua</SelectItem>
                    <SelectItem value="East">Est</SelectItem>
                    <SelectItem value="South">Sud</SelectItem>
                    <SelectItem value="West">Ouest</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="civic_score">Score civique</SelectItem>
                    <SelectItem value="average_rating">Note moyenne</SelectItem>
                    <SelectItem value="follower_count">Nombre de suiveurs</SelectItem>
                    <SelectItem value="name">Nom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="w-full sm:w-auto"
                >
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </Button>

                <Button
                  variant={compareMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCompareMode(!compareMode)}
                  className="w-full sm:w-auto"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Compare Mode {compareMode && `(${comparedPoliticians.length}/2)`}
                </Button>

                {comparedPoliticians.length === 2 && (
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => setShowComparisonModal(true)}
                    className="w-full sm:w-auto"
                  >
                    Compare Selected
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Politicians Grid */}
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
          ) : filteredPoliticians.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun politicien trouvé</h3>
                <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPoliticians.map((politician) => {
                const civicBadge = getCivicScoreBadge(politician.civic_score);
                const isInComparison = comparedPoliticians.find(p => p.id === politician.id);
                
                return (
                  <Card key={politician.id} className={`border-cameroon-yellow/20 hover:shadow-lg transition-all duration-300 ${isInComparison ? 'ring-2 ring-cameroon-primary' : ''}`}>
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
                          {politician.political_party && (
                            <p className="text-sm text-gray-600">{politician.political_party.name}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {politician.region && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <MapPin className="w-3 h-3" />
                                {politician.region}
                              </div>
                            )}
                            {politician.level_of_office && (
                              <Badge variant="secondary" className="text-xs">
                                {politician.level_of_office}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {politician.bio && (
                        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{politician.bio}</p>
                      )}

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {/* Civic Score */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">Score Civique</span>
                            <Badge className={`${civicBadge.color} text-white text-xs`}>
                              {politician.civic_score}
                            </Badge>
                          </div>
                          <Progress value={politician.civic_score} className="h-1" />
                        </div>

                        {/* Approval Rating */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">Approbation</span>
                            <span className="text-xs text-gray-600">
                              {politician.average_rating?.toFixed(1) || '0'}/5
                            </span>
                          </div>
                          <Progress value={(politician.average_rating || 0) * 20} className="h-1" />
                        </div>

                        {/* Integrity */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">Intégrité</span>
                            <span className="text-xs text-gray-600">
                              {politician.integrity_rating?.toFixed(1) || '0'}/5
                            </span>
                          </div>
                          <Progress value={(politician.integrity_rating || 0) * 20} className="h-1" />
                        </div>

                        {/* Development Impact */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">Impact Dév.</span>
                            <span className="text-xs text-gray-600">
                              {politician.development_impact_rating?.toFixed(1) || '0'}/5
                            </span>
                          </div>
                          <Progress value={(politician.development_impact_rating || 0) * 20} className="h-1" />
                        </div>
                      </div>

                      {/* Promises Summary */}
                      {politician.promises_summary && politician.promises_summary.total > 0 && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium mb-2">Promesses</h4>
                          <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span>{politician.promises_summary.fulfilled} Tenues</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-yellow-500" />
                              <span>{politician.promises_summary.in_progress} En cours</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-red-500" />
                              <span>{politician.promises_summary.unfulfilled} Non tenues</span>
                            </div>
                          </div>
                        </div>
                      )}

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

                      {/* Contact Info */}
                      {(politician.contact_phone || politician.contact_website) && (
                        <div className="mb-4 flex gap-2">
                          {politician.contact_phone && (
                            <Button variant="outline" size="sm" className="flex-1">
                              <Phone className="w-3 h-3 mr-1" />
                              Téléphone
                            </Button>
                          )}
                          {politician.contact_website && (
                            <Button variant="outline" size="sm" className="flex-1">
                              <Globe className="w-3 h-3 mr-1" />
                              Site web
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => followPolitician(politician.id)}
                        >
                          {politician.is_following ? (
                            <>
                              <UserMinus className="w-4 h-4 mr-1" />
                              Ne plus suivre
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-1" />
                              Suivre
                            </>
                          )}
                        </Button>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedPoliticianId(politician.id);
                            setShowDetailModal(true);
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Voir profil
                        </Button>
                        
                        {compareMode && (
                          <Button 
                            variant={isInComparison ? "default" : "outline"}
                            size="sm"
                            onClick={() => 
                              isInComparison 
                                ? removeFromComparison(politician.id)
                                : addToComparison(politician)
                            }
                            disabled={!isInComparison && comparedPoliticians.length >= 2}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                       </div>

                      {/* Claim Profile Button */}
                      <div className="mt-2">
                        <ClaimProfileButton
                          type="politician"
                          targetName={politician.name}
                          targetId={politician.id}
                          isClaimed={politician.is_claimed}
                          isClaimable={politician.is_claimable}
                          className="w-full text-sm"
                        />
                      </div>

                      {/* Stats Footer */}
                      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                        <span>{politician.follower_count || 0} suiveurs</span>
                        <span>{politician.total_ratings || 0} évaluations</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Modals */}
          <PoliticianDetailModal
            politicianId={selectedPoliticianId}
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedPoliticianId(null);
            }}
          />

          <PoliticianComparisonModal
            politicians={comparedPoliticians}
            isOpen={showComparisonModal}
            onClose={() => setShowComparisonModal(false)}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default Politicians;