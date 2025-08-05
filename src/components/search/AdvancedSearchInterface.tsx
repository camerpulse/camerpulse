import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search,
  Filter,
  Clock,
  TrendingUp,
  MapPin,
  Users,
  FileText,
  Briefcase,
  Building2,
  ChevronRight,
  Star,
  Calendar
} from 'lucide-react';
import useAdvancedSearch, { SearchFilters } from '@/hooks/useAdvancedSearch';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/layout/ResponsiveComponents';

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'village': return <MapPin className="h-4 w-4" />;
    case 'politician': return <Users className="h-4 w-4" />;
    case 'petition': return <FileText className="h-4 w-4" />;
    case 'job': return <Briefcase className="h-4 w-4" />;
    case 'company': return <Building2 className="h-4 w-4" />;
    default: return <Search className="h-4 w-4" />;
  }
};

const getTypeBadgeVariant = (type: string) => {
  switch (type) {
    case 'village': return 'default';
    case 'politician': return 'secondary';
    case 'petition': return 'outline';
    case 'job': return 'destructive';
    case 'company': return 'default';
    default: return 'outline';
  }
};

export const AdvancedSearchInterface: React.FC = () => {
  const {
    query,
    filters,
    searchResults,
    pagination,
    suggestions,
    searchStats,
    isLoading,
    updateQuery,
    updateFilters,
    clearSearch,
    autoComplete
  } = useAdvancedSearch();

  const [showFilters, setShowFilters] = useState(false);
  const [autoCompleteResults, setAutoCompleteResults] = useState<string[]>([]);

  const handleQueryChange = async (value: string) => {
    updateQuery(value);
    
    if (value.length >= 2) {
      const completions = await autoComplete(value);
      setAutoCompleteResults(completions);
    } else {
      setAutoCompleteResults([]);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    updateFilters({ [key]: value });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Advanced Search</h1>
          <p className="text-muted-foreground">
            Search across villages, politicians, jobs, companies, and more
          </p>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for villages, politicians, jobs, companies..."
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  className="pl-10 pr-4 h-12 text-lg"
                />
                
                {/* Auto-complete dropdown */}
                {autoCompleteResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md mt-1 shadow-lg z-50">
                    {autoCompleteResults.map((completion, index) => (
                      <button
                        key={index}
                        className="w-full px-4 py-2 text-left hover:bg-muted transition-colors"
                        onClick={() => {
                          updateQuery(completion);
                          setAutoCompleteResults([]);
                        }}
                      >
                        {completion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                
                {query && (
                  <Button variant="outline" size="sm" onClick={clearSearch}>
                    Clear
                  </Button>
                )}

                {/* Quick filter buttons */}
                <div className="flex gap-1">
                  {['village', 'politician', 'job', 'company'].map((type) => (
                    <Button
                      key={type}
                      variant={filters.types?.includes(type) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const currentTypes = filters.types || [];
                        const newTypes = currentTypes.includes(type)
                          ? currentTypes.filter(t => t !== type)
                          : [...currentTypes, type];
                        handleFilterChange('types', newTypes.length > 0 ? newTypes : undefined);
                      }}
                    >
                      {getTypeIcon(type)}
                      <span className="ml-1 capitalize">{type}s</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <select
                      value={filters.sortBy || 'relevance'}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="date">Date</option>
                      <option value="alphabetical">Alphabetical</option>
                      <option value="popularity">Popularity</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort Order</label>
                    <select
                      value={filters.sortOrder || 'desc'}
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Verified Only</label>
                    <input
                      type="checkbox"
                      checked={filters.verified || false}
                      onChange={(e) => handleFilterChange('verified', e.target.checked || undefined)}
                      className="w-4 h-4 mt-2"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search Stats */}
        {searchStats && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Found {searchStats.total} results</span>
            {Object.entries(searchStats.byType).map(([type, count]) => (
              <Badge key={type} variant="outline" className="text-xs">
                {getTypeIcon(type)}
                <span className="ml-1">{count} {type}s</span>
              </Badge>
            ))}
          </div>
        )}

        {/* Search Suggestions */}
        {suggestions.length > 0 && !query && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Search Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuery(suggestion.query)}
                  >
                    {suggestion.type === 'recent' && <Clock className="h-3 w-3 mr-1" />}
                    {suggestion.type === 'popular' && <TrendingUp className="h-3 w-3 mr-1" />}
                    {suggestion.query}
                    {suggestion.count && <Badge variant="secondary" className="ml-1 text-xs">{suggestion.count}</Badge>}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" text="Searching..." />
          </div>
        )}

        {/* Search Results */}
        {!isLoading && searchResults.length > 0 && (
          <ResponsiveGrid cols={{ default: 1, lg: 2 }}>
            {searchResults.map((result) => (
              <Card key={`${result.type}-${result.id}`} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(result.type)}
                        <Badge variant={getTypeBadgeVariant(result.type)} className="text-xs">
                          {result.type}
                        </Badge>
                        {result.metadata?.verified && (
                          <Badge variant="default" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        {result.title}
                      </CardTitle>
                      <CardDescription>
                        {result.description}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-4">
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(result.updated_at)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {result.excerpt}
                    </p>
                    
                    {/* Metadata */}
                    {result.metadata && (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(result.metadata).map(([key, value]) => {
                          if (!value || typeof value === 'object') return null;
                          return (
                            <Badge key={key} variant="outline" className="text-xs">
                              {String(value)}
                            </Badge>
                          );
                        })}
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.location.href = result.url}
                    >
                      View Details
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ResponsiveGrid>
        )}

        {/* No Results */}
        {!isLoading && query && searchResults.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters
                </p>
                <Button onClick={clearSearch}>
                  Clear Search
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => {/* Implement pagination */}}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => {/* Implement pagination */}}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </ResponsiveContainer>
  );
};