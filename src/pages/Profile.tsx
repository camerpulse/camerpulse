import React from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileManager } from '@/components/profile/ProfileManager';
import { FollowButton } from '@/components/Social/FollowButton';
import { UserAvatar } from '@/components/camerpulse/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { useFollow } from '@/hooks/useFollow';
import { 
  Settings, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Calendar,
  Users,
  Heart,
  MessageCircle,
  ArrowLeft
} from 'lucide-react';

export default function Profile() {
  const { userId } = useParams();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  
  // If no userId provided, show current user's profile
  const targetUserId = userId || user?.id;
  const isOwnProfile = user?.id === targetUserId;
  
  const { followersCount } = useFollow(targetUserId || '');

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user && !userId) {
    navigate('/auth');
    return null;
  }

  // For now, we'll use the current user's profile data
  // In a real app, you'd fetch the target user's profile
  const displayProfile = profile;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <UserAvatar
                  user={{
                    id: targetUserId || '',
                    name: displayProfile?.display_name || displayProfile?.username || 'User',
                    avatar: displayProfile?.avatar_url,
                    verified: displayProfile?.verified || false
                  }}
                  size="2xl"
                  className="w-24 h-24"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold truncate">
                        {displayProfile?.display_name || displayProfile?.username}
                      </h1>
                      {displayProfile?.verified && (
                        <Badge className="bg-primary text-primary-foreground">
                          Verified
                        </Badge>
                      )}
                      {displayProfile?.is_diaspora && (
                        <Badge variant="outline" className="border-primary text-primary">
                          <Globe className="w-3 h-3 mr-1" />
                          Diaspora
                        </Badge>
                      )}
                    </div>
                    
                    {displayProfile?.username && (
                      <p className="text-muted-foreground mb-2">@{displayProfile.username}</p>
                    )}
                    
                    {displayProfile?.bio && (
                      <p className="text-foreground mb-4 leading-relaxed">{displayProfile.bio}</p>
                    )}

                    {/* Contact Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {displayProfile?.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {displayProfile.location}
                        </div>
                      )}
                      {displayProfile?.website_url && (
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          <a 
                            href={displayProfile.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Website
                          </a>
                        </div>
                      )}
                      {displayProfile?.email && isOwnProfile && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {displayProfile.email}
                        </div>
                      )}
                      {displayProfile?.created_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Joined {new Date(displayProfile.created_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    {isOwnProfile ? (
                      <Button variant="outline" onClick={() => navigate('/settings')}>
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : targetUserId && (
                      <>
                        <FollowButton 
                          targetUserId={targetUserId}
                          targetUsername={displayProfile?.username}
                          showCount={true}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate('/messages')}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 mt-6 pt-4 border-t">
                  <div className="text-center">
                    <div className="font-semibold">{followersCount}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">0</div>
                    <div className="text-sm text-muted-foreground">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{displayProfile?.profile_completion_score || 0}%</div>
                    <div className="text-sm text-muted-foreground">Profile Complete</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content */}
        {isOwnProfile ? (
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="mt-6">
              <ProfileManager />
            </TabsContent>
            
            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Your recent activity will appear here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="privacy" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Privacy controls coming soon.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">User posts will appear here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Public Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Public activity will appear here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="about" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {displayProfile?.bio && (
                    <div>
                      <h4 className="font-medium mb-2">Bio</h4>
                      <p className="text-muted-foreground">{displayProfile.bio}</p>
                    </div>
                  )}
                  
                  {displayProfile?.skills && displayProfile.skills.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {displayProfile.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {displayProfile?.interests && displayProfile.interests.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Interests</h4>
                      <div className="flex flex-wrap gap-2">
                        {displayProfile.interests.map((interest, index) => (
                          <Badge key={index} variant="outline">{interest}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}