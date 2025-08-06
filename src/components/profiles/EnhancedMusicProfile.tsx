import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useUnifiedProfile } from '@/hooks/useUnifiedProfile';
import { useSafeQuery } from '@/utils/supabaseBestPractices';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { DynamicIcon } from '@/utils/iconBestPractices';
import { Music, Users, Heart, Play, Download, Share2, Calendar, MapPin } from 'lucide-react';

interface MusicProfileProps {
  artistSlug?: string;
  id?: string;
}

/**
 * Enhanced Music Profile Component using Unified Profile System
 * Implements best practices for data fetching, error handling, and UI
 */
export const EnhancedMusicProfile: React.FC<MusicProfileProps> = ({ 
  artistSlug: propArtistSlug, 
  id: propId 
}) => {
  const { artistSlug: paramArtistSlug, id: paramId } = useParams<{ 
    artistSlug: string; 
    id: string; 
  }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { safeQuery } = useSafeQuery();

  // Use props or URL params
  const artistSlug = propArtistSlug || paramArtistSlug;
  const id = propId || paramId;

  // Use the unified profile system
  const {
    profile: coreProfile,
    musicProfile,
    loading,
    error,
    isFollowing,
    followUser,
    unfollowUser
  } = useUnifiedProfile(id);

  const [activeTab, setActiveTab] = useState('overview');
  const [isPlaying, setIsPlaying] = useState(false);

  // Handle profile loading errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error Loading Profile",
        description: "Failed to load artist profile. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser();
        toast({
          title: "Unfollowed",
          description: `You unfollowed ${coreProfile?.display_name}`,
        });
      } else {
        await followUser();
        toast({
          title: "Following",
          description: `You are now following ${coreProfile?.display_name}`,
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const handlePlayTrack = (trackId: string) => {
    setIsPlaying(!isPlaying);
    // Implement actual playback logic here
  };

  const handleShareProfile = async () => {
    try {
      await navigator.share({
        title: `${coreProfile?.display_name} - CamerPulse Music`,
        text: `Check out ${coreProfile?.display_name}'s music profile`,
        url: window.location.href,
      });
    } catch (err) {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Profile link copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading artist profile...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!coreProfile) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center space-y-4">
              <DynamicIcon name="AlertCircle" className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-semibold">Artist Not Found</h2>
              <p className="text-muted-foreground">
                The artist profile you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center md:items-start space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage 
                    src={coreProfile.avatar_url} 
                    alt={`${coreProfile.display_name}'s avatar`}
                  />
                  <AvatarFallback className="text-2xl">
                    {getInitials(coreProfile.display_name || coreProfile.username || 'A')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex gap-2">
                  {user && user.id !== coreProfile.user_id && (
                    <Button
                      onClick={handleFollow}
                      variant={isFollowing ? "outline" : "default"}
                      size="sm"
                      className="min-w-[100px]"
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleShareProfile}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {coreProfile.display_name || coreProfile.username}
                  </h1>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">
                      <Music className="h-3 w-3 mr-1" />
                      Artist
                    </Badge>
                    {musicProfile?.is_verified && (
                      <Badge variant="default">
                        Verified
                      </Badge>
                    )}
                    {musicProfile?.genre && (
                      <Badge variant="outline">
                        {musicProfile.genre}
                      </Badge>
                    )}
                  </div>

                  {musicProfile?.artist_bio && (
                    <p className="text-muted-foreground mb-4">
                      {musicProfile.artist_bio}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {musicProfile?.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {musicProfile.location}
                      </div>
                    )}
                    {musicProfile?.career_start_year && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Active since {musicProfile.career_start_year}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {musicProfile?.total_releases || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Releases</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {musicProfile?.monthly_listeners || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Monthly Listeners</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {musicProfile?.total_followers || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="music">Music</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Latest Releases */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Latest Releases
                </CardTitle>
              </CardHeader>
              <CardContent>
                {musicProfile?.latest_releases?.length > 0 ? (
                  <div className="space-y-4">
                    {musicProfile.latest_releases.slice(0, 3).map((release: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 p-4 rounded-lg border">
                        <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                          <Music className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{release.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {release.release_date} • {release.track_count} tracks
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePlayTrack(release.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Play
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No releases yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="music" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Discography</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Full discography coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming events</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About the Artist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {musicProfile?.artist_bio && (
                  <div>
                    <h4 className="font-semibold mb-2">Biography</h4>
                    <p className="text-muted-foreground">{musicProfile.artist_bio}</p>
                  </div>
                )}

                {musicProfile?.influences?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Influences</h4>
                    <div className="flex flex-wrap gap-2">
                      {musicProfile.influences.map((influence: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {influence}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {musicProfile?.record_labels?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Record Labels</h4>
                    <div className="space-y-2">
                      {musicProfile.record_labels.map((label: any, index: number) => (
                        <p key={index} className="text-muted-foreground">
                          {label.name} ({label.start_year} - {label.end_year || 'Present'})
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default EnhancedMusicProfile;