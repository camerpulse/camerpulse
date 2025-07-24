import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { FollowButton } from '@/components/Social/FollowButton';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfileEditDialog } from '@/components/profile/ProfileEditDialog';
import { ProfileQRCode } from '@/components/profile/ProfileQRCode';
import { ProfileComparison } from '@/components/profile/ProfileComparison';
import { MessengerSection } from '@/components/Profile/MessengerSection';
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
  Edit,
  Save,
  X,
  Upload,
  Bookmark,
  History,
  UserCheck,
  BarChart3,
  Languages,
  Bell,
  Lock,
  Key,
  FileText,
  Monitor,
  Smartphone,
  Trash,
  Download,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AdvancedProfileProps {
  userId: string;
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

interface EnhancedProfile {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  cover_photo_url?: string;
  location?: string;
  region?: string;
  subdivision?: string;
  profession?: string;
  civic_tagline?: string;
  profile_type: 'government_institution' | 'political_party' | 'company' | 'school' | 'ngo' | 'artist' | 'politician' | 'normal_user' | 'journalist' | 'activist' | 'camerpulse_official' | 'moderator';
  verification_status: 'verified' | 'pending' | 'rejected' | 'under_review';
  civic_influence_score: number;
  post_count: number;
  polls_created: number;
  events_attended: number;
  profile_views: number;
  rich_bio: any;
  contact_info: any;
  social_links: any;
  achievements: any;
  privacy_settings: any;
  is_diaspora: boolean;
  verified: boolean;
  is_banned: boolean;
  last_active_at: string;
  created_at: string;
  // PulseProfile v4.0 fields
  profile_slug?: string;
  civic_interests?: string[];
  profile_tags?: string[];
  contribution_level?: string;
  language_preference?: string;
  enable_notifications?: boolean;
  allow_messages?: boolean;
}

interface ProfileSettings {
  id: string;
  profile_id: string;
  hide_polls: boolean;
  hide_activity: boolean;
  hide_followers: boolean;
  hide_location: boolean;
  show_civic_score: boolean;
  show_contact_info: boolean;
}

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_type_id: string;
  awarded_at: string;
  progress_data: any;
  achievement_type?: {
    name: string;
    description: string;
    icon: string;
    category: string;
    points_value: number;
  };
}

interface SavedContent {
  id: string;
  user_id: string;
  content_type: string;
  content_id: string;
  saved_at: string;
}

interface ProfileStats {
  followers_count: number;
  following_count: number;
  average_rating: number;
  total_ratings: number;
}

interface ActivityItem {
  id: string;
  activity_type: string;
  activity_title: string;
  activity_description?: string;
  activity_data: any;
  is_public: boolean;
  created_at: string;
}

interface ProfileBadge {
  id: string;
  badge_type: string;
  badge_name: string;
  badge_description?: string;
  badge_icon?: string;
  awarded_at: string;
}

export const AdvancedUserProfile: React.FC<AdvancedProfileProps> = ({ 
  userId, 
  isOpen = true, 
  onClose,
  isModal = true
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<EnhancedProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({ 
    followers_count: 0, 
    following_count: 0, 
    average_rating: 0, 
    total_ratings: 0 
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [badges, setBadges] = useState<ProfileBadge[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [savedContent, setSavedContent] = useState<SavedContent[]>([]);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Partial<EnhancedProfile>>({});

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchProfileStats();
      fetchActivityTimeline();
      fetchProfileBadges();
      fetchAchievements();
      fetchProfileSettings();
      if (user?.id === userId) {
        fetchSavedContent();
      }
      incrementProfileViews();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          professional_profiles (
            organization_name,
            position_title,
            years_experience,
            skills
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive"
      });
    }
  };

  const fetchProfileStats = async () => {
    try {
      const [followersResult, followingResult, ratingsResult] = await Promise.all([
        supabase
          .from('follows')
          .select('id', { count: 'exact' })
          .eq('following_id', userId),
        supabase
          .from('follows')
          .select('id', { count: 'exact' })
          .eq('follower_id', userId),
        supabase
          .from('profile_ratings')
          .select('rating_value')
          .eq('rated_profile_id', profile?.id)
      ]);

      const ratings = ratingsResult.data || [];
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r.rating_value, 0) / ratings.length 
        : 0;

      setStats({
        followers_count: followersResult.count || 0,
        following_count: followingResult.count || 0,
        average_rating: avgRating,
        total_ratings: ratings.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchActivityTimeline = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_activity_timeline')
        .select('*')
        .eq('profile_id', profile?.id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchProfileBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_badges')
        .select('*')
        .eq('profile_id', profile?.id)
        .eq('is_active', true)
        .order('awarded_at', { ascending: false });

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement_type:profile_achievement_types(
            name,
            description,
            icon,
            category,
            points_value
          )
        `)
        .eq('user_id', userId)
        .order('awarded_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchProfileSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_settings')
        .select('*')
        .eq('profile_id', profile?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProfileSettings(data);
    } catch (error) {
      console.error('Error fetching profile settings:', error);
    }
  };

  const fetchSavedContent = async () => {
    try {
      const { data, error } = await supabase
        .from('user_saved_content')
        .select('*')
        .eq('user_id', userId)
        .order('saved_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSavedContent(data || []);
    } catch (error) {
      console.error('Error fetching saved content:', error);
    }
  };

  const incrementProfileViews = async () => {
    if (!profile || user?.id === userId) return;
    
    try {
      await supabase
        .from('profiles')
        .update({ profile_views: (profile.profile_views || 0) + 1 })
        .eq('id', profile.id);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const getProfileTypeDisplay = (type: string) => {
    const types: { [key: string]: { label: string; icon: React.ComponentType; color: string } } = {
      normal_user: { label: 'Citizen', icon: Users, color: 'text-blue-600' },
      politician: { label: 'Politician', icon: Crown, color: 'text-purple-600' },
      political_party: { label: 'Political Party', icon: Flag, color: 'text-red-600' },
      artist: { label: 'Artist', icon: Camera, color: 'text-pink-600' },
      company: { label: 'Company', icon: Building, color: 'text-green-600' },
      government_institution: { label: 'Government', icon: Shield, color: 'text-blue-800' },
      journalist: { label: 'Journalist', icon: BookOpen, color: 'text-yellow-600' },
      activist: { label: 'Activist', icon: TrendingUp, color: 'text-orange-600' },
      camerpulse_official: { label: 'CamerPulse Official', icon: CheckCircle, color: 'text-emerald-600' },
      moderator: { label: 'Moderator', icon: Shield, color: 'text-indigo-600' }
    };
    return types[type] || types.normal_user;
  };

  const getVerificationBadge = (status: string) => {
    const badges = {
      verified: { label: 'Verified', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      under_review: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      pending: { label: 'Pending', color: 'bg-gray-100 text-gray-800', icon: AlertTriangle }
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const handleShareProfile = () => {
    const url = `${window.location.origin}/profile/${userId}`;
    const text = `Check out ${profile?.display_name || profile?.username}'s profile on CamerPulse`;
    
    if (navigator.share) {
      navigator.share({ title: 'CamerPulse Profile', text, url });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Profile link copied to clipboard"
      });
    }
  };

  const updateProfileSetting = async (setting: string, value: any) => {
    if (!profileSettings) return;
    
    try {
      const { error } = await supabase
        .from('profile_settings')
        .update({ [setting]: value })
        .eq('id', profileSettings.id);

      if (error) throw error;
      
      setProfileSettings(prev => prev ? { ...prev, [setting]: value } : null);
      toast({
        title: "Settings updated",
        description: "Your privacy settings have been updated"
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      });
    }
  };

  const updateProfile = async (updates: Partial<EnhancedProfile>) => {
    if (!profile) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const requestVerification = async () => {
    try {
      const { error } = await supabase
        .from('profile_verification_queue')
        .insert({
          user_id: userId,
          verification_type: 'identity',
          status: 'pending'
        });

      if (error) throw error;
      
      toast({
        title: "Verification request submitted",
        description: "Your verification request has been submitted for review"
      });
    } catch (error) {
      console.error('Error requesting verification:', error);
      toast({
        title: "Error",
        description: "Failed to submit verification request",
        variant: "destructive"
      });
    }
  };

  const renderCivicScore = () => {
    const score = profile?.civic_influence_score || 0;
    const maxScore = 350; // Based on calculation function
    const percentage = Math.min((score / maxScore) * 100, 100);
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Civic Influence Score</span>
          <span className="text-lg font-bold text-primary">{score}</span>
        </div>
        <Progress value={percentage} className="h-2" />
        <p className="text-xs text-muted-foreground">
          Based on posts, followers, and community ratings
        </p>
      </div>
    );
  };

  if (isModal && !isOpen) return null;

  const ProfileContent = () => (
    <Card className={isModal ? "w-full max-w-4xl max-h-[95vh] overflow-hidden" : "w-full max-w-4xl mx-auto"}>
      {/* Header with Cover Photo */}
      <div className="relative h-48 bg-gradient-to-r from-primary/20 to-accent/20">
        {profile?.cover_photo_url && (
          <img
            src={profile.cover_photo_url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Close Button - only show in modal mode */}
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

        {/* Profile Picture & Basic Info */}
        <div className="absolute -bottom-16 left-6">
          <Avatar className="w-32 h-32 border-4 border-background">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {profile?.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-4 right-4 flex gap-2 flex-wrap">
          <ProfileQRCode 
            profileSlug={profile?.profile_slug || profile?.username || ''} 
            displayName={profile?.display_name || profile?.username || 'User'} 
          />
          <ProfileComparison currentProfile={profile} />
          <Button variant="outline" size="sm" onClick={handleShareProfile}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          {user?.id === userId ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <ProfileEditDialog
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                profile={profile}
                onProfileUpdate={(updatedProfile) => {
                  setProfile(updatedProfile);
                  setIsEditing(false);
                }}
              />
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Profile Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Privacy Settings */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Privacy & Visibility</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Hide Polls</Label>
                            <p className="text-sm text-muted-foreground">Hide your poll history from others</p>
                          </div>
                          <Switch 
                            checked={profileSettings?.hide_polls || false}
                            onCheckedChange={(checked) => updateProfileSetting('hide_polls', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Hide Activity</Label>
                            <p className="text-sm text-muted-foreground">Hide your activity timeline</p>
                          </div>
                          <Switch 
                            checked={profileSettings?.hide_activity || false}
                            onCheckedChange={(checked) => updateProfileSetting('hide_activity', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Hide Followers</Label>
                            <p className="text-sm text-muted-foreground">Hide your follower list</p>
                          </div>
                          <Switch 
                            checked={profileSettings?.hide_followers || false}
                            onCheckedChange={(checked) => updateProfileSetting('hide_followers', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Contact Info</Label>
                            <p className="text-sm text-muted-foreground">Show contact information publicly</p>
                          </div>
                          <Switch 
                            checked={profileSettings?.show_contact_info || false}
                            onCheckedChange={(checked) => updateProfileSetting('show_contact_info', checked)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Profile Settings */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Profile Configuration</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive platform notifications</p>
                          </div>
                          <Switch 
                            checked={profile?.enable_notifications || false}
                            onCheckedChange={(checked) => updateProfile({ enable_notifications: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Allow Messages</Label>
                            <p className="text-sm text-muted-foreground">Allow direct messages from other users</p>
                          </div>
                          <Switch 
                            checked={profile?.allow_messages || false}
                            onCheckedChange={(checked) => updateProfile({ allow_messages: checked })}
                          />
                        </div>
                        <div>
                          <Label>Language Preference</Label>
                          <Select 
                            value={profile?.language_preference || 'en'}
                            onValueChange={(value) => updateProfile({ language_preference: value })}
                          >
                            <SelectTrigger className="w-full mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="fr">Français</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Verification Request */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Account Verification</h3>
                      <div className="space-y-4">
                        {profile?.verification_status !== 'verified' && (
                          <Button onClick={requestVerification} className="w-full">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Request Verification
                          </Button>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Current status: <Badge variant={profile?.verification_status === 'verified' ? 'default' : 'secondary'}>
                            {profile?.verification_status || 'pending'}
                          </Badge>
                        </p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="flex gap-2">
              {profile?.allow_messages && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = `/messenger?startConversation=${userId}`}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              )}
              <Button variant="outline" size="sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                Report
              </Button>
              <FollowButton 
                targetUserId={userId} 
                targetUsername={profile?.username}
                variant="default"
                size="sm"
              />
            </div>
          )}
        </div>
      </div>
      <CardContent className="pt-20 pb-4">
          {/* Profile Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold">
                    {profile?.display_name || profile?.username}
                  </h1>
                  
                  {/* Profile Type Badge */}
                  {profile?.profile_type && profile.profile_type !== 'normal_user' && (
                    <Badge 
                      variant="secondary" 
                      className={getProfileTypeDisplay(profile.profile_type).color}
                    >
                        {React.createElement(getProfileTypeDisplay(profile.profile_type).icon, { 
                          className: "h-3 w-3 mr-1" 
                        } as any)}
                      {getProfileTypeDisplay(profile.profile_type).label}
                    </Badge>
                  )}

                  {/* Verification Badge */}
                  {profile?.verification_status === 'verified' && (
                    <Badge className={getVerificationBadge(profile.verification_status).color}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}

                  {/* Diaspora Badge */}
                  {profile?.is_diaspora && (
                    <Badge variant="outline" className="border-primary text-primary">
                      <Globe className="h-3 w-3 mr-1" />
                      Diaspora
                    </Badge>
                  )}
                </div>

                <p className="text-muted-foreground">@{profile?.username}</p>
                
                {profile?.civic_tagline && (
                  <p className="text-sm font-medium text-primary italic">
                    "{profile.civic_tagline}"
                  </p>
                )}

                {profile?.profession && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>{profile.profession}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {profile?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDistanceToNow(new Date(profile?.created_at || ''), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{profile?.profile_views || 0} views</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 text-center mt-4 md:mt-0">
                <div>
                  <div className="font-bold text-lg">{stats.followers_count}</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                <div>
                  <div className="font-bold text-lg">{profile?.post_count || 0}</div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </div>
                <div>
                  <div className="font-bold text-lg">{profile?.polls_created || 0}</div>
                  <div className="text-xs text-muted-foreground">Polls</div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {profile?.bio && (
              <p className="text-foreground leading-relaxed mb-4">{profile.bio}</p>
            )}

            {/* Civic Influence Score */}
            <Card className="mb-4">
              <CardContent className="pt-4">
                {renderCivicScore()}
              </CardContent>
            </Card>

            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {badges.map((badge) => (
                  <Badge key={badge.id} variant="outline" className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {badge.badge_name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-9 md:grid-cols-9">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="polls">Polls</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="ratings">Ratings</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
              <TabsTrigger value="followers">Followers</TabsTrigger>
              {user?.id === userId && <TabsTrigger value="messenger">Messenger</TabsTrigger>}
              {user?.id === userId && <TabsTrigger value="saved">Saved</TabsTrigger>}
            </TabsList>

            <div className={isModal ? "max-h-64 overflow-y-auto mt-4" : "mt-4"}>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contact Info */}
                  {profile?.contact_info && Object.keys(profile.contact_info).length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Contact Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {profile.contact_info.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            <span>{profile.contact_info.email}</span>
                          </div>
                        )}
                        {profile.contact_info.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            <span>{profile.contact_info.phone}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Social Links */}
                  {profile?.social_links && Object.keys(profile.social_links).length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Social Media
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {Object.entries(profile.social_links).map(([platform, url]) => (
                          <div key={platform} className="flex items-center gap-2">
                            <ExternalLink className="h-3 w-3" />
                            <a 
                              href={url as string} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline capitalize"
                            >
                              {platform}
                            </a>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Profile Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="font-semibold">{stats.followers_count}</div>
                        <div className="text-xs text-muted-foreground">Followers</div>
                      </div>
                      <div>
                        <div className="font-semibold">{stats.following_count}</div>
                        <div className="text-xs text-muted-foreground">Following</div>
                      </div>
                      <div>
                        <div className="font-semibold">{profile?.events_attended || 0}</div>
                        <div className="text-xs text-muted-foreground">Events</div>
                      </div>
                      <div>
                        <div className="font-semibold flex items-center justify-center gap-1">
                          {stats.average_rating.toFixed(1)}
                          <Star className="h-3 w-3 text-yellow-500" />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ({stats.total_ratings} ratings)
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="posts" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Recent posts will appear here</p>
                </div>
              </TabsContent>

              <TabsContent value="polls" className="space-y-4">
                {!profileSettings?.hide_polls ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>User-created polls will appear here</p>
                    <p className="text-xs mt-1">{profile?.polls_created || 0} polls created</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>This user has hidden their polls</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="events" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Joined and created events will appear here</p>
                  <p className="text-xs mt-1">{profile?.events_attended || 0} events attended</p>
                </div>
              </TabsContent>

              <TabsContent value="following" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>People, parties, and institutions followed</p>
                  <p className="text-xs mt-1">{stats.following_count} following</p>
                </div>
              </TabsContent>

              <TabsContent value="followers" className="space-y-4">
                {!profileSettings?.hide_followers ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Civic followers</p>
                    <p className="text-xs mt-1">{stats.followers_count} followers</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>This user has hidden their followers</p>
                  </div>
                )}
              </TabsContent>

              {user?.id === userId && (
                <TabsContent value="messenger" className="space-y-4">
                  <MessengerSection />
                </TabsContent>
              )}

              {user?.id === userId && (
                <TabsContent value="saved" className="space-y-4">
                  {savedContent.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bookmark className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Saved drafts and bookmarked content</p>
                      <p className="text-xs mt-1">No saved content yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedContent.map((item) => (
                        <Card key={item.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="capitalize">
                                {item.content_type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Saved {formatDistanceToNow(new Date(item.saved_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm">Content ID: {item.content_id}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              )}

              <TabsContent value="activity" className="space-y-4">
                {activities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="border-l-2 border-primary/20 pl-4 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-medium text-sm">{activity.activity_title}</div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {activity.activity_description && (
                          <p className="text-sm text-muted-foreground">{activity.activity_description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ratings" className="space-y-4">
                {/* Rating eligibility check based on profile type */}
                {['politician', 'company', 'government_institution'].includes(profile?.profile_type || '') ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Community Ratings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-5 w-5 ${
                                  star <= Math.floor(stats.average_rating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <div>
                            <div className="font-semibold">{stats.average_rating.toFixed(1)} / 5.0</div>
                            <div className="text-sm text-muted-foreground">
                              Based on {stats.total_ratings} rating{stats.total_ratings !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>This profile type is not eligible for public ratings</p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
      </CardContent>
    </Card>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <ProfileContent />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <ProfileContent />
    </div>
  );
};