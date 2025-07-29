import React from 'react';
import { UserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar,
  MessageCircle,
  UserPlus,
  Eye,
  Star,
  Shield,
  CheckCircle
} from 'lucide-react';

interface UserProfileCardProps {
  profile: UserProfile;
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
  onSendMessage?: () => void;
  onConnect?: () => void;
  onViewProfile?: () => void;
  showActions?: boolean;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  profile,
  isOwnProfile = false,
  onEditProfile,
  onSendMessage,
  onConnect,
  onViewProfile,
  showActions = true
}) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCompletionColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="overflow-hidden">
      {/* Cover Image */}
      {profile.cover_image_url && (
        <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20 relative">
          <img 
            src={profile.cover_image_url} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <CardHeader className="relative pb-4">
        {/* Profile Picture */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-background">
              <AvatarImage src={profile.profile_picture_url} />
              <AvatarFallback className="text-xl">
                {profile.display_name?.charAt(0) || profile.username?.charAt(0) || <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">
                  {profile.display_name || profile.username}
                </CardTitle>
                {profile.is_verified && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    <Badge variant="secondary" className="text-xs">
                      Verified
                    </Badge>
                  </div>
                )}
              </div>
              
              {profile.username && profile.display_name && (
                <p className="text-muted-foreground">@{profile.username}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {profile.show_location && profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                    {profile.region && `, ${profile.region}`}
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {formatDate(profile.created_at)}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Completion & Actions */}
          <div className="flex flex-col items-end gap-2">
            {isOwnProfile && (
              <div className="text-right">
                <div className="text-xs text-muted-foreground mb-1">Profile Completion</div>
                <div className={`text-sm font-medium ${getCompletionColor(profile.profile_completion_score)}`}>
                  {profile.profile_completion_score}%
                </div>
              </div>
            )}
            
            {showActions && (
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Button onClick={onEditProfile} variant="outline" size="sm">
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    {profile.allow_messages && (
                      <Button onClick={onSendMessage} variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    )}
                    {profile.allow_friend_requests && (
                      <Button onClick={onConnect} size="sm">
                        <UserPlus className="h-4 w-4 mr-1" />
                        Connect
                      </Button>
                    )}
                    <Button onClick={onViewProfile} variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bio */}
        {profile.bio && (
          <div>
            <p className="text-sm leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Contact Information */}
        {(profile.show_email || profile.show_phone || profile.website_url) && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Contact</h4>
            <div className="space-y-1">
              {profile.website_url && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={profile.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {profile.website_url}
                  </a>
                </div>
              )}
              {profile.show_phone && profile.phone_number && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {profile.phone_number}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Skills</h4>
            <div className="flex flex-wrap gap-1">
              {profile.skills.slice(0, 8).map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {profile.skills.length > 8 && (
                <Badge variant="outline" className="text-xs">
                  +{profile.skills.length - 8} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Interests</h4>
            <div className="flex flex-wrap gap-1">
              {profile.interests.slice(0, 6).map(interest => (
                <Badge key={interest} variant="outline" className="text-xs">
                  {interest}
                </Badge>
              ))}
              {profile.interests.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{profile.interests.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Languages */}
        {profile.languages && profile.languages.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Languages</h4>
            <div className="flex flex-wrap gap-1">
              {profile.languages.map(language => (
                <Badge key={language} variant="outline" className="text-xs">
                  {language}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Social Media Links */}
        {profile.social_media_links && Object.keys(profile.social_media_links).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Social Media</h4>
            <div className="flex gap-2">
              {Object.entries(profile.social_media_links).map(([platform, url]) => (
                <a 
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm capitalize"
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Last Active */}
        <Separator />
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Last active: {formatDate(profile.last_active)}</span>
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {profile.profile_visibility}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};