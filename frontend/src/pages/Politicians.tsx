import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/Layout/AppLayout';
import { NavigationBreadcrumb } from '@/components/Navigation/NavigationBreadcrumb';
import { PoliticalNavigation } from '@/components/Navigation/PoliticalNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, Filter, SlidersHorizontal, Grid, List, Star, Users, MapPin, 
  MessageCircle, CheckCircle, TrendingUp, X, Eye, Heart, Share2,
  Phone, Mail, Globe, Award, Calendar, Briefcase
} from 'lucide-react';

interface PoliticalEntity {
  id: string;
  name: string;
  position: string;
  party?: string;
  region?: string;
  photo_url?: string;
  average_rating: number;
  total_ratings: number;
  transparency_score?: number;
  performance_score?: number;
  civic_engagement_score?: number;
  is_verified?: boolean;
  follower_count?: number;
  can_receive_messages?: boolean;
  bio?: string;
  email?: string;
  phone?: string;
  website?: string;
  terms_served?: number;
  achievements?: string[];
}

interface FilterState {
  search: string;
  region: string;
  party: string;
  rating: string;
  verification: string;
  sortBy: string;
}

const Politicians = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [politicians, setPoliticians] = useState<PoliticalEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [regions, setRegions] = useState<string[]>([]);
  const [parties, setParties] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    region: 'all',
    party: 'all',
    rating: 'all',
    verification: 'all',
    sortBy: 'rating'
  });

  useEffect(() => {
    fetchPoliticians();
  }, []);

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      region: 'all',
      party: 'all',
      rating: 'all',
      verification: 'all',
      sortBy: 'rating'
    });
  };

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
          approval_ratings(rating, user_id)
        `)
        .eq('is_archived', false)
        .order('civic_score', { ascending: false });

      if (error) throw error;

      const politiciansWithData = (data || []).map((politician) => {
        const ratings = politician.approval_ratings || [];
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0 
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
          : 0;

        return {
          id: politician.id,
          name: politician.name,
          position: politician.role_title || 'Politician',
          party: politician.party || politician.political_parties?.name,
          region: politician.region,
          photo_url: politician.profile_image_url,
          average_rating: averageRating,
          total_ratings: totalRatings,
          transparency_score: (politician.transparency_rating || 0) * 20,
          performance_score: (politician.development_impact_rating || 0) * 20,
          civic_engagement_score: (politician.civic_score || 0) / 20,
          is_verified: politician.verified,
          follower_count: politician.follower_count || 0,
          can_receive_messages: true,
          bio: politician.bio,
          email: undefined, // Will be loaded from contact details
          phone: undefined, // Will be loaded from contact details  
          website: undefined, // Will be loaded from social media links
          terms_served: 0, // Will be calculated from database
          achievements: [] // Will be loaded from achievements table
        };
      });

      setPoliticians(politiciansWithData);
      
      // Extract unique regions and parties
      const uniqueRegions = [...new Set(politiciansWithData.map(p => p.region).filter(Boolean))];
      const uniqueParties = [...new Set(politiciansWithData.map(p => p.party).filter(Boolean))];
      
      setRegions(uniqueRegions);
      setParties(uniqueParties);
    } catch (error) {
      console.error('Error fetching politicians:', error);
      toast({
        title: "Error",
        description: "Unable to load politicians",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort politicians
  const filteredPoliticians = politicians.filter(politician => {
    const matchesSearch = politician.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         politician.position.toLowerCase().includes(filters.search.toLowerCase()) ||
                         politician.party?.toLowerCase().includes(filters.search.toLowerCase()) ||
                         politician.region?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesRegion = filters.region === 'all' || politician.region === filters.region;
    const matchesParty = filters.party === 'all' || politician.party === filters.party;
    const matchesRating = filters.rating === 'all' ||
      (filters.rating === 'high' && politician.average_rating >= 4) ||
      (filters.rating === 'medium' && politician.average_rating >= 3 && politician.average_rating < 4) ||
      (filters.rating === 'low' && politician.average_rating < 3);
    const matchesVerification = filters.verification === 'all' ||
      (filters.verification === 'verified' && politician.is_verified) ||
      (filters.verification === 'unverified' && !politician.is_verified);

    return matchesSearch && matchesRegion && matchesParty && matchesRating && matchesVerification;
  });

  const sortedPoliticians = [...filteredPoliticians].sort((a, b) => {
    switch (filters.sortBy) {
      case 'rating':
        return b.average_rating - a.average_rating;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'followers':
        return (b.follower_count || 0) - (a.follower_count || 0);
      case 'transparency':
        return (b.transparency_score || 0) - (a.transparency_score || 0);
      default:
        return 0;
    }
  });

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => 
    key !== 'sortBy' && value !== '' && value !== 'all'
  ).length;

  const PoliticianCard = ({ politician }: { politician: PoliticalEntity }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 touch-manipulation">
      <CardContent className="p-0">
        <div className="relative">
          {/* Main Content */}
          <div className="p-4 sm:p-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-primary/20">
                  <AvatarImage src={politician.photo_url} alt={politician.name} />
                  <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary/10 to-secondary/10">
                    {politician.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {politician.is_verified && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-lg sm:text-xl text-foreground truncate font-grotesk">
                      {politician.name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-inter">{politician.position}</p>
                    {politician.party && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {politician.party}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Rating */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-lg font-mono">
                        {politician.average_rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {politician.total_ratings} reviews
                    </p>
                  </div>
                </div>

                {/* Region and Followers */}
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  {politician.region && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="font-inter">{politician.region}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span className="font-mono">{politician.follower_count?.toLocaleString() || 0}</span>
                  </div>
                </div>

                {/* Bio Preview */}
                {politician.bio && (
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2 font-inter">
                    {politician.bio}
                  </p>
                )}

                {/* Performance Scores */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="text-center p-2 bg-primary/5 rounded-md">
                    <div className="text-sm font-bold text-primary font-grotesk">
                      {politician.transparency_score?.toFixed(0) || 'N/A'}%
                    </div>
                    <div className="text-xs text-muted-foreground font-inter">Transparency</div>
                  </div>
                  <div className="text-center p-2 bg-secondary/5 rounded-md">
                    <div className="text-sm font-bold text-secondary font-grotesk">
                      {politician.performance_score?.toFixed(0) || 'N/A'}%
                    </div>
                    <div className="text-xs text-muted-foreground font-inter">Performance</div>
                  </div>
                  <div className="text-center p-2 bg-accent/5 rounded-md">
                    <div className="text-sm font-bold text-accent font-grotesk">
                      {politician.civic_engagement_score?.toFixed(0) || 'N/A'}%
                    </div>
                    <div className="text-xs text-muted-foreground font-inter">Engagement</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button asChild className="flex-1 h-12 touch-manipulation">
                    <Link to={`/politicians/${politician.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      <span className="font-medium">View Profile</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon" className="h-12 w-12 touch-manipulation">
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-12 w-12 touch-manipulation">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <div className="min-h-screen bg-background safe-area-padding">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <NavigationBreadcrumb />
            <div className="mt-4">
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-playfair">
                Politicians of Cameroon
              </h1>
              <p className="text-sm sm:text-lg text-muted-foreground mt-2 font-inter">
                Discover, follow and evaluate your political representatives
              </p>
            </div>
            <div className="mt-4">
              <PoliticalNavigation />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 space-y-6 pb-safe-bottom">
          {/* Search and Filters */}
          <Card className="shadow-elegant">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {/* Search and View Toggle */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search politicians by name, position, party, or region..."
                      value={filters.search}
                      onChange={(e) => updateFilter('search', e.target.value)}
                      className="pl-10 font-inter h-12 touch-manipulation"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className="whitespace-nowrap h-12 touch-manipulation"
                    >
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                    
                    <div className="flex rounded-md border">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="rounded-r-none h-12 w-12 touch-manipulation"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="rounded-l-none h-12 w-12 touch-manipulation"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expandable Filters */}
                {showFilters && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 p-4 bg-muted/20 rounded-lg">
                    <Select value={filters.region} onValueChange={(value) => updateFilter('region', value)}>
                      <SelectTrigger className="h-12 touch-manipulation">
                        <SelectValue placeholder="All Regions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        {regions.map(region => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filters.party} onValueChange={(value) => updateFilter('party', value)}>
                      <SelectTrigger className="h-12 touch-manipulation">
                        <SelectValue placeholder="All Parties" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Parties</SelectItem>
                        {parties.map(party => (
                          <SelectItem key={party} value={party}>{party}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filters.rating} onValueChange={(value) => updateFilter('rating', value)}>
                      <SelectTrigger className="h-12 touch-manipulation">
                        <SelectValue placeholder="All Ratings" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ratings</SelectItem>
                        <SelectItem value="high">High (4.0+)</SelectItem>
                        <SelectItem value="medium">Medium (3.0-3.9)</SelectItem>
                        <SelectItem value="low">Low (&lt;3.0)</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filters.verification} onValueChange={(value) => updateFilter('verification', value)}>
                      <SelectTrigger className="h-12 touch-manipulation">
                        <SelectValue placeholder="Verification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="verified">Verified Only</SelectItem>
                        <SelectItem value="unverified">Unverified Only</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                      <SelectTrigger className="h-12 touch-manipulation">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="followers">Followers</SelectItem>
                        <SelectItem value="transparency">Transparency</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={clearFilters} className="whitespace-nowrap h-12 touch-manipulation">
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                )}

                {/* Active Filters Display */}
                {activeFilterCount > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground font-inter">Active filters:</span>
                    {filters.search && (
                      <Badge variant="secondary" className="gap-1">
                        Search: {filters.search}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => updateFilter('search', '')}
                        />
                      </Badge>
                    )}
                    {filters.region !== 'all' && (
                      <Badge variant="secondary" className="gap-1">
                        Region: {filters.region}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => updateFilter('region', 'all')}
                        />
                      </Badge>
                    )}
                    {filters.party !== 'all' && (
                      <Badge variant="secondary" className="gap-1">
                        Party: {filters.party}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => updateFilter('party', 'all')}
                        />
                      </Badge>
                    )}
                    {filters.rating !== 'all' && (
                      <Badge variant="secondary" className="gap-1">
                        Rating: {filters.rating}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => updateFilter('rating', 'all')}
                        />
                      </Badge>
                    )}
                    {filters.verification !== 'all' && (
                      <Badge variant="secondary" className="gap-1">
                        {filters.verification}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => updateFilter('verification', 'all')}
                        />
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-sm font-inter">
              <Users className="h-3 w-3 mr-1" />
              {sortedPoliticians.length} of {politicians.length} politicians
            </Badge>
          </div>

          {/* Politicians Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-muted rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-6 bg-muted rounded w-3/4" />
                          <div className="h-4 bg-muted rounded w-1/2" />
                          <div className="h-4 bg-muted rounded w-2/3" />
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="h-12 bg-muted rounded" />
                        <div className="h-12 bg-muted rounded" />
                        <div className="h-12 bg-muted rounded" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : sortedPoliticians.length === 0 ? (
            <Card className="shadow-elegant">
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2 font-grotesk">
                  {activeFilterCount > 0 ? 'No politicians match your filters' : 'No politicians available'}
                </h3>
                <p className="text-muted-foreground font-inter">
                  {activeFilterCount > 0 
                    ? 'Try adjusting your search criteria or clearing filters' 
                    : 'Politician data will be imported soon'
                  }
                </p>
                {activeFilterCount > 0 && (
                  <Button onClick={clearFilters} variant="outline" className="mt-4">
                    Clear All Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {sortedPoliticians.map((politician) => (
                <PoliticianCard key={politician.id} politician={politician} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Politicians;