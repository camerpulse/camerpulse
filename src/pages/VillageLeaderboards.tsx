import React, { useState, useEffect } from 'react';
import { Trophy, Star, Users, Crown, Building, TrendingUp, Medal, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface LeaderboardVillage {
  id: string;
  village_name: string;
  region: string;
  division: string;
  subdivision: string;
  overall_rating: number;
  infrastructure_score: number;
  sons_daughters_count: number;
  view_count: number;
  is_verified: boolean;
  total_ratings_count: number;
}

const VillageLeaderboards = () => {
  const [topRatedVillages, setTopRatedVillages] = useState<LeaderboardVillage[]>([]);
  const [mostDevelopedVillages, setMostDevelopedVillages] = useState<LeaderboardVillage[]>([]);
  const [mostActiveVillages, setMostActiveVillages] = useState<LeaderboardVillage[]>([]);
  const [mostViewedVillages, setMostViewedVillages] = useState<LeaderboardVillage[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const regions = [
    'all', 'Adamawa', 'Centre', 'East', 'Far North',
    'Littoral', 'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  useEffect(() => {
    fetchLeaderboards();
  }, [selectedRegion]);

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);
      
      // Base query builder
      const buildQuery = () => {
        let query = supabase.from('villages').select('*');
        if (selectedRegion !== 'all') {
          query = query.eq('region', selectedRegion);
        }
        return query;
      };

      // Fetch all leaderboards
      const [topRated, mostDeveloped, mostActive, mostViewed] = await Promise.all([
        buildQuery().order('overall_rating', { ascending: false }).limit(100),
        buildQuery().order('infrastructure_score', { ascending: false }).limit(100),
        buildQuery().order('sons_daughters_count', { ascending: false }).limit(100),
        buildQuery().order('view_count', { ascending: false }).limit(100)
      ]);

      setTopRatedVillages(topRated.data || []);
      setMostDevelopedVillages(mostDeveloped.data || []);
      setMostActiveVillages(mostActive.data || []);
      setMostViewedVillages(mostViewed.data || []);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
      toast.error('Failed to load leaderboards');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-primary text-primary" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-primary/50 text-primary" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground" />);
    }

    return stars;
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <div className="h-6 w-6 flex items-center justify-center bg-muted rounded-full text-sm font-bold">{position}</div>;
    }
  };

  const LeaderboardCard = ({ 
    village, 
    position, 
    metric, 
    metricLabel 
  }: { 
    village: LeaderboardVillage; 
    position: number; 
    metric: number | string; 
    metricLabel: string; 
  }) => (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <Link to={`/villages/${village.id}`} className="block">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {/* Rank */}
            <div className="flex-shrink-0">
              {getRankIcon(position)}
            </div>

            {/* Village Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                  {village.village_name}
                </h3>
                {village.is_verified && (
                  <Crown className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              
              <p className="text-sm text-muted-foreground truncate">
                {village.subdivision}, {village.division}, {village.region}
              </p>
              
              <div className="flex items-center mt-2">
                {renderStars(village.overall_rating)}
                <span className="ml-2 text-sm text-muted-foreground">
                  ({village.total_ratings_count} reviews)
                </span>
              </div>
            </div>

            {/* Metric */}
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-bold text-primary">{metric}</div>
              <div className="text-sm text-muted-foreground">{metricLabel}</div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );

  const LoadingCard = () => (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-6 w-6 bg-muted rounded-full"></div>
          <div className="flex-1">
            <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
          <div className="text-right">
            <div className="h-8 w-12 bg-muted rounded mb-1"></div>
            <div className="h-3 w-16 bg-muted rounded"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-civic py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Village Leaderboards</h1>
            <p className="text-xl opacity-90 mb-8">
              Celebrating the best villages across Cameroon
            </p>
            
            {/* Region Filter */}
            <div className="max-w-xs mx-auto">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="bg-white text-black">
                  <SelectValue placeholder="Filter by Region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region === 'all' ? 'All Regions' : region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="top-rated" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="top-rated" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Top Rated</span>
            </TabsTrigger>
            <TabsTrigger value="most-developed" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Most Developed</span>
            </TabsTrigger>
            <TabsTrigger value="most-active" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Most Active</span>
            </TabsTrigger>
            <TabsTrigger value="most-viewed" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Most Viewed</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="top-rated" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Top 100 Highest Rated Villages
                  {selectedRegion !== 'all' && (
                    <Badge variant="secondary">in {selectedRegion}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <LoadingCard key={i} />
                    ))
                  ) : topRatedVillages.length === 0 ? (
                    <div className="text-center py-12">
                      <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No villages found</h3>
                      <p className="text-muted-foreground">
                        No villages match your criteria in this region.
                      </p>
                    </div>
                  ) : (
                    topRatedVillages.map((village, index) => (
                      <LeaderboardCard
                        key={village.id}
                        village={village}
                        position={index + 1}
                        metric={village.overall_rating.toFixed(1)}
                        metricLabel="Rating"
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="most-developed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-500" />
                  Top 100 Most Developed Villages
                  {selectedRegion !== 'all' && (
                    <Badge variant="secondary">in {selectedRegion}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <LoadingCard key={i} />
                    ))
                  ) : mostDevelopedVillages.length === 0 ? (
                    <div className="text-center py-12">
                      <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No villages found</h3>
                      <p className="text-muted-foreground">
                        No villages match your criteria in this region.
                      </p>
                    </div>
                  ) : (
                    mostDevelopedVillages.map((village, index) => (
                      <LeaderboardCard
                        key={village.id}
                        village={village}
                        position={index + 1}
                        metric={`${village.infrastructure_score}/20`}
                        metricLabel="Infrastructure"
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="most-active" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  Top 100 Most Active Villages
                  {selectedRegion !== 'all' && (
                    <Badge variant="secondary">in {selectedRegion}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <LoadingCard key={i} />
                    ))
                  ) : mostActiveVillages.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No villages found</h3>
                      <p className="text-muted-foreground">
                        No villages match your criteria in this region.
                      </p>
                    </div>
                  ) : (
                    mostActiveVillages.map((village, index) => (
                      <LeaderboardCard
                        key={village.id}
                        village={village}
                        position={index + 1}
                        metric={village.sons_daughters_count}
                        metricLabel="Members"
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="most-viewed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  Top 100 Most Viewed Villages
                  {selectedRegion !== 'all' && (
                    <Badge variant="secondary">in {selectedRegion}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <LoadingCard key={i} />
                    ))
                  ) : mostViewedVillages.length === 0 ? (
                    <div className="text-center py-12">
                      <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No villages found</h3>
                      <p className="text-muted-foreground">
                        No villages match your criteria in this region.
                      </p>
                    </div>
                  ) : (
                    mostViewedVillages.map((village, index) => (
                      <LeaderboardCard
                        key={village.id}
                        village={village}
                        position={index + 1}
                        metric={village.view_count.toLocaleString()}
                        metricLabel="Views"
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VillageLeaderboards;