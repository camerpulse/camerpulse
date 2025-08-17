import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { FollowButton } from '@/components/Social/FollowButton';
import { UserProfile } from '@/components/Social/UserProfile';
import { useToast } from '@/hooks/use-toast';
import { useNavigation } from '@/hooks/useNavigation';
import { 
  Users, 
  Search, 
  Globe, 
  MapPin, 
  TrendingUp,
  Heart,
  MessageCircle,
  UserPlus
} from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  is_diaspora: boolean;
  verified: boolean;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
}

const Social = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { navigateToAuth } = useNavigation();
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [following, setFollowing] = useState<Profile[]>([]);
  const [suggested, setSuggested] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSocialData();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchSocialData = async () => {
    if (!user) return;

    try {
      const [followersResult, followingResult, suggestedResult] = await Promise.all([
        fetchFollowers(),
        fetchFollowing(),
        fetchSuggested()
      ]);

      setFollowers(followersResult);
      setFollowing(followingResult);
      setSuggested(suggestedResult);
    } catch (error) {
      console.error('Error fetching social data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données sociales",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowers = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', user.id);

      if (error) throw error;

      if (!data || data.length === 0) return [];

      const followerIds = data.map(f => f.follower_id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', followerIds);

      if (profilesError) throw profilesError;

      return profiles || [];
    } catch (error) {
      console.error('Error fetching followers:', error);
      return [];
    }
  };

  const fetchFollowing = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (error) throw error;

      if (!data || data.length === 0) return [];

      const followingIds = data.map(f => f.following_id);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', followingIds);

      if (profilesError) throw profilesError;

      return profiles || [];
    } catch (error) {
      console.error('Error fetching following:', error);
      return [];
    }
  };

  const fetchSuggested = async () => {
    if (!user) return [];

    // Get users not already followed
    const { data: followingData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id);

    const followingIds = followingData?.map(f => f.following_id) || [];
    followingIds.push(user.id); // Exclude self

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .not('user_id', 'in', `(${followingIds.join(',')})`)
      .limit(10);

    if (error) throw error;

    return await enrichProfilesWithStats(data || []);
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
        .limit(20);

      if (error) throw error;

      const enrichedProfiles = await enrichProfilesWithStats(data || []);
      setSearchResults(enrichedProfiles);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const enrichProfilesWithStats = async (profiles: any[]) => {
    const enrichedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        const [followersResult, followingResult, postsResult] = await Promise.all([
          supabase
            .from('follows')
            .select('id', { count: 'exact' })
            .eq('following_id', profile.user_id),
          supabase
            .from('follows')
            .select('id', { count: 'exact' })
            .eq('follower_id', profile.user_id),
          supabase
            .from('pulse_posts')
            .select('id', { count: 'exact' })
            .eq('user_id', profile.user_id)
        ]);

        return {
          ...profile,
          followers_count: followersResult.count || 0,
          following_count: followingResult.count || 0,
          posts_count: postsResult.count || 0
        };
      })
    );

    return enrichedProfiles;
  };

  const UserCard = ({ profile, showStats = true }: { profile: Profile; showStats?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar 
            className="w-12 h-12 cursor-pointer" 
            onClick={() => setSelectedUserId(profile.user_id)}
          >
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {profile.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 
                className="font-medium truncate cursor-pointer hover:underline"
                onClick={() => setSelectedUserId(profile.user_id)}
              >
                {profile.display_name || profile.username}
              </h3>
              {profile.verified && (
                <Badge variant="outline" className="border-blue-500 text-blue-600 text-xs">
                  ✓
                </Badge>
              )}
              {profile.is_diaspora && (
                <Badge variant="outline" className="border-primary text-primary text-xs">
                  <Globe className="w-3 h-3" />
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground truncate">@{profile.username}</p>
            
            {profile.bio && (
              <p className="text-sm text-foreground mt-1 line-clamp-2">{profile.bio}</p>
            )}
            
            {profile.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="w-3 h-3" />
                <span>{profile.location}</span>
              </div>
            )}
            
            {showStats && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                <span>{profile.followers_count} abonnés</span>
                <span>{profile.posts_count} posts</span>
              </div>
            )}
          </div>
          
          <FollowButton 
            targetUserId={profile.user_id} 
            targetUsername={profile.username}
            size="sm"
          />
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-4">Connexion requise</h2>
              <p className="text-gray-600 mb-4">Connectez-vous pour découvrir et suivre d'autres utilisateurs</p>
              <Button onClick={() => navigateToAuth()}>Se connecter</Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Réseau Social</h1>
            <p className="text-muted-foreground">Connectez-vous avec la communauté camerounaise</p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des utilisateurs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">Résultats de recherche</h3>
                {searchResults.map((profile) => (
                  <UserCard key={profile.id} profile={profile} />
                ))}
              </div>
            )}
          </div>

          <Tabs defaultValue="suggested" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="suggested">Suggestions</TabsTrigger>
              <TabsTrigger value="followers">Abonnés ({followers.length})</TabsTrigger>
              <TabsTrigger value="following">Abonnements ({following.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="suggested" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <UserPlus className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Utilisateurs suggérés</h2>
                </div>
                
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                              <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                              <div className="w-24 h-3 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : suggested.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Aucune suggestion</h3>
                      <p className="text-muted-foreground">Revenez plus tard pour découvrir de nouveaux utilisateurs</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {suggested.map((profile) => (
                      <UserCard key={profile.id} profile={profile} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="followers" className="mt-6">
              <div className="space-y-4">
                {followers.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Aucun abonné</h3>
                      <p className="text-muted-foreground">Vos abonnés apparaîtront ici</p>
                    </CardContent>
                  </Card>
                ) : (
                  followers.map((profile) => (
                    <UserCard key={profile.id} profile={profile} showStats={false} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="following" className="mt-6">
              <div className="space-y-4">
                {following.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Aucun abonnement</h3>
                      <p className="text-muted-foreground">Suivez d'autres utilisateurs pour voir leurs publications</p>
                    </CardContent>
                  </Card>
                ) : (
                  following.map((profile) => (
                    <UserCard key={profile.id} profile={profile} showStats={false} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* User Profile Modal */}
      {selectedUserId && (
        <UserProfile
          userId={selectedUserId}
          isOpen={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </AppLayout>
  );
};

export default Social;