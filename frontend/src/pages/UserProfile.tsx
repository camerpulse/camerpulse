import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { AppLayout } from '@/components/Layout/AppLayout';
import { ProfileHeader } from '@/components/Profile/ProfileHeader';
import { ProfileWall } from '@/components/Profile/ProfileWall';
import { ProfileSidebar } from '@/components/Profile/ProfileSidebar';
import { ProfileTabs } from '@/components/Profile/ProfileTabs';
import { CreatePostModal } from '@/components/Profile/CreatePostModal';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  User, 
  Plus,
  MessageCircle,
  UserPlus,
  UserCheck,
  Settings,
  Share2,
  MoreHorizontal,
  ArrowLeft
} from 'lucide-react';

const UserProfile: React.FC = () => {
  const { userId, slug } = useParams<{ userId?: string; slug?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { userProfile, getProfileBySlug, getUserProfile, trackProfileView } = useUserProfile();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('wall');
  const [showCreatePost, setShowCreatePost] = useState(false);

  const isOwnProfile = profile?.user_id === user?.id;

  useEffect(() => {
    loadProfile();
  }, [userId, slug, user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      let profileData = null;
      
      if (slug) {
        // Load by slug (@username)
        profileData = await getProfileBySlug(slug);
      } else if (userId) {
        // Load by user ID
        profileData = await getUserProfile(userId);
      } else if (user) {
        // Load current user's profile
        profileData = await getUserProfile();
      }

      if (profileData) {
        setProfile(profileData);
        
        // Track profile view if viewing someone else's profile
        if (profileData.user_id !== user?.id) {
          await trackProfileView(profileData.user_id);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen animate-pulse">
          <div className="h-64 bg-muted"></div>
          <div className="container mx-auto px-4 -mt-20">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <div className="h-48 bg-muted rounded-lg"></div>
              </div>
              <div className="lg:col-span-3">
                <div className="space-y-4">
                  <div className="h-8 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-32 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The requested profile doesn't exist or is private.
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
                {isOwnProfile && (
                  <Button onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Create Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Profile Header */}
        <ProfileHeader 
          profile={profile}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          onFollowToggle={setIsFollowing}
          onEditProfile={() => navigate('/settings')}
          onMessage={() => navigate(`/messages/new?user=${profile.user_id}`)}
          onShare={() => {
            navigator.share?.({
              title: `${profile.display_name}'s Profile`,
              url: window.location.href
            });
          }}
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-1">
              <ProfileSidebar 
                profile={profile}
                isOwnProfile={isOwnProfile}
              />
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Quick Actions */}
              {isOwnProfile && (
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Button 
                        onClick={() => setShowCreatePost(true)}
                        className="flex-1"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Post
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/polls/create')}>
                        Create Poll
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/events/create')}>
                        Create Event
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Profile Tabs */}
              <ProfileTabs 
                activeTab={activeTab}
                onTabChange={setActiveTab}
                profile={profile}
                isOwnProfile={isOwnProfile}
              />

              {/* Tab Content */}
              <div className="mt-6">
                {activeTab === 'wall' && (
                  <ProfileWall 
                    profile={profile}
                    isOwnProfile={isOwnProfile}
                  />
                )}
                
                {activeTab === 'about' && (
                  <div>About content will be rendered here</div>
                )}
                
                {activeTab === 'photos' && (
                  <div>Photos content will be rendered here</div>
                )}
                
                {activeTab === 'videos' && (
                  <div>Videos content will be rendered here</div>
                )}
                
                {activeTab === 'connections' && (
                  <div>Connections content will be rendered here</div>
                )}
                
                {activeTab === 'activity' && (
                  <div>Activity content will be rendered here</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <CreatePostModal 
            isOpen={showCreatePost}
            onClose={() => setShowCreatePost(false)}
            onPostCreated={() => {
              setShowCreatePost(false);
              // Refresh wall content
            }}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default UserProfile;