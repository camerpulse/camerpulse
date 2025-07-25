import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Settings, 
  MessageCircle, 
  UserPlus, 
  UserCheck, 
  Share2,
  MoreHorizontal,
  MapPin,
  Calendar,
  Globe,
  Flag,
  CheckCircle,
  Star,
  Award,
  Camera,
  Edit3
} from 'lucide-react';

interface ProfileHeaderProps {
  profile: any;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onFollowToggle: (following: boolean) => void;
  onEditProfile: () => void;
  onMessage: () => void;
  onShare: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isOwnProfile,
  isFollowing,
  onFollowToggle,
  onEditProfile,
  onMessage,
  onShare
}) => {
  const [isUploading, setIsUploading] = useState(false);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // TODO: Implement cover photo upload
    setTimeout(() => setIsUploading(false), 2000);
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // TODO: Implement profile picture upload
    setTimeout(() => setIsUploading(false), 2000);
  };

  return (
    <div className="relative">
      {/* Cover Photo */}
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
        
        {/* Cover overlay */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Cover Photo Actions */}
        {isOwnProfile && (
          <div className="absolute bottom-4 right-4">
            <label htmlFor="cover-upload" className="cursor-pointer">
              <Button 
                variant="secondary" 
                size="sm"
                disabled={isUploading}
                className="bg-white/90 hover:bg-white text-black"
              >
                <Camera className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Edit Cover'}
              </Button>
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
              />
            </label>
          </div>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-16 sm:-mt-20 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Profile Picture */}
            <div className="relative">
              <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-background shadow-lg">
                <AvatarImage src={profile.avatar_url} alt={profile.display_name || profile.username} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {getInitials(profile.display_name || profile.username)}
                </AvatarFallback>
              </Avatar>
              
              {/* Profile Picture Edit */}
              {isOwnProfile && (
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="absolute bottom-0 right-0 h-10 w-10 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                    <Camera className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureUpload}
                  />
                </label>
              )}
            </div>

            {/* Profile Details */}
            <div className="flex-1 sm:ml-4 mt-4 sm:mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  {/* Name and Verification */}
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
                    {profile.profile_type && (
                      <Badge variant="outline" className="capitalize">
                        {profile.profile_type.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground text-lg">@{profile.username}</p>
                  
                  {/* Bio */}
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
                    {profile.civic_influence_score && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>Civic Score: {profile.civic_influence_score}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {isOwnProfile ? (
                    <Button variant="outline" size="sm" onClick={onEditProfile}>
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant={isFollowing ? "outline" : "default"}
                        size="sm"
                        onClick={() => onFollowToggle(!isFollowing)}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Follow
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm" onClick={onMessage}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </>
                  )}
                  
                  <Button variant="outline" size="sm" onClick={onShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t">
                <div className="text-center cursor-pointer hover:text-primary transition-colors">
                  <div className="font-bold text-lg">{formatNumber(profile.posts_count || 0)}</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
                <div className="text-center cursor-pointer hover:text-primary transition-colors">
                  <div className="font-bold text-lg">{formatNumber(profile.followers_count || 0)}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div className="text-center cursor-pointer hover:text-primary transition-colors">
                  <div className="font-bold text-lg">{formatNumber(profile.following_count || 0)}</div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
                <div className="text-center cursor-pointer hover:text-primary transition-colors">
                  <div className="font-bold text-lg">{formatNumber(profile.connections_count || 0)}</div>
                  <div className="text-sm text-muted-foreground">Connections</div>
                </div>
                {profile.achievements_count > 0 && (
                  <div className="text-center cursor-pointer hover:text-primary transition-colors">
                    <div className="font-bold text-lg flex items-center gap-1">
                      <Award className="h-4 w-4 text-yellow-500" />
                      {profile.achievements_count}
                    </div>
                    <div className="text-sm text-muted-foreground">Awards</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};