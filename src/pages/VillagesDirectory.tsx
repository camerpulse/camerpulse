import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MapPin, Star, Users, Crown, X, SlidersHorizontal, CheckCircle, GraduationCap, Heart, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { InteractiveVillageMap } from '@/components/villages/InteractiveVillageMap';
import { VillageRecommendations } from '@/components/recommendations/VillageRecommendations';
import { useAnalytics } from '@/hooks/useAnalytics';

interface Village {
  id: string;
  village_name: string;
  region: string;
  division: string;
  subdivision: string;
  overall_rating: number;
  sons_daughters_count: number;
  view_count: number;
  is_verified: boolean;
  total_ratings_count: number;
  infrastructure_score: number;
  education_score: number;
  health_score: number;
  diaspora_engagement_score: number;
}

const VillagesDirectory = () => {
  const { trackSearch, trackVillageView } = useAnalytics();
  const [villages, setVillages] = useState<Village[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [featuredVillages, setFeaturedVillages] = useState({
    topRated: [],
    mostDeveloped: [],
    mostActive: []
  });

  // Advanced filter states
  const [filters, setFilters] = useState({
    verifiedOnly: false,
    infrastructureRange: [0, 20],
    educationRange: [0, 10],
    healthRange: [0, 10],
    diasporaRange: [0, 10],
    sonsAndDaughtersMin: 0,
    viewsMin: 0,
    ratingsCountMin: 0,
    selectedDivisions: [] as string[],
    selectedSubdivisions: [] as string[]
  });

  const regions = [
    'all', 'Adamawa', 'Centre', 'East', 'Far North',
    'Littoral', 'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  useEffect(() => {
    fetchVillages();
    fetchFeaturedVillages();
  }, []);

  const fetchVillages = async () => {
    try {
      let query = supabase
        .from('villages')
        .select('*')
        .order('overall_rating', { ascending: false });

      if (selectedRegion !== 'all') {
        query = query.eq('region', selectedRegion);
      }

      if (searchTerm) {
        query = query.or(`village_name.ilike.%${searchTerm}%,division.ilike.%${searchTerm}%,subdivision.ilike.%${searchTerm}%`);
      }

      // Apply rating filter
      if (selectedRating !== 'all') {
        const minRating = parseFloat(selectedRating.replace('+', ''));
        query = query.gte('overall_rating', minRating);
      }

      // Apply advanced filters
      if (filters.verifiedOnly) {
        query = query.eq('is_verified', true);
      }

      query = query
        .gte('infrastructure_score', filters.infrastructureRange[0])
        .lte('infrastructure_score', filters.infrastructureRange[1])
        .gte('education_score', filters.educationRange[0])
        .lte('education_score', filters.educationRange[1])
        .gte('health_score', filters.healthRange[0])
        .lte('health_score', filters.healthRange[1])
        .gte('diaspora_engagement_score', filters.diasporaRange[0])
        .lte('diaspora_engagement_score', filters.diasporaRange[1])
        .gte('sons_daughters_count', filters.sonsAndDaughtersMin)
        .gte('view_count', filters.viewsMin)
        .gte('total_ratings_count', filters.ratingsCountMin);

      if (filters.selectedDivisions.length > 0) {
        query = query.in('division', filters.selectedDivisions);
      }

      if (filters.selectedSubdivisions.length > 0) {
        query = query.in('subdivision', filters.selectedSubdivisions);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVillages(data || []);
    } catch (error) {
      console.error('Error fetching villages:', error);
      toast.error('Failed to load villages');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedVillages = async () => {
    try {
      // Top rated villages
      const { data: topRated } = await supabase
        .from('villages')
        .select('*')
        .order('overall_rating', { ascending: false })
        .limit(10);

      // Most developed (highest infrastructure score)
      const { data: mostDeveloped } = await supabase
        .from('villages')
        .select('*')
        .order('infrastructure_score', { ascending: false })
        .limit(10);

      // Most active (highest sons/daughters count)
      const { data: mostActive } = await supabase
        .from('villages')
        .select('*')
        .order('sons_daughters_count', { ascending: false })
        .limit(10);

      setFeaturedVillages({
        topRated: topRated || [],
        mostDeveloped: mostDeveloped || [],
        mostActive: mostActive || []
      });
    } catch (error) {
      console.error('Error fetching featured villages:', error);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchVillages();
      // Track search if there's a search term
      if (searchTerm.trim()) {
        trackSearch(searchTerm, { region: selectedRegion, rating: selectedRating }, villages.length);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedRegion, selectedRating, filters]);

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

  const resetFilters = () => {
    setFilters({
      verifiedOnly: false,
      infrastructureRange: [0, 20],
      educationRange: [0, 10],
      healthRange: [0, 10],
      diasporaRange: [0, 10],
      sonsAndDaughtersMin: 0,
      viewsMin: 0,
      ratingsCountMin: 0,
      selectedDivisions: [],
      selectedSubdivisions: []
    });
    setSelectedRegion('all');
    setSelectedRating('all');
    setSearchTerm('');
  };

  // Get unique divisions and subdivisions for filter options
  const uniqueDivisions = [...new Set(villages.map(v => v.division))].sort();
  const uniqueSubdivisions = [...new Set(villages.map(v => v.subdivision))].sort();

  const VillageCard = ({ village, onClick }: { village: Village; onClick?: () => void }) => (
    <Card className="hover:shadow-lg transition-all duration-200 group cursor-pointer">
      <Link to={`/villages/${village.id}`} className="block" onClick={onClick}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                {village.village_name}
                {village.is_verified && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {village.subdivision}, {village.division}, {village.region}
              </div>
            </div>
            <div className="flex flex-col items-end text-right">
              <div className="flex items-center">
                {renderStars(village.overall_rating)}
                <span className="ml-1 text-sm font-medium">
                  {village.overall_rating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {village.total_ratings_count} ratings
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary">{village.sons_daughters_count}</div>
              <div className="text-xs text-muted-foreground">Sons & Daughters</div>
            </div>
            <div>
              <div className="text-lg font-bold text-secondary">{village.view_count}</div>
              <div className="text-xs text-muted-foreground">Profile Views</div>
            </div>
            <div>
              <div className="text-lg font-bold text-accent">{village.infrastructure_score}/20</div>
              <div className="text-xs text-muted-foreground">Infrastructure</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              Education: {village.education_score}/10
            </Badge>
            <Badge variant="outline" className="text-xs">
              Health: {village.health_score}/10
            </Badge>
            <Badge variant="outline" className="text-xs">
              Diaspora: {village.diaspora_engagement_score}/10
            </Badge>
          </div>
        </CardContent>
      </Link>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-civic py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Villages Directory</h1>
            <p className="text-xl opacity-90 mb-8">
              Discover, connect with, and celebrate villages across Cameroon
            </p>
            
            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search villages by name, region, or division..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white text-black"
                  />
                </div>
                
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-full md:w-48 bg-white text-black">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region === 'all' ? 'All Regions' : region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedRating} onValueChange={setSelectedRating}>
                  <SelectTrigger className="w-full md:w-48 bg-white text-black">
                    <SelectValue placeholder="Rating Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="4+">4+ Stars</SelectItem>
                    <SelectItem value="3+">3+ Stars</SelectItem>
                    <SelectItem value="2+">2+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Link to="/villages/add">
                <Button size="lg" variant="secondary" className="text-primary hover:text-primary-foreground">
                  <Plus className="h-5 w-5 mr-2" />
                  Add My Village
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-80 bg-card border rounded-lg p-6 h-fit sticky top-4`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                <h3 className="font-semibold">Filters</h3>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset
                </Button>
                <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setShowFilters(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Verified Only */}
              <div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="verified" 
                    checked={filters.verifiedOnly}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, verifiedOnly: checked as boolean }))}
                  />
                  <Label htmlFor="verified" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Verified villages only
                  </Label>
                </div>
              </div>

              <Separator />

              {/* Infrastructure Score */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4" />
                  Infrastructure Score: {filters.infrastructureRange[0]} - {filters.infrastructureRange[1]}
                </Label>
                <Slider
                  min={0}
                  max={20}
                  step={1}
                  value={filters.infrastructureRange}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, infrastructureRange: value }))}
                  className="w-full"
                />
              </div>

              {/* Education Score */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <GraduationCap className="h-4 w-4" />
                  Education Score: {filters.educationRange[0]} - {filters.educationRange[1]}
                </Label>
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={filters.educationRange}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, educationRange: value }))}
                  className="w-full"
                />
              </div>

              {/* Health Score */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Heart className="h-4 w-4" />
                  Health Score: {filters.healthRange[0]} - {filters.healthRange[1]}
                </Label>
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={filters.healthRange}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, healthRange: value }))}
                  className="w-full"
                />
              </div>

              {/* Diaspora Engagement */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Globe className="h-4 w-4" />
                  Diaspora Score: {filters.diasporaRange[0]} - {filters.diasporaRange[1]}
                </Label>
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={filters.diasporaRange}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, diasporaRange: value }))}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Minimum Sons & Daughters */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4" />
                  Min Sons & Daughters: {filters.sonsAndDaughtersMin}
                </Label>
                <Slider
                  min={0}
                  max={1000}
                  step={10}
                  value={[filters.sonsAndDaughtersMin]}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sonsAndDaughtersMin: value[0] }))}
                  className="w-full"
                />
              </div>

              {/* Minimum Views */}
              <div>
                <Label className="mb-3 block">Min Profile Views: {filters.viewsMin}</Label>
                <Slider
                  min={0}
                  max={10000}
                  step={100}
                  value={[filters.viewsMin]}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, viewsMin: value[0] }))}
                  className="w-full"
                />
              </div>

              {/* Minimum Ratings Count */}
              <div>
                <Label className="mb-3 block">Min Ratings Count: {filters.ratingsCountMin}</Label>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[filters.ratingsCountMin]}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, ratingsCountMin: value[0] }))}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Divisions Filter */}
              <div>
                <Label className="mb-3 block">Divisions</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uniqueDivisions.map((division) => (
                    <div key={division} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`division-${division}`}
                        checked={filters.selectedDivisions.includes(division)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters(prev => ({ ...prev, selectedDivisions: [...prev.selectedDivisions, division] }));
                          } else {
                            setFilters(prev => ({ ...prev, selectedDivisions: prev.selectedDivisions.filter(d => d !== division) }));
                          }
                        }}
                      />
                      <Label htmlFor={`division-${division}`} className="text-sm">{division}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subdivisions Filter */}
              <div>
                <Label className="mb-3 block">Subdivisions</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uniqueSubdivisions.map((subdivision) => (
                    <div key={subdivision} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`subdivision-${subdivision}`}
                        checked={filters.selectedSubdivisions.includes(subdivision)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters(prev => ({ ...prev, selectedSubdivisions: [...prev.selectedSubdivisions, subdivision] }));
                          } else {
                            setFilters(prev => ({ ...prev, selectedSubdivisions: prev.selectedSubdivisions.filter(s => s !== subdivision) }));
                          }
                        }}
                      />
                      <Label htmlFor={`subdivision-${subdivision}`} className="text-sm">{subdivision}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Filter Toggle Button for Mobile */}
            <div className="lg:hidden mb-4">
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>

            {/* Interactive Map */}
            <div className="mb-12">
              <InteractiveVillageMap selectedRegion={selectedRegion} height="600px" />
            </div>

            {/* Featured Villages */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Featured Villages</h2>
          
              <Tabs defaultValue="top-rated" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
                  <TabsTrigger value="most-developed">Most Developed</TabsTrigger>
                  <TabsTrigger value="most-active">Most Active</TabsTrigger>
                </TabsList>
                
                <TabsContent value="top-rated">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {featuredVillages.topRated.slice(0, 4).map((village: Village) => (
                      <VillageCard key={village.id} village={village} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="most-developed">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {featuredVillages.mostDeveloped.slice(0, 4).map((village: Village) => (
                      <VillageCard key={village.id} village={village} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="most-active">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {featuredVillages.mostActive.slice(0, 4).map((village: Village) => (
                      <VillageCard key={village.id} village={village} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* All Villages */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">All Villages</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {villages.length} villages found
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded"></div>
                          <div className="h-4 bg-muted rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : villages.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No villages found</h3>
                    <p className="text-muted-foreground mb-4">
                      No villages match your search criteria. Try adjusting your filters.
                    </p>
                    <Link to="/villages/add">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add the first village
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 lg:grid-cols-4">
                  <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                      {villages.map((village) => (
                        <VillageCard 
                          key={village.id} 
                          village={village}
                          onClick={() => trackVillageView(village.id, village)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-1">
                    <VillageRecommendations />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VillagesDirectory;