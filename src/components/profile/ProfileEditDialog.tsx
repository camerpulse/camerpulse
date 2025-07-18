import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  X, 
  Camera, 
  Crop,
  MapPin,
  Tag,
  Save,
  Loader2,
  Plus
} from 'lucide-react';

interface ProfileEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onProfileUpdate: (updatedProfile: any) => void;
}

export const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdate
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    profession: profile?.profession || '',
    civic_tagline: profile?.civic_tagline || '',
    civic_interests: profile?.civic_interests || [],
    profile_tags: profile?.profile_tags || [],
    contact_info: profile?.contact_info || {},
    social_links: profile?.social_links || {},
    avatar_url: profile?.avatar_url || '',
    cover_photo_url: profile?.cover_photo_url || ''
  });

  const [newTag, setNewTag] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newSocialPlatform, setNewSocialPlatform] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  const civicInterestOptions = [
    'Elections', 'Economy', 'Youth', 'Transparency', 'Health', 
    'Education', 'Environment', 'Justice', 'Infrastructure', 'Security'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const uploadFile = async (file: File, bucket: string, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${user?.id}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { 
        cacheControl: '3600',
        upsert: true 
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const avatarUrl = await uploadFile(file, 'profile-avatars', 'avatars');
      handleInputChange('avatar_url', avatarUrl);
      toast({
        title: "Avatar uploaded successfully",
        description: "Your profile photo has been updated"
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const coverUrl = await uploadFile(file, 'profile-covers', 'covers');
      handleInputChange('cover_photo_url', coverUrl);
      toast({
        title: "Cover photo uploaded successfully",
        description: "Your cover photo has been updated"
      });
    } catch (error) {
      console.error('Error uploading cover:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload cover photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingCover(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.profile_tags.includes(newTag.trim())) {
      handleInputChange('profile_tags', [...formData.profile_tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('profile_tags', formData.profile_tags.filter(tag => tag !== tagToRemove));
  };

  const addInterest = (interest: string) => {
    if (!formData.civic_interests.includes(interest)) {
      handleInputChange('civic_interests', [...formData.civic_interests, interest]);
    }
  };

  const removeInterest = (interestToRemove: string) => {
    handleInputChange('civic_interests', formData.civic_interests.filter(int => int !== interestToRemove));
  };

  const addSocialLink = () => {
    if (newSocialPlatform.trim() && newSocialUrl.trim()) {
      handleInputChange('social_links', {
        ...formData.social_links,
        [newSocialPlatform.toLowerCase()]: newSocialUrl
      });
      setNewSocialPlatform('');
      setNewSocialUrl('');
    }
  };

  const removeSocialLink = (platform: string) => {
    const updatedLinks = { ...formData.social_links };
    delete updatedLinks[platform];
    handleInputChange('social_links', updatedLinks);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Ensure bio is within 500 character limit
      if (formData.bio.length > 500) {
        toast({
          title: "Bio too long",
          description: "Bio must be 500 characters or less",
          variant: "destructive"
        });
        return;
      }

      const updateData = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (error) throw error;

      onProfileUpdate({ ...profile, ...updateData });
      toast({
        title: "Profile updated successfully",
        description: "Your profile changes have been saved"
      });
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Photo Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Profile Photos</h3>
            
            {/* Avatar Upload */}
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={formData.avatar_url || profile?.avatar_url} />
                <AvatarFallback>
                  {profile?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button
                  variant="outline"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="mb-2"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload Avatar
                </Button>
                <p className="text-sm text-muted-foreground">
                  Recommended: 400x400px, max 2MB
                </p>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Cover Photo */}
            <div>
              <Label>Cover Photo</Label>
              {(formData.cover_photo_url || profile?.cover_photo_url) && (
                <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-2">
                  <img
                    src={formData.cover_photo_url || profile?.cover_photo_url}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
              >
                {uploadingCover ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload Cover Photo
              </Button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <Label htmlFor="profession">Profession</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => handleInputChange('profession', e.target.value)}
                  placeholder="Your profession"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio ({formData.bio.length}/500)</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                maxLength={500}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="civic_tagline">Civic Tagline</Label>
              <Input
                id="civic_tagline"
                value={formData.civic_tagline}
                onChange={(e) => handleInputChange('civic_tagline', e.target.value)}
                placeholder="Your civic motto or tagline"
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, Region"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Civic Interests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Civic Interests</h3>
            <div className="flex flex-wrap gap-2">
              {civicInterestOptions.map((interest) => (
                <Badge
                  key={interest}
                  variant={formData.civic_interests.includes(interest) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => 
                    formData.civic_interests.includes(interest)
                      ? removeInterest(interest)
                      : addInterest(interest)
                  }
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags/Skills */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tags & Skills</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.profile_tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Social Links</h3>
            <div className="space-y-2">
              {Object.entries(formData.social_links).map(([platform, url]) => (
                <div key={platform} className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{platform}</Badge>
                  <span className="text-sm flex-1">{url as string}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSocialLink(platform)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSocialPlatform}
                onChange={(e) => setNewSocialPlatform(e.target.value)}
                placeholder="Platform (e.g., Twitter, LinkedIn)"
                className="flex-1"
              />
              <Input
                value={newSocialUrl}
                onChange={(e) => setNewSocialUrl(e.target.value)}
                placeholder="URL"
                className="flex-1"
              />
              <Button onClick={addSocialLink} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};