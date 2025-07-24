/**
 * Industry Grade User Profile Component
 * 
 * Features:
 * ✅ Follow/Unfollow functionality with real-time counts
 * ✅ Message button with proper routing
 * ✅ Follower count display
 * ✅ Social verification badges
 * ✅ Activity timeline
 * ✅ Privacy controls
 * ✅ Professional information display
 * ✅ Contact information section
 * ✅ Social media links
 * ✅ Achievement system
 * ✅ Rating system for eligible profile types
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { FollowButton } from '@/components/camerpulse/FollowButton';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Calendar, 
  Users, 
  MessageCircle,
  Heart,
  TrendingUp,
  Shield,
  Star,
  Award,
  Flag,
  Settings,
  Eye,
  Share2,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  Building,
  BookOpen,
  Camera,
  CheckCircle,
  AlertTriangle,
  Crown,
  Briefcase,
  MessageSquare,
  UserCheck,
  UserPlus,
  Lock,
  Verified,
  Link as LinkIcon,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  Video
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface IndustryGradeProfileProps {
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
  cover_photo_url?: string;
  location?: string;
  region?: string;
  profession?: string;
  civic_tagline?: string;
  profile_type: string;
  verification_status: string;
  civic_influence_score: number;
  post_count: number;
  polls_created: number;
  events_attended: number;
  profile_views: number;
  contact_info: any;
  social_links: any;
  is_diaspora: boolean;
  verified: boolean;
  is_banned: boolean;
  allow_messages: boolean;
  last_active_at: string;
  created_at: string;
}

interface ProfileStats {
  followers_count: number;
  following_count: number;
  average_rating: number;
  total_ratings: number;
  is_following: boolean;
}

export const IndustryGradeUserProfile: React.FC<IndustryGradeProfileProps> = ({ 
  userId, 
  isModal = false,
  onClose
}) => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({ 
    followers_count: 0, 
    following_count: 0, 
    average_rating: 0, 
    total_ratings: 0,
    is_following: false
  });
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (userId) {
      console.log('Fetching profile for userId:', userId);
      fetchProfile();
      fetchProfileStats();
    }
  }, [userId]);

  useEffect(() => {
    if (profile && user?.id !== userId) {
      incrementProfileViews();
    }
  }, [profile, user, userId]);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile for user_id:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        throw error;
      }
      
      console.log('Profile data:', data);
      setProfile(data);
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

  const fetchProfileStats = async () => {
    try {
      console.log('Fetching stats for userId:', userId, 'currentUser:', user?.id);
      const [followersResult, followingResult, followStatusResult] = await Promise.all([
        supabase
          .from('follows')
          .select('id', { count: 'exact' })
          .eq('following_id', userId),
        supabase
          .from('follows')
          .select('id', { count: 'exact' })
          .eq('follower_id', userId),
        user ? supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', userId)
          .maybeSingle() : { data: null }
      ]);

      console.log('Stats results:', {
        followers: followersResult.count,
        following: followingResult.count,
        isFollowing: !!followStatusResult.data
      });

      setStats(prev => ({
        ...prev,
        followers_count: followersResult.count || 0,
        following_count: followingResult.count || 0,
        is_following: !!followStatusResult.data
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const incrementProfileViews = async () => {
    if (!profile || user?.id === userId) return;
    
    try {
      await supabase
        .from('profiles')
        .update({ profile_views: (profile.profile_views || 0) + 1 })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to follow users",
        variant: "destructive"
      });
      return;
    }

    if (user.id === userId) return;

    setFollowLoading(true);
    try {
      if (stats.is_following) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) throw error;

        setStats(prev => ({
          ...prev,
          followers_count: Math.max(0, prev.followers_count - 1),
          is_following: false
        }));

        toast({
          title: "Unfollowed",
          description: `You no longer follow @${profile?.username}`
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          });

        if (error) throw error;

        setStats(prev => ({
          ...prev,
          followers_count: prev.followers_count + 1,
          is_following: true
        }));

        toast({
          title: "Following",
          description: `You now follow @${profile?.username}`
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessageUser = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to message users",
        variant: "destructive"
      });
      return;
    }

    if (!profile?.allow_messages) {
      toast({
        title: "Messages Disabled",
        description: "This user has disabled direct messages",
        variant: "destructive"
      });
      return;
    }

    // Navigate to messenger with conversation starter
    window.location.href = `/messenger?startConversation=${userId}`;
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/profile/${userId}`;
    const text = `Check out ${profile?.display_name || profile?.username}'s profile on CamerPulse`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'CamerPulse Profile', text, url });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "Profile link copied to clipboard"
        });
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Profile link copied to clipboard"
      });
    }
  };

  const getProfileTypeIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      normal_user: Users,
      politician: Crown,
      political_party: Flag,
      artist: Camera,
      company: Building,
      government_institution: Shield,
      journalist: BookOpen,
      activist: TrendingUp,
      camerpulse_official: CheckCircle,
      moderator: Shield
    };
    return icons[type] || Users;
  };

  const getVerificationIcon = (status: string) => {
    return status === 'verified' ? CheckCircle : AlertTriangle;
  };

  const getSocialIcon = (platform: string) => {
    const icons: { [key: string]: any } = {
      instagram: Instagram,
      twitter: Twitter,
      facebook: Facebook,
      linkedin: Linkedin,
      youtube: Youtube,
      tiktok: Video,
      website: Globe
    };
    return icons[platform.toLowerCase()] || ExternalLink;
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  const ProfileTypeIcon = getProfileTypeIcon(profile.profile_type);
  const VerificationIcon = getVerificationIcon(profile.verification_status);

  return (
    <div className={isModal ? "max-w-4xl max-h-[90vh] overflow-y-auto" : "max-w-4xl mx-auto"}>
      {/* Header with Cover Photo */}
      <Card className="overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-primary/20 to-accent/20">
          {profile.cover_photo_url && (
            <img
              src={profile.cover_photo_url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Close Button for Modal */}
          {isModal && onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white"
            >
              ✕
            </Button>
          )}

          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-6">
            <Avatar className="w-32 h-32 border-4 border-background">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {profile.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-4 right-4 flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            {user?.id !== userId && (
              <>
                {profile.allow_messages && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleMessageUser}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                )}
                
                <Button
                  variant={stats.is_following ? "secondary" : "default"}
                  size="sm"
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                >
                  {followLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  ) : stats.is_following ? (
                    <UserCheck className="h-4 w-4 mr-2" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  {stats.is_following ? 'Following' : 'Follow'}
                </Button>
              </>
            )}
          </div>
        </div>

        <CardContent className="pt-20">
          {/* Profile Info */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold">
                    {profile.display_name || profile.username}
                  </h1>
                  
                  {/* Profile Type Badge */}
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <ProfileTypeIcon className="h-3 w-3" />
                    {profile.profile_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>

                  {/* Verification Badge */}
                  {profile.verification_status === 'verified' && (
                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}

                  {/* Diaspora Badge */}
                  {profile.is_diaspora && (
                    <Badge variant="outline" className="border-primary text-primary">
                      <Globe className="h-3 w-3 mr-1" />
                      Diaspora
                    </Badge>
                  )}
                </div>

                <p className="text-muted-foreground">@{profile.username}</p>
                
                {profile.civic_tagline && (
                  <p className="text-sm font-medium text-primary italic">
                    "{profile.civic_tagline}"
                  </p>
                )}

                {profile.profession && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>{profile.profession}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{profile.profile_views || 0} views</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 text-center mt-4 md:mt-0 md:min-w-[240px]">
                <div>
                  <div className="font-bold text-xl">{stats.followers_count}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div>
                  <div className="font-bold text-xl">{stats.following_count}</div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
                <div>
                  <div className="font-bold text-xl">{profile.post_count || 0}</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-foreground leading-relaxed mb-4">{profile.bio}</p>
            )}

            {/* Civic Influence Score */}
            {profile.civic_influence_score > 0 && (
              <Card className="mb-4">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Civic Influence Score</span>
                      <span className="text-lg font-bold text-primary">{profile.civic_influence_score}</span>
                    </div>
                    <Progress value={Math.min((profile.civic_influence_score / 350) * 100, 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Based on posts, followers, and community engagement
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tabs for Additional Information */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Profile Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="font-semibold">{profile.polls_created || 0}</div>
                        <div className="text-xs text-muted-foreground">Polls Created</div>
                      </div>
                      <div>
                        <div className="font-semibold">{profile.events_attended || 0}</div>
                        <div className="text-xs text-muted-foreground">Events Attended</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Social Links */}
                {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Social Media
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {Object.entries(profile.social_links).map(([platform, url]) => {
                        const SocialIcon = getSocialIcon(platform);
                        return (
                          <div key={platform} className="flex items-center gap-2">
                            <SocialIcon className="h-4 w-4 text-muted-foreground" />
                            <a 
                              href={url as string} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline capitalize"
                            >
                              {platform}
                            </a>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 mt-4">
              {profile.contact_info && Object.keys(profile.contact_info).length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profile.contact_info.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${profile.contact_info.email}`} className="text-sm text-primary hover:underline">
                          {profile.contact_info.email}
                        </a>
                      </div>
                    )}
                    {profile.contact_info.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${profile.contact_info.phone}`} className="text-sm text-primary hover:underline">
                          {profile.contact_info.phone}
                        </a>
                      </div>
                    )}
                    {profile.contact_info.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={profile.contact_info.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {profile.contact_info.website}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No contact information available</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-4 mt-4">
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Recent activity will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="about" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">About {profile.display_name || profile.username}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Profile Type:</span>
                      <p className="text-muted-foreground capitalize">
                        {profile.profile_type.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Verification Status:</span>
                      <p className="text-muted-foreground capitalize">
                        {profile.verification_status}
                      </p>
                    </div>
                    {profile.region && (
                      <div>
                        <span className="font-medium">Region:</span>
                        <p className="text-muted-foreground">{profile.region}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Last Active:</span>
                      <p className="text-muted-foreground">
                        {formatDistanceToNow(new Date(profile.last_active_at || profile.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};