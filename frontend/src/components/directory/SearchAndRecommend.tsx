import { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Filter, Star, Clock, TrendingUp, Map as MapIcon, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Institution } from '@/types/directory';

interface SearchFilters {
  category: 'all' | 'schools' | 'hospitals' | 'pharmacies' | 'villages';
  location: string;
  radius: number;
  minRating: number;
  verified: boolean;
  sortBy: 'relevance' | 'rating' | 'distance' | 'trending';
}

interface SearchAndRecommendProps {
  initialQuery?: string;
  showMap?: boolean;
}

export const SearchAndRecommend = ({ initialQuery = '', showMap = false }: SearchAndRecommendProps) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<Institution[]>([]);
  const [recommendations, setRecommendations] = useState<Institution[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>(showMap ? 'map' : 'list');
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    location: '',
    radius: 10,
    minRating: 0,
    verified: false,
    sortBy: 'relevance'
  });
  const { toast } = useToast();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('camerpulse-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save search to recent searches
  const saveToRecentSearches = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('camerpulse-recent-searches', JSON.stringify(updated));
  };

  // Fetch search results
  const performSearch = async (query: string = searchQuery) => {
    if (!query.trim() && filters.category === 'all' && !filters.location) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      let supabaseQuery = supabase
        .from('institutions' as any)
        .select('*')
        .limit(50);

      // Apply filters
      if (query.trim()) {
        supabaseQuery = supabaseQuery.ilike('name', `%${query}%`);
      }

      if (filters.category !== 'all') {
        supabaseQuery = supabaseQuery.eq('institution_type', filters.category.slice(0, -1)); // Remove 's'
      }

      if (filters.location) {
        supabaseQuery = supabaseQuery.or(`city.ilike.%${filters.location}%,address.ilike.%${filters.location}%`);
      }

      if (filters.verified) {
        supabaseQuery = supabaseQuery.eq('is_verified', true);
      }

      if (filters.minRating > 0) {
        supabaseQuery = supabaseQuery.gte('average_rating', filters.minRating);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'rating':
          supabaseQuery = supabaseQuery.order('average_rating', { ascending: false });
          break;
        case 'trending':
          supabaseQuery = supabaseQuery.order('total_views', { ascending: false });
          break;
        default:
          supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
      }

      const { data, error } = await supabaseQuery;
      
      if (error) throw error;
      setSearchResults((data as unknown as Institution[]) || []);
      
      if (query.trim()) {
        saveToRecentSearches(query);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch recommendations
  const fetchRecommendations = async () => {
    try {
      // Get trending institutions with high ratings
      const { data, error } = await supabase
        .from('institutions' as any)
        .select('*')
        .gte('average_rating', 4.0)
        .order('total_views', { ascending: false })
        .limit(6);

      if (error) throw error;
      setRecommendations((data as unknown as Institution[]) || []);
    } catch (error) {
      console.error('Recommendations error:', error);
    }
  };

  // Load recommendations on mount
  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Auto-search when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'school': return '🏫';
      case 'hospital': return '🏥';
      case 'pharmacy': return '💊';
      case 'village': return '🏘️';
      default: return '📍';
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'school': return 'directory-school';
      case 'hospital': return 'directory-hospital';
      case 'pharmacy': return 'directory-pharmacy';
      case 'village': return 'directory-village';
      default: return 'primary';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const SearchResults = () => (
    <div className="space-y-4">
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : searchResults.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {searchResults.map((institution) => (
            <Card key={institution.id} className={`directory-card hover:shadow-${getCategoryColor(institution.institution_type)}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{getCategoryIcon(institution.institution_type)}</span>
                  {institution.is_verified && (
                    <Badge className="badge-verified text-xs">Verified</Badge>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-1 line-clamp-1">{institution.name}</h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  {institution.address} • {institution.city}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">{renderStars(institution.average_rating || 0)}</div>
                  <span className="text-sm text-muted-foreground">
                    ({institution.total_reviews || 0})
                  </span>
                </div>
                <Badge variant="outline" className={`text-${getCategoryColor(institution.institution_type)}`}>
                  {institution.institution_type}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No results found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );

  const RecommendationsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((institution) => (
            <Card key={institution.id} className="directory-card">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getCategoryIcon(institution.institution_type)}</span>
                  <h4 className="font-medium text-sm line-clamp-1">{institution.name}</h4>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <div className="flex">{renderStars(institution.average_rating || 0)}</div>
                  <span className="text-xs text-muted-foreground">
                    ({institution.total_reviews || 0})
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {institution.address} • {institution.city}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search schools, hospitals, pharmacies, villages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            Search
          </Button>
        </form>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Recent:</span>
            {recentSearches.slice(0, 3).map((search, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setSearchQuery(search)}
              >
                {search}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Filters and View Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-6 lg:grid-cols-8 items-end">
            <div className="md:col-span-1">
              <Label>Category</Label>
              <Select value={filters.category} onValueChange={(value: any) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="schools">Schools</SelectItem>
                  <SelectItem value="hospitals">Hospitals</SelectItem>
                  <SelectItem value="pharmacies">Pharmacies</SelectItem>
                  <SelectItem value="villages">Villages</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-1">
              <Label>Location</Label>
              <Input
                placeholder="City, region..."
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="md:col-span-1">
              <Label>Radius (km)</Label>
              <Slider
                value={[filters.radius]}
                onValueChange={([value]) => setFilters(prev => ({ ...prev, radius: value }))}
                max={50}
                min={1}
                step={1}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{filters.radius}km</span>
            </div>

            <div className="md:col-span-1">
              <Label>Min Rating</Label>
              <Slider
                value={[filters.minRating]}
                onValueChange={([value]) => setFilters(prev => ({ ...prev, minRating: value }))}
                max={5}
                min={0}
                step={0.5}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{filters.minRating}+ stars</span>
            </div>

            <div className="md:col-span-1">
              <Label>Sort By</Label>
              <Select value={filters.sortBy} onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-1 flex items-center space-x-2">
              <input
                type="checkbox"
                id="verified"
                checked={filters.verified}
                onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="verified" className="text-sm">Verified only</Label>
            </div>

            <div className="md:col-span-1 flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <MapIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
        <TabsContent value="list">
          <SearchResults />
        </TabsContent>
        <TabsContent value="map">
          <Card>
            <CardContent className="p-4">
              <div className="bg-muted rounded-lg h-96 flex items-center justify-center">
                <div className="text-center">
                  <MapIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Map view coming soon</p>
                  <p className="text-sm text-muted-foreground">Will show search results on interactive map</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      {searchResults.length === 0 && !searchQuery.trim() && (
        <RecommendationsSection />
      )}
    </div>
  );
};