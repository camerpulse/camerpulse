import React, { useState, useEffect } from 'react';
import { useProfileSystem, ProfileFilter } from '@/hooks/useProfileSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdvancedUserProfile } from './AdvancedUserProfile';
import { FollowButton } from '@/components/Social/FollowButton';
import { 
  Search, 
  Filter, 
  Users, 
  MapPin, 
  TrendingUp, 
  Crown, 
  Flag, 
  Camera, 
  Building, 
  Shield, 
  BookOpen, 
  CheckCircle,
  Globe,
  Star,
  Eye,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const PROFILE_TYPES = [
  { value: 'all', label: 'All Types', icon: Users },
  { value: 'normal_user', label: 'Citizens', icon: Users },
  { value: 'politician', label: 'Politicians', icon: Crown },
  { value: 'political_party', label: 'Political Parties', icon: Flag },
  { value: 'artist', label: 'Artists', icon: Camera },
  { value: 'company', label: 'Companies', icon: Building },
  { value: 'government_institution', label: 'Government', icon: Shield },
  { value: 'journalist', label: 'Journalists', icon: BookOpen },
  { value: 'activist', label: 'Activists', icon: TrendingUp },
  { value: 'camerpulse_official', label: 'CamerPulse Official', icon: CheckCircle },
];

const VERIFICATION_STATUS = [
  { value: 'all', label: 'All Status' },
  { value: 'verified', label: 'Verified' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'pending', label: 'Pending' },
];

const CAMEROON_REGIONS = [
  { value: 'all', label: 'All Regions' },
  { value: 'Adamawa', label: 'Adamawa' },
  { value: 'Centre', label: 'Centre' },
  { value: 'East', label: 'East' },
  { value: 'Far North', label: 'Far North' },
  { value: 'Littoral', label: 'Littoral' },
  { value: 'North', label: 'North' },
  { value: 'Northwest', label: 'Northwest' },
  { value: 'South', label: 'South' },
  { value: 'Southwest', label: 'Southwest' },
  { value: 'West', label: 'West' },
];

export const ProfileDiscovery: React.FC = () => {
  const {
    profiles,
    loading,
    pagination,
    fetchProfiles,
    loadMore,
    refresh
  } = useProfileSystem();

  const [filters, setFilters] = useState<ProfileFilter>({
    profileType: 'all',
    verificationStatus: 'all',
    region: 'all',
    searchQuery: ''
  });
  
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    refresh(filters);
  }, []);

  const handleFilterChange = (key: keyof ProfileFilter, value: string | number) => {
    const newFilters = {
      ...filters,
      [key]: value === 'all' ? undefined : value
    };
    setFilters(newFilters);
    refresh(newFilters);
  };

  const handleSearch = (query: string) => {
    const newFilters = { ...filters, searchQuery: query || undefined };
    setFilters(newFilters);
    refresh(newFilters);
  };

  const getProfileTypeIcon = (type: string) => {
    const typeConfig = PROFILE_TYPES.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : Users;
  };

  const getInfluenceLevel = (score: number) => {
    if (score >= 250) return { label: 'High Influence', color: 'bg-red-100 text-red-800' };
    if (score >= 150) return { label: 'Moderate Influence', color: 'bg-yellow-100 text-yellow-800' };
    if (score >= 50) return { label: 'Growing Influence', color: 'bg-blue-100 text-blue-800' };
    return { label: 'New Voice', color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Profile Discovery</h1>
          <p className="text-muted-foreground">
            Discover and connect with civic leaders, activists, and citizens across Cameroon
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button onClick={() => refresh(filters)} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search profiles by name or username..."
                value={filters.searchQuery || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <Select 
                  value={filters.profileType || 'all'} 
                  onValueChange={(value) => handleFilterChange('profileType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Profile Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFILE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {React.createElement(type.icon, { className: "h-4 w-4" })}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={filters.verificationStatus || 'all'} 
                  onValueChange={(value) => handleFilterChange('verificationStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Verification Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {VERIFICATION_STATUS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={filters.region || 'all'} 
                  onValueChange={(value) => handleFilterChange('region', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMEROON_REGIONS.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => {
          const ProfileIcon = getProfileTypeIcon(profile.profile_type);
          const influenceLevel = getInfluenceLevel(profile.civic_influence_score);

          return (
            <Card key={profile.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Profile Header */}
                  <div className="flex items-start gap-3">
                    <Avatar 
                      className="h-16 w-16 cursor-pointer" 
                      onClick={() => setSelectedProfile(profile.user_id)}
                    >
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {profile.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 
                          className="font-semibold truncate cursor-pointer hover:text-primary"
                          onClick={() => setSelectedProfile(profile.user_id)}
                        >
                          {profile.display_name || profile.username}
                        </h3>
                        {profile.verification_status === 'verified' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {profile.is_diaspora && (
                          <Globe className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        @{profile.username}
                      </p>
                      {profile.civic_tagline && (
                        <p className="text-xs text-primary italic mt-1 line-clamp-2">
                          "{profile.civic_tagline}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Profile Type & Profession */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ProfileIcon className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary" className="text-xs">
                        {PROFILE_TYPES.find(t => t.value === profile.profile_type)?.label || 'Citizen'}
                      </Badge>
                    </div>
                    {profile.profession && (
                      <p className="text-sm text-muted-foreground truncate">
                        {profile.profession}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="font-semibold text-sm">{profile.civic_influence_score}</div>
                      <div className="text-xs text-muted-foreground">Influence</div>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{profile.followers_count || 0}</div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                  </div>

                  {/* Influence Level */}
                  <Badge className={`w-full justify-center ${influenceLevel.color}`}>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {influenceLevel.label}
                  </Badge>

                  {/* Location & Last Active */}
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {profile.region && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{profile.region}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Active {formatDistanceToNow(new Date(profile.last_active_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProfile(profile.user_id)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <FollowButton
                      targetUserId={profile.user_id}
                      targetUsername={profile.username}
                      variant="default"
                      size="sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Load More */}
      {pagination.hasMore && (
        <div className="text-center">
          <Button 
            onClick={() => loadMore(filters)} 
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Loading...' : 'Load More Profiles'}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && profiles.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No profiles found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button onClick={() => refresh({})} variant="outline">
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Profile Modal */}
      {selectedProfile && (
        <AdvancedUserProfile
          userId={selectedProfile}
          isOpen={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
};