import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  MapPin,
  Star,
  TrendingUp,
  Users,
  Filter,
  Eye,
  ExternalLink,
  Award,
  CheckCircle,
  User,
  Building2,
  Globe
} from 'lucide-react';

interface Official {
  id: string;
  name: string;
  role_title?: string;
  region?: string;
  party?: string;
  profile_image_url?: string;
  average_rating?: number;
  total_ratings?: number;
  civic_score: number;
  verified: boolean;
  level_of_office?: string;
  political_party?: {
    id: string;
    name: string;
    acronym: string;
    logo_url?: string;
  };
}

interface SearchFilters {
  query: string;
  role: string;
  region: string;
  party: string;
  minRating: number;
  sortBy: 'rating' | 'civic_score' | 'name' | 'total_ratings';
}

interface EmbedProps {
  context: 'search' | 'party' | 'region' | 'ranking';
  partyId?: string;
  regionName?: string;
  maxItems?: number;
  showFilters?: boolean;
  compact?: boolean;
}

export const OfficialEmbedEngine: React.FC<EmbedProps> = ({
  context,
  partyId,
  regionName,
  maxItems = 10,
  showFilters = true,
  compact = false
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    role: 'all',
    region: regionName || 'all',
    party: partyId || 'all',
    minRating: 0,
    sortBy: 'civic_score'
  });

  const [showComparison, setShowComparison] = useState(false);
  const [selectedOfficials, setSelectedOfficials] = useState<Official[]>([]);

  // Fetch officials based on context and filters
  const { data: officials = [], isLoading } = useQuery({
    queryKey: ['embedded_officials', context, filters, partyId, regionName],
    queryFn: async () => {
      let query = supabase
        .from('politicians')
        .select(`
          *,
          political_parties!political_party_id (
            id,
            name,
            acronym,
            logo_url
          ),
          approval_ratings(rating)
        `)
        .eq('is_archived', false);

      // Apply context-specific filters
      if (context === 'party' && partyId) {
        query = query.eq('political_party_id', partyId);
      }

      if (context === 'region' && regionName) {
        query = query.eq('region', regionName);
      }

      // Apply user filters
      if (filters.role !== 'all') {
        query = query.eq('level_of_office', filters.role);
      }

      if (filters.region !== 'all' && context !== 'region') {
        query = query.eq('region', filters.region);
      }

      if (filters.party !== 'all' && context !== 'party') {
        query = query.eq('political_party_id', filters.party);
      }

      // Search by name or party
      if (filters.query) {
        query = query.or(`name.ilike.%${filters.query}%,party.ilike.%${filters.query}%`);
      }

      const { data, error } = await query.limit(maxItems * 2); // Fetch more for filtering

      if (error) throw error;

      // Process and calculate ratings
      const processedOfficials = (data || []).map((official: any) => {
        const ratings = official.approval_ratings || [];
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0 
          ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / totalRatings 
          : 0;

        return {
          ...official,
          average_rating: averageRating,
          total_ratings: totalRatings,
          political_party: official.political_parties,
          approval_ratings: undefined,
          political_parties: undefined
        };
      }).filter((official: Official) => 
        official.average_rating >= filters.minRating
      );

      // Sort officials
      processedOfficials.sort((a: Official, b: Official) => {
        switch (filters.sortBy) {
          case 'rating':
            return (b.average_rating || 0) - (a.average_rating || 0);
          case 'civic_score':
            return b.civic_score - a.civic_score;
          case 'total_ratings':
            return (b.total_ratings || 0) - (a.total_ratings || 0);
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return b.civic_score - a.civic_score;
        }
      });

      return processedOfficials.slice(0, maxItems);
    },
    refetchInterval: context === 'ranking' ? 30000 : false // Auto-refresh for rankings
  });

  // Fetch parties for filter
  const { data: parties = [] } = useQuery({
    queryKey: ['parties_for_filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('political_parties')
        .select('id, name, acronym')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: showFilters && context !== 'party'
  });

  const toggleComparison = (official: Official) => {
    if (selectedOfficials.find(o => o.id === official.id)) {
      setSelectedOfficials(prev => prev.filter(o => o.id !== official.id));
    } else if (selectedOfficials.length < 3) {
      setSelectedOfficials(prev => [...prev, official]);
    }
  };

  const getContextTitle = () => {
    switch (context) {
      case 'search':
        return 'Official Search Results';
      case 'party':
        return 'Party Officials';
      case 'region':
        return `${regionName} Representatives`;
      case 'ranking':
        return 'Top Performing Officials';
      default:
        return 'Officials';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const renderOfficialCard = (official: Official) => {
    const isSelected = selectedOfficials.find(o => o.id === official.id);
    
    return (
      <Card 
        key={official.id} 
        className={`hover:shadow-md transition-all duration-200 ${
          isSelected ? 'ring-2 ring-primary' : ''
        } ${compact ? 'p-3' : ''}`}
      >
        <CardContent className={compact ? 'p-3' : 'p-4'}>
          <div className="flex items-start gap-3">
            <Avatar className={compact ? 'w-10 h-10' : 'w-12 h-12'}>
              <AvatarImage src={official.profile_image_url} />
              <AvatarFallback>
                {official.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={`font-semibold ${compact ? 'text-sm' : 'text-base'} truncate`}>
                    {official.name}
                  </h3>
                  <p className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
                    {official.role_title}
                  </p>
                  {!compact && (
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{official.region}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1">
                  {official.verified && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                  {context === 'ranking' && (
                    <Badge variant="secondary" className="text-xs">
                      #{officials.findIndex(o => o.id === official.id) + 1}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Ratings */}
              <div className="mt-2 space-y-1">
                {official.average_rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= Math.round(official.average_rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-medium ${getRatingColor(official.average_rating)}`}>
                      {official.average_rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({official.total_ratings} votes)
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Civic Score:</span>
                  <Progress value={official.civic_score} className="flex-1 h-1" />
                  <span className="text-xs font-medium">{official.civic_score}%</span>
                </div>
              </div>

              {/* Party Badge */}
              {official.political_party && !compact && (
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    {official.political_party.acronym || official.political_party.name}
                  </Badge>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3">
                <Button size="sm" variant="outline" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  View Profile
                </Button>
                
                {showComparison && (
                  <Button 
                    size="sm" 
                    variant={isSelected ? "default" : "ghost"}
                    onClick={() => toggleComparison(official)}
                    className="text-xs"
                  >
                    {isSelected ? 'Remove' : 'Compare'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className={compact ? 'pb-3' : ''}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{getContextTitle()}</span>
              {!isLoading && (
                <Badge variant="secondary">{officials.length} officials</Badge>
              )}
            </div>
            
            {context === 'search' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComparison(!showComparison)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Compare Mode
              </Button>
            )}
          </CardTitle>
        </CardHeader>

        {/* Filters */}
        {showFilters && !compact && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search officials..."
                  value={filters.query}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                  className="pl-9"
                />
              </div>

              <Select 
                value={filters.role} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="National">Ministers</SelectItem>
                  <SelectItem value="Regional">MPs</SelectItem>
                  <SelectItem value="Local">Senators</SelectItem>
                </SelectContent>
              </Select>

              {context !== 'region' && (
                <Select 
                  value={filters.region} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, region: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="Centre">Centre</SelectItem>
                    <SelectItem value="Littoral">Littoral</SelectItem>
                    <SelectItem value="Northwest">North West</SelectItem>
                    <SelectItem value="Southwest">South West</SelectItem>
                    <SelectItem value="North">North</SelectItem>
                    <SelectItem value="Far North">Far North</SelectItem>
                    <SelectItem value="Adamawa">Adamawa</SelectItem>
                    <SelectItem value="East">East</SelectItem>
                    <SelectItem value="South">South</SelectItem>
                    <SelectItem value="West">West</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Select 
                value={filters.sortBy} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="civic_score">Civic Score</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="total_ratings">Most Rated</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.minRating.toString()} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, minRating: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Min Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Rating</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="5">5 Stars Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Comparison Panel */}
      {showComparison && selectedOfficials.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <span className="font-medium">Selected for Comparison ({selectedOfficials.length}/3)</span>
              </div>
              <Button size="sm" disabled={selectedOfficials.length < 2}>
                Compare Selected
              </Button>
            </div>
            {selectedOfficials.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedOfficials.map(official => (
                  <Badge key={official.id} variant="secondary" className="flex items-center gap-1">
                    {official.name}
                    <button 
                      onClick={() => toggleComparison(official)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Officials List */}
      <div className={`grid gap-3 ${
        compact 
          ? 'grid-cols-1' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-2 bg-muted rounded w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : officials.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No officials found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
            </CardContent>
          </Card>
        ) : (
          officials.map(renderOfficialCard)
        )}
      </div>

      {/* Regional Summary for region context */}
      {context === 'region' && officials.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">{regionName} Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{officials.length}</div>
                <div className="text-xs text-muted-foreground">Total Officials</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {officials.filter(o => o.average_rating >= 4).length}
                </div>
                <div className="text-xs text-muted-foreground">Highly Rated</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {(officials.reduce((sum, o) => sum + o.civic_score, 0) / officials.length).toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">Avg Civic Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {officials.filter(o => o.verified).length}
                </div>
                <div className="text-xs text-muted-foreground">Verified</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Export specific embed components for easy integration
export const SearchEmbed: React.FC<{ maxItems?: number }> = ({ maxItems }) => (
  <OfficialEmbedEngine context="search" maxItems={maxItems} />
);

export const PartyEmbed: React.FC<{ partyId: string; compact?: boolean }> = ({ partyId, compact }) => (
  <OfficialEmbedEngine context="party" partyId={partyId} showFilters={false} compact={compact} />
);

export const RegionEmbed: React.FC<{ regionName: string }> = ({ regionName }) => (
  <OfficialEmbedEngine context="region" regionName={regionName} showFilters={false} />
);

export const RankingEmbed: React.FC<{ maxItems?: number }> = ({ maxItems = 10 }) => (
  <OfficialEmbedEngine context="ranking" maxItems={maxItems} showFilters={false} />
);

export default OfficialEmbedEngine;