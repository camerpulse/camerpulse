import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, Filter, Users, MapPin, Briefcase, Star, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileSearchResult {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  profile_type: string;
  verification_status: string;
  civic_influence_score: number;
  location?: string;
  region?: string;
  profession?: string;
  followers_count?: number;
  is_verified: boolean;
  last_active_at?: string;
}

interface ProfileSearchProps {
  onProfileSelect?: (profile: ProfileSearchResult) => void;
  showFilters?: boolean;
  placeholder?: string;
  limit?: number;
}

const PROFILE_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'normal_user', label: 'Citizens' },
  { value: 'politician', label: 'Politicians' },
  { value: 'political_party', label: 'Political Parties' },
  { value: 'artist', label: 'Artists' },
  { value: 'company', label: 'Companies' },
  { value: 'government_institution', label: 'Government' },
  { value: 'journalist', label: 'Journalists' },
  { value: 'activist', label: 'Activists' },
];

const REGIONS = [
  { value: 'all', label: 'All Regions' },
  { value: 'Centre', label: 'Centre' },
  { value: 'Littoral', label: 'Littoral' },
  { value: 'Northwest', label: 'Northwest' },
  { value: 'Southwest', label: 'Southwest' },
  { value: 'West', label: 'West' },
  { value: 'North', label: 'North' },
  { value: 'Far North', label: 'Far North' },
  { value: 'East', label: 'East' },
  { value: 'South', label: 'South' },
  { value: 'Adamawa', label: 'Adamawa' },
];

export const ProfileSearch: React.FC<ProfileSearchProps> = ({
  onProfileSelect,
  showFilters = true,
  placeholder = "Search profiles...",
  limit = 20
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<ProfileSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    profileType: 'all',
    region: 'all',
    verifiedOnly: false,
    sortBy: 'relevance'
  });
  const [showResults, setShowResults] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearch.trim()) {
      searchProfiles();
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [debouncedSearch, filters]);

  const searchProfiles = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          username,
          display_name,
          bio,
          avatar_url,
          profile_type,
          verification_status,
          civic_influence_score,
          location,
          region,
          profession,
          verified,
          last_active_at
        `)
        .limit(limit);

      // Apply text search
      if (debouncedSearch.trim()) {
        query = query.or(`
          username.ilike.%${debouncedSearch}%,
          display_name.ilike.%${debouncedSearch}%,
          bio.ilike.%${debouncedSearch}%,
          profession.ilike.%${debouncedSearch}%
        `);
      }

      // Apply filters
      if (filters.profileType !== 'all') {
        query = query.eq('profile_type', filters.profileType as any);
      }

      if (filters.region !== 'all') {
        query = query.eq('region', filters.region);
      }

      if (filters.verifiedOnly) {
        query = query.eq('verified', true);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'influence':
          query = query.order('civic_influence_score', { ascending: false });
          break;
        case 'recent':
          query = query.order('last_active_at', { ascending: false });
          break;
        case 'alphabetical':
          query = query.order('display_name', { ascending: true });
          break;
        default:
          // Relevance - order by verification status, then influence score
          query = query.order('verified', { ascending: false })
                       .order('civic_influence_score', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get follower counts for results
      const profileIds = data?.map(p => p.id) || [];
      if (profileIds.length > 0) {
        const { data: followCounts } = await supabase
          .from('follows')
          .select('following_id')
          .in('following_id', profileIds);

        const followerCounts: { [key: string]: number } = {};
        followCounts?.forEach(follow => {
          followerCounts[follow.following_id] = (followerCounts[follow.following_id] || 0) + 1;
        });

        const resultsWithCounts = data?.map(profile => ({
          ...profile,
          followers_count: followerCounts[profile.id] || 0,
          is_verified: profile.verified
        })) || [];

        setResults(resultsWithCounts);
      } else {
        setResults([]);
      }

      setShowResults(true);
    } catch (error) {
      console.error('Error searching profiles:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = (profile: ProfileSearchResult) => {
    if (onProfileSelect) {
      onProfileSelect(profile);
    } else {
      navigate(`/user/${profile.user_id}`);
    }
    setShowResults(false);
  };

  const getProfileTypeIcon = (type: string) => {
    const icons = {
      politician: '👑',
      political_party: '🏛️',
      artist: '🎨',
      company: '🏢',
      government_institution: '🏛️',
      journalist: '📰',
      activist: '✊',
      normal_user: '👤'
    };
    return icons[type as keyof typeof icons] || '👤';
  };

  return (
    <div className="relative w-full">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-10"
            onFocus={() => setShowResults(results.length > 0)}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-4">
            <Select
              value={filters.profileType}
              onValueChange={(value) => setFilters(prev => ({ ...prev, profileType: value }))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Profile Type" />
              </SelectTrigger>
              <SelectContent>
                {PROFILE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.region}
              onValueChange={(value) => setFilters(prev => ({ ...prev, region: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map(region => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy}
              onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="influence">Influence Score</SelectItem>
                <SelectItem value="recent">Recently Active</SelectItem>
                <SelectItem value="alphabetical">A-Z</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={filters.verifiedOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, verifiedOnly: !prev.verifiedOnly }))}
            >
              <Star className="w-4 h-4 mr-2" />
              Verified Only
            </Button>
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto bg-background border shadow-lg">
          <CardContent className="p-0">
            {results.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No profiles found</p>
              </div>
            ) : (
              <div className="divide-y">
                {results.map((profile) => (
                  <div
                    key={profile.id}
                    className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleProfileClick(profile)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback>
                          {profile.display_name?.[0] || profile.username[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">
                            {profile.display_name || profile.username}
                          </span>
                          {profile.is_verified && (
                            <Star className="w-4 h-4 text-blue-500" />
                          )}
                          <span className="text-xs">
                            {getProfileTypeIcon(profile.profile_type)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>@{profile.username}</span>
                          {profile.location && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{profile.location}</span>
                              </div>
                            </>
                          )}
                          {profile.profession && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                <span>{profile.profession}</span>
                              </div>
                            </>
                          )}
                        </div>

                        {profile.bio && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {profile.bio}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="w-3 h-3" />
                          <span>{profile.civic_influence_score}</span>
                        </div>
                        {profile.followers_count !== undefined && (
                          <div className="text-xs text-muted-foreground">
                            {profile.followers_count} followers
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};