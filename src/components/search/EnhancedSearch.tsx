import React, { useState, useEffect } from 'react';
import { Search, Filter, BookmarkPlus, Clock, TrendingUp, X, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEnhancedSearch } from '@/hooks/useEnhancedSearch';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SearchFilters {
  region?: string;
  tags?: string[];
  minRating?: number;
  sortBy?: string;
}

interface EnhancedSearchProps {
  onResultsChange?: (results: any[]) => void;
  onFiltersChange?: (filters: SearchFilters) => void;
  className?: string;
}

export const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  onResultsChange,
  onFiltersChange,
  className = ''
}) => {
  const { user } = useAuth();
  const {
    search,
    loading,
    results,
    trendingSearches,
    savedSearches,
    availableTags,
    saveSearch,
    deleteSavedSearch
  } = useEnhancedSearch();

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [enableNotifications, setEnableNotifications] = useState(false);

  const regions = [
    'Adamawa', 'Centre', 'East', 'Far North',
    'Littoral', 'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  // Perform search when query or filters change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      search(query, filters);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, filters, search]);

  // Update parent component with results and filters
  useEffect(() => {
    onResultsChange?.(results);
  }, [results, onResultsChange]);

  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    handleFilterChange('tags', newTags.length > 0 ? newTags : undefined);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleSaveSearch = async () => {
    if (!user) {
      toast.error('Please sign in to save searches');
      return;
    }

    if (!saveSearchName.trim()) {
      toast.error('Please enter a name for your saved search');
      return;
    }

    const success = await saveSearch(saveSearchName, query, filters, enableNotifications);
    if (success) {
      toast.success('Search saved successfully!');
      setShowSaveDialog(false);
      setSaveSearchName('');
      setEnableNotifications(false);
    } else {
      toast.error('Failed to save search');
    }
  };

  const handleUseSavedSearch = (savedSearch: any) => {
    setQuery(savedSearch.search_query);
    setFilters(savedSearch.search_filters);
  };

  const handleUseTrendingSearch = (trendingQuery: string) => {
    setQuery(trendingQuery);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search villages by name, region, or keywords..."
          className="pl-10 pr-20 h-12 text-lg"
        />
        <div className="absolute right-2 top-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          {user && (
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <BookmarkPlus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Search</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="search-name">Search Name</Label>
                    <Input
                      id="search-name"
                      value={saveSearchName}
                      onChange={(e) => setSaveSearchName(e.target.value)}
                      placeholder="My village search"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notifications"
                      checked={enableNotifications}
                      onCheckedChange={setEnableNotifications}
                    />
                    <Label htmlFor="notifications">
                      Notify me when new results match this search
                    </Label>
                  </div>
                  <Button onClick={handleSaveSearch} className="w-full">
                    Save Search
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Region Filter */}
              <div>
                <Label>Region</Label>
                <Select
                  value={filters.region || ''}
                  onValueChange={(value) => handleFilterChange('region', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All regions</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Minimum Rating */}
              <div>
                <Label>Minimum Rating</Label>
                <Select
                  value={filters.minRating?.toString() || ''}
                  onValueChange={(value) => handleFilterChange('minRating', value ? parseFloat(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any rating</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="2">2+ Stars</SelectItem>
                    <SelectItem value="1">1+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <Label>Sort By</Label>
                <Select
                  value={filters.sortBy || ''}
                  onValueChange={(value) => handleFilterChange('sortBy', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Relevance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Relevance</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="active">Most Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableTags.slice(0, 20).map(tag => {
                    const isSelected = filters.tags?.includes(tag);
                    return (
                      <Badge
                        key={tag}
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                        {isSelected && <X className="ml-1 h-3 w-3" />}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search Suggestions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Trending Searches */}
        {trendingSearches.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Trending Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {trendingSearches.slice(0, 5).map((trend, index) => (
                  <button
                    key={trend.search_query}
                    onClick={() => handleUseTrendingSearch(trend.search_query)}
                    className="w-full text-left p-2 rounded hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{trend.search_query}</span>
                      <Badge variant="secondary" className="text-xs">
                        {trend.search_count}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Saved Searches */}
        {user && savedSearches.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Saved Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {savedSearches.map((saved) => (
                    <div
                      key={saved.id}
                      className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                    >
                      <button
                        onClick={() => handleUseSavedSearch(saved)}
                        className="flex-1 text-left"
                      >
                        <div className="text-sm font-medium">{saved.search_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {saved.search_query}
                        </div>
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSavedSearch(saved.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Searching...</span>
          </div>
        </div>
      )}
    </div>
  );
};