import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FollowButton } from '@/components/Social/FollowButton';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Calendar, 
  Users, 
  MessageCircle,
  Camera,
  Grid3X3,
  Video,
  Star,
  Award,
  Settings,
  Share2,
  Heart,
  Eye,
  Flag,
  CheckCircle,
  Shield,
  Globe,
  Mail,
  Building,
  Phone
} from 'lucide-react';

interface SocialStyleProfileProps {
  userId: string;
  isModal?: boolean;
  onClose?: () => void;
}

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  cover_image_url?: string;
  location?: string;
  website?: string;
  email?: string;
  phone?: string;
  is_diaspora: boolean;
  verified: boolean;
  verification_status?: string;
  profile_type?: string;
  created_at: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  civic_influence_score?: number;
}

interface Post {
  id: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  sentiment_score?: number;
  sentiment_label?: string;
  hashtags?: string[];
  mentions?: string[];
  created_at: string;
}

export const SocialStyleProfile: React.FC<SocialStyleProfileProps> = ({ 
  userId, 
  isModal = false,
  onClose 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchPosts();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile(data);
        await fetchStats(data.id);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (profileId: string) => {
    try {
      // Fetch follower/following counts
      const [followersRes, followingRes, postsRes] = await Promise.all([
        supabase.from('follows').select('id', { count: 'exact' }).eq('following_id', userId),
        supabase.from('follows').select('id', { count: 'exact' }).eq('follower_id', userId),
        supabase.from('pulse_posts').select('id', { count: 'exact' }).eq('user_id', userId)
      ]);

      setProfile(prev => prev ? {
        ...prev,
        followers_count: followersRes.count || 0,
        following_count: followingRes.count || 0,
        posts_count: postsRes.count || 0
      } : null);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('pulse_posts')
        .select(`
          id,
          content,
          image_url,
          likes_count,
          comments_count,
          shares_count,
          sentiment_score,
          sentiment_label,
          hashtags,
          mentions,
          created_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          <div className="h-48 bg-muted"></div>
          <div className="container mx-auto px-4 -mt-16">
            <div className="h-32 w-32 bg-muted rounded-full border-4 border-background"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground">The requested user profile could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Photo Section */}
      <div className="relative h-48 sm:h-64 lg:h-80 bg-gradient-to-r from-primary/20 to-primary/10 overflow-hidden">
        {profile.cover_image_url ? (
          <img 
            src={profile.cover_image_url} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 flex items-center justify-center">
            <Camera className="h-16 w-16 text-primary/40" />
          </div>
        )}
        
        {/* Cover overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Profile Header */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-16 sm:-mt-20 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Profile Picture */}
            <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-background shadow-lg">
              <AvatarImage src={profile.avatar_url} alt={profile.display_name || profile.username} />
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                {getInitials(profile.display_name || profile.username)}
              </AvatarFallback>
            </Avatar>

            {/* Profile Info */}
            <div className="flex-1 sm:ml-4 mt-4 sm:mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                      {profile.display_name || profile.username}
                    </h1>
                    {profile.verified && (
                      <CheckCircle className="h-6 w-6 text-blue-500" />
                    )}
                    {profile.is_diaspora && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Flag className="h-3 w-3 mr-1" />
                        Diaspora
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground text-lg">@{profile.username}</p>
                  
                  {profile.bio && (
                    <p className="text-foreground mt-2 max-w-2xl">{profile.bio}</p>
                  )}

                  {/* Profile Meta */}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {profile.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(profile.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {user?.id === userId ? (
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <FollowButton 
                        targetUserId={userId}
                      />
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t">
                <div className="text-center">
                  <div className="font-bold text-lg">{formatNumber(profile.posts_count || 0)}</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{formatNumber(profile.followers_count || 0)}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{formatNumber(profile.following_count || 0)}</div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
                {profile.civic_influence_score && (
                  <div className="text-center">
                    <div className="font-bold text-lg flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {profile.civic_influence_score}
                    </div>
                    <div className="text-sm text-muted-foreground">Civic Score</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 bg-background border-b rounded-none h-auto p-0">
            <TabsTrigger 
              value="posts" 
              className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">Posts</span>
            </TabsTrigger>
            <TabsTrigger 
              value="about" 
              className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">About</span>
            </TabsTrigger>
            <TabsTrigger 
              value="media" 
              className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Media</span>
            </TabsTrigger>
            <TabsTrigger 
              value="videos" 
              className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Videos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="achievements" 
              className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Awards</span>
            </TabsTrigger>
            <TabsTrigger 
              value="civic" 
              className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Civic</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="mt-6">
            <TabsContent value="posts" className="space-y-4">
              {posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {posts.map((post) => (
                    <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        {post.image_url && (
                          <img 
                            src={post.image_url} 
                            alt="Post" 
                            className="w-full h-48 object-cover rounded-md mb-3"
                          />
                        )}
                        <p className="text-sm text-foreground line-clamp-3 mb-2">{post.content}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {post.likes_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {post.comments_count}
                            </span>
                          </div>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Grid3X3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No posts yet</h3>
                  <p className="text-muted-foreground">
                    {user?.id === userId ? "Share your first post!" : "This user hasn't posted anything yet."}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">About {profile.display_name || profile.username}</h3>
                  <div className="space-y-4">
                    {profile.bio && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Bio</h4>
                        <p className="text-muted-foreground">{profile.bio}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.location && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Location</div>
                            <div className="text-muted-foreground">{profile.location}</div>
                          </div>
                        </div>
                      )}
                      
                      {profile.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Website</div>
                            <a 
                              href={profile.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {profile.website}
                            </a>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Joined</div>
                          <div className="text-muted-foreground">{formatDate(profile.created_at)}</div>
                        </div>
                      </div>
                      
                      {profile.profile_type && (
                        <div className="flex items-center gap-3">
                          <Building className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Profile Type</div>
                            <div className="text-muted-foreground capitalize">{profile.profile_type}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media">
              <div className="text-center py-12">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No media yet</h3>
                <p className="text-muted-foreground">Photos and images will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="videos">
              <div className="text-center py-12">
                <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No videos yet</h3>
                <p className="text-muted-foreground">Videos will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="achievements">
              <div className="text-center py-12">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No achievements yet</h3>
                <p className="text-muted-foreground">Awards and achievements will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="civic">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Civic Engagement</h3>
                  <div className="space-y-4">
                    {profile.civic_influence_score && (
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Star className="h-8 w-8 text-yellow-500" />
                          <div>
                            <div className="font-medium">Civic Influence Score</div>
                            <div className="text-sm text-muted-foreground">Community impact rating</div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-primary">{profile.civic_influence_score}</div>
                      </div>
                    )}
                    
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h4 className="text-lg font-medium text-foreground mb-2">Civic Activities</h4>
                      <p className="text-muted-foreground">Civic engagement activities will appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};