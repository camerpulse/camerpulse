import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Filter, SlidersHorizontal, Grid, List,
  Users, MapPin, Star, TrendingUp, X
} from 'lucide-react';
import { UnifiedPoliticalCard } from './UnifiedPoliticalCard';
import { cn } from '@/lib/utils';

interface FilterState {
  search: string;
  region: string;
  party: string;
  rating: string;
  verification: string;
  sortBy: string;
}

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
}

interface EnhancedPoliticalGridProps {
  entities: PoliticalEntity[];
  loading: boolean;
  title: string;
  subtitle: string;
  entityType: 'politician' | 'senator' | 'mp' | 'minister';
  regions?: string[];
  parties?: string[];
}

export const EnhancedPoliticalGrid: React.FC<EnhancedPoliticalGridProps> = ({
  entities,
  loading,
  title,
  subtitle,
  entityType,
  regions = [],
  parties = []
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    region: 'all',
    party: 'all',
    rating: 'all',
    verification: 'all',
    sortBy: 'rating'
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

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

  // Filter entities
  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         entity.position.toLowerCase().includes(filters.search.toLowerCase()) ||
                         entity.party?.toLowerCase().includes(filters.search.toLowerCase()) ||
                         entity.region?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesRegion = filters.region === 'all' || entity.region === filters.region;
    const matchesParty = filters.party === 'all' || entity.party === filters.party;
    const matchesRating = filters.rating === 'all' ||
      (filters.rating === 'high' && entity.average_rating >= 4) ||
      (filters.rating === 'medium' && entity.average_rating >= 3 && entity.average_rating < 4) ||
      (filters.rating === 'low' && entity.average_rating < 3);
    const matchesVerification = filters.verification === 'all' ||
      (filters.verification === 'verified' && entity.is_verified) ||
      (filters.verification === 'unverified' && !entity.is_verified);

    return matchesSearch && matchesRegion && matchesParty && matchesRating && matchesVerification;
  });

  // Sort entities
  const sortedEntities = [...filteredEntities].sort((a, b) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      {/* Search and Quick Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={`Search ${entityType}s by name, position, party, or region...`}
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="whitespace-nowrap"
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
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-muted/20 rounded-lg">
                <Select value={filters.region} onValueChange={(value) => updateFilter('region', value)}>
                  <SelectTrigger>
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
                  <SelectTrigger>
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
                  <SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Verification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="verified">Verified Only</SelectItem>
                    <SelectItem value="unverified">Unverified Only</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="followers">Followers</SelectItem>
                    <SelectItem value="transparency">Transparency</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={clearFilters} className="whitespace-nowrap">
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            )}

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
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
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            <Users className="h-3 w-3 mr-1" />
            {sortedEntities.length} of {entities.length} {entityType}s
          </Badge>
        </div>
      </div>

      {/* Grid/List View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-xl aspect-square mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedEntities.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {activeFilterCount > 0 ? `No ${entityType}s match your filters` : `No ${entityType}s available`}
          </h3>
          <p className="text-muted-foreground">
            {activeFilterCount > 0 
              ? 'Try adjusting your search criteria or clearing filters' 
              : `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} data will be imported soon`
            }
          </p>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            : "space-y-4"
        )}>
          {sortedEntities.map((entity) => (
            <UnifiedPoliticalCard
              key={entity.id}
              {...entity}
              type={entityType}
              className={viewMode === 'list' ? 'grid grid-cols-[200px_1fr] gap-4' : ''}
            />
          ))}
        </div>
      )}
    </div>
  );
};