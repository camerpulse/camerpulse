import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUnifiedProfile } from '@/hooks/useUnifiedProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Calendar, 
  Users, 
  MessageCircle,
  Camera,
  Settings,
  Share2,
  CheckCircle,
  Flag,
  Globe,
  Music,
  Briefcase,
  Building,
  Heart,
  Stethoscope
} from 'lucide-react';

import { ProfileHeader } from './ProfileHeader';
import { ProfileStats } from './ProfileStats';
import { ProfileTabs } from './ProfileTabs';
import { ProfileAbout } from './ProfileAbout';
import { ProfileModules } from './ProfileModules';

interface UnifiedProfileProps {
  userId: string;
  username?: string;
  isModal?: boolean;
  onClose?: () => void;
}

export const UnifiedProfile: React.FC<UnifiedProfileProps> = ({ 
  userId, 
  username,
  isModal = false,
  onClose 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  const {
    profile,
    musicProfile,
    jobProfile,
    marketplaceProfile,
    healthcareProfile,
    villageMemberships,
    loading,
    error,
    fetchProfile,
    updateProfile,
    followUser,
    unfollowUser,
    isFollowing
  } = useUnifiedProfile(userId, username);

  useEffect(() => {
    if (userId || username) {
      fetchProfile();
    }
  }, [userId, username, fetchProfile]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser();
        toast({
          title: "Unfollowed",
          description: `You are no longer following ${profile?.display_name || profile?.username}`,
        });
      } else {
        await followUser();
        toast({
          title: "Following",
          description: `You are now following ${profile?.display_name || profile?.username}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    }
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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground">{error || 'The requested user profile could not be found.'}</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === profile.user_id;

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <ProfileHeader 
        profile={profile}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onFollow={handleFollow}
        getInitials={getInitials}
      />

      <div className="container mx-auto px-4">
        {/* Profile Stats */}
        <ProfileStats 
          profile={profile}
          formatNumber={formatNumber}
        />

        {/* Navigation Tabs */}
        <ProfileTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasMusic={!!musicProfile}
          hasJob={!!jobProfile}
          hasMarketplace={!!marketplaceProfile}
          hasHealthcare={!!healthcareProfile}
          hasVillage={villageMemberships.length > 0}
        />

        {/* Tab Content */}
        <div className="mt-6 pb-8">
          <TabsContent value="overview" className="space-y-6">
            <ProfileAbout profile={profile} />
            <ProfileModules 
              musicProfile={musicProfile}
              jobProfile={jobProfile}
              marketplaceProfile={marketplaceProfile}
              healthcareProfile={healthcareProfile}
              villageMemberships={villageMemberships}
            />
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <ProfileAbout profile={profile} detailed />
          </TabsContent>

          <TabsContent value="music" className="space-y-6">
            {musicProfile ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Music className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Music Profile</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Stage Name</h4>
                      <p className="text-muted-foreground">{musicProfile.stage_name}</p>
                    </div>
                    {musicProfile.genres && (
                      <div>
                        <h4 className="font-medium mb-2">Genres</h4>
                        <div className="flex flex-wrap gap-2">
                          {musicProfile.genres.map((genre, index) => (
                            <Badge key={index} variant="secondary">{genre}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {musicProfile.bio && (
                      <div>
                        <h4 className="font-medium mb-2">Artist Bio</h4>
                        <p className="text-muted-foreground">{musicProfile.bio}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12">
                <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Music Profile</h3>
                <p className="text-muted-foreground">This user hasn't set up a music profile yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="professional" className="space-y-6">
            {jobProfile ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Professional Profile</h3>
                  </div>
                  <div className="space-y-4">
                    {jobProfile.job_title && (
                      <div>
                        <h4 className="font-medium mb-2">Current Position</h4>
                        <p className="text-muted-foreground">{jobProfile.job_title}</p>
                      </div>
                    )}
                    {jobProfile.company && (
                      <div>
                        <h4 className="font-medium mb-2">Company</h4>
                        <p className="text-muted-foreground">{jobProfile.company}</p>
                      </div>
                    )}
                    {jobProfile.skills && (
                      <div>
                        <h4 className="font-medium mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {jobProfile.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Professional Profile</h3>
                <p className="text-muted-foreground">This user hasn't set up a professional profile yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            {marketplaceProfile ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Building className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Marketplace Profile</h3>
                  </div>
                  <div className="space-y-4">
                    {marketplaceProfile.business_name && (
                      <div>
                        <h4 className="font-medium mb-2">Business Name</h4>
                        <p className="text-muted-foreground">{marketplaceProfile.business_name}</p>
                      </div>
                    )}
                    {marketplaceProfile.business_type && (
                      <div>
                        <h4 className="font-medium mb-2">Business Type</h4>
                        <p className="text-muted-foreground">{marketplaceProfile.business_type}</p>
                      </div>
                    )}
                    {marketplaceProfile.business_description && (
                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-muted-foreground">{marketplaceProfile.business_description}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12">
                <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Marketplace Profile</h3>
                <p className="text-muted-foreground">This user hasn't set up a marketplace profile yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="healthcare" className="space-y-6">
            {healthcareProfile ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Healthcare Profile</h3>
                  </div>
                  <div className="space-y-4">
                    {healthcareProfile.specialization && (
                      <div>
                        <h4 className="font-medium mb-2">Specialization</h4>
                        <p className="text-muted-foreground">{healthcareProfile.specialization}</p>
                      </div>
                    )}
                    {healthcareProfile.institution && (
                      <div>
                        <h4 className="font-medium mb-2">Institution</h4>
                        <p className="text-muted-foreground">{healthcareProfile.institution}</p>
                      </div>
                    )}
                    {healthcareProfile.years_of_experience && (
                      <div>
                        <h4 className="font-medium mb-2">Years of Experience</h4>
                        <p className="text-muted-foreground">{healthcareProfile.years_of_experience} years</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12">
                <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Healthcare Profile</h3>
                <p className="text-muted-foreground">This user hasn't set up a healthcare profile yet.</p>
              </div>
            )}
          </TabsContent>
        </div>
      </div>
    </div>
  );
};