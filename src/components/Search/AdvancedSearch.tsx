import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  User, 
  FileText, 
  MessageSquare,
  Vote,
  Building,
  Star,
  Clock,
  Trending,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';

interface SearchFilters {
  query: string;
  category: string;
  location: string;
  dateRange?: DateRange;
  author: string;
  tags: string[];
  verified: boolean;
  contentType: string[];
  sortBy: 'relevance' | 'date' | 'popularity' | 'rating';
  region: string;
}

interface SearchResult {
  id: string;
  type: 'post' | 'user' | 'poll' | 'petition' | 'official' | 'event';
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  metadata: {
    location?: string;
    date?: string;
    tags?: string[];
    rating?: number;
    engagement?: number;
  };
  relevance_score: number;
}

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'civic', label: 'Civic Engagement' },
  { value: 'politics', label: 'Politics' },
  { value: 'community', label: 'Community' },
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'environment', label: 'Environment' },
  { value: 'economy', label: 'Economy' },
  { value: 'infrastructure', label: 'Infrastructure' }
];

const REGIONS = [
  { value: 'all', label: 'All Regions' },
  { value: 'centre', label: 'Centre Region' },
  { value: 'littoral', label: 'Littoral Region' },
  { value: 'west', label: 'West Region' },
  { value: 'southwest', label: 'Southwest Region' },
  { value: 'northwest', label: 'Northwest Region' },
  { value: 'north', label: 'North Region' },
  { value: 'adamawa', label: 'Adamawa Region' },
  { value: 'east', label: 'East Region' },
  { value: 'south', label: 'South Region' },
  { value: 'far_north', label: 'Far North Region' }
];

const CONTENT_TYPES = [
  { id: 'posts', label: 'Posts', icon: FileText },
  { id: 'users', label: 'People', icon: User },
  { id: 'polls', label: 'Polls', icon: Vote },
  { id: 'petitions', label: 'Petitions', icon: MessageSquare },
  { id: 'officials', label: 'Officials', icon: Building },
  { id: 'events', label: 'Events', icon: Calendar }
];

export const AdvancedSearch: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    location: '',
    author: '',
    tags: [],
    verified: false,
    contentType: ['posts'],
    sortBy: 'relevance',
    region: 'all'
  });

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Debounced search
  const debouncedSearch = useMemo(() => {
    const timeoutId = setTimeout(() => {
      if (filters.query.length > 2) {
        performSearch();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  useEffect(() => {
    return debouncedSearch;
  }, [debouncedSearch]);

  const performSearch = async (isLoadMore = false) => {
    if (!filters.query.trim() && filters.category === 'all') return;

    setLoading(true);
    try {
      // Build search query
      let query = supabase
        .from('search_results')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.query) {
        query = query.textSearch('search_vector', filters.query);
      }

      if (filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters.region !== 'all') {
        query = query.eq('region', filters.region);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.author) {
        query = query.ilike('author_name', `%${filters.author}%`);
      }

      if (filters.verified) {
        query = query.eq('author_verified', true);
      }

      if (filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      if (filters.contentType.length > 0) {
        query = query.in('type', filters.contentType);
      }

      if (filters.dateRange?.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
      }

      if (filters.dateRange?.to) {
        query = query.lte('created_at', filters.dateRange.to.toISOString());
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'date':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popularity':
          query = query.order('engagement_score', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        default:
          query = query.order('relevance_score', { ascending: false });
      }

      // Pagination
      const limit = 20;
      const offset = isLoadMore ? (page - 1) * limit : 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      const searchResults: SearchResult[] = data?.map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        content: item.content,
        author: {
          id: item.author_id,
          name: item.author_name,
          avatar: item.author_avatar,
          verified: item.author_verified
        },
        metadata: {
          location: item.location,
          date: item.created_at,
          tags: item.tags,
          rating: item.rating,
          engagement: item.engagement_score
        },
        relevance_score: item.relevance_score
      })) || [];

      if (isLoadMore) {
        setResults(prev => [...prev, ...searchResults]);
      } else {
        setResults(searchResults);
        setPage(1);
      }

      setTotalResults(count || 0);

      // Save to recent searches
      if (filters.query && !recentSearches.includes(filters.query)) {
        const updated = [filters.query, ...recentSearches.slice(0, 9)];
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
      }

    } catch (error) {
      console.error('Search error:', error);
      toast({
        variant: "destructive",
        title: "Search Error",
        description: "Failed to perform search. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('search_suggestions')
        .select('suggestion')
        .textSearch('suggestion', query)
        .limit(5);

      if (error) throw error;
      setSuggestions(data?.map(item => item.suggestion) || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !filters.tags.includes(tag)) {
      setFilters(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const clearSearch = () => {
    setFilters({
      query: '',
      category: 'all',
      location: '',
      author: '',
      tags: [],
      verified: false,
      contentType: ['posts'],
      sortBy: 'relevance',
      region: 'all'
    });
    setResults([]);
    setTotalResults(0);
  };

  const ResultCard: React.FC<{ result: SearchResult }> = ({ result }) => {
    const getTypeIcon = () => {
      const typeConfig = CONTENT_TYPES.find(t => t.id === result.type + 's');
      const Icon = typeConfig?.icon || FileText;
      return <Icon className="h-4 w-4" />;
    };

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {getTypeIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium truncate">{result.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {result.type}
                </Badge>
                {result.author.verified && (
                  <Badge variant="default" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {result.content}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {result.author.name}
                  </div>
                  {result.metadata.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {result.metadata.location}
                    </div>
                  )}
                  {result.metadata.date && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(result.metadata.date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {result.metadata.rating && (
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="h-3 w-3 text-yellow-500" />
                    {result.metadata.rating.toFixed(1)}
                  </div>
                )}
              </div>

              {result.metadata.tags && result.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {result.metadata.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Main Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for posts, people, polls, and more..."
                value={filters.query}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, query: e.target.value }));
                  loadSuggestions(e.target.value);
                }}
                className="pl-10 pr-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(showFilters && "bg-primary/10")}
                >
                  <Filter className="h-4 w-4" />
                </Button>
                {(filters.query || results.length > 0) && (
                  <Button variant="ghost" size="sm" onClick={clearSearch}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Search Suggestions */}
              {suggestions.length > 0 && (
                <Card className="absolute top-full left-0 right-0 z-10 mt-1">
                  <CardContent className="p-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full text-left p-2 hover:bg-muted rounded text-sm"
                        onClick={() => {
                          setFilters(prev => ({ ...prev, query: suggestion }));
                          setSuggestions([]);
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => {
                    const isSelected = filters.contentType.includes(type.id);
                    setFilters(prev => ({
                      ...prev,
                      contentType: isSelected 
                        ? prev.contentType.filter(t => t !== type.id)
                        : [...prev.contentType, type.id]
                    }));
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-full text-sm border transition-colors",
                    filters.contentType.includes(type.id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-muted border-border"
                  )}
                >
                  <type.icon className="h-3 w-3" />
                  {type.label}
                </button>
              ))}
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && !filters.query && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Recent searches:</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setFilters(prev => ({ ...prev, query: search }))}
                      className="px-3 py-1 bg-muted rounded-full text-sm hover:bg-muted/80"
                    >
                      <Clock className="h-3 w-3 inline mr-1" />
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Region</label>
                <Select
                  value={filters.region}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, region: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map(region => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">
                      <div className="flex items-center gap-2">
                        <Trending className="h-4 w-4" />
                        Relevance
                      </div>
                    </SelectItem>
                    <SelectItem value="date">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date
                      </div>
                    </SelectItem>
                    <SelectItem value="popularity">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Popularity
                      </div>
                    </SelectItem>
                    <SelectItem value="rating">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Rating
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Input
                  placeholder="Enter location..."
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Author</label>
                <Input
                  placeholder="Enter author name..."
                  value={filters.author}
                  onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={filters.verified}
                  onCheckedChange={(checked) => 
                    setFilters(prev => ({ ...prev, verified: !!checked }))
                  }
                />
                <label htmlFor="verified" className="text-sm font-medium">
                  Verified authors only
                </label>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {filters.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <X
                      className="h-3 w-3 ml-1"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add tags..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <DatePickerWithRange
                value={filters.dateRange}
                onChange={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {(results.length > 0 || loading) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Search Results</span>
              {totalResults > 0 && (
                <Badge variant="secondary">
                  {totalResults.toLocaleString()} results
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && results.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map(result => (
                  <ResultCard key={result.id} result={result} />
                ))}

                {/* Load More Button */}
                {results.length < totalResults && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPage(prev => prev + 1);
                        performSearch(true);
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Load More Results'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {!loading && results.length === 0 && filters.query && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button variant="outline" onClick={clearSearch}>
                Clear Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};