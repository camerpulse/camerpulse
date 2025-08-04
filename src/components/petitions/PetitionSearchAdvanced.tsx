import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Target,
  SlidersHorizontal,
  X,
  Star,
  Clock,
  Share2
} from 'lucide-react';

interface Petition {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  target_institution: string;
  goal_signatures: number;
  current_signatures: number;
  location: string;
  created_at: string;
  deadline: string;
  creator_id: string;
}

interface SearchFilters {
  query: string;
  category: string;
  status: string;
  location: string;
  dateRange: string;
  signatureRange: string;
  sortBy: string;
  tags: string[];
}

interface TrendingSearch {
  query: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

export function PetitionSearchAdvanced() {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearch[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    status: 'all',
    location: 'all',
    dateRange: 'all',
    signatureRange: 'all',
    sortBy: 'relevance',
    tags: []
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTrendingSearches();
    loadRecentSearches();
  }, []);

  useEffect(() => {
    if (filters.query.length > 2 || hasActiveFilters()) {
      searchPetitions();
    } else {
      setPetitions([]);
      setTotalResults(0);
    }
  }, [filters]);

  const fetchTrendingSearches = async () => {
    // Mock trending searches
    const trending: TrendingSearch[] = [
      { query: 'road infrastructure', count: 245, trend: 'up' },
      { query: 'healthcare access', count: 189, trend: 'up' },
      { query: 'education reform', count: 156, trend: 'stable' },
      { query: 'environmental protection', count: 134, trend: 'up' },
      { query: 'youth employment', count: 98, trend: 'down' }
    ];
    setTrendingSearches(trending);
  };

  const loadRecentSearches = () => {
    const recent = JSON.parse(localStorage.getItem('petition_recent_searches') || '[]');
    setRecentSearches(recent.slice(0, 5));
  };

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    
    let recent = JSON.parse(localStorage.getItem('petition_recent_searches') || '[]');
    recent = [query, ...recent.filter((q: string) => q !== query)].slice(0, 10);
    localStorage.setItem('petition_recent_searches', JSON.stringify(recent));
    setRecentSearches(recent.slice(0, 5));
  };

  const hasActiveFilters = () => {
    return filters.category !== 'all' || 
           filters.status !== 'all' || 
           filters.location !== 'all' || 
           filters.dateRange !== 'all' || 
           filters.signatureRange !== 'all' ||
           filters.tags.length > 0;
  };

  const searchPetitions = async () => {
    setLoading(true);
    try {
      // Save search query
      if (filters.query.length > 2) {
        saveRecentSearch(filters.query);
      }

      // Build query
      let query = supabase
        .from('petitions')
        .select('*', { count: 'exact' });

      // Apply text search
      if (filters.query) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }

      // Apply filters
      if (filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.location !== 'all') {
        query = query.ilike('location', `%${filters.location}%`);
      }

      // Apply date range filter
      if (filters.dateRange !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (filters.dateRange) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 'year':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0);
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }

      // Apply signature range filter
      if (filters.signatureRange !== 'all') {
        switch (filters.signatureRange) {
          case 'small':
            query = query.lt('current_signatures', 100);
            break;
          case 'medium':
            query = query.gte('current_signatures', 100).lt('current_signatures', 1000);
            break;
          case 'large':
            query = query.gte('current_signatures', 1000);
            break;
        }
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'most_signed':
          query = query.order('current_signatures', { ascending: false });
          break;
        case 'trending':
          // Mock trending calculation
          query = query.order('current_signatures', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query.limit(20);

      if (error) throw error;

      setPetitions(data || []);
      setTotalResults(count || 0);
    } catch (error) {
      console.error('Error searching petitions:', error);
      toast({
        title: "Search Error",
        description: "Failed to search petitions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      status: 'all',
      location: 'all',
      dateRange: 'all',
      signatureRange: 'all',
      sortBy: 'relevance',
      tags: []
    });
  };

  const sharePetition = async (petition: Petition) => {
    const url = `${window.location.origin}/petitions/${petition.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: petition.title,
          text: petition.description,
          url: url,
        });
      } catch (error) {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "Petition link copied to clipboard",
        });
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Petition link copied to clipboard",
      });
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      default: return <TrendingUp className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Main Search Bar */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search petitions by title, description, or keywords..."
                  value={filters.query}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {hasActiveFilters() && (
                  <Badge variant="secondary" className="ml-1">
                    {Object.values(filters).filter(v => v !== 'all' && v !== '' && (!Array.isArray(v) || v.length > 0)).length}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, query: search }))}
                  className="text-xs"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {search}
                </Button>
              ))}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={filters.category} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="governance">Governance</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="environment">Environment</SelectItem>
                        <SelectItem value="social_justice">Social Justice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={filters.status} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="successful">Successful</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <Select 
                      value={filters.dateRange} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="week">Past Week</SelectItem>
                        <SelectItem value="month">Past Month</SelectItem>
                        <SelectItem value="year">Past Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <Select 
                      value={filters.sortBy} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="most_signed">Most Signatures</SelectItem>
                        <SelectItem value="trending">Trending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                  {hasActiveFilters() && (
                    <Badge variant="secondary">
                      {Object.values(filters).filter(v => v !== 'all' && v !== '' && (!Array.isArray(v) || v.length > 0)).length} filters active
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trending Searches */}
      {!filters.query && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trending Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {trendingSearches.map((trending, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => setFilters(prev => ({ ...prev, query: trending.query }))}
                  className="justify-between"
                >
                  <span>{trending.query}</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(trending.trend)}
                    <span className="text-xs text-muted-foreground">{trending.count}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {(filters.query.length > 2 || hasActiveFilters()) && (
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
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : petitions.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No petitions found</h3>
                <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {petitions.map((petition) => {
                  const progressPercentage = Math.min((petition.current_signatures / petition.goal_signatures) * 100, 100);
                  
                  return (
                    <div key={petition.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg line-clamp-1">{petition.title}</h3>
                            <Badge variant="outline">{petition.status}</Badge>
                          </div>
                          <p className="text-muted-foreground line-clamp-2 mb-3">
                            {petition.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {petition.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {petition.target_institution}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(petition.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sharePetition(petition)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => window.open(`/petitions/${petition.id}`, '_blank')}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {petition.current_signatures.toLocaleString()} / {petition.goal_signatures.toLocaleString()} signatures
                          </span>
                          <span>{progressPercentage.toFixed(1)}% complete</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}