import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Star, Users, Crown, X, ChevronRight, TrendingUp, Award, Building, Menu, Grid, List, Eye, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useVillages, useVillagesByRegion, useTopVillages } from '@/hooks/useVillages';
import { VillageMap } from '@/components/villages/VillageMap';

interface Village {
  id: string;
  village_name: string;
  region: string;
  division: string;
  subdivision: string;
  slug?: string;
  overall_rating: number;
  sons_daughters_count: number;
  view_count: number;
  is_verified: boolean;
  total_ratings_count: number;
  infrastructure_score: number;
  education_score: number;
  health_score: number;
  diaspora_engagement_score: number;
  governance_score: number;
  civic_participation_score: number;
}

const REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North',
  'Littoral', 'North', 'Northwest', 'South', 'Southwest', 'West'
];

const FILTER_CATEGORIES = [
  { id: 'most_rated', label: 'Most Rated', field: 'total_ratings_count' },
  { id: 'most_viewed', label: 'Most Viewed', field: 'view_count' },
  { id: 'highest_rated', label: 'Highest Rated', field: 'overall_rating' },
  { id: 'most_developed', label: 'Most Developed', field: 'infrastructure_score' },
  { id: 'best_education', label: 'Best Education', field: 'education_score' },
  { id: 'best_health', label: 'Best Health', field: 'health_score' },
  { id: 'diaspora_connected', label: 'Diaspora Connected', field: 'diaspora_engagement_score' },
  { id: 'largest_community', label: 'Largest Community', field: 'sons_daughters_count' }
];

const VillagesDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedSubdivision, setSelectedSubdivision] = useState<string>('');
  const [selectedCouncil, setSelectedCouncil] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState([0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [filteredVillages, setFilteredVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: allVillages } = useVillages();
  const { data: regionVillages } = useVillagesByRegion(selectedRegion);
  const { data: topVillages } = useTopVillages('developed', 5);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedRegion, selectedDivision, selectedSubdivision, selectedCouncil, filterCategory, verifiedOnly, minRating, allVillages, regionVillages]);

  const applyFilters = async () => {
    setLoading(true);
    try {
      let villages = allVillages || [];

      // Use region-specific data if region is selected
      if (selectedRegion && regionVillages) {
        villages = regionVillages;
      }

      // Apply search filter
      if (searchTerm) {
        villages = villages.filter(village =>
          village.village_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          village.division.toLowerCase().includes(searchTerm.toLowerCase()) ||
          village.subdivision.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply location filters
      if (selectedDivision) {
        villages = villages.filter(village => village.division === selectedDivision);
      }
      if (selectedSubdivision) {
        villages = villages.filter(village => village.subdivision === selectedSubdivision);
      }

      // Apply verified filter
      if (verifiedOnly) {
        villages = villages.filter(village => village.is_verified);
      }

      // Apply minimum rating filter
      if (minRating[0] > 0) {
        villages = villages.filter(village => village.overall_rating >= minRating[0]);
      }

      // Apply category sorting
      if (filterCategory) {
        const category = FILTER_CATEGORIES.find(cat => cat.id === filterCategory);
        if (category) {
          villages.sort((a, b) => (b[category.field as keyof Village] as number) - (a[category.field as keyof Village] as number));
        }
      }

      setFilteredVillages(villages);
    } catch (error) {
      console.error('Error filtering villages:', error);
      toast.error('Failed to filter villages');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedRegion('');
    setSelectedDivision('');
    setSelectedSubdivision('');
    setSelectedCouncil('');
    setFilterCategory('');
    setVerifiedOnly(false);
    setMinRating([0]);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-3 w-3 fill-primary text-primary" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-3 w-3 fill-primary/50 text-primary" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-muted-foreground" />);
    }

    return stars;
  };

  const VillageCard = ({ village }: { village: Village }) => (
    <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer border-border hover:border-primary/20">
      <Link to={`/village/${village.slug || village.id}`} className="block h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {village.village_name}
              </CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="line-clamp-1">{village.subdivision}, {village.division}</span>
              </div>
            </div>
            {village.is_verified && (
              <Badge variant="secondary" className="ml-2 text-xs bg-primary/10 text-primary border-primary/20">
                <Crown className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {renderStars(village.overall_rating)}
              <span className="ml-2 text-sm font-medium">
                {village.overall_rating.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {village.total_ratings_count} ratings
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div>
              <div className="text-lg font-bold text-primary">{village.sons_daughters_count}</div>
              <div className="text-xs text-muted-foreground">Community</div>
            </div>
            <div>
              <div className="text-lg font-bold text-secondary">{village.infrastructure_score}/20</div>
              <div className="text-xs text-muted-foreground">Development</div>
            </div>
            <div>
              <div className="text-lg font-bold text-accent">{village.diaspora_engagement_score}/10</div>
              <div className="text-xs text-muted-foreground">Diaspora</div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center text-xs text-muted-foreground">
              <Eye className="h-3 w-3 mr-1" />
              {village.view_count} views
            </div>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground h-7 px-3">
              View Village
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );

  const VillageListItem = ({ village }: { village: Village }) => (
    <Card className="hover:shadow-md transition-all duration-300 group cursor-pointer">
      <Link to={`/village/${village.slug || village.id}`} className="block">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {village.village_name}
                </h3>
                {village.is_verified && (
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                    <Crown className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                {village.subdivision}, {village.division}, {village.region}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center">
                  {renderStars(village.overall_rating)}
                  <span className="ml-1 font-medium">{village.overall_rating.toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground">{village.total_ratings_count} ratings</span>
                <span className="text-muted-foreground">{village.view_count} views</span>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="font-bold text-primary">{village.sons_daughters_count}</div>
                  <div className="text-muted-foreground">Community</div>
                </div>
                <div>
                  <div className="font-bold text-secondary">{village.infrastructure_score}/20</div>
                  <div className="text-muted-foreground">Development</div>
                </div>
                <div>
                  <div className="font-bold text-accent">{village.diaspora_engagement_score}/10</div>
                  <div className="text-muted-foreground">Diaspora</div>
                </div>
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Villages Directory</h1>
              <p className="text-primary-foreground/80 text-lg">
                Discover and connect with Cameroonian villages worldwide
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{filteredVillages.length}</div>
                <div className="text-sm opacity-90">Villages</div>
              </div>
              <Separator orientation="vertical" className="h-12 bg-primary-foreground/20" />
              <div className="text-center">
                <div className="text-2xl font-bold">{filteredVillages.filter(v => v.is_verified).length}</div>
                <div className="text-sm opacity-90">Verified</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Mobile Filter Toggle */}
          <Button 
            variant="outline" 
            size="sm" 
            className="md:hidden fixed top-4 left-4 z-50"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Left Sidebar - Filters */}
          <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-80 space-y-6`}>
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Filters
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Villages</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, division..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Region Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Region</label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Regions</SelectItem>
                      {REGIONS.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Default Order</SelectItem>
                      {FILTER_CATEGORIES.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Verified Only */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified"
                    checked={verifiedOnly}
                    onCheckedChange={(checked) => setVerifiedOnly(checked === true)}
                  />
                  <label htmlFor="verified" className="text-sm font-medium">
                    Verified villages only
                  </label>
                </div>

                {/* Minimum Rating */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Minimum Rating: {minRating[0]}
                  </label>
                  <Slider
                    value={minRating}
                    onValueChange={setMinRating}
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <Separator />

                {/* Quick Links */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quick Access</label>
                  <div className="space-y-2">
                    <Link to="/villages/ratings-leaderboard">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Ratings Leaderboard
                      </Button>
                    </Link>
                    <Link to="/villages/petitioned">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Award className="h-4 w-4 mr-2" />
                        Most Petitioned
                      </Button>
                    </Link>
                    <Link to="/villages/diaspora-backed">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Building className="h-4 w-4 mr-2" />
                        Diaspora Projects
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Top Featured Villages */}
            {!searchTerm && !selectedRegion && topVillages && topVillages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-primary" />
                    Top Developed Villages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {topVillages.slice(0, 5).map((village, index) => (
                      <Link key={village.id} to={`/village/${(village as any).slug || village.id}`}>
                        <div className="text-center p-3 rounded-lg border border-border hover:border-primary/20 transition-colors group">
                          <div className="text-2xl font-bold text-primary mb-1">#{index + 1}</div>
                          <div className="font-medium text-sm group-hover:text-primary transition-colors">
                            {village.village_name}
                          </div>
                          <div className="text-xs text-muted-foreground">{village.region}</div>
                          <div className="text-xs text-primary font-medium mt-1">
                            {village.infrastructure_score}/20 dev score
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {searchTerm ? `Results for "${searchTerm}"` : 'All Villages'}
                </h2>
                <p className="text-muted-foreground">
                  {loading ? 'Loading...' : `${filteredVillages.length} villages found`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Village Results */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredVillages.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-muted-foreground mb-4">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No villages found</h3>
                    <p>Try adjusting your filters or search terms</p>
                  </div>
                  <Button onClick={resetFilters} variant="outline">
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                  : 'space-y-4'
              }>
                {filteredVillages.map((village) => (
                  viewMode === 'grid' 
                    ? <VillageCard key={village.id} village={village} />
                    : <VillageListItem key={village.id} village={village} />
                ))}
              </div>
            )}

            {/* Map View */}
            {filteredVillages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Village Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96 rounded-lg overflow-hidden">
                    <VillageMap selectedRegion={selectedRegion} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VillagesDirectory;