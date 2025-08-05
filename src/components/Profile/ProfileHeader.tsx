import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Camera,
  Settings,
  MessageCircle,
  Share2,
  CheckCircle,
  Flag,
  MapPin,
  Globe,
  Calendar
} from 'lucide-react';
import type { UnifiedProfile } from '@/hooks/useUnifiedProfile';

interface ProfileHeaderProps {
  profile: UnifiedProfile;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onFollow: () => void;
  getInitials: (name: string) => string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isOwnProfile,
  isFollowing,
  onFollow,
  getInitials
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <>
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
              <AvatarImage src={profile.profile_picture_url} alt={profile.display_name || profile.username} />
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
                    {profile.profile_visibility !== 'public' && (
                      <Badge variant="outline">
                        {profile.profile_visibility}
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
                    {profile.website_url && (
                      <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        <a 
                          href={profile.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {profile.website_url.replace(/^https?:\/\//, '')}
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
                  {isOwnProfile ? (
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant={isFollowing ? "outline" : "default"}
                        size="sm"
                        onClick={onFollow}
                      >
                        {isFollowing ? "Unfollow" : "Follow"}
                      </Button>
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};