import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageUpload } from './ImageUpload';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Camera, 
  Crown, 
  Shield, 
  CheckCircle,
  ImageIcon,
  Upload
} from 'lucide-react';

interface ProfileImageManagerProps {
  isEditing?: boolean;
  onClose?: () => void;
}

export const ProfileImageManager: React.FC<ProfileImageManagerProps> = ({
  isEditing = false,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [canUploadCover, setCanUploadCover] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      checkCoverPhotoPermission();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCoverPhotoPermission = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('can_upload_cover_photo', { user_id: user.id });

      if (error) throw error;
      setCanUploadCover(data || false);
    } catch (error) {
      console.error('Error checking cover photo permission:', error);
      setCanUploadCover(false);
    }
  };

  const handleImageUpdate = (type: 'avatar' | 'cover') => (imageUrl: string) => {
    setProfile((prev: any) => ({
      ...prev,
      [type === 'avatar' ? 'avatar_url' : 'cover_image_url']: imageUrl
    }));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Profile Images
          </CardTitle>
          <CardDescription>
            Manage your profile picture and cover photo
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Profile Picture Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Profile Picture
          </CardTitle>
          <CardDescription>
            Your profile picture appears throughout the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Current Avatar Preview */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={profile?.avatar_url} alt="Profile picture" />
                <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">
                  {getInitials(profile?.display_name || profile?.username || user?.email?.split('@')[0] || 'U')}
                </AvatarFallback>
              </Avatar>
              <Badge variant="outline" className="text-xs">
                Current Avatar
              </Badge>
            </div>

            {/* Upload Interface */}
            <div className="flex-1">
              <ImageUpload
                type="avatar"
                currentImageUrl={profile?.avatar_url}
                onImageUpdate={handleImageUpdate('avatar')}
                canUpload={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cover Photo Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ImageIcon className="h-5 w-5" />
            Cover Photo
            {canUploadCover && (
              <Badge variant="secondary" className="ml-2 gap-1">
                <CheckCircle className="h-3 w-3" />
                Available
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {canUploadCover 
              ? "A cover photo appears at the top of your profile"
              : "Cover photos are available for verified users and public officials"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Current Cover Preview */}
          {profile?.cover_image_url && (
            <div className="mb-4">
              <div className="relative h-32 rounded-lg overflow-hidden border">
                <img
                  src={profile.cover_image_url}
                  alt="Cover photo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    Current Cover
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <ImageUpload
            type="cover"
            currentImageUrl={profile?.cover_image_url}
            onImageUpdate={handleImageUpdate('cover')}
            canUpload={canUploadCover}
          />

          {/* Verification Info */}
          {!canUploadCover && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-3">
                <Crown className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">
                    Upgrade Your Account
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Cover photos are available for:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span>Verified Users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-amber-500" />
                      <span>Public Officials</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Politicians</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-500" />
                      <span>Judges & Ministers</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </div>
  );
};